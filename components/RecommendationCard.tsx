import { Recommendation } from "@/lib/types";

const levelDot: Record<"high" | "medium" | "low", string> = {
  high: "#34D399",
  medium: "#FBBF24",
  low: "#9CA3AF",
};

function LevelBadge({ label, level }: { label: string; level: "high" | "medium" | "low" }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-gray">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: levelDot[level] }} />
      {label}: <span className="font-medium text-[#1C1C1A]">{level}</span>
    </span>
  );
}

export function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-[15px] font-medium leading-snug">{rec.title}</h4>
        <span className="text-[10.5px] uppercase tracking-wide text-gray bg-[#F8F7F4] px-2 py-0.5 rounded-full flex-shrink-0">
          {rec.tier.replace("_", " ")}
        </span>
      </div>
      <p className="text-[13px] text-gray leading-relaxed">{rec.whyItMatters}</p>
      <div className="rounded-xl bg-[#F8F7F4] p-3">
        <div className="text-[10.5px] uppercase tracking-wide text-gray mb-1">Suggested fix</div>
        <p className="text-[12.5px] leading-relaxed">{rec.suggestedFix}</p>
      </div>
      <div className="flex items-center gap-4 pt-1">
        <LevelBadge label="Impact" level={rec.impact} />
        <LevelBadge label="Effort" level={rec.effort} />
        <span className="text-[11px] text-gray ml-auto">{Math.round(rec.confidence * 100)}% confidence</span>
      </div>
    </div>
  );
}
