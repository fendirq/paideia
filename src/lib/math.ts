import katex from "katex";

export function tryKatex(expr: string, displayMode: boolean): string | null {
  try {
    return katex.renderToString(expr.trim(), { displayMode, throwOnError: false });
  } catch {
    return null;
  }
}

// Strip any raw HTML tags from AI model output to prevent XSS.
function sanitizeModelOutput(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

// Pre-render all math expressions with KaTeX before passing to ReactMarkdown.
export function renderMath(text: string): string {
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

  // Pass 2: Inline math $...$
  text = text.replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
    const html = tryKatex(expr, false);
    if (html) {
      rendered.push(html);
      return placeholder(rendered.length - 1);
    }
    return match;
  });

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

// Convert plain-text math to unicode for user messages
export function cleanUserMath(text: string): string {
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
