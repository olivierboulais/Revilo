import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { SummaryCard } from "@/components/SummaryCard";
import { IssueCard } from "@/components/IssueCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";

export default async function AdoptionPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const adoptionFindings = report.findings.filter((f) => f.sourceArea === "adoption");

  const designFindings = adoptionFindings.filter((f) => f.type === "detached_instance");
  const engineeringFindings = adoptionFindings.filter(
    (f) => f.type === "hardcoded_value" || f.type === "deprecated_usage" || f.type === "custom_implementation"
  );

  if (!isPaid) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Adoption</h1>
        <p className="text-[13px] text-gray mb-6">Whether teams are actually using the design system.</p>
        <UpgradeBanner message="Adoption findings show where teams are bypassing the design system." />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Adoption</h1>
      <p className="text-[13px] text-gray mb-6">Whether teams are actually using the design system.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <SummaryCard label="Design Adoption" value={report.adoption.designAdoption} suffix="%" />
        <SummaryCard label="Engineering Adoption" value={report.adoption.engineeringAdoption} suffix="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <h2 className="text-[14px] font-medium mb-3">Design</h2>
          <div className="rounded-2xl border border-line bg-white px-5">
            {designFindings.length === 0 ? (
              <p className="text-[13px] text-gray py-6 text-center">
                No detached instances, local styles, or out-of-library components detected.
              </p>
            ) : (
              designFindings.map((f) => <IssueCard key={f.id} finding={f} />)
            )}
          </div>
        </div>
        <div>
          <h2 className="text-[14px] font-medium mb-3">Engineering</h2>
          <div className="rounded-2xl border border-line bg-white px-5">
            {engineeringFindings.length === 0 ? (
              <p className="text-[13px] text-gray py-6 text-center">No adoption issues detected on the engineering side.</p>
            ) : (
              engineeringFindings.map((f) => <IssueCard key={f.id} finding={f} />)
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-medium mb-1">Biggest adoption gaps</h2>
        <p className="text-[12.5px] text-gray mb-4">Adoption trend tracking is coming in a future release — for now, here's what this scan found.</p>
        {engineeringFindings.length === 0 && designFindings.length === 0 ? (
          <p className="text-[13px] text-gray">No significant adoption gaps detected this scan.</p>
        ) : (
          <p className="text-[13px]">
            {engineeringFindings.length} engineering-side issue{engineeringFindings.length === 1 ? "" : "s"} found, primarily around{" "}
            {engineeringFindings.some((f) => f.type === "hardcoded_value") ? "hardcoded values bypassing tokens" : "deprecated component usage"}.
          </p>
        )}
      </div>
    </div>
  );
}
