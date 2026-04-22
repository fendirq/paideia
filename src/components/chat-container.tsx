"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChatMessage } from "./chat-message";
import { ActionPanel } from "./action-panel";
import { filterResponseBySubject } from "@/lib/content-filter";
import { stripThinkingTags } from "@/lib/strip-thinking";
import { parseActionsFromResponse, splitActions } from "@/lib/parse-actions";
import { createSseParserState, extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";
import { useHeartbeat } from "@/lib/use-heartbeat";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: string[];
}

interface InquiryContext {
  subject: string;
  unitName: string;
  teacherName: string;
  description: string;
}

interface ChatContainerProps {
  sessionId: string;
  initialMessages: Message[];
  inquiry: InquiryContext;
  helpType?: string | null;
  topicPreviews?: string[];
}

export function ChatContainer({
  sessionId,
  initialMessages,
  inquiry,
  helpType,
  topicPreviews = [],
}: ChatContainerProps) {
  useHeartbeat(sessionId);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(initialMessages.length === 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isStreamingRef = useRef(false);

  const subjectGroup = useMemo(() =>
    inquiry.subject === "MATHEMATICS" || inquiry.subject === "SCIENCE"
      ? "math-stem"
      : inquiry.subject === "HISTORY"
        ? "history"
        : "writing",
    [inquiry.subject]
  );

  const welcomePhrase = useMemo(() => {
    const phrases = [
      "What do you have in mind?",
      "Let\u2019s make this click.",
      "Ready when you are.",
      "Let\u2019s break it down together.",
      "One step at a time \u2014 let\u2019s go.",
      "Let\u2019s figure this out.",
      "You\u2019ve got this \u2014 let\u2019s start.",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }, []);

  const welcomeActions = useMemo(() => {
    // When topicPreviews is populated it contains full Socratic
    // questions AI-generated from the student's uploaded material
    // (see src/lib/topic-questions.ts). Surface them directly as
    // action labels — the questions are already complete prompts and
    // wrapping them ("Walk me through this: ...") reads clunky.
    if (topicPreviews.length > 0) {
      const actions = topicPreviews.slice(0, 3);
      while (actions.length < 3) {
        if (subjectGroup === "math-stem") {
          actions.push(actions.length === 1 ? `Quiz me on ${inquiry.unitName}` : `Start with the fundamentals`);
        } else if (subjectGroup === "history") {
          actions.push(actions.length === 1 ? `Quiz me on the key events` : `Give me the background context`);
        } else {
          actions.push(actions.length === 1 ? `Help me develop a thesis` : `Walk me through essay structure`);
        }
      }
      return actions;
    }

    // When helpType exists (from session setup form), tailor actions to the user's stated struggle
    if (helpType) {
      if (subjectGroup === "math-stem") {
        return [
          `Walk me through this step by step: ${helpType}`,
          `Start with the fundamentals, then help me with this`,
          `Give me a practice problem related to this`,
        ];
      }
      if (subjectGroup === "history") {
        return [
          `Help me understand this: ${helpType}`,
          `Give me the background context I need first`,
          `Quiz me on this topic to find my gaps`,
        ];
      }
      return [
        `Help me work through this: ${helpType}`,
        `Start with the basics, then build up to this`,
        `Give me an example to learn from`,
      ];
    }

    // Fallback: no helpType or file content, use inquiry description or generic actions
    if (subjectGroup === "math-stem") {
      return inquiry.description
        ? [
            `Help me understand: ${inquiry.description}`,
            `Load up a problem from my uploaded file`,
            `Quiz me on ${inquiry.unitName}`,
          ]
        : [
            `Load up a problem from my uploaded file`,
            `Quiz me on ${inquiry.unitName}`,
            `Start with the basics of ${inquiry.unitName}`,
          ];
    }

    if (subjectGroup === "history") {
      return inquiry.description
        ? [
            `Help me analyze: ${inquiry.description}`,
            `Walk me through a source from my uploaded file`,
            `Quiz me on the key events in ${inquiry.unitName}`,
          ]
        : [
            `Walk me through a source from my uploaded file`,
            `Help me understand the causes and effects in ${inquiry.unitName}`,
            `Start with the timeline of ${inquiry.unitName}`,
          ];
    }

    // writing (English, Humanities, etc.)
    return inquiry.description
      ? [
          `Help me with: ${inquiry.description}`,
          `Give me feedback on my uploaded writing`,
          `Help me develop a thesis for ${inquiry.unitName}`,
        ]
      : [
          `Give me feedback on my uploaded writing`,
          `Help me develop a thesis for ${inquiry.unitName}`,
          `Walk me through the structure of a strong essay`,
        ];
  }, [subjectGroup, helpType, topicPreviews, inquiry.description, inquiry.unitName]);

  const getDefaultActions = useCallback((): string[] => {
    if (subjectGroup === "math-stem") {
      return [
        "Walk me through the next step",
        "Can you explain that a different way?",
        "I'm stuck, help me",
      ];
    }
    if (subjectGroup === "history") {
      return [
        "Tell me more about this",
        "Can you explain that a different way?",
        "I'm stuck, help me",
      ];
    }
    return [
      "Help me develop this further",
      "Can you explain that a different way?",
      "I'm stuck, help me",
    ];
  }, [subjectGroup]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Show actions from the last assistant message on load
  useEffect(() => {
    if (!showWelcome) {
      const lastAssistant = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");
      if (lastAssistant?.suggestedActions?.length) {
        setCurrentActions(lastAssistant.suggestedActions);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const streamResponse = async (text: string) => {
    if (isStreamingRef.current) return;
    isStreamingRef.current = true;

    setShowWelcome(false);
    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
    setIsThinking(true);
    setCurrentActions([]);

    // Add placeholder for streaming AI response
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Chat failed: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Chat response had no body");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const sseState = createSseParserState();
      let fullText = "";
      let thinkingCleared = false;
      // One or two malformed frames during a reconnect is fine; a
      // sustained burst of unparseable JSON means the upstream is
      // producing garbage and we should surface that instead of
      // silently rendering an empty assistant message.
      let parseFailConsecutive = 0;
      let parseFailTotal = 0;
      const MAX_CONSECUTIVE_PARSE_FAILS = 5;
      const MAX_TOTAL_PARSE_FAILS = 15;
      let streamMalformed = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const messages = extractSseDataMessages(sseState, chunk);

        for (const data of messages) {
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            parseFailConsecutive = 0;
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;

              // Strip <think>...</think> tags and fix R1 sentence fragments
              const visible = stripThinkingTags(fullText);

              // Don't show anything while model is still thinking
              if (!visible) continue;

              if (!thinkingCleared) {
                setIsThinking(false);
                thinkingCleared = true;
              }

              const displayText = filterResponseBySubject(
                splitActions(visible).before.trim(),
                inquiry.subject
              );
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: displayText,
                };
                return updated;
              });
              scrollToBottom();
            }
          } catch {
            parseFailConsecutive += 1;
            parseFailTotal += 1;
            if (
              parseFailConsecutive >= MAX_CONSECUTIVE_PARSE_FAILS ||
              parseFailTotal >= MAX_TOTAL_PARSE_FAILS
            ) {
              streamMalformed = true;
              break;
            }
          }
        }
        if (streamMalformed) break;
      }

      if (streamMalformed) {
        throw new Error(
          "Tutor stream was malformed (too many unparseable frames). Please retry.",
        );
      }

      for (const data of flushSseDataMessages(sseState)) {
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullText += delta;
          }
        } catch {
          // Single trailing frame may be partial; silently skipped.
          // The streaming-phase threshold above already caught
          // sustained garbage.
        }
      }

      // Parse actions using shared utility
      const { message: parsedMessage, suggestedActions: actions } = parseActionsFromResponse(fullText);
      const finalMessage = filterResponseBySubject(parsedMessage, inquiry.subject);

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: finalMessage,
          suggestedActions: actions,
        };
        return updated;
      });

      setCurrentActions(actions.length > 0 ? actions : getDefaultActions());
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      isStreamingRef.current = false;
      setIsStreaming(false);
      setIsThinking(false);
      inputRef.current?.focus();
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;
    await streamResponse(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-2">
          {showWelcome && (
            <div className="py-12">
              <p className="text-2xl font-display font-semibold mb-2">
                Hello, I&apos;m Paideia.
              </p>
              <p className="text-base text-text-secondary font-serif leading-relaxed">
                Your Socratic tutor for{" "}
                <span className="text-text-primary font-semibold">
                  {inquiry.unitName}
                </span>{" "}
                in{" "}
                {inquiry.subject.charAt(0) + inquiry.subject.slice(1).toLowerCase()}{" "}
                with {inquiry.teacherName}.{" "}
                {welcomePhrase}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.id ?? `msg-${i}`}
              role={msg.role}
              content={msg.content}
              isStreaming={
                isStreaming &&
                i === messages.length - 1 &&
                msg.role === "assistant"
              }
              isThinking={
                isThinking &&
                i === messages.length - 1 &&
                msg.role === "assistant"
              }
            />
          ))}
        </div>
      </div>

      {/* Action panel + Input area */}
      <div className="border-t border-[rgba(168,152,128,0.12)]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {showWelcome && !isStreaming && (
            <ActionPanel
              actions={welcomeActions}
              label={helpType ? "How should we approach this?" : "How would you like to start?"}
              onSelect={(action) => {
                sendMessage(action);
              }}
              onDismiss={() => setShowWelcome(false)}
            />
          )}

          {!showWelcome && currentActions.length > 0 && !isStreaming && (
            <ActionPanel
              actions={currentActions}
              onSelect={(action) => {
                setCurrentActions([]);
                sendMessage(action);
              }}
              onDismiss={() => setCurrentActions([])}
            />
          )}

          {/* Show standalone input only when no action panel is visible */}
          {!(!isStreaming && (showWelcome || currentActions.length > 0)) && (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                maxLength={2000}
                rows={1}
                disabled={isStreaming}
                className="flex-1 bg-bg-base border border-[rgba(168,152,128,0.15)] rounded-2xl px-5 py-3.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none disabled:opacity-50 font-serif"
              />
              <button
                type="submit"
                disabled={isStreaming || !input.trim()}
                className="bg-accent hover:bg-accent-light text-[#281c14] rounded-2xl px-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
