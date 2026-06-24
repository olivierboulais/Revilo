import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Recommendations — Revilo" };
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { RecommendationCard } from "@/components/RecommendationCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { EmptySourcesState } from "@/components/EmptySourcesState";

const tierConfig = [
  { key: "quick_win" as const, title: "Quick Wins", description: "Low effort, ship these first." },
  { key: "medium_term" as const, title: "Medium-Term Improvements", description: "Worth scheduling into the next sprint or two." },
  { key: "strategic" as const, title: "Strategic Improvements", description: "Bigger investments with lasting payoff." },
];

export default async function RecommendationsPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName, session.email);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const hasRealData = report.dataSource?.figma === "real" || report.dataSource?.github === "real";

  if (!hasRealData) {
    return (
      <div className="px-3 sm:px-6 py-6 sm:py-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Recommendations</h1>
        <p className="text-[13px] text-gray mb-6">What to fix first, grouped by effort.</p>
        <EmptySourcesState page="recommendations" />
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="px-3 sm:px-6 py-6 sm:py-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Recommendations</h1>
        <p className="text-[13px] text-gray mb-6">What to fix first, grouped by effort.</p>
        <UpgradeBanner message={`${report.recommendations.length} prioritized recommendations are in the full report.`} />
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Recommendations</h1>
      <p className="text-[13px] text-gray mb-6">What to fix first, grouped by effort.</p>

      <div className="flex flex-col gap-8">
        {tierConfig.map(({ key, title, description }) => {
          const recs = report.recommendations.filter((r) => r.tier === key);
          if (recs.length === 0) return null;
          return (
            <section key={key}>
              <h2 className="text-[14px] font-medium mb-0.5">{title}</h2>
              <p className="text-[12.5px] text-gray mb-3">{description}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {recs.map((r) => (
                  <RecommendationCard key={r.id} rec={r} />
                ))}
              </div>
            </section>
          );
        })}
        {report.recommendations.length === 0 && <p className="text-[13px] text-gray py-8 text-center">No recommendations generated for this scan.</p>}
      </div>
    </div>
  );
}
