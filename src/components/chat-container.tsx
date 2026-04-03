"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ActionPanel } from "./action-panel";
import { filterResponseBySubject } from "@/lib/content-filter";

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
}

export function ChatContainer({
  sessionId,
  initialMessages,
  inquiry,
  helpType,
}: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const [showWelcome, setShowWelcome] = useState(initialMessages.length === 0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isStreamingRef = useRef(false);

  const getWelcomeActions = (): string[] => {
    const subjectGroup =
      inquiry.subject === "MATHEMATICS" || inquiry.subject === "SCIENCE"
        ? "math-stem"
        : inquiry.subject === "HISTORY"
          ? "history"
          : "writing";

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
  };

  const welcomeActions = getWelcomeActions();

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

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let thinkingCleared = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullText += delta;

              // Strip <think>...</think> tags and any unclosed <think> block
              let visible = fullText
                .replace(/<think>[\s\S]*?<\/think>/g, "")
                .replace(/<think>[\s\S]*$/g, "")
                .trim();

              // Don't show anything while model is still thinking
              if (!visible) continue;

              if (!thinkingCleared) {
                setIsThinking(false);
                thinkingCleared = true;
              }

              const displayText = filterResponseBySubject(
                visible.split("---ACTIONS---")[0].trim(),
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
            // skip parse errors
          }
        }
      }

      // Strip thinking tags (closed and unclosed) and parse actions
      let cleaned = fullText
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .replace(/<think>[\s\S]*$/g, "")
        .trim();

      const separator = "---ACTIONS---";
      const idx = cleaned.lastIndexOf(separator);
      let finalMessage = filterResponseBySubject(cleaned, inquiry.subject);
      let actions: string[] = [];

      if (idx !== -1) {
        finalMessage = cleaned.slice(0, idx).trim();
        const actionsText = cleaned.slice(idx + separator.length).trim();
        actions = actionsText
          .split("\n")
          .map((l) => l.replace(/^\d+\.\s*/, "").trim())
          .filter((l) => l.length > 0 && l !== "I still don't understand")
          .slice(0, 3);
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: finalMessage,
          suggestedActions: actions,
        };
        return updated;
      });

      if (actions.length > 0) {
        setCurrentActions(actions);
      }
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
    streamResponse(text);
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
                with {inquiry.teacherName}. How would you like to start?
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
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
      <div className="border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {showWelcome && !isStreaming && (
            <ActionPanel
              actions={welcomeActions}
              label="How would you like to start?"
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
              className="flex-1 bg-bg-base border border-white/[0.06] rounded-2xl px-5 py-3.5 text-[15px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none disabled:opacity-50 font-serif"
            />
            <button
              type="submit"
              disabled={isStreaming || !input.trim()}
              className="bg-accent hover:bg-accent-light text-bg-base rounded-2xl px-4 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </div>
  );
}
