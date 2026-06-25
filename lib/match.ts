import { NormalizedComponent, NormalizedToken } from "@/lib/types";

// A small set of known synonym pairs for the "likely same but named differently"
// case. A real implementation would lean on AI + embedding similarity here per
// the spec ("AI should be used for matching likely equivalent components...
// with different naming"); this rule-based stand-in keeps the logic
// deterministic and inspectable for the mock pass.
const KNOWN_SYNONYMS: Record<string, string> = {
  notification: "alert",
  alert: "notification",
  dropdownmenu: "menu",
  menu: "dropdownmenu",
};

export interface ComponentMatchResult {
  components: NormalizedComponent[];
  missingInCode: NormalizedComponent[];
  missingInDesign: NormalizedComponent[];
  renamed: { figma: NormalizedComponent; github: NormalizedComponent }[];
  variantMismatches: { figma: NormalizedComponent; github: NormalizedComponent; figmaOnly: string[]; githubOnly: string[] }[];
}

export function matchComponents(all: NormalizedComponent[]): ComponentMatchResult {
  const figma = all.filter((c) => c.source === "figma");
  const github = all.filter((c) => c.source === "github");

  const missingInCode: NormalizedComponent[] = [];
  const missingInDesign: NormalizedComponent[] = [];
  const renamed: ComponentMatchResult["renamed"] = [];
  const variantMismatches: ComponentMatchResult["variantMismatches"] = [];

  const githubMatched = new Set<string>();

  for (const f of figma) {
    // Exact normalized-name match first.
    const exact = github.find((g) => g.normalizedName === f.normalizedName);
    if (exact) {
      githubMatched.add(exact.id);
      f.status = "matched";
      f.matchedComponentId = exact.id;
      f.confidence = 1;
      exact.status = "matched";
      exact.matchedComponentId = f.id;
      exact.confidence = 1;

      const figmaOnly = f.variants.filter((v) => !exact.variants.includes(v));
      const githubOnly = exact.variants.filter((v) => !f.variants.includes(v));
      if (figmaOnly.length > 0 || githubOnly.length > 0) {
        variantMismatches.push({ figma: f, github: exact, figmaOnly, githubOnly });
      }
      continue;
    }

    // Known-synonym fallback.
    const synonymKey = KNOWN_SYNONYMS[f.normalizedName];
    const synonymMatch = synonymKey ? github.find((g) => g.normalizedName === synonymKey) : undefined;
    if (synonymMatch) {
      githubMatched.add(synonymMatch.id);
      f.status = "matched";
      f.matchedComponentId = synonymMatch.id;
      f.confidence = 0.72; // lower confidence — name differs, matched via synonym table
      synonymMatch.status = "matched";
      synonymMatch.matchedComponentId = f.id;
      synonymMatch.confidence = 0.72;
      renamed.push({ figma: f, github: synonymMatch });
      continue;
    }

    f.status = "missing_in_code";
    f.confidence = 1;
    missingInCode.push(f);
  }

  for (const g of github) {
    if (githubMatched.has(g.id)) continue;
    if (g.path.includes("/deprecated/")) {
      g.status = "deprecated";
      g.confidence = 1;
      continue; // surfaced via adoption findings, not "missing in design"
    }
    g.status = "missing_in_design";
    g.confidence = 1;
    missingInDesign.push(g);
  }

  return { components: all, missingInCode, missingInDesign, renamed, variantMismatches };
}

export interface TokenMatchResult {
  tokens: NormalizedToken[];
  valueMismatches: { figma: NormalizedToken; github: NormalizedToken }[];
  namingMismatches: { figma: NormalizedToken; github: NormalizedToken }[];
  hardcodedValues: NormalizedToken[];
  missingSemanticLayer: NormalizedToken[];
}

