import { TeamInsight } from "@/lib/types";

function InsightRow({ insight }: { insight: TeamInsight }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-line last:border-b-0">
      <span
        className="text-[10.5px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
        style={{
          background: insight.team === "design" ? "#EFD9FF" : "#DBEAFE",
          color: insight.team === "design" ? "#6D28D9" : "#1E40AF",
        }}
      >
        {insight.team}
      </span>
      <p className="text-[13px] leading-relaxed">{insight.title}</p>
    </div>
  );
}

export function TeamInsightsList({ insights }: { insights: TeamInsight[] }) {
  if (insights.length === 0) {
    return <p className="text-[13px] text-gray py-6 text-center">No team-level patterns detected.</p>;
  }
  return (
    <div className="flex flex-col">
      {insights.map((i) => (
        <InsightRow key={i.id} insight={i} />
      ))}
    </div>
  );
}
