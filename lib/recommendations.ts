import { Finding, Recommendation, RecommendationTier, Impact, Effort } from "@/lib/types";

let recCounter = 0;
function nextRecId(): string {
  recCounter += 1;
  return `rec_${recCounter}`;
}

// Swap point: a real implementation sends grouped findings to the OpenAI/Claude
// API (per spec: "AI Role in Product") and parses structured recommendations
// back. This mock groups findings by type and applies a template per group,
// producing the same Recommendation shape a real AI call would return.
async function callAIForRecommendation(
  findingGroup: Finding[],
  template: { title: string; whyItMatters: string; suggestedFix: string; impact: Impact; effort: Effort; tier: RecommendationTier }
): Promise<Recommendation> {
  const sample = findingGroup[0];
  return {
    id: nextRecId(),
    title: template.title,
    problem: sample.description,
    whyItMatters: template.whyItMatters,
    suggestedFix: template.suggestedFix,
    impact: template.impact,
    effort: template.effort,
    confidence: Math.round((findingGroup.reduce((sum, f) => sum + f.confidence, 0) / findingGroup.length) * 100) / 100,
    tier: template.tier,
  };
}

export async function generateRecommendations(findings: Finding[]): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  const byType = (type: Finding["type"]) => findings.filter((f) => f.type === type);

  const missingInCode = byType("component_missing_in_code");
  if (missingInCode.length > 0) {
    recommendations.push(
      await callAIForRecommendation(missingInCode, {
        title: "Build the components that exist in Figma but not in code",
        whyItMatters: `${missingInCode.length} component${missingInCode.length === 1 ? "" : "s"} designers can use today have no implementation, forcing engineers to either build one-off versions or send the work back to design.`,
        suggestedFix: "Prioritize by usage frequency in design files, then implement and publish to the shared component library.",
        impact: missingInCode.length > 2 ? "high" : "medium",
        effort: "medium",
        tier: "medium_term",
      })
    );
  }

  const missingInDesign = byType("component_missing_in_design");
  if (missingInDesign.length > 0) {
    recommendations.push(
      await callAIForRecommendation(missingInDesign, {
        title: "Document the code-only components in Figma",
        whyItMatters: "Designers can't discover or reuse components that only exist in code, which leads to duplicate design work and inconsistent UI.",
        suggestedFix: "Add Figma representations for these components, even as a simple first pass, so design and engineering reference the same library.",
        impact: "medium",
        effort: "low",
        tier: "quick_win",
      })
    );
  }

  const renamed = byType("component_renamed");
  if (renamed.length > 0) {
    recommendations.push(
      await callAIForRecommendation(renamed, {
        title: "Standardize naming for components that drifted apart",
        whyItMatters: "When design and code independently name the same thing differently, nobody can tell they're related — which leads to duplicate builds and broken handoff.",
        suggestedFix: "Pick one name per component, update the other source to match, and document the mapping until the rename is fully adopted.",
        impact: "medium",
        effort: "low",
        tier: "quick_win",
      })
    );
  }

  const variantMismatches = byType("variant_mismatch");
  if (variantMismatches.length > 0) {
    recommendations.push(
      await callAIForRecommendation(variantMismatches, {
        title: "Reconcile variant sets between design and code",
        whyItMatters: "When a variant exists on only one side, either designers are speccing states engineers can't ship, or engineers built states design never approved.",
        suggestedFix: "For each mismatch, decide whether to add the missing variant or remove the orphaned one, then keep both sources in sync going forward.",
        impact: "medium",
        effort: "medium",
        tier: "medium_term",
      })
    );
  }

  const valueMismatches = byType("token_value_mismatch");
  if (valueMismatches.length > 0) {
    recommendations.push(
      await callAIForRecommendation(valueMismatches, {
        title: "Fix token value mismatches between design and code",
        whyItMatters: "These are the same named token resolving to different actual values — meaning what designers see in Figma is not what ships, even though everyone assumes it is.",
        suggestedFix: "Treat one source as the source of truth, correct the other, and add a check that catches future drift before it ships.",
        impact: "high",
        effort: "low",
        tier: "quick_win",
      })
    );
  }

  const namingMismatches = byType("token_naming_mismatch");
  if (namingMismatches.length > 0) {
    recommendations.push(
      await callAIForRecommendation(namingMismatches, {
        title: "Align token names that resolve to the same value",
        whyItMatters: "Identical colors under different names make it impossible to tell, just by reading the code or the file, that two things are meant to be the same.",
        suggestedFix: "Standardize on one naming convention and migrate references, prioritizing the tokens used most widely first.",
        impact: "low",
        effort: "low",
        tier: "quick_win",
      })
    );
  }

  const missingSemanticLayer = byType("token_missing_semantic_layer");
  if (missingSemanticLayer.length > 0) {
    recommendations.push(
      await callAIForRecommendation(missingSemanticLayer, {
        title: "Introduce a semantic layer for loosely-named tokens",
        whyItMatters: "Tokens like these describe where they were first used, not what they're for — so nobody can safely reuse or rename them without risking a visual regression somewhere unrelated.",
        suggestedFix: "Map each one to a primitive value and give it a semantic name that describes its purpose (e.g. color.action.primary.background), then update references.",
        impact: "medium",
        effort: "high",
        tier: "strategic",
      })
    );
  }

  const hardcoded = byType("hardcoded_value");
  if (hardcoded.length > 0) {
    recommendations.push(
      await callAIForRecommendation(hardcoded, {
        title: "Replace hardcoded values with token references",
        whyItMatters: "Hardcoded values can't be updated centrally, so a future token change won't reach these components — they'll silently fall out of sync again.",
        suggestedFix: "Swap each hardcoded value for the matching token reference, and add a lint rule to catch new ones before merge.",
        impact: "medium",
        effort: "medium",
        tier: "medium_term",
      })
    );
  }

  const deprecated = byType("deprecated_usage");
  if (deprecated.length > 0) {
    recommendations.push(
      await callAIForRecommendation(deprecated, {
        title: "Remove deprecated components still in use",
        whyItMatters: "Every deprecated component still imported somewhere is a component the team has to maintain twice, and a trap for anyone who copies an existing usage as a starting point.",
        suggestedFix: "Find remaining usages, migrate them to the current component, then delete the deprecated version.",
        impact: "low",
        effort: "medium",
        tier: "medium_term",
      })
    );
  }

  const customImplementations = byType("custom_implementation");
  if (customImplementations.length > 0) {
    recommendations.push(
      await callAIForRecommendation(customImplementations, {
        title: "Standardize Button Architecture",
        whyItMatters: "Ad hoc duplicates like these usually mean the system component didn't support something engineers needed, so they built around it instead of extending it — and the next person will too.",
        suggestedFix: "Audit what the duplicates do differently from the system component, fold the real requirements back into the base component, and retire the duplicates.",
        impact: "high",
        effort: "medium",
        tier: "strategic",
      })
    );
  }

  return recommendations;
}
