# Chat Interface & Socratic Tutoring — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real-time Socratic tutoring chat interface powered by Together.ai, with RAG context retrieval from pgvector, streaming responses, markdown rendering, and a Claude-style suggested actions panel.

**Architecture:** POST `/api/sessions/[id]/chat` receives a user message, retrieves relevant RAG chunks via cosine similarity, builds a system prompt with Socratic instructions + context, streams the response from Together.ai, and parses suggested actions. The chat UI streams tokens in real-time with user bubbles (right-aligned, dark) and AI open text (markdown-rendered). An action panel shows 4 contextual suggestions after each AI response.

**Tech Stack:** Together.ai Chat API (streaming SSE), pgvector cosine similarity, react-markdown + remark-gfm, Server-Sent Events

---

### Task 1: Install Chat Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install markdown rendering**

```bash
npm install react-markdown remark-gfm
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add markdown rendering dependencies"
```

---

### Task 2: RAG Retrieval Utility

**Files:**
- Create: `src/lib/rag-retrieval.ts`

Cosine similarity search against pgvector to find the most relevant text chunks for a query.

- [ ] **Step 1: Create the retrieval module**

```typescript
import { db } from "./db";
import { generateSingleEmbedding } from "./embeddings";

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  query: string,
  inquiryId: string,
  topK: number = 6
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateSingleEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const chunks = await db.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT id, content, 1 - (embedding <=> $1::vector(1024)) as similarity
     FROM "TextChunk"
     WHERE "inquiryId" = $2
     ORDER BY embedding <=> $1::vector(1024)
     LIMIT $3`,
    vectorStr,
    inquiryId,
    topK
  );

  return chunks;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag-retrieval.ts
git commit -m "feat: add RAG retrieval with pgvector cosine similarity"
```

---

### Task 3: Socratic System Prompt Builder

**Files:**
- Create: `src/lib/system-prompt.ts`

Builds the system prompt with Socratic instructions, subject context, and RAG chunks.

- [ ] **Step 1: Create the system prompt module**

```typescript
interface PromptContext {
  subject: string;
  unitName: string;
  teacherName: string;
  description: string;
  ragChunks: { content: string }[];
}

