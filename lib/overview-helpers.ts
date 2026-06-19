import { Finding, Recommendation, TeamInsight } from "@/lib/types";

export type OverviewCategory = "components" | "tokens" | "structure";

const componentTypes: Finding["type"][] = ["component_missing_in_code", "component_missing_in_design", "component_renamed", "variant_mismatch"];
const tokenTypes: Finding["type"][] = ["token_value_mismatch", "token_naming_mismatch", "token_missing_semantic_layer"];

export function categorize(finding: Finding): OverviewCategory {
  if (componentTypes.includes(finding.type)) return "components";
  if (tokenTypes.includes(finding.type)) return "tokens";
  return "structure";
}

export function groupByCategory(findings: Finding[]): Record<OverviewCategory, Finding[]> {
  const groups: Record<OverviewCategory, Finding[]> = { components: [], tokens: [], structure: [] };
  for (const f of findings) groups[categorize(f)].push(f);
  return groups;
}

export function severityCounts(findings: Finding[]): { high: number; medium: number; low: number } {
  return {
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
  };
}

// "Biggest risks" = top 3 by severity (high first), per PRD.
export function topRisks(findings: Finding[], n = 3): Finding[] {
  const order: Record<Finding["severity"], number> = { high: 0, medium: 1, low: 2 };
  return [...findings].sort((a, b) => order[a.severity] - order[b.severity]).slice(0, n);
}

// "Recommended actions" = top 3 by impact (high first), tie-broken by lower effort.
export function topActions(recommendations: Recommendation[], n = 3): Recommendation[] {
  const impactOrder: Record<Recommendation["impact"], number> = { high: 0, medium: 1, low: 2 };
  const effortOrder: Record<Recommendation["effort"], number> = { low: 0, medium: 1, high: 2 };
  return [...recommendations]
    .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact] || effortOrder[a.effort] - effortOrder[b.effort])
    .slice(0, n);
}

export function teamDriftCounts(insights: TeamInsight[]): { design: number; engineering: number } {
  return {
    design: insights.filter((i) => i.team === "design").reduce((sum, i) => sum + i.count, 0),
    engineering: insights.filter((i) => i.team === "engineering").reduce((sum, i) => sum + i.count, 0),
  };
}
