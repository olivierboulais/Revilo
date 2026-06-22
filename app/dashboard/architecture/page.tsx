import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { SummaryCard, SummaryStatCard } from "@/components/SummaryCard";
import { IssueCard } from "@/components/IssueCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";

function maturityLevel(score: number): string {
  if (score >= 85) return "Mature";
  if (score >= 70) return "Developing";
  if (score >= 50) return "Emerging";
  return "Early";
}

export default async function ArchitecturePage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const architectureFindings = report.findings.filter((f) => f.sourceArea === "architecture");
  const tokenArchFindings = architectureFindings.filter((f) => f.type === "token_missing_semantic_layer");
  const structureFindings = architectureFindings.filter((f) => f.type === "naming_inconsistency");
  const componentArchFindings = report.findings.filter((f) => f.type === "custom_implementation");

  if (!isPaid) {
    return (
      <div className="px-6 py-8">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Architecture</h1>
        <p className="text-[13px] text-gray mb-6">Whether the design system is structured to scale.</p>
        <UpgradeBanner message="Architecture findings cover token structure and component hierarchy quality." />
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Architecture</h1>
      <p className="text-[13px] text-gray mb-6">Whether the design system is structured to scale.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Architecture Score" value={report.architecture.overall} />
        <SummaryStatCard label="Maturity Level" value={maturityLevel(report.architecture.overall)} />
        <SummaryStatCard
          label="Architecture Issues"
          value={architectureFindings.length + componentArchFindings.length}
          accent={architectureFindings.length + componentArchFindings.length > 10 ? "#EF4444" : undefined}
        />
      </div>

      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-[14px] font-medium mb-1">Token Architecture</h2>
          <p className="text-[12.5px] text-gray mb-3">Primitive naming, semantic layer presence, and hierarchy consistency.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <SummaryStatCard label="Token Architecture Score" value={report.architecture.tokenArchitecture} />
            <SummaryStatCard label="Semantic Layer Score" value={report.architecture.semanticLayer} />
          </div>
          <div className="rounded-2xl border border-line bg-white px-5">
            {tokenArchFindings.length === 0 ? (
              <p className="text-[13px] text-gray py-6 text-center">No token architecture issues detected.</p>
            ) : (
              tokenArchFindings.map((f) => <IssueCard key={f.id} finding={f} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[14px] font-medium mb-1">Component Architecture</h2>
          <p className="text-[12.5px] text-gray mb-3">Base/semantic/product-level structure and naming consistency.</p>
          <div className="rounded-2xl border border-line bg-white px-5 mb-3">
            <div className="flex items-center justify-between py-3.5">
              <span className="text-[13px]">Component Hierarchy Score</span>
              <span className="text-[15px] font-semibold">{report.architecture.componentHierarchy}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-white px-5">
            {componentArchFindings.length === 0 ? (
              <p className="text-[13px] text-gray py-6 text-center">No chaotic or duplicate component naming detected.</p>
            ) : (
              componentArchFindings.map((f) => <IssueCard key={f.id} finding={f} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="text-[14px] font-medium mb-1">System Structure Alignment</h2>
          <p className="text-[12.5px] text-gray mb-3">How well Figma's library structure maps to the GitHub package structure.</p>
          <div className="rounded-2xl border border-line bg-white p-5 mb-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px]">Structure Consistency Score</span>
              <span className="text-[15px] font-semibold">{report.architecture.structureConsistency}</span>
            </div>
            <p className="text-[12.5px] text-gray leading-relaxed">
              {report.architecture.structureConsistency >= 75
                ? "Figma's foundations and component groupings map reasonably well to the code package structure."
                : "Figma's foundations and component groupings don't map cleanly to the code package structure yet — this is usually the slowest architecture issue to fix, since it touches how both teams organize their work."}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white px-5">
            {structureFindings.length === 0 ? (
              <p className="text-[13px] text-gray py-6 text-center">No structural mismatches detected between Figma and code.</p>
            ) : (
              structureFindings.map((f) => <IssueCard key={f.id} finding={f} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
