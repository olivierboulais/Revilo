interface ScoreCardProps {
  label: string;
  value: number;
  locked?: boolean;
  accent?: "primary" | "default";
  subscores?: { label: string; value: number }[];
}

function riskColor(value: number): string {
  if (value >= 80) return "#34D399";
  if (value >= 60) return "#FBBF24";
  return "#EF4444";
}

export function ScoreCard({ label, value, locked = false, accent = "default", subscores }: ScoreCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col gap-3 ${
        accent === "primary" ? "bg-[#1C1C1A] text-white" : "bg-white border border-line"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[11px] uppercase tracking-wider ${accent === "primary" ? "text-white/60" : "text-gray"}`}>
          {label}
        </span>
        {locked && (
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={accent === "primary" ? "text-white/50" : "text-gray"}>
            <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        )}
      </div>
      {locked ? (
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-semibold tracking-tight blur-sm select-none">{value}</span>
          <span className={`text-[14px] ${accent === "primary" ? "text-white/50" : "text-gray"}`}>/100</span>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-semibold tracking-tight" style={{ color: accent === "primary" ? undefined : riskColor(value) }}>
            {value}
          </span>
          <span className={`text-[14px] ${accent === "primary" ? "text-white/50" : "text-gray"}`}>/100</span>
        </div>
      )}
      {subscores && !locked && (
        <div className="flex flex-col gap-1.5 mt-1">
          {subscores.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-[12px]">
              <span className={accent === "primary" ? "text-white/70" : "text-gray"}>{s.label}</span>
              <span className="font-medium">{s.value}</span>
            </div>
          ))}
        </div>
      )}
      {locked && (
        <p className={`text-[11.5px] leading-relaxed ${accent === "primary" ? "text-white/50" : "text-gray"}`}>
          Unlock the full report to see this score.
        </p>
      )}
    </div>
  );
}
