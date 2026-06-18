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
