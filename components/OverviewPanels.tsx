import Link from "next/link";
import { Finding, Recommendation } from "@/lib/types";
import { SeverityDot } from "@/components/Visuals";

function PanelShell({
  title,
  href,
  hrefLabel,
  icon,
  children,
}: {
  title: string;
  href: string;
  hrefLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6 flex flex-col h-full bg-white border border-line">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-medium text-[#1C1C1A]">{title}</span>
        {icon && (
          <span className="w-8 h-8 rounded-lg bg-[#F8F7F4] flex items-center justify-center text-[#1C1C1A]/60 flex-shrink-0">
            {icon}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col gap-2.5">{children}</div>
      <Link href={href} className="text-[11.5px] font-medium mt-3.5 flex items-center gap-1 text-lilac-deep">
        {hrefLabel}
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
          <path d="M1.5 7.5L7.5 1.5M7.5 1.5H3M7.5 1.5V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

const areaLabel: Record<Finding["sourceArea"], string> = { alignment: "Alignment", adoption: "Adoption", architecture: "Architecture" };
const areaHref: Record<Finding["sourceArea"], string> = {
  alignment: "/dashboard/alignment",
  adoption: "/dashboard/adoption",
  architecture: "/dashboard/architecture",
};

export function BiggestRisksPanel({ risks, isPaid }: { risks: Finding[]; isPaid: boolean }) {
  if (!isPaid) {
    return (
      <PanelShell title="Biggest Risks" href="/upgrade" hrefLabel="Unlock to see risks" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor"/></svg></>}>
        <div className="flex-1 flex items-center justify-center text-[12px] text-gray text-center py-4">
          The top risks across your system are in the full report.
        </div>
      </PanelShell>
    );
  }
  return (
    <PanelShell title="Biggest Risks" href="/dashboard/alignment" hrefLabel="View all findings" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor"/></svg></>}>
      {risks.map((f) => (
        <Link key={f.id} href={areaHref[f.sourceArea]} className="flex items-start gap-2 group">
          <SeverityDot severity={f.severity} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium leading-snug group-hover:text-lilac-deep transition-colors">{f.title}</div>
            <div className="text-[10.5px] text-gray uppercase tracking-wide mt-0.5">{areaLabel[f.sourceArea]}</div>
          </div>
        </Link>
      ))}
    </PanelShell>
  );
}

export function TeamDriftPanel({ design, engineering, isPaid }: { design: number; engineering: number; isPaid: boolean }) {
  if (!isPaid) {
    return (
      <PanelShell title="Team Drift" href="/upgrade" hrefLabel="Unlock team insights" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="1.8" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></>}>
        <div className="flex-1 flex items-center justify-center text-[12px] text-gray text-center py-4">
          See whether design or engineering is creating more drift.
        </div>
      </PanelShell>
    );
  }
  const total = Math.max(design + engineering, 1);
  return (
    <PanelShell title="Team Drift" href="/dashboard/team-insights" hrefLabel="View team insights" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="1.8" stroke="currentColor" strokeWidth="1.3"/><circle cx="11" cy="6" r="1.4" stroke="currentColor" strokeWidth="1.3"/><path d="M2 13c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></>}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-gray"><span className="w-2 h-2 rounded-full bg-lilac-mid" />Design</span>
          <span className="font-medium">{design}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
          <div className="h-full rounded-full bg-lilac-mid" style={{ width: `${(design / total) * 100}%` }} />
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-gray"><span className="w-2 h-2 rounded-full bg-[#60A5FA]" />Engineering</span>
          <span className="font-medium">{engineering}</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
          <div className="h-full rounded-full bg-[#60A5FA]" style={{ width: `${(engineering / total) * 100}%` }} />
        </div>
      </div>
      <p className="text-[11.5px] text-gray mt-1">
        {engineering > design ? "Engineering is creating more drift right now." : design > engineering ? "Design is creating more drift right now." : "Drift is evenly split between teams."}
      </p>
    </PanelShell>
  );
}

const impactColor: Record<Recommendation["impact"], string> = { high: "#34D399", medium: "#FBBF24", low: "#9CA3AF" };

export function RecommendedActionsPanel({ actions, isPaid }: { actions: Recommendation[]; isPaid: boolean }) {
  if (!isPaid) {
    return (
      <PanelShell title="Recommended Actions" href="/upgrade" hrefLabel="Unlock recommendations" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 1.7.8 2.9 2 3.8v1.7h5V9.8c1.2-.9 2-2.1 2-3.8 0-2.5-2-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 14h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></>}>
        <div className="flex-1 flex items-center justify-center text-[12px] text-gray text-center py-4">
          Prioritized fixes, ranked by impact and effort, are in the full report.
        </div>
      </PanelShell>
    );
  }
  return (
    <PanelShell title="Recommended Actions" href="/dashboard/recommendations" hrefLabel="View all recommendations" icon={<><svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 1.7.8 2.9 2 3.8v1.7h5V9.8c1.2-.9 2-2.1 2-3.8 0-2.5-2-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 14h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg></>}>
      {actions.map((r) => (
        <div key={r.id} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: impactColor[r.impact] }} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium leading-snug">{r.title}</div>
            <div className="text-[10.5px] text-gray mt-0.5">
              Impact: {r.impact} · Effort: {r.effort}
            </div>
          </div>
        </div>
      ))}
    </PanelShell>
  );
}

export function CategoryModule({
  title,
  score,
  issueCount,
  summary,
  href,
  locked,
}: {
  title: string;
  score: number;
  issueCount: number;
  summary: string;
  href: string;
  locked?: boolean;
}) {
  return (
    <div className="rounded-2xl p-6 flex flex-col bg-white border border-line">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12.5px] font-medium">{title}</span>
        {!locked && (
          <span className="text-[18px] font-semibold tracking-tight" style={{ color: score >= 80 ? "#34D399" : score >= 60 ? "#FBBF24" : "#EF4444" }}>
            {score}
          </span>
        )}
      </div>
      {locked ? (
        <p className="text-[12px] text-gray flex-1">Unlock the full report to see this module.</p>
      ) : (
        <>
          <p className="text-[12px] text-gray flex-1 leading-relaxed">{summary}</p>
          <div className="text-[11px] text-gray mt-2">{issueCount} issue{issueCount === 1 ? "" : "s"} found</div>
        </>
      )}
      <Link
        href={locked ? "/upgrade" : href}
        className="text-[11.5px] font-medium mt-3 px-3 py-1.5 rounded-full border border-line text-center hover:bg-black/[0.03] transition-colors"
      >
        {locked ? "Unlock" : "View details"}
      </Link>
    </div>
  );
}
