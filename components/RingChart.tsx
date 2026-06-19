function colorForValue(value: number): string {
  if (value >= 80) return "#34D399";
  if (value >= 60) return "#FBBF24";
  return "#EF4444";
}

export function RingChart({
  value,
  size = 72,
  strokeWidth = 7,
  label,
  color,
  trackColor = "rgba(28,28,26,0.08)",
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  trackColor?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);
  const resolvedColor = color ?? colorForValue(value);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={resolvedColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold tracking-tight" style={{ fontSize: size * 0.26 }}>
          {value}
        </span>
        {label && <span className="text-[9px] text-gray uppercase tracking-wide -mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
