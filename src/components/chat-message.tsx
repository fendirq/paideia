"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { renderMath, cleanUserMath } from "@/lib/math";
import "katex/dist/katex.min.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  isThinking?: boolean;
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  isThinking,
}: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div
          className="max-w-[75%] px-[18px] py-3"
          style={{
            borderRadius: "20px 20px 6px 20px",
            background: "rgba(74, 157, 91, 0.3)",
            border: "1px solid rgba(74, 157, 91, 0.15)",
          }}
        >
          <p className="text-text-primary text-[15px] leading-relaxed font-serif whitespace-pre-wrap">
            {cleanUserMath(content)}
          </p>
        </div>
      </div>
    );
  }

  if (isThinking && !content) {
    return (
      <div className="mb-8 max-w-[90%]">
        <div className="flex items-center gap-3 text-text-muted">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="8 4" strokeLinecap="round" className="text-accent/60" />
          </svg>
          <span className="text-sm font-serif italic">
            Working on it...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 max-w-[90%] pb-6 border-b border-white/[0.04] last:border-b-0">
      <div className="chat-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        >
          {renderMath(content)}
        </ReactMarkdown>
      </div>
      {isStreaming && content && (
        <span className="inline-block w-2 h-5 bg-accent animate-pulse ml-1 mt-1" />
      )}
    </div>
  );
}
