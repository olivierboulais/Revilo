import { getSession } from "@/lib/auth/session";
import { getReport } from "@/lib/store";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ScoreCard } from "@/components/ScoreCard";
import { FindingsList } from "@/components/FindingsList";
import { RecommendationCard } from "@/components/RecommendationCard";
import { TeamInsightsList } from "@/components/TeamInsightsList";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { LinkButton } from "@/components/Button";

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[17px] font-semibold tracking-tight mb-1">{title}</h2>
      <p className="text-[13px] text-gray">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  const report = await getReport(session.email);
  if (!report) redirect("/connect");

  const isPaid = session.tier !== "free";

  const alignmentFindings = report.findings.filter((f) => f.sourceArea === "alignment");
  const adoptionFindings = report.findings.filter((f) => f.sourceArea === "adoption");
  const architectureFindings = report.findings.filter((f) => f.sourceArea === "architecture");

  const visibleAlignmentFindings = isPaid ? alignmentFindings : alignmentFindings.slice(0, 1);

  const quickWins = report.recommendations.filter((r) => r.tier === "quick_win");
  const mediumTerm = report.recommendations.filter((r) => r.tier === "medium_term");
  const strategic = report.recommendations.filter((r) => r.tier === "strategic");

  return (
    <main className="flex-1">
      <div className="max-w-[920px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-gray">{report.workspaceName}</span>
            {!isPaid && (
              <LinkButton href="/upgrade" variant="lilac" withArrow={false} className="text-[12px]">
                Upgrade
              </LinkButton>
            )}
          </div>
        </div>

        <div className="mb-2">
          <span className="text-[11px] uppercase tracking-wider text-gray">
            Scanned {new Date(report.scannedAt).toLocaleString()} · {report.componentsScanned} components · {report.tokenSetsScanned} token sets
          </span>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight mb-8">Alignment Report</h1>

        {/* SCORES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <ScoreCard
            label="Alignment Score"
            value={report.alignment.overall}
            accent="primary"
            subscores={[
              { label: "Component Alignment", value: report.alignment.componentAlignment },
              { label: "Variant Alignment", value: report.alignment.variantAlignment },
              { label: "Token Alignment", value: report.alignment.tokenAlignment },
              { label: "Naming Alignment", value: report.alignment.namingAlignment },
            ]}
          />
          <ScoreCard
            label="Adoption Score"
            value={report.adoption.overall}
            locked={!isPaid}
            subscores={[
              { label: "Design Adoption", value: report.adoption.designAdoption },
              { label: "Engineering Adoption", value: report.adoption.engineeringAdoption },
            ]}
          />
          <ScoreCard
            label="Architecture Score"
            value={report.architecture.overall}
            locked={!isPaid}
            subscores={[
              { label: "Token Architecture", value: report.architecture.tokenArchitecture },
              { label: "Semantic Layer", value: report.architecture.semanticLayer },
              { label: "Component Hierarchy", value: report.architecture.componentHierarchy },
              { label: "Structure Consistency", value: report.architecture.structureConsistency },
            ]}
          />
        </div>

        {/* ALIGNMENT FINDINGS */}
        <section className="mb-12">
          <SectionHeader title="Alignment" description="Where design and code are out of sync." />
          <div className="rounded-2xl border border-line bg-white px-5">
            <FindingsList findings={visibleAlignmentFindings} />
          </div>
          {!isPaid && alignmentFindings.length > 1 && (
            <div className="mt-3">
              <UpgradeBanner message={`${alignmentFindings.length - 1} more alignment findings are in the full report.`} />
            </div>
          )}
        </section>

        {/* ADOPTION */}
        <section className="mb-12">
          <SectionHeader title="Adoption" description="Whether teams are actually using the design system." />
          {isPaid ? (
            <div className="rounded-2xl border border-line bg-white px-5">
              <FindingsList findings={adoptionFindings} />
            </div>
          ) : (
            <UpgradeBanner message="Adoption findings show where teams are bypassing the design system." />
          )}
        </section>

        {/* ARCHITECTURE */}
        <section className="mb-12">
          <SectionHeader title="Architecture" description="Whether the system is structured to scale." />
          {isPaid ? (
            <div className="rounded-2xl border border-line bg-white px-5">
              <FindingsList findings={architectureFindings} />
            </div>
          ) : (
            <UpgradeBanner message="Architecture findings cover token structure and component hierarchy quality." />
          )}
        </section>

        {/* TEAM INSIGHTS */}
        <section className="mb-12">
          <SectionHeader title="Team Insights" description="Where drift is being created, and by which team." />
          {isPaid ? (
            <div className="rounded-2xl border border-line bg-white px-5">
              <TeamInsightsList insights={report.teamInsights} />
            </div>
          ) : (
            <UpgradeBanner message="See design vs. engineering patterns behind the drift." />
          )}
        </section>

        {/* RECOMMENDATIONS */}
        <section className="mb-12">
          <SectionHeader title="Recommendations" description="What to fix first, grouped by effort." />
          {isPaid ? (
            <div className="flex flex-col gap-8">
              {quickWins.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-medium text-gray uppercase tracking-wide mb-3">Quick wins</h3>
                  <div className="flex flex-col gap-3">
                    {quickWins.map((r) => (
                      <RecommendationCard key={r.id} rec={r} />
                    ))}
                  </div>
                </div>
              )}
              {mediumTerm.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-medium text-gray uppercase tracking-wide mb-3">Medium-term improvements</h3>
                  <div className="flex flex-col gap-3">
                    {mediumTerm.map((r) => (
                      <RecommendationCard key={r.id} rec={r} />
                    ))}
                  </div>
                </div>
              )}
              {strategic.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-medium text-gray uppercase tracking-wide mb-3">Strategic improvements</h3>
                  <div className="flex flex-col gap-3">
                    {strategic.map((r) => (
                      <RecommendationCard key={r.id} rec={r} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <UpgradeBanner message={`${report.recommendations.length} prioritized recommendations are in the full report.`} />
          )}
        </section>

        {!isPaid && (
          <div className="rounded-2xl bg-[#1C1C1A] text-white p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-[18px] font-semibold mb-1">Unlock the full report</h3>
              <p className="text-[13px] text-white/70">All findings, recommendations, and a prioritized roadmap.</p>
            </div>
            <LinkButton href="/upgrade" variant="lilac">
              Unlock Full Report
            </LinkButton>
          </div>
        )}
      </div>
    </main>
  );
}
