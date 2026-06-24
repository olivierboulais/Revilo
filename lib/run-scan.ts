import { ScanReport, ScanDataSource, RiskLevel } from "@/lib/types";
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
  let userId: string | null = null;
  if (userEmail) {
    const user = await findUserByEmail(userEmail);
    userId = user?.id ?? null;
  }

  let figmaSource = userId ? await getSource(userId, "figma") : null;
  const hasFigma =
    figmaSource?.status === "connected" &&
    figmaSource.access_token &&
    figmaSource.figma_file_key;

  let githubSource = userId ? await getSource(userId, "github") : null;
  const hasGithub =
    githubSource?.status === "connected" &&
    githubSource.access_token &&
    githubSource.github_repo;

  const dataSource: ScanDataSource = {
    figma: hasFigma ? "real" : "mock",
    github: hasGithub ? "real" : "mock",
  };

  const [figmaRawComponents, figmaRawTokens, githubRawComponents, githubRawTokens, figmaUsageSignals] =
    await Promise.all([
      hasFigma
        ? fetchFigmaComponents(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => {
            dataSource.figma = "error";
            dataSource.figmaError = err instanceof Error ? err.message : String(err);
            return mockFigmaComponents();
          })
        : mockFigmaComponents(),

      hasFigma
        ? fetchFigmaTokens(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => {
            dataSource.figma = "error";
            dataSource.figmaError = err instanceof Error ? err.message : String(err);
            return mockFigmaTokens();
          })
        : mockFigmaTokens(),

      hasGithub
        ? fetchGithubComponents(githubSource!.github_repo!, githubSource!.access_token!)
            .catch((err) => {
              dataSource.github = "error";
              dataSource.githubError = err instanceof Error ? err.message : String(err);
              return mockGithubComponents();
            })
        : mockGithubComponents(),

      hasGithub
        ? fetchGithubTokens(githubSource!.github_repo!, githubSource!.access_token!)
            .catch((err) => {
              dataSource.github = "error";
              dataSource.githubError = err instanceof Error ? err.message : String(err);
              return mockGithubTokens();
            })
        : mockGithubTokens(),

      hasFigma
        ? fetchFigmaUsageSignals(
            userId!,
            figmaSource!.figma_file_key!,
            figmaSource!.access_token!,
            figmaSource!.refresh_token,
            figmaSource!.token_expires_at
          ).catch((err) => {
            dataSource.figma = "error";
            dataSource.figmaError = err instanceof Error ? err.message : String(err);
            return mockFigmaUsageSignals();
          })
        : mockFigmaUsageSignals(),
    ]);

  const components = normalizeComponents([...figmaRawComponents, ...githubRawComponents]);
  const tokens = normalizeTokens([...figmaRawTokens, ...githubRawTokens]);

  const compMatch = matchComponents(components);
  const tokMatch = matchTokens(tokens);
  const structureAnalysis = analyzeStructureConsistency(components);

  const alignment = scoreAlignment(components, compMatch, tokens, tokMatch);
  const adoption = scoreAdoption(components, tokMatch.hardcodedValues.length, figmaUsageSignals.length);
  const architecture = scoreArchitecture(tokens, tokMatch, compMatch, structureAnalysis);

  const findings = [
    ...generateFindings(compMatch, tokMatch, components),
    ...generateDesignUsageFindings(figmaUsageSignals),
    ...generateStructureFindings(structureAnalysis.mismatches),
  ];

  const recommendations = await generateRecommendations(findings);
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
    dataSource,
  };
}
