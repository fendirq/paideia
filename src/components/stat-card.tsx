interface StatCardProps {
  value: number;
  label: string;
  sublabel?: string;
  trend?: number;
}

export function StatCard({ value, label, sublabel, trend }: StatCardProps) {
  return (
    <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
      <div className="flex items-start justify-between">
        <p className="font-display font-bold text-[32px] text-text-primary">
          {value}
        </p>
        {trend !== undefined && trend > 0 && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-accent/[0.12] text-accent-light font-display font-medium">
            +{trend} this week
          </span>
        )}
      </div>
      <p className="text-[13px] text-text-muted mt-1 font-display">{label}</p>
      {sublabel && (
        <p className="text-[11px] text-text-muted/60 mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
