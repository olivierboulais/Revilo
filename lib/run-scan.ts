import { ScanReport, RiskLevel } from "@/lib/types";
import { fetchFigmaComponents, fetchFigmaTokens, fetchFigmaUsageSignals } from "@/lib/mock/figma";
import { fetchGithubComponents, fetchGithubTokens } from "@/lib/mock/github";
import { normalizeComponents, normalizeTokens } from "@/lib/normalize";
import { matchComponents, matchTokens, analyzeStructureConsistency } from "@/lib/match";
import { scoreAlignment, scoreAdoption, scoreArchitecture } from "@/lib/score";
import { generateFindings, generateDesignUsageFindings, generateStructureFindings } from "@/lib/findings";
import { generateRecommendations } from "@/lib/recommendations";
import { generateTeamInsights } from "@/lib/team-insights";

function riskFromScores(alignment: number, adoption: number, architecture: number): RiskLevel {
  const avg = (alignment + adoption + architecture) / 3;
  if (avg >= 80) return "low";
  if (avg >= 60) return "medium";
  return "high";
}

export async function runScan(workspaceName: string): Promise<ScanReport> {
  // 1. Ingest — swap points for real Figma/GitHub API calls live in lib/mock/*.
  const [figmaRawComponents, figmaRawTokens, githubRawComponents, githubRawTokens, figmaUsageSignals] = await Promise.all([
    fetchFigmaComponents(),
    fetchFigmaTokens(),
    fetchGithubComponents(),
    fetchGithubTokens(),
    fetchFigmaUsageSignals(),
  ]);

  // 2. Normalize.
  const components = normalizeComponents([...figmaRawComponents, ...githubRawComponents]);
  const tokens = normalizeTokens([...figmaRawTokens, ...githubRawTokens]);

  // 3. Match — deterministic comparison logic.
  const compMatch = matchComponents(components);
  const tokMatch = matchTokens(tokens);
  const structureAnalysis = analyzeStructureConsistency(components);

  // 4. Score.
  const alignment = scoreAlignment(components, compMatch, tokens, tokMatch);
  const adoption = scoreAdoption(components, tokMatch.hardcodedValues.length, figmaUsageSignals.length);
  const architecture = scoreArchitecture(tokens, tokMatch, compMatch, structureAnalysis);

  // 5. Findings.
  const findings = [
    ...generateFindings(compMatch, tokMatch, components),
    ...generateDesignUsageFindings(figmaUsageSignals),
    ...generateStructureFindings(structureAnalysis.mismatches),
  ];

  // 6. Recommendations — AI layer, mocked. See lib/recommendations.ts for the swap point.
  const recommendations = await generateRecommendations(findings);

  // 7. Team insights.
  const teamInsights = generateTeamInsights(findings, components);

  const riskLevel = riskFromScores(alignment.overall, adoption.overall, architecture.overall);

  return {
    id: `scan_${Date.now()}`,
    workspaceName,
    scannedAt: new Date().toISOString(),
    componentsScanned: components.filter((c) => c.source === "figma").length,
    tokenSetsScanned: tokens.filter((t) => t.source === "figma").length,
    alignment,
    adoption,
    architecture,
    riskLevel,
    components,
    tokens,
    findings,
    recommendations,
    teamInsights,
  };
}
