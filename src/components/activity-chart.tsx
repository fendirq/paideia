"use client";

interface ActivityChartProps {
  data: { day: string; count: number }[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-bg-inner border border-white/[0.04] rounded-[14px] p-6">
      <h3 className="font-display text-[13px] font-semibold mb-4">
        Weekly Activity
      </h3>
      <div className="flex items-end gap-2 h-[120px]">
        {data.map((d) => (
          <div
            key={d.day}
            className="flex-1 flex flex-col items-center gap-1.5"
          >
            <div
              className="w-full rounded-t bg-accent/70 hover:bg-accent transition-colors"
              style={{
                height: `${(d.count / max) * 100}%`,
                minHeight: d.count > 0 ? "4px" : "0",
              }}
            />
            <span className="text-[10px] text-text-muted font-display">
              {d.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
