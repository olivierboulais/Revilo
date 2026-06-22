import { Finding, NormalizedComponent, TeamInsight } from "@/lib/types";

let insightCounter = 0;
function nextInsightId(): string {
  insightCounter += 1;
  return `insight_${insightCounter}`;
}

// Spec: "If user attribution is unavailable, show team-level insights instead."
// Mock ingest has no per-author data, so this always produces team-level
// insights. A real implementation with commit/file-author data available
// could attribute these to individuals instead.
export function generateTeamInsights(findings: Finding[], components: NormalizedComponent[]): TeamInsight[] {
  const insights: TeamInsight[] = [];

  const customImplementations = findings.filter((f) => f.type === "custom_implementation");
  if (customImplementations.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "engineering",
      title: `Engineering created ${customImplementations.length} ad hoc component${customImplementations.length === 1 ? "" : "s"} instead of using system components`,
      detail: customImplementations.map((f) => f.title).join("; "),
      count: customImplementations.length,
    });
  }

  const missingInDesign = findings.filter((f) => f.type === "component_missing_in_design");
  if (missingInDesign.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "engineering",
      title: `Engineering built ${missingInDesign.length} component${missingInDesign.length === 1 ? "" : "s"} with no corresponding design source`,
      detail: missingInDesign.map((f) => f.title).join("; "),
      count: missingInDesign.length,
    });
  }

  const hardcoded = findings.filter((f) => f.type === "hardcoded_value");
  if (hardcoded.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "engineering",
      title: `${hardcoded.length} hardcoded value${hardcoded.length === 1 ? "" : "s"} used instead of approved tokens`,
      detail: hardcoded.map((f) => f.title).join("; "),
      count: hardcoded.length,
    });
  }

  const deprecated = findings.filter((f) => f.type === "deprecated_usage");
  if (deprecated.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "engineering",
      title: `${deprecated.length} deprecated component${deprecated.length === 1 ? "" : "s"} still in use`,
      detail: deprecated.map((f) => f.title).join("; "),
      count: deprecated.length,
    });
  }

  const missingInCode = findings.filter((f) => f.type === "component_missing_in_code");
  if (missingInCode.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "design",
      title: `Design specified ${missingInCode.length} component${missingInCode.length === 1 ? "" : "s"} that engineering hasn't built`,
      detail: missingInCode.map((f) => f.title).join("; "),
      count: missingInCode.length,
    });
  }

  const variantMismatches = findings.filter((f) => f.type === "variant_mismatch");
  if (variantMismatches.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "design",
      title: `${variantMismatches.length} component${variantMismatches.length === 1 ? "" : "s"} have variants design and code disagree on`,
      detail: variantMismatches.map((f) => f.title).join("; "),
      count: variantMismatches.length,
    });
  }

  const detached = findings.filter((f) => f.type === "detached_instance");
  if (detached.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "design",
      title: `Design created ${detached.length} detached instance${detached.length === 1 ? "" : "s"}`,
      detail: detached.map((f) => f.title).join("; "),
      count: detached.length,
    });
  }

  const localStylesAndVars = findings.filter((f) => f.type === "local_style" || f.type === "local_variable");
  if (localStylesAndVars.length > 0) {
    insights.push({
      id: nextInsightId(),
      team: "design",
      title: `${localStylesAndVars.length} local style${localStylesAndVars.length === 1 ? "" : "s"} were used instead of approved tokens`,
      detail: localStylesAndVars.map((f) => f.title).join("; "),
      count: localStylesAndVars.length,
    });
  }

  return insights;
}
