export function ComparisonBar({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  leftColor = "#C084FC",
  rightColor = "#60A5FA",
}: {
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  leftColor?: string;
  rightColor?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="flex items-center gap-1.5 text-gray">
          <span className="w-2 h-2 rounded-full" style={{ background: leftColor }} />
          {leftLabel}
        </span>
        <span className="font-medium">{leftValue}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${leftValue}%`, background: leftColor }} />
      </div>
      <div className="flex items-center justify-between text-[11.5px]">
        <span className="flex items-center gap-1.5 text-gray">
          <span className="w-2 h-2 rounded-full" style={{ background: rightColor }} />
          {rightLabel}
        </span>
        <span className="font-medium">{rightValue}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${rightValue}%`, background: rightColor }} />
      </div>
    </div>
  );
}

const severityColor: Record<"high" | "medium" | "low", string> = {
  high: "#EF4444",
  medium: "#FBBF24",
  low: "#9CA3AF",
};

export function SeverityDot({ severity }: { severity: "high" | "medium" | "low" }) {
  return <span className="inline-block w-2 h-2 rounded-full flex-shrink-0" style={{ background: severityColor[severity] }} />;
}

// Confidence as a label, not a raw percentage, per PRD ("convert it into a
// simple label: High / Medium / Low confidence").
export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.85) return "High confidence";
  if (confidence >= 0.65) return "Medium confidence";
  return "Low confidence";
}

export function IssueDistributionBar({ high, medium, low }: { high: number; medium: number; low: number }) {
  const total = Math.max(high + medium + low, 1);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-2 rounded-full overflow-hidden flex w-full bg-[#F3F1EC]">
        {high > 0 && <div style={{ width: `${(high / total) * 100}%`, background: severityColor.high }} />}
        {medium > 0 && <div style={{ width: `${(medium / total) * 100}%`, background: severityColor.medium }} />}
        {low > 0 && <div style={{ width: `${(low / total) * 100}%`, background: severityColor.low }} />}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-gray">
        <span className="flex items-center gap-1"><SeverityDot severity="high" />{high} high</span>
        <span className="flex items-center gap-1"><SeverityDot severity="medium" />{medium} medium</span>
        <span className="flex items-center gap-1"><SeverityDot severity="low" />{low} low</span>
      </div>
    </div>
  );
}
