"use client";

import { SUBJECT_COLORS } from "@/lib/subject-constants";

interface DonutSegment {
  subject: string;
  label: string;
  count: number;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
}

export function DonutChart({ segments, total }: DonutChartProps) {
  const size = 140;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute cumulative offsets to avoid mutation during render
  const offsets = segments.reduce<number[]>((acc, seg, i) => {
    const prev = i === 0 ? 0 : acc[i - 1] + (total > 0 ? segments[i - 1].count / total : 0);
    acc.push(prev);
    return acc;
  }, []);

  return (
    <div className="bg-bg-inner border border-white/[0.04] rounded-[14px] p-6">
      <h3 className="font-display text-[13px] font-semibold mb-5">
        Study Breakdown
      </h3>

      <div className="flex items-center gap-6">
        {/* SVG Donut */}
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            {segments.map((seg, i) => {
              const percent = total > 0 ? seg.count / total : 0;
              const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const dashOffset = -circumference * offsets[i];
              const color =
                SUBJECT_COLORS[seg.subject] ?? SUBJECT_COLORS.OTHER;

              return (
                <circle
                  key={seg.subject}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="butt"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display font-bold text-[22px] text-text-primary">
              {total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 flex-1">
          {segments.map((seg) => {
            const color =
              SUBJECT_COLORS[seg.subject] ?? SUBJECT_COLORS.OTHER;
            return (
              <div key={seg.subject} className="flex items-center gap-2.5">
                <div
                  className="w-[7px] h-[7px] rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[13px] text-text-primary flex-1 font-display">
                  {seg.label}
                </span>
                <span className="text-[13px] text-text-muted font-display">
                  {seg.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
