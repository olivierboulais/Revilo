import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { TeamInsightsList } from "@/components/TeamInsightsList";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { EmptySourcesState } from "@/components/EmptySourcesState";
import { teamDriftCounts } from "@/lib/overview-helpers";

export default async function TeamInsightsPage() {
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
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Team Insights</h1>
        <p className="text-[13px] text-gray mb-6">Where drift is being created, and by which team.</p>
        <EmptySourcesState page="team insights" />
      </div>
    );
  }

  if (!isPaid) {
    return (
      <div className="px-3 sm:px-6 py-6 sm:py-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Team Insights</h1>
        <p className="text-[13px] text-gray mb-6">Where drift is being created, and by which team.</p>
        <UpgradeBanner message="See design vs. engineering patterns behind the drift." />
      </div>
    );
  }

  const designInsights = report.teamInsights.filter((i) => i.team === "design");
  const engineeringInsights = report.teamInsights.filter((i) => i.team === "engineering");
  const drift = teamDriftCounts(report.teamInsights);
  const mostCommon = [...report.teamInsights].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Team Insights</h1>
      <p className="text-[13px] text-gray mb-6">Where drift is being created, and by which team.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <div>
          <h2 className="text-[14px] font-medium mb-3">Design team patterns</h2>
          <div className="rounded-2xl border border-line bg-white px-5">
            <TeamInsightsList insights={designInsights} />
          </div>
        </div>
        <div>
          <h2 className="text-[14px] font-medium mb-3">Engineering team patterns</h2>
          <div className="rounded-2xl border border-line bg-white px-5">
            <TeamInsightsList insights={engineeringInsights} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14px] font-medium mb-3">Most common anti-patterns</h2>
          {mostCommon.length === 0 ? (
            <p className="text-[13px] text-gray py-4 text-center">No recurring anti-patterns detected.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {mostCommon.map((insight) => (
                <div key={insight.id} className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] leading-snug">{insight.title}</span>
                  <span className="text-[13px] font-semibold flex-shrink-0">{insight.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14px] font-medium mb-3">Most frequent source of drift</h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-1.5 text-gray"><span className="w-2 h-2 rounded-full bg-lilac-mid" />Design</span>
              <span className="font-medium">{drift.design}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
              <div className="h-full rounded-full bg-lilac-mid" style={{ width: `${(drift.design / Math.max(drift.design + drift.engineering, 1)) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-1.5 text-gray"><span className="w-2 h-2 rounded-full bg-[#60A5FA]" />Engineering</span>
              <span className="font-medium">{drift.engineering}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F3F1EC] overflow-hidden">
              <div className="h-full rounded-full bg-[#60A5FA]" style={{ width: `${(drift.engineering / Math.max(drift.design + drift.engineering, 1)) * 100}%` }} />
            </div>
            <p className="text-[12px] text-gray mt-1">
              {drift.engineering > drift.design ? "Engineering is currently the bigger source of drift." : drift.design > drift.engineering ? "Design is currently the bigger source of drift." : "Drift is evenly split between teams."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
