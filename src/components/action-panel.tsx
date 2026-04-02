"use client";

import { useState } from "react";

const superscripts: Record<string, string> = {
  "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
  "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
  "n": "\u207F", "i": "\u2071",
};

function cleanMathText(text: string): string {
  return text
    .replace(/\^(\d+|n|i)/g, (_, exp) =>
      [...exp].map((c: string) => superscripts[c] || c).join("")
    )
    .replace(/\^{([^}]+)}/g, (_, exp) =>
      [...exp].map((c: string) => superscripts[c] || c).join("")
    )
    .replace(/sqrt\(([^)]*)\)/gi, "\u221A($1)")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\\frac{([^}]*)}{([^}]*)}/g, "$1/$2")
    .replace(/\\sqrt{([^}]*)}/g, "\u221A($1)")
    .replace(/\\cdot/g, "\u00B7")
    .replace(/\\pi/g, "\u03C0")
    .replace(/\\infty/g, "\u221E")
    .replace(/\\pm/g, "\u00B1")
    .replace(/\\times/g, "\u00D7")
    .replace(/\\div/g, "\u00F7")
    .replace(/\\leq/g, "\u2264")
    .replace(/\\geq/g, "\u2265")
    .replace(/\\neq/g, "\u2260")
    .replace(/\\(?![a-zA-Z])/g, "")
    .replace(/\\/g, "");
}

interface ActionPanelProps {
  actions: string[];
  onSelect: (action: string) => void;
  onDismiss: () => void;
  label?: string;
}

export function ActionPanel({ actions, onSelect, onDismiss, label }: ActionPanelProps) {
  const [customInput, setCustomInput] = useState(false);
  const [customText, setCustomText] = useState("");

  if (actions.length === 0) return null;

  return (
    <div className="bg-bg-base border border-bg-elevated rounded-xl p-3.5 mb-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-text-primary">
          {label || "Choose your answer:"}
        </p>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-primary transition-colors p-0.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-1">
        {actions.slice(0, 3).map((action, i) => (
          <button
            key={i}
            onClick={() => onSelect(action)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2.5 font-[Times_New_Roman,_Times,_serif] text-text-secondary hover:bg-bg-elevated/50"
          >
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 bg-bg-elevated text-text-muted">
              {i + 1}
            </span>
            <span className="flex-1">{cleanMathText(action)}</span>
          </button>
        ))}

        <div className="border-t border-bg-elevated mt-2 pt-2">
          {!customInput ? (
            <button
              onClick={() => setCustomInput(true)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-text-muted hover:bg-bg-elevated/50 flex items-center gap-2.5 transition-colors"
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center bg-bg-elevated shrink-0">
                <svg className="w-3 h-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </span>
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
                placeholder="Type your question..."
                className="flex-1 bg-bg-elevated rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent font-[Times_New_Roman,_Times,_serif]"
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
        </div>
      </div>
    </div>
  );
}
