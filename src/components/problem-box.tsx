import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { katexSanitizeSchema } from "@/lib/rehype-sanitize-config";
import { renderMath } from "@/lib/math";

interface ProblemBoxProps {
  label?: string;
  content: string;
}

export function ProblemBox({ label = "PROBLEM", content }: ProblemBoxProps) {
  return (
    <div className="bg-bg-surface/70 border border-[rgba(168,152,128,0.15)] border-l-[3px] border-l-accent rounded-xl px-5 py-4 my-4">
      <p className="font-display font-semibold text-[11px] uppercase tracking-wider text-accent-light mb-3">
        {label}
      </p>
      <div className="text-[17px] leading-relaxed text-text-primary">
        <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, katexSanitizeSchema]]}>
          {renderMath(content)}
        </ReactMarkdown>
      </div>
    </div>
  );
}
