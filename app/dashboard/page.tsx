import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { SummaryCard, SummaryStatCard } from "@/components/SummaryCard";
import { BiggestRisksPanel, TeamDriftPanel, RecommendedActionsPanel, CategoryModule } from "@/components/OverviewPanels";
import { groupByCategory, topRisks, topActions, teamDriftCounts } from "@/lib/overview-helpers";
import { TrendChart } from "@/components/TrendChart";
import { getScoreHistory } from "@/lib/score-history";

const riskLevelLabel: Record<string, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" };
const riskLevelColor: Record<string, string> = { low: "#34D399", medium: "#FBBF24", high: "#EF4444" };

interface Props {
  searchParams: Promise<{ scan_error?: string; upgraded?: string; figma_error?: string; github_error?: string }>;
}

export default async function OverviewPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/signup");

  const { scan_error, upgraded, figma_error, github_error } = await searchParams;

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const hasRealData = report.dataSource?.figma !== "mock" || report.dataSource?.github !== "mock";
  const categories = groupByCategory(report.findings);
  const risks = topRisks(report.findings);
  const actions = topActions(report.recommendations);
  const drift = teamDriftCounts(report.teamInsights);
  const history = await getScoreHistory(session.email, report);

  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
        <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight">Overview</h1>
        {hasRealData && (
          <div className="flex items-center gap-2">
            {isPaid && (
              <a
                href="/api/report/pdf"
                download
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v7M3 6l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Export PDF
              </a>
            )}
            <span className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ background: `${riskLevelColor[report.riskLevel]}1A`, color: riskLevelColor[report.riskLevel] }}>
              {riskLevelLabel[report.riskLevel]}
            </span>
          </div>
        )}
      </div>
      <p className="text-[13px] text-gray mb-6">The state of {report.workspaceName}, at a glance.</p>

      {scan_error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          The scan encountered an error. Showing your previous report. Try again with the Re-scan button.
        </div>
      )}
      {figma_error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          Figma data failed to load: {figma_error}. The report below uses sample Figma data. Try reconnecting in <a href="/connect" className="underline font-medium">Sources</a>.
        </div>
      )}
      {github_error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          GitHub data failed to load: {github_error}. The report below uses sample GitHub data. Try reconnecting in <a href="/connect" className="underline font-medium">Sources</a>.
        </div>
      )}
      {upgraded && (
        <div className="mb-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[13px] text-[#15803D] px-4 py-3">
          You&apos;re now on the {upgraded === "monitoring" ? "Monthly Monitoring" : "Pro Report"} plan. Full report unlocked.
        </div>
      )}

      {!hasRealData ? (
        <>
          {/* Empty state — no sources connected */}
          <div className="rounded-2xl border border-line bg-white p-8 sm:p-12 flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#F3E8FF] flex items-center justify-center mb-5">
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
                <circle cx="4.5" cy="4.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
                <circle cx="11.5" cy="11.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
                <path d="M6 6L10 10" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="text-[16px] font-semibold tracking-tight mb-2">Connect your sources to get started</h2>
            <p className="text-[13px] text-gray max-w-[380px] mb-6">
              Link your Figma and GitHub accounts so Revilo can scan your design system and generate a real report.
            </p>
            <a
              href="/connect"
              className="inline-flex items-center gap-2 text-[13px] font-medium px-5 py-2.5 rounded-full text-[#1C1C1A]"
              style={{ background: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 50%, #DDD6FE 100%)" }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                <circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M6 6L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              Connect sources
            </a>
          </div>

          {/* Empty summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {["Alignment Score", "Adoption Score", "Architecture Score", "Issues Found"].map((label) => (
              <div key={label} className="rounded-2xl border border-line bg-white p-6 flex items-center gap-4">
                <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center bg-[#F3F1EC] flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="text-gray/40">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[11.5px] uppercase tracking-wide text-gray mb-1">{label}</div>
                  <div className="text-[13px] text-gray/60">No data yet</div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { title: "Biggest Risks", desc: "Connect your sources to discover risks in your design system." },
              { title: "Team Drift", desc: "See whether design or engineering is creating more drift." },
              { title: "Recommended Actions", desc: "Get prioritized fixes once your sources are connected." },
            ].map((p) => (
              <div key={p.title} className="rounded-2xl p-6 flex flex-col bg-white border border-line">
                <div className="text-[13px] font-medium text-[#1C1C1A] mb-4">{p.title}</div>
                <div className="flex-1 flex items-center justify-center text-[12px] text-gray text-center py-6">
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Top row: 4 primary summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Alignment Score" value={report.alignment.overall} />
            <SummaryCard label="Adoption Score" value={report.adoption.overall} locked={!isPaid} />
            <SummaryCard label="Architecture Score" value={report.architecture.overall} locked={!isPaid} />
            <SummaryStatCard label="Issues Found" value={report.findings.length} helperText={`${report.findings.filter(f => f.severity === "high").length} high severity`} />
          </div>

          {/* Second row: 3 priority panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <BiggestRisksPanel risks={risks} isPaid={isPaid} />
            <TeamDriftPanel design={drift.design} engineering={drift.engineering} isPaid={isPaid} />
            <RecommendedActionsPanel actions={actions} isPaid={isPaid} />
          </div>

          {/* Trend chart */}
          <div className="rounded-2xl border border-line bg-white p-3 sm:p-5 mb-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[12.5px] font-medium text-[#1C1C1A]">Score trend</div>
              {!history.isReal && (
                <span className="text-[10.5px] text-gray/70 hidden sm:inline">Illustrative — scan a few more times to see your real trend</span>
              )}
            </div>
            <p className="text-[11.5px] text-gray mb-4">How alignment{isPaid ? ", adoption, and architecture have" : " has"} moved over recent scans.</p>
            <TrendChart
              labels={history.labels}
              insufficient={history.insufficient}
              series={
                isPaid
                  ? [
                      { label: "Alignment", color: "#7C3AED", values: history.alignment },
                      { label: "Adoption", color: "#60A5FA", values: history.adoption },
                      { label: "Architecture", color: "#34D399", values: history.architecture },
                    ]
                  : [{ label: "Alignment", color: "#7C3AED", values: history.alignment }]
              }
            />
          </div>

          {/* Third row: 3 category modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </>
      )}
    </div>
  );
}
