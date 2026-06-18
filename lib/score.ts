import { NormalizedComponent, NormalizedToken, AlignmentScore, AdoptionScore, ArchitectureScore } from "@/lib/types";
import { ComponentMatchResult, TokenMatchResult } from "@/lib/match";

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

export function scoreAdoption(components: NormalizedComponent[], hardcodedCount: number): AdoptionScore {
  const figmaComponents = components.filter((c) => c.source === "figma");
  const githubComponents = components.filter((c) => c.source === "github");

  // Design adoption: penalized by components that exist in design but were
  // never picked up in code at all is actually an alignment issue, not
  // adoption — adoption here is about *usage discipline*: deprecated
  // components and ad hoc duplicates outside the system.
  const designAdoption = 91; // mock baseline; a real pass would derive this from detached-instance / local-style counts

  const deprecatedCount = githubComponents.filter((c) => c.status === "deprecated").length;
  const chaoticNamingCount = githubComponents.filter((c) => c.status !== "deprecated" && /\d$|final|old$/i.test(c.name)).length;
  const penalties = deprecatedCount * 6 + chaoticNamingCount * 5 + hardcodedCount * 4;
  const engineeringAdoption = Math.max(100 - penalties, 30);

  const overall = Math.round(designAdoption * 0.5 + engineeringAdoption * 0.5);

  return { overall, designAdoption, engineeringAdoption };
}

export function scoreArchitecture(tokens: NormalizedToken[], tokMatch: TokenMatchResult, compMatch: ComponentMatchResult): ArchitectureScore {
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

  // Structure consistency: how well Figma's path grouping maps to GitHub's
  // folder grouping for matched components.
  const matchedPairs = compMatch.components.filter((c) => c.source === "figma" && c.status === "matched");
  const structureConsistency = matchedPairs.length > 0 ? 78 : 50; // mock baseline; real pass diffs path segments

  const overall = Math.round(
    tokenArchitecture * 0.3 + semanticLayer * 0.25 + componentHierarchy * 0.25 + structureConsistency * 0.2
  );

  return { overall, tokenArchitecture, semanticLayer: Math.round(semanticLayer), componentHierarchy, structureConsistency };
}
