import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { katexSanitizeSchema } from "@/lib/rehype-sanitize-config";
import { renderMath } from "@/lib/math";

interface Step {
  label: string;
  explanation: string;
  math?: string;
}

interface StepChainProps {
  steps: Step[];
}

export function StepChain({ steps }: StepChainProps) {
  return (
    <div className="border-l-2 border-accent/30 pl-[22px] my-4 space-y-0">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`py-4 ${
            i < steps.length - 1
              ? "border-b border-white/[0.04]"
              : ""
          }`}
        >
          {/* Step label */}
          <p className="font-display font-semibold text-[13px] text-accent-light mb-2">
            {step.label}
          </p>

          {/* Explanation */}
          <div className="font-serif text-[15px] leading-relaxed text-text-secondary mb-2">
            <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, katexSanitizeSchema]]}>
              {renderMath(step.explanation)}
            </ReactMarkdown>
          </div>

          {/* Math block */}
          {step.math && (
            <div className="bg-bg-surface/50 border border-white/[0.04] rounded-lg px-3.5 py-2.5 text-base leading-relaxed">
              <ReactMarkdown rehypePlugins={[rehypeRaw, [rehypeSanitize, katexSanitizeSchema]]}>
                {renderMath(step.math)}
              </ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
