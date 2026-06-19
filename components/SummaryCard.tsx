type TileVariant = "lilac" | "dark" | "soft" | "outline";

const tileStyles: Record<TileVariant, { bg: string; text: string; sub: string; track: string; fill: string }> = {
  lilac: { bg: "#EFD9FF", text: "#3B1D6E", sub: "rgba(59,29,110,0.65)", track: "rgba(124,58,237,0.18)", fill: "#7C3AED" },
  dark: { bg: "#1C1C1A", text: "#FFFFFF", sub: "rgba(255,255,255,0.6)", track: "rgba(255,255,255,0.18)", fill: "#C084FC" },
  soft: { bg: "#F3EEFF", text: "#4C2A85", sub: "rgba(76,42,133,0.6)", track: "rgba(124,58,237,0.14)", fill: "#A78BFA" },
  outline: { bg: "#FFFFFF", text: "#1C1C1A", sub: "#706F6A", track: "rgba(28,28,26,0.08)", fill: "#1C1C1A" },
};

export function SummaryCard({
  label,
  value,
  suffix = "/100",
  locked = false,
  helperText,
  variant = "lilac",
}: {
  label: string;
  value: number;
  suffix?: string;
  locked?: boolean;
  helperText?: string;
  variant?: TileVariant;
}) {
  const s = tileStyles[variant];
  const pct = Math.max(0, Math.min(100, value));

  if (locked) {
    return (
      <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[148px]" style={{ background: "#F3F1EC" }}>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium" style={{ color: "#706F6A" }}>{label}</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#706F6A" }}>
            <rect x="3" y="6" width="8" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </div>
        <div className="text-[13px]" style={{ color: "#706F6A" }}>Unlock to view</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[148px]" style={{ background: s.bg }}>
      <div className="text-[12px] font-medium" style={{ color: s.sub }}>{label}</div>
      <div>
        <div className="flex items-baseline gap-1 mb-2.5">
          <span className="text-[34px] font-semibold tracking-tight leading-none" style={{ color: s.text }}>
            {value}
          </span>
          <span className="text-[13px]" style={{ color: s.sub }}>{suffix}</span>
        </div>
        <div className="h-[5px] rounded-full overflow-hidden" style={{ background: s.track }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.fill }} />
        </div>
        {helperText && <div className="text-[11px] mt-2" style={{ color: s.sub }}>{helperText}</div>}
      </div>
    </div>
  );
}

export function SummaryStatCard({
  label,
  value,
  helperText,
  variant = "outline",
}: {
  label: string;
  value: string | number;
  helperText?: string;
  variant?: TileVariant;
}) {
  const s = tileStyles[variant];
  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between min-h-[148px]" style={{ background: s.bg }}>
      <div className="text-[12px] font-medium" style={{ color: s.sub }}>{label}</div>
      <div>
        <div className="text-[34px] font-semibold tracking-tight leading-none mb-1" style={{ color: s.text }}>
          {value}
        </div>
        {helperText && <div className="text-[11.5px]" style={{ color: s.sub }}>{helperText}</div>}
      </div>
    </div>
  );
}
