import { Finding } from "@/lib/types";

const severityStyles: Record<Finding["severity"], string> = {
  high: "bg-[#FEE2E2] text-[#B91C1C]",
  medium: "bg-[#FEF3C7] text-[#92400E]",
  low: "bg-[#F3F4F6] text-[#374151]",
};

function FindingRow({ finding }: { finding: Finding }) {
  return (
    <div className="py-4 border-b border-line last:border-b-0">
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <span className="text-[13.5px] font-medium leading-snug">{finding.title}</span>
        <span className={`text-[10.5px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${severityStyles[finding.severity]}`}>
          {finding.severity}
        </span>
      </div>
      <p className="text-[12.5px] text-gray leading-relaxed mb-2">{finding.description}</p>
      <div className="flex items-center gap-3 flex-wrap">
        {finding.evidence.map((e, i) => (
          <span key={i} className="text-[11px] text-gray bg-[#F8F7F4] px-2 py-1 rounded-md font-mono">
            {e}
          </span>
        ))}
        <span className="text-[11px] text-gray ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-lilac-mid" />
          {Math.round(finding.confidence * 100)}% confidence
        </span>
      </div>
    </div>
  );
}

export function FindingsList({ findings, emptyLabel = "No findings in this category." }: { findings: Finding[]; emptyLabel?: string }) {
  if (findings.length === 0) {
    return <p className="text-[13px] text-gray py-6 text-center">{emptyLabel}</p>;
  }
  return (
    <div className="flex flex-col">
      {findings.map((f) => (
        <FindingRow key={f.id} finding={f} />
      ))}
    </div>
  );
}
