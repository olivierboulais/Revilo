import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { SummaryCard, SummaryStatCard } from "@/components/SummaryCard";
import { BiggestRisksPanel, TeamDriftPanel, RecommendedActionsPanel, CategoryModule } from "@/components/OverviewPanels";
import { groupByCategory, topRisks, topActions, teamDriftCounts } from "@/lib/overview-helpers";

const riskLevelLabel: Record<string, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" };
const riskLevelColor: Record<string, string> = { low: "#34D399", medium: "#FBBF24", high: "#EF4444" };

export default async function OverviewPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const categories = groupByCategory(report.findings);
  const risks = topRisks(report.findings);
  const actions = topActions(report.recommendations);
  const drift = teamDriftCounts(report.teamInsights);

  return (
    <div className="max-w-[1080px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Overview</h1>
        <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: `${riskLevelColor[report.riskLevel]}1A`, color: riskLevelColor[report.riskLevel] }}>
          {riskLevelLabel[report.riskLevel]}
        </span>
      </div>
      <p className="text-[13px] text-gray mb-6">The state of {report.workspaceName}, at a glance.</p>

      {/* Top row: 4 primary summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Alignment Score" value={report.alignment.overall} variant="dark" />
        <SummaryCard label="Adoption Score" value={report.adoption.overall} locked={!isPaid} variant="lilac" />
        <SummaryCard label="Architecture Score" value={report.architecture.overall} locked={!isPaid} variant="soft" />
        <SummaryStatCard label="Issues Found" value={report.findings.length} helperText={`${report.findings.filter(f => f.severity === "high").length} high severity`} variant="outline" />
      </div>

      {/* Second row: 3 priority panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <BiggestRisksPanel risks={risks} isPaid={isPaid} />
        <TeamDriftPanel design={drift.design} engineering={drift.engineering} isPaid={isPaid} />
        <RecommendedActionsPanel actions={actions} isPaid={isPaid} />
      </div>

      {/* Third row: 3 category modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CategoryModule
          title="Components"
          score={report.alignment.componentAlignment}
          issueCount={categories.components.length}
          summary="Component and variant parity between Figma and code."
          href="/dashboard/alignment"
          locked={!isPaid}
        />
        <CategoryModule
          title="Tokens"
          score={report.alignment.tokenAlignment}
          issueCount={categories.tokens.length}
          summary="Token naming and value consistency across design and code."
          href="/dashboard/alignment"
          locked={!isPaid}
        />
        <CategoryModule
          title="Structure"
          score={report.architecture.overall}
          issueCount={categories.structure.length}
          summary="System architecture, hierarchy, and adoption discipline."
          href="/dashboard/architecture"
          locked={!isPaid}
        />
      </div>
    </div>
  );
}