export function matchTokens(all: NormalizedToken[]): TokenMatchResult {
  const figma = all.filter((t) => t.source === "figma");
  const github = all.filter((t) => t.source === "github" && t.category !== "hardcoded");
  const hardcodedValues = all.filter((t) => t.source === "github" && t.category === "hardcoded");

  const valueMismatches: TokenMatchResult["valueMismatches"] = [];
  const namingMismatches: TokenMatchResult["namingMismatches"] = [];
  const githubMatched = new Set<string>();

  for (const f of figma) {
    // Same name → check value parity.
    const sameName = github.find((g) => g.normalizedName === f.normalizedName);
    if (sameName) {
      githubMatched.add(sameName.id);
      if (sameName.value === f.value) {
        f.matchedTokenId = sameName.id;
        sameName.matchedTokenId = f.id;
        f.confidence = 1;
        sameName.confidence = 1;
      } else {
        valueMismatches.push({ figma: f, github: sameName });
      }
      continue;
    }

    // Different name, same value → naming mismatch.
    const sameValue = github.find((g) => g.value === f.value && g.category === f.category);
    if (sameValue) {
      githubMatched.add(sameValue.id);
      namingMismatches.push({ figma: f, github: sameValue });
      continue;
    }
  }

  const missingSemanticLayer = all.filter((t) => t.tier === "unknown" && t.source === "figma");

  return { tokens: all, valueMismatches, namingMismatches, hardcodedValues, missingSemanticLayer };
}

export interface StructureMismatch {
  figma: NormalizedComponent;
  github: NormalizedComponent;
  figmaGroup: string;
  githubGroup: string;
}

export interface StructureAnalysis {
  matchedPairCount: number;
  mismatches: StructureMismatch[];
  consistencyScore: number; // 0-100
}

// Compares Figma's library grouping (e.g. "Foundations/Forms") against
// GitHub's folder grouping (e.g. "src/components/Input") for matched
// components, per the spec's "System Structure Alignment" check. A real
// implementation might use a configured mapping between the two hierarchies;
// this heuristic flags it as a mismatch whenever GitHub has no folder-level
// grouping that corresponds to Figma's category (e.g. everything sitting
// flat under one folder regardless of its Figma group).
export function analyzeStructureConsistency(components: NormalizedComponent[]): StructureAnalysis {
  const matchedFigma = components.filter((c) => c.source === "figma" && c.status === "matched" && c.matchedComponentId);
  const mismatches: StructureMismatch[] = [];

  // Build a map of all GitHub component groupings to detect inconsistent patterns
  const githubGroupings = new Map<string, string[]>();

  for (const f of matchedFigma) {
    const github = components.find((c) => c.id === f.matchedComponentId);
    if (!github) continue;

    // Figma group: extract meaningful category segments
    const figmaSegments = f.path.split("/").filter((s) => s && s !== "Figma Library");
    const figmaGroup = figmaSegments[figmaSegments.length - 1] ?? f.path;

    // GitHub group: extract the meaningful folder path above the component
    const githubSegments = github.path.split("/").filter(Boolean);
    // Find the most specific grouping folder (skip generic containers)
    const genericFolders = new Set(["src", "lib", "app", "packages", "modules"]);
    const meaningfulSegments = githubSegments.filter((s) => !genericFolders.has(s.toLowerCase()));
    const githubGroup = meaningfulSegments.length > 0
      ? meaningfulSegments[meaningfulSegments.length - 1]
      : githubSegments[githubSegments.length - 1] ?? github.path;

    // Track groupings for consistency analysis
    const groupKey = githubGroup.toLowerCase();
    if (!githubGroupings.has(groupKey)) githubGroupings.set(groupKey, []);
    githubGroupings.get(groupKey)!.push(github.name);

    // Check for structural mismatch:
    // 1. GitHub has no meaningful sub-grouping (everything in flat "components" folder)
    // 2. Figma has a category but GitHub path doesn't reflect it
    const githubHasNoSubGrouping = githubGroup.toLowerCase() === "components";
    const figmaHasCategory = figmaSegments.length > 1;

    // Normalize names for comparison
    const figmaNorm = figmaGroup.toLowerCase().replace(/[^a-z0-9]/g, "");
    const githubNorm = githubGroup.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Mismatch when GitHub is flat but Figma has categories, OR when
    // the grouping names don't share any meaningful overlap
    const groupingsMatch = figmaNorm === githubNorm ||
      figmaNorm.includes(githubNorm) || githubNorm.includes(figmaNorm) ||
      github.name.toLowerCase().replace(/[^a-z0-9]/g, "") === githubNorm;

    if (githubHasNoSubGrouping && figmaHasCategory) {
      mismatches.push({ figma: f, github, figmaGroup, githubGroup });
    } else if (!groupingsMatch && figmaHasCategory && !githubHasNoSubGrouping) {
      mismatches.push({ figma: f, github, figmaGroup, githubGroup });
    }
  }

  const matchedPairCount = matchedFigma.length;
  const consistencyScore = matchedPairCount > 0 ? Math.round(((matchedPairCount - mismatches.length) / matchedPairCount) * 100) : 100;

  return { matchedPairCount, mismatches, consistencyScore };
}
