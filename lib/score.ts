import { NormalizedComponent, NormalizedToken, AlignmentScore, AdoptionScore, ArchitectureScore } from "@/lib/types";
import { ComponentMatchResult, TokenMatchResult, StructureAnalysis } from "@/lib/match";

function pct(numerator: number, denominator: number): number {
  if (denominator === 0) return 100;
  return Math.round((numerator / denominator) * 100);
}

export function scoreAlignment(
  components: NormalizedComponent[],
  compMatch: ComponentMatchResult,
  tokens: NormalizedToken[],
  tokMatch: TokenMatchResult
): AlignmentScore {
  const figmaComponents = components.filter((c) => c.source === "figma");
  const componentAlignment = pct(
    figmaComponents.filter((c) => c.status === "matched").length,
    figmaComponents.length
  );

  const componentsWithVariants = compMatch.variantMismatches.length;
  const matchedComponentCount = figmaComponents.filter((c) => c.status === "matched").length;
  const variantAlignment = pct(Math.max(matchedComponentCount - componentsWithVariants, 0), Math.max(matchedComponentCount, 1));

  const figmaTokens = tokens.filter((t) => t.source === "figma");
  const tokenMismatchCount = tokMatch.valueMismatches.length + tokMatch.namingMismatches.length;
  const tokenAlignment = pct(Math.max(figmaTokens.length - tokenMismatchCount, 0), Math.max(figmaTokens.length, 1));

  // Naming alignment penalizes renamed-but-matched components and token naming
  // mismatches — anywhere the two sources independently chose different names
  // for what's functionally the same thing.
  const namingIssues = compMatch.renamed.length + tokMatch.namingMismatches.length;
  const namingAlignment = Math.max(100 - namingIssues * 8, 40);

  const overall = Math.round(
    componentAlignment * 0.35 + variantAlignment * 0.2 + tokenAlignment * 0.3 + namingAlignment * 0.15
  );

  return { overall, componentAlignment, variantAlignment, tokenAlignment, namingAlignment };
}

export function scoreAdoption(components: NormalizedComponent[], hardcodedCount: number, designUsageIssueCount: number): AdoptionScore {
  const figmaComponents = components.filter((c) => c.source === "figma");
  const githubComponents = components.filter((c) => c.source === "github");

  // Design adoption: penalized by detached instances and untokenized local
  // styles/variables — these are real signals that designers are working
  // around the library rather than through it. Scaled against the size of
  // the library so a handful of issues doesn't tank the score for a large system.
  const designAdoption = Math.max(100 - Math.round((designUsageIssueCount / Math.max(figmaComponents.length, 1)) * 100), 30);

  const deprecatedCount = githubComponents.filter((c) => c.status === "deprecated").length;
  const chaoticNamingCount = githubComponents.filter((c) => c.status !== "deprecated" && /\d$|final|old$/i.test(c.name)).length;
  const penalties = deprecatedCount * 6 + chaoticNamingCount * 5 + hardcodedCount * 4;
  const engineeringAdoption = Math.max(100 - penalties, 30);

  const overall = Math.round(designAdoption * 0.5 + engineeringAdoption * 0.5);

  return { overall, designAdoption, engineeringAdoption };
}

export function scoreArchitecture(
  tokens: NormalizedToken[],
  tokMatch: TokenMatchResult,
  compMatch: ComponentMatchResult,
  structureAnalysis: StructureAnalysis
): ArchitectureScore {
  const figmaTokens = tokens.filter((t) => t.source === "figma");
  const unknownTierCount = figmaTokens.filter((t) => t.tier === "unknown").length;
  const tokenArchitecture = pct(Math.max(figmaTokens.length - unknownTierCount, 0), Math.max(figmaTokens.length, 1));

  const semanticCount = figmaTokens.filter((t) => t.tier === "semantic").length;
  const primitiveCount = figmaTokens.filter((t) => t.tier === "primitive").length;
  // A healthy system has a meaningful semantic layer relative to its
  // primitives, not just primitives used directly everywhere.
  const semanticLayer = Math.min(pct(semanticCount, Math.max(primitiveCount, 1)) * 1.5, 100);

  const chaoticNamingCount = compMatch.components.filter(
    (c) => c.source === "github" && c.status !== "deprecated" && /\d$|final|old$/i.test(c.name)
  ).length;
  const componentHierarchy = Math.max(100 - chaoticNamingCount * 12, 30);

  // Structure consistency: real comparison of Figma's library grouping
  // against GitHub's folder grouping for matched components (see
  // lib/match.ts analyzeStructureConsistency).
  const structureConsistency = structureAnalysis.consistencyScore;

  const overall = Math.round(
    tokenArchitecture * 0.3 + semanticLayer * 0.25 + componentHierarchy * 0.25 + structureConsistency * 0.2
  );

  return { overall, tokenArchitecture, semanticLayer: Math.round(semanticLayer), componentHierarchy, structureConsistency };
}