export function buildSystemPrompt(context: PromptContext): string {
  const ragContext = context.ragChunks.length > 0
    ? `\n\n## Uploaded Material Context\nThe student uploaded coursework about "${context.unitName}" in ${context.subject} (teacher: ${context.teacherName}). They described their struggle as: "${context.description}"\n\nRelevant excerpts from their uploaded materials:\n${context.ragChunks.map((c, i) => `[Excerpt ${i + 1}]: ${c.content}`).join("\n\n")}`
    : "";

  return `You are Paideia, an AI Socratic tutor for Drew School students. Your role is to guide students to understanding through questions, not to give answers directly.

## Core Principles
- Never give answers directly — ask guiding questions first
- Diagnose the student's confusion before teaching
- Break problems into small steps, checking comprehension after each
- Use analogies and multiple representations
- Celebrate progress without being patronizing
- Adapt to the student's level (simplify or increase complexity)
- Reference the student's uploaded material when relevant
- Periodically check understanding ("Can you explain that back in your own words?")
- If the student explicitly asks to see the full solution or says "break it down for me", adapt and show a complete step-by-step walkthrough, then move to practice problems

## Subject Context
Subject: ${context.subject}
Unit/Topic: ${context.unitName}
Teacher: ${context.teacherName}
${ragContext}

## Response Format
After your tutoring response, output exactly 4 suggested follow-up actions the student might want to take. Format them on separate lines after a separator:

---ACTIONS---
[action 1]
[action 2]
[action 3]
[action 4]

The actions should be specific to the current conversation context (e.g., "Walk me through step 2", "Try a similar problem", "Explain why that formula works", "Quiz me on this concept").`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/system-prompt.ts
git commit -m "feat: add Socratic system prompt builder with RAG context"
```

---

### Task 4: Together.ai Streaming Chat Utility

**Files:**
- Create: `src/lib/together-chat.ts`

Handles streaming chat completions from Together.ai with response parsing.

- [ ] **Step 1: Create the chat utility**

```typescript
const TOGETHER_CHAT_URL = "https://api.together.xyz/v1/chat/completions";
const DEFAULT_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getModel(): string {
  return process.env.TOGETHER_CHAT_MODEL || DEFAULT_MODEL;
}

export async function streamChatCompletion(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error("TOGETHER_API_KEY is not set");

  const response = await fetch(TOGETHER_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together.ai chat error: ${response.status} ${error}`);
  }

  return response.body!;
}

export function parseActionsFromResponse(fullText: string): {
  message: string;
  suggestedActions: string[];
} {
  const separator = "---ACTIONS---";
  const idx = fullText.lastIndexOf(separator);
  if (idx === -1) {
    return { message: fullText.trim(), suggestedActions: [] };
  }

  const message = fullText.slice(0, idx).trim();
  const actionsText = fullText.slice(idx + separator.length).trim();
  const suggestedActions = actionsText
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, 4);

  return { message, suggestedActions };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/together-chat.ts
git commit -m "feat: add Together.ai streaming chat utility with action parsing"
```

---

### Task 5: Session API Routes

**Files:**
- Create: `src/app/api/sessions/route.ts`
- Create: `src/app/api/sessions/[id]/route.ts`
- Create: `src/app/api/sessions/[id]/chat/route.ts`
- Create: `src/app/api/sessions/[id]/rate/route.ts`

- [ ] **Step 1: Create session list/create route**

`src/app/api/sessions/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inquiryId } = await req.json();
  if (!inquiryId) {
    return NextResponse.json({ error: "inquiryId required" }, { status: 400 });
  }

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
    },
  });

  return NextResponse.json(tutoringSession, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: {
        select: { subject: true, unitName: true, teacherName: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json(sessions);
}
```

- [ ] **Step 2: Create session detail route**

`src/app/api/sessions/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tutoringSession);
}
```

- [ ] **Step 3: Create chat streaming route**

`src/app/api/sessions/[id]/chat/route.ts`:

This is the core route — receives user message, retrieves RAG context, streams AI response.

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { retrieveRelevantChunks } from "@/lib/rag-retrieval";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { streamChatCompletion, parseActionsFromResponse } from "@/lib/together-chat";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const { message } = await req.json();

  if (!message || typeof message !== "string" || message.length > 2000) {
    return new Response("Invalid message", { status: 400 });
  }

  // Load session with inquiry and recent messages
  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: true,
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Save user message
  await db.message.create({
    data: {
      sessionId: id,
      role: "user",
      content: message,
    },
  });

  // Retrieve RAG context
  const ragChunks = await retrieveRelevantChunks(
    message,
    tutoringSession.inquiryId
  );

  // Build system prompt
  const systemPrompt = buildSystemPrompt({
    subject: tutoringSession.inquiry.subject,
    unitName: tutoringSession.inquiry.unitName,
    teacherName: tutoringSession.inquiry.teacherName,
    description: tutoringSession.inquiry.description,
    ragChunks,
  });

  // Build messages array for the LLM
  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...tutoringSession.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Stream response from Together.ai
  const upstreamBody = await streamChatCompletion(chatMessages);

  // Create a transform stream that:
  // 1. Forwards SSE chunks to the client
  // 2. Collects the full response text
  // 3. After completion, saves the AI message to DB
  let fullResponse = "";

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk);

      // Parse SSE to collect full text
      const text = new TextDecoder().decode(chunk);
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) fullResponse += delta;
        } catch {
          // skip parse errors
        }
      }
    },
    async flush() {
      // Save AI response to DB after stream completes
      const { message: aiMessage, suggestedActions } =
        parseActionsFromResponse(fullResponse);

      await db.message.create({
        data: {
          sessionId: id,
          role: "assistant",
          content: aiMessage,
          suggestedActions,
        },
      });
    },
  });

  const stream = upstreamBody.pipeThrough(transform);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 4: Create session rating route**

