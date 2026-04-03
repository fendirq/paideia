import { defaultSchema } from "rehype-sanitize";

// Allow KaTeX HTML output through rehype-sanitize while blocking XSS vectors.
// KaTeX generates <span>, <svg>, <path>, <line> with class/style attributes.
export const katexSanitizeSchema: typeof defaultSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "span",
    "svg",
    "path",
    "line",
    "rect",
    "g",
    "defs",
    "use",
    "clipPath",
    "symbol",
  ],
  attributes: {
    ...defaultSchema.attributes,
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      "className",
      "class",
      "style",
      "aria-hidden",
    ],
    svg: ["className", "class", "width", "height", "viewBox", "style", "aria-hidden", "focusable"],
    path: ["d", "fill", "stroke", "strokeWidth", "strokeLinecap", "strokeLinejoin"],
    line: ["x1", "x2", "y1", "y2", "stroke", "strokeWidth"],
    rect: ["x", "y", "width", "height", "fill"],
    g: ["transform", "className", "class"],
    use: ["href"],
    clipPath: ["id"],
    symbol: ["id", "viewBox"],
    div: [...(defaultSchema.attributes?.div ?? []), "className", "class", "style"],
  },
};
