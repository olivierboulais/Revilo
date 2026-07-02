import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Overview — Revilo" };
export const maxDuration = 60;
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
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

  // Check if user has real sources connected
  const user = await findUserByEmail(session.email).catch(() => null);
  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];
  const hasRealSources =
    (figmaSource?.status === "connected" && Boolean(figmaSource.figma_file_key)) ||
    (githubSource?.status === "connected" && Boolean(githubSource.github_repo));

  let report = await getReport(session.email);

  // If sources are connected but the cached report used mock data, send the
  // user through the scan flow so they get real data immediately.
  if (hasRealSources && (!report || report.usedMockData)) {
    redirect("/scan");
  }

  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const hasRealData = report.dataSource?.figma === "real" || report.dataSource?.github === "real";
  const figmaTokenSource = report.dataSource?.figmaTokenSource;
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
          Figma data failed to load: {figma_error}. The report below uses sample Figma data. Try reconnecting in <a href="/dashboard?connect=1" className="underline font-medium">Sources</a>.
        </div>
      )}
      {github_error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          GitHub data failed to load: {github_error}. The report below uses sample GitHub data. Try reconnecting in <a href="/dashboard?connect=1" className="underline font-medium">Sources</a>.
        </div>
      )}
      {upgraded && (
        <div className="mb-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[13px] text-[#15803D] px-4 py-3">
          You&apos;re now on the {upgraded === "monitoring" ? "Monthly Monitoring" : "Pro Report"} plan. Full report unlocked.
        </div>
      )}

      {/* Figma token quality notice — shown when connected but not using Variables */}
      {hasRealData && figmaTokenSource === "styles" && (
        <div className="mb-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[13px] text-[#92400E] px-4 py-3 flex items-start gap-3">
          <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 6V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.7" fill="currentColor"/>
          </svg>
          <div>
            <span className="font-medium">Your Figma file uses Styles, not Variables.</span>{" "}
            Token values are read from your style nodes — naming and structure are fully analysed, but value-level checks (e.g. color mismatches between Figma and code) are more accurate with{" "}
            <a href="https://help.figma.com/hc/en-us/articles/15339657135383" target="_blank" rel="noopener noreferrer" className="underline font-medium">Figma Variables</a>.{" "}
            If your file has no Variables set up yet, this is expected.
          </div>
        </div>
      )}
      {hasRealData && figmaTokenSource === "none" && (
        <div className="mb-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[13px] text-[#92400E] px-4 py-3 flex items-start gap-3">
          <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 6V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11.5" r="0.7" fill="currentColor"/>
          </svg>
          <div>
            <span className="font-medium">No tokens found in your Figma file.</span>{" "}
            Component analysis ran successfully, but token checks were skipped because the file has no Variables or Styles defined.{" "}
            Set up{" "}
            <a href="https://help.figma.com/hc/en-us/articles/15339657135383" target="_blank" rel="noopener noreferrer" className="underline font-medium">Figma Variables</a>{" "}
            or Styles to unlock token drift detection.
          </div>
        </div>
      )}

      {/* Demo mode banner — shown when no real sources are connected */}
      {!hasRealData && (
        <div className="mb-6 rounded-2xl border border-[#E9D5FF] bg-[#FAF5FF] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="4.5" cy="4.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
                <circle cx="11.5" cy="11.5" r="2" stroke="#7C3AED" strokeWidth="1.4" />
                <path d="M6 6L10 10" stroke="#7C3AED" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#5B21B6]">This is a sample report</p>
              <p className="text-[12px] text-[#7C3AED]/80 mt-0.5 leading-relaxed">
                Connect your Figma and GitHub to scan your actual design system. The scores and findings below are based on a built-in example.
              </p>
            </div>
          </div>
          <a
            href="?connect=1"
            className="gradient-lilac inline-flex items-center gap-2 text-[12.5px] font-medium px-4 py-2 rounded-full flex-shrink-0 self-start sm:self-center"
          >
            Connect sources
          </a>
        </div>
      )}

      {/* Top row: 4 primary summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Alignment Score"
          value={report.alignment.overall}
          helperText="Figma ↔ code parity"
          tooltip={[
            "Are the same components and tokens defined in both Figma and your codebase?",
            "Revilo compares every Figma component against your GitHub files by name. It checks whether variants match (e.g. primary/secondary/ghost) and whether token values are the same on both sides.",
            "100 = perfect parity. Lower scores mean things exist in one place but not the other, or their definitions have drifted apart.",
          ]}
        />
        <SummaryCard
          label="Adoption Score"
          value={report.adoption.overall}
          locked={!isPaid}
          helperText="Design system usage rate"
          tooltip={[
            "Is your team actually using the design system — or working around it?",
            "On the design side: detached Figma instances and local styles signal designers are bypassing the shared library. On the engineering side: hardcoded hex values in components and deprecated component usage lower this score.",
            "100 = everyone is going through the system. Lower scores mean workarounds are accumulating.",
          ]}
        />
        <SummaryCard
          label="Architecture Score"
          value={report.architecture.overall}
          locked={!isPaid}
          helperText="Token & component structure"
          tooltip={[
            "Is your design system structured the way it should be?",
            "This checks whether tokens follow a primitive → semantic hierarchy (e.g. color.blue.500 feeds into color.action.primary), whether Figma's component groupings reflect your code folder structure, and whether naming is clean and consistent.",
            "100 = well-structured. Lower scores mean tokens are ad-hoc, folder organization is flat, or component names are chaotic.",
          ]}
        />
        <SummaryStatCard
          label="Issues Found"
          value={report.findings.length}
          helperText={`${report.findings.filter(f => f.severity === "high").length} high · ${report.findings.filter(f => f.severity === "medium").length} medium · ${report.findings.filter(f => f.severity === "low").length} low`}
          tooltip={[
            "Total findings across all three score areas.",
            "High = likely causing real inconsistencies in production. Medium = worth fixing in the next sprint. Low = minor polish items.",
            "Each finding links to a specific recommendation with suggested steps to fix it.",
          ]}
        />
      </div>

      {/* Second row: 3 priority panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <BiggestRisksPanel risks={risks} isPaid={isPaid || !hasRealData} />
        <TeamDriftPanel design={drift.design} engineering={drift.engineering} isPaid={isPaid || !hasRealData} />
        <RecommendedActionsPanel actions={actions} isPaid={isPaid || !hasRealData} />
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
          summary="How many Figma components exist in code with matching variants and props."
          href="/dashboard/alignment"
          locked={isPaid ? false : hasRealData}
        />
        <CategoryModule
          title="Tokens"
          score={report.alignment.tokenAlignment}
          issueCount={categories.tokens.length}
          summary="Whether design tokens in Figma match the values and names used in code."
          href="/dashboard/alignment"
          locked={isPaid ? false : hasRealData}
        />
        <CategoryModule
          title="Structure"
          score={report.architecture.overall}
          issueCount={categories.structure.length}
          summary="Whether your token hierarchy (primitives → semantics) is followed consistently."
          href="/dashboard/architecture"
          locked={isPaid ? false : hasRealData}
        />
      </div>
    </div>
  );
}