`src/app/api/sessions/[id]/rate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating, comment } = await req.json();

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
  }

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await db.tutoringSession.update({
    where: { id },
    data: {
      rating,
      ratingComment: comment || null,
      status: "COMPLETED",
      endedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/app/api/sessions/
git commit -m "feat: add session CRUD and streaming chat API routes"
```

---

### Task 6: Chat Message Component

**Files:**
- Create: `src/components/chat-message.tsx`

User messages: dark bubbles, right-aligned. AI messages: open text with markdown.

- [ ] **Step 1: Create the message component**

```tsx
"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-bg-base rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
          <p className="text-text-primary text-sm whitespace-pre-wrap">
            {content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 max-w-[85%]">
      <div className="prose prose-invert prose-sm max-w-none text-text-primary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat-message.tsx
git commit -m "feat: add chat message component with markdown rendering"
```

---

### Task 7: Action Panel Component

**Files:**
- Create: `src/components/action-panel.tsx`

Claude-style floating panel with 4 suggested actions.

- [ ] **Step 1: Create the action panel**

```tsx
"use client";

import { useState } from "react";

interface ActionPanelProps {
  actions: string[];
  onSelect: (action: string) => void;
  onDismiss: () => void;
}

export function ActionPanel({ actions, onSelect, onDismiss }: ActionPanelProps) {
  const [customInput, setCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  if (actions.length === 0) return null;

  return (
    <div className="bg-bg-surface border border-bg-elevated rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-text-secondary">
          What do you want to do?
        </p>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-1.5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => onSelect(action)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              i === 0
                ? "bg-accent/10 text-accent border border-accent/20"
                : "text-text-primary hover:bg-bg-elevated border border-transparent"
            }`}
          >
            <span className={`text-xs font-mono ${i === 0 ? "text-accent" : "text-text-muted"}`}>
              {i + 1}
            </span>
            {action}
          </button>
        ))}

        <div className="border-t border-bg-elevated my-2" />

        {!customInput ? (
          <button
            onClick={() => setCustomInput(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-bg-elevated flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
            Something else
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customText.trim()) {
                onSelect(customText.trim());
                setCustomText("");
                setCustomInput(false);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your own question..."
              className="flex-1 bg-bg-elevated rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-2 bg-accent text-bg-base rounded-lg text-sm font-medium"
            >
              Send
            </button>
          </form>
        )}

        <button
          onClick={onDismiss}
          className="w-full text-center px-3 py-1.5 text-xs text-text-muted hover:text-text-secondary"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/action-panel.tsx
git commit -m "feat: add Claude-style action panel for suggested follow-ups"
```

---

### Task 8: Chat Container Component

**Files:**
- Create: `src/components/chat-container.tsx`

Main chat orchestrator — manages messages, streaming, scroll, input, and action panel.

- [ ] **Step 1: Create the chat container**

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ActionPanel } from "./action-panel";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  suggestedActions?: string[];
}

interface ChatContainerProps {
  sessionId: string;
  initialMessages: Message[];
}

export function ChatContainer({ sessionId, initialMessages }: ChatContainerProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentActions, setCurrentActions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (lastAssistant?.suggestedActions?.length) {
      setCurrentActions(lastAssistant.suggestedActions);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);
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
              // Remove actions section from displayed text while streaming
              const displayText = fullText.split("---ACTIONS---")[0].trim();
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

      // Parse final response for actions
      const separator = "---ACTIONS---";
      const idx = fullText.lastIndexOf(separator);
      let finalMessage = fullText.trim();
      let actions: string[] = [];

      if (idx !== -1) {
        finalMessage = fullText.slice(0, idx).trim();
        const actionsText = fullText.slice(idx + separator.length).trim();
        actions = actionsText
          .split("\n")
          .map((l) => l.replace(/^\d+\.\s*/, "").trim())
          .filter((l) => l.length > 0)
          .slice(0, 4);
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
      setIsStreaming(false);
      inputRef.current?.focus();
    }
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
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-text-muted py-12">
            <p className="text-lg font-display">Ready to learn</p>
            <p className="text-sm mt-1">Send a message to start your tutoring session.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
      </div>

      {/* Action panel + Input area */}
      <div className="border-t border-bg-elevated p-4">
        {currentActions.length > 0 && !isStreaming && (
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
            className="flex-1 bg-bg-surface border border-bg-elevated rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat-container.tsx
git commit -m "feat: add chat container with streaming and action panel"
```

---

### Task 9: Session Pages

**Files:**
- Create: `src/app/app/sessions/new/page.tsx`
- Create: `src/app/app/sessions/[id]/page.tsx`
- Create: `src/app/app/sessions/page.tsx`

- [ ] **Step 1: Create new session page (redirector)**

`src/app/app/sessions/new/page.tsx` — Creates a session and redirects to the chat.

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { inquiry: inquiryId } = await searchParams;
  if (!inquiryId) redirect("/app");

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) redirect("/app");

  // Create new tutoring session
  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
    },
  });

  redirect(`/app/sessions/${tutoringSession.id}`);
}
```

- [ ] **Step 2: Create session chat page**

`src/app/app/sessions/[id]/page.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChatContainer } from "@/components/chat-container";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: { select: { subject: true, unitName: true, teacherName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    redirect("/app");
  }

  const initialMessages = tutoringSession.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    suggestedActions: m.suggestedActions,
  }));

  const subjectLabel =
    tutoringSession.inquiry.subject.charAt(0) +
    tutoringSession.inquiry.subject.slice(1).toLowerCase();

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-bg-elevated px-6 py-3 flex items-center gap-3">
        <a href="/app" className="text-text-muted hover:text-text-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </a>
        <div>
          <h1 className="text-sm font-display font-semibold">
            {tutoringSession.inquiry.unitName}
          </h1>
          <p className="text-xs text-text-muted">
            {subjectLabel} &middot; {tutoringSession.inquiry.teacherName}
          </p>
        </div>
      </div>
      <div className="flex-1 bg-bg-surface overflow-hidden">
        <ChatContainer sessionId={id} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create sessions list page**

