interface StatCardProps {
  value: number;
  label: string;
  sublabel?: string;
  trend?: number;
}

export function StatCard({ value, label, sublabel, trend }: StatCardProps) {
  return (
    <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <p className="font-display font-bold text-4xl text-text-primary">
          {value}
        </p>
        {trend !== undefined && trend > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-accent/[0.12] text-accent-light">
            +{trend}
          </span>
        )}
      </div>
      <p className="text-[13px] text-text-muted mt-1 font-body">{label}</p>
      {sublabel && (
        <p className="text-xs text-text-muted/60 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
