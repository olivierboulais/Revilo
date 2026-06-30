import { ScanReport, ScanDataSource, RiskLevel, RawComponent, RawToken, RawDesignUsageSignal } from "@/lib/types";
import { fetchFigmaComponents, fetchFigmaTokens, fetchFigmaUsageSignals } from "@/lib/figma/api";
import { fetchGithubComponents, fetchGithubTokens } from "@/lib/github/api";
import { fetchFigmaComponents as mockFigmaComponents, fetchFigmaTokens as mockFigmaTokens, fetchFigmaUsageSignals as mockFigmaUsageSignals } from "@/lib/mock/figma";
import { fetchGithubComponents as mockGithubComponents, fetchGithubTokens as mockGithubTokens } from "@/lib/mock/github";
import { getSource, parseFigmaFiles, FigmaFile, FigmaFileRole } from "@/lib/db/sources";
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

  const figmaSource = userId ? await getSource(userId, "figma") : null;
  const figmaFiles = parseFigmaFiles(figmaSource?.figma_file_key ?? null);
  const hasFigma =
    figmaSource?.status === "connected" &&
    figmaSource.access_token &&
    figmaFiles.length > 0;

  const githubSource = userId ? await getSource(userId, "github") : null;
  const hasGithub =
    githubSource?.status === "connected" &&
    githubSource.access_token &&
    githubSource.github_repo;

  const dataSource: ScanDataSource = {
    figma: hasFigma ? "real" : "mock",
    github: hasGithub ? "real" : "mock",
  };

  // Map file roles to token tiers for downstream classification
  const roleToTierHint: Record<FigmaFileRole, string> = {
    seed: "primitive",
    primitive: "primitive",
    semantic: "semantic",
    component: "semantic",
    project: "semantic",
  };

  // Fetch from all Figma files in parallel, tagging tokens with their role
  let figmaRawComponents: RawComponent[] = [];
  let figmaRawTokens: RawToken[] = [];
  let figmaUsageSignals: RawDesignUsageSignal[] = [];

  if (hasFigma) {
    const fileResults = await Promise.all(
      figmaFiles.map(async (file: FigmaFile) => {
        const comps = await fetchFigmaComponents(
          userId!, file.key, figmaSource!.access_token!,
          figmaSource!.refresh_token, figmaSource!.token_expires_at
        ).catch((err) => {
          dataSource.figma = "error";
          dataSource.figmaError = err instanceof Error ? err.message : String(err);
          return [] as RawComponent[];
        });

        const toks = await fetchFigmaTokens(
          userId!, file.key, figmaSource!.access_token!,
          figmaSource!.refresh_token, figmaSource!.token_expires_at
        ).then((tokens) =>
          tokens.map((t) => ({ ...t, tierHint: roleToTierHint[file.role] }))
        ).catch((err) => {
          dataSource.figma = "error";
          dataSource.figmaError = err instanceof Error ? err.message : String(err);
          return [] as RawToken[];
        });

        // Only fetch usage signals from component/project files
        let signals: RawDesignUsageSignal[] = [];
        if (file.role === "component" || file.role === "project") {
          signals = await fetchFigmaUsageSignals(
            userId!, file.key, figmaSource!.access_token!,
            figmaSource!.refresh_token, figmaSource!.token_expires_at
          ).catch((err) => {
            dataSource.figma = "error";
            dataSource.figmaError = err instanceof Error ? err.message : String(err);
            return [] as RawDesignUsageSignal[];
          });
        }

        return { comps, toks, signals };
      })
    );

    for (const r of fileResults) {
      figmaRawComponents.push(...r.comps);
      figmaRawTokens.push(...r.toks);
      figmaUsageSignals.push(...r.signals);
    }

    if (figmaRawComponents.length === 0 && figmaRawTokens.length === 0) {
      figmaRawComponents = await mockFigmaComponents();
      figmaRawTokens = await mockFigmaTokens();
      figmaUsageSignals = await mockFigmaUsageSignals();
      dataSource.figma = "mock";
    }
  } else {
    figmaRawComponents = await mockFigmaComponents();
    figmaRawTokens = await mockFigmaTokens();
    figmaUsageSignals = await mockFigmaUsageSignals();
  }

  const [githubRawComponents, githubRawTokens] = await Promise.all([
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
    usedMockData: !hasFigma && !hasGithub,
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
