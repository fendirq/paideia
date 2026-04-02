"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import katex from "katex";
import "katex/dist/katex.min.css";

// Strip any raw HTML tags from AI model output to prevent XSS.
function sanitizeModelOutput(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function tryKatex(expr: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(expr.trim(), { displayMode, throwOnError: false });
  } catch {
    return null;
  }
}

// Pre-render all math expressions with KaTeX before passing to ReactMarkdown.
// Uses placeholder approach: render math → store in array → replace placeholders after.
function renderMath(text: string): string {
  text = sanitizeModelOutput(text);

  // Normalize \(...\) → $...$ and \[...\] → $$...$$
  text = text
    .replace(/\\\((.+?)\\\)/g, (_, e) => `$${e}$`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, e) => `$$${e}$$`);

  const rendered: string[] = [];
  const placeholder = (i: number) => `%%KATEX_${i}%%`;

  // Pass 1: Display math $$...$$
  text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, expr) => {
    const html = tryKatex(expr, true);
    if (html) {
      rendered.push(html);
      return placeholder(rendered.length - 1);
    }
    return match;
  });

  // Pass 2: Inline math $...$  (no newlines, no $ inside)
  text = text.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
    const html = tryKatex(expr, false);
    if (html) {
      rendered.push(html);
      return placeholder(rendered.length - 1);
    }
    return match;
  });

  // Clean up any unmatched $$ or stray $$ markers
  text = text.replace(/\$\$/g, "");

  // Replace placeholders with rendered HTML
  for (let i = 0; i < rendered.length; i++) {
    text = text.replace(placeholder(i), rendered[i]);
  }

  return text;
}

const superscripts: Record<string, string> = {
  "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
  "n": "\u207F", "i": "\u2071",
};

// Convert plain-text math (^2, sqrt(), etc.) to unicode for user messages
function cleanUserMath(text: string): string {
  return text
    .replace(/\^{([^}]+)}/g, (_, exp) =>
      [...exp].map((c: string) => superscripts[c] || c).join("")
    )
    .replace(/\^(\d+|n|i)/g, (_, exp) =>
      [...exp].map((c: string) => superscripts[c] || c).join("")
    )
    .replace(/sqrt\(([^)]*)\)/gi, "\u221A($1)")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\\\/g, "")
    .replace(/\\pi/g, "\u03C0")
    .replace(/\\pm/g, "\u00B1")
    .replace(/\\times/g, "\u00D7")
    .replace(/\\div/g, "\u00F7")
    .replace(/\\leq/g, "\u2264")
    .replace(/\\geq/g, "\u2265");
}

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
        <div className="bg-bg-elevated rounded-2xl rounded-br-md px-5 py-3.5 max-w-[75%]">
          <p className="text-text-primary text-base leading-relaxed whitespace-pre-wrap font-[Times_New_Roman,_Times,_serif]">
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
          <span className="text-sm font-[Times_New_Roman,_Times,_serif] italic">
            Working on it...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 max-w-[90%]">
      <div className="chat-prose font-[Times_New_Roman,_Times,_serif]">
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
