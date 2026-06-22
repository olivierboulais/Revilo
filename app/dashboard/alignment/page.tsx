import { getSession } from "@/lib/auth/session";
import { getReport, saveReport } from "@/lib/store";
import { runScan } from "@/lib/run-scan";
import { redirect } from "next/navigation";
import { SummaryCard } from "@/components/SummaryCard";
import { CollapsibleIssueGroup, IssueCard } from "@/components/IssueCard";
import { UpgradeBanner } from "@/components/UpgradeBanner";
import { Finding } from "@/lib/types";

export default async function AlignmentPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  let report = await getReport(session.email);
  if (!report) {
    report = await runScan(session.workspaceName);
    await saveReport(session.email, report);
  }

  const isPaid = session.tier !== "free";
  const alignmentFindings = report.findings.filter((f) => f.sourceArea === "alignment");

  const groups: { title: string; findings: Finding[] }[] = [
    { title: "Components Missing in Code", findings: alignmentFindings.filter((f) => f.type === "component_missing_in_code") },
    { title: "Components Missing in Design", findings: alignmentFindings.filter((f) => f.type === "component_missing_in_design") },
    { title: "Variant Mismatches", findings: alignmentFindings.filter((f) => f.type === "variant_mismatch") },
    { title: "Token Mismatches", findings: alignmentFindings.filter((f) => f.type === "token_value_mismatch") },
    { title: "Naming Mismatches", findings: alignmentFindings.filter((f) => f.type === "component_renamed" || f.type === "token_naming_mismatch") },
  ];

  // Free tier: show only the single highest-severity finding across all
  // groups, matching the Overview/marketing-site promise of "1 finding."
  const visibleFindingIds = isPaid
    ? null
    : new Set(
        [...alignmentFindings].sort((a, b) => {
          const order: Record<Finding["severity"], number> = { high: 0, medium: 1, low: 2 };
          return order[a.severity] - order[b.severity];
        }).slice(0, 1).map((f) => f.id)
      );

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Alignment</h1>
      <p className="text-[13px] text-gray mb-6">Where design and code are out of sync.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Component Alignment" value={report.alignment.componentAlignment} />
        <SummaryCard label="Variant Alignment" value={report.alignment.variantAlignment} />
        <SummaryCard label="Token Alignment" value={report.alignment.tokenAlignment} />
        <SummaryCard label="Naming Alignment" value={report.alignment.namingAlignment} />
      </div>

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const visible = isPaid ? group.findings : group.findings.filter((f) => visibleFindingIds!.has(f.id));
          const hidden = group.findings.length - visible.length;
          return (
            <CollapsibleIssueGroup key={group.title} title={group.title} count={group.findings.length}>
              {group.findings.length === 0 ? (
                <p className="text-[13px] text-gray py-6 text-center">No issues in this category.</p>
              ) : (
                <>
                  {visible.map((f) => (
                    <IssueCard key={f.id} finding={f} />
                  ))}
                  {hidden > 0 && (
                    <div className="py-4">
                      <UpgradeBanner message={`${hidden} more finding${hidden === 1 ? "" : "s"} in this category are in the full report.`} />
                    </div>
                  )}
                </>
              )}
            </CollapsibleIssueGroup>
          );
        })}
      </div>
    </div>
  );
}
