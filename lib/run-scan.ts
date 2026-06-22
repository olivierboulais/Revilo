import { ScanReport, RiskLevel } from "@/lib/types";
import { fetchFigmaComponents, fetchFigmaTokens, fetchFigmaUsageSignals } from "@/lib/figma/api";
import { fetchGithubComponents, fetchGithubTokens } from "@/lib/github/api";
import { fetchFigmaComponents as mockFigmaComponents, fetchFigmaTokens as mockFigmaTokens, fetchFigmaUsageSignals as mockFigmaUsageSignals } from "@/lib/mock/figma";
import { fetchGithubComponents as mockGithubComponents, fetchGithubTokens as mockGithubTokens } from "@/lib/mock/github";
import { getSource } from "@/lib/db/sources";
import { findUserByEmail } from "@/lib/db/users";
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

export async function runScan(workspaceName: string, userEmail?: string): Promise<ScanReport> {
  // Resolve user so we can look up their connected sources
  let userId: string | null = null;
  if (userEmail) {
    const user = await findUserByEmail(userEmail);
    userId = user?.id ?? null;
  }

  // Figma data — real if a connected source with a file key exists, else mock
  let figmaSource = userId ? await getSource(userId, "figma") : null;
  const hasFigma =
    figmaSource?.status === "connected" &&
    figmaSource.access_token &&
    figmaSource.figma_file_key;

  // GitHub data — real if a connected source with a repo exists, else mock
  let githubSource = userId ? await getSource(userId, "github") : null;
  const hasGithub =
    githubSource?.status === "connected" &&
    githubSource.access_token &&
    githubSource.github_repo;

  const [figmaRawComponents, figmaRawTokens, githubRawComponents, githubRawTokens, figmaUsageSignals] =
    await Promise.all([
      hasFigma
        ? fetchFigmaComponents(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => { console.error("Figma components fetch failed, using mock:", err); return mockFigmaComponents(); })
        : mockFigmaComponents(),

      hasFigma
        ? fetchFigmaTokens(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => { console.error("Figma tokens fetch failed, using mock:", err); return mockFigmaTokens(); })
        : mockFigmaTokens(),

      hasGithub
        ? fetchGithubComponents(githubSource!.github_repo!, githubSource!.access_token!)
            .catch((err) => { console.error("GitHub components fetch failed, using mock:", err); return mockGithubComponents(); })
        : mockGithubComponents(),

      hasGithub
        ? fetchGithubTokens(githubSource!.github_repo!, githubSource!.access_token!)
            .catch((err) => { console.error("GitHub tokens fetch failed, using mock:", err); return mockGithubTokens(); })
        : mockGithubTokens(),

      hasFigma
        ? fetchFigmaUsageSignals(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => { console.error("Figma usage signals fetch failed, using mock:", err); return mockFigmaUsageSignals(); })
        : mockFigmaUsageSignals(),
    ]);

  // 2. Normalize
  const components = normalizeComponents([...figmaRawComponents, ...githubRawComponents]);
  const tokens = normalizeTokens([...figmaRawTokens, ...githubRawTokens]);

  // 3. Match
  const compMatch = matchComponents(components);
  const tokMatch = matchTokens(tokens);
  const structureAnalysis = analyzeStructureConsistency(components);

  // 4. Score
  const alignment = scoreAlignment(components, compMatch, tokens, tokMatch);
  const adoption = scoreAdoption(components, tokMatch.hardcodedValues.length, figmaUsageSignals.length);
  const architecture = scoreArchitecture(tokens, tokMatch, compMatch, structureAnalysis);

  // 5. Findings
  const findings = [
    ...generateFindings(compMatch, tokMatch, components),
    ...generateDesignUsageFindings(figmaUsageSignals),
    ...generateStructureFindings(structureAnalysis.mismatches),
  ];

  // 6. Recommendations (AI-backed when ANTHROPIC_API_KEY set, templates otherwise)
  const recommendations = await generateRecommendations(findings);

  // 7. Team insights
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