`src/app/app/sessions/page.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: { select: { subject: true, unitName: true, teacherName: true } },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Tutoring Sessions</h1>
      <p className="text-text-secondary mb-8">
        Your past and active tutoring sessions.
      </p>

      {sessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No sessions yet.</p>
          <a href="/app/upload" className="text-accent text-sm mt-2 inline-block">
            Upload coursework to start
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const subjectLabel =
              s.inquiry.subject.charAt(0) + s.inquiry.subject.slice(1).toLowerCase();
            return (
              <a
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="card p-4 block hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm">
                      {s.inquiry.unitName}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {subjectLabel} &middot; {s.inquiry.teacherName} &middot;{" "}
                      {s._count.messages} messages
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.status === "ACTIVE"
                          ? "bg-accent/10 text-accent"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {s.status === "ACTIVE" ? "Active" : "Completed"}
                    </span>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

- [ ] **Step 5: Verify build**

Run: `npx next build`
Expected: All routes compile, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/app/sessions/
git commit -m "feat: add session pages (new, chat, list)"
```

---

### Task 10: Add Chat Model to Environment

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add model configuration**

Add to `.env.local`:
```
TOGETHER_CHAT_MODEL="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"
```

- [ ] **Step 2: Verify dev server and test chat**

Start dev server, navigate to the inquiry detail page, click "Start Tutoring Session", send a message, and verify:
- Session is created
- User message appears in dark bubble (right-aligned)
- AI response streams in real-time with markdown
- Suggested actions appear after response completes
- Clicking an action sends it as a new message
