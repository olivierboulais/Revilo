// Normalized data model — see "Normalized Data Model" in the build spec.
// These types are the contract between ingestion (Figma/GitHub), comparison,
// scoring, and the dashboard. Whether the data backing them is mocked or real,
// everything downstream of this file is written against these shapes.

export type Source = "figma" | "github";

export type Tier = "primitive" | "semantic" | "unknown";

export interface RawComponent {
  source: Source;
  name: string;
  path: string;
  variants: string[];
  props?: string[];
}

export interface RawToken {
  source: Source;
  name: string;
  value: string;
  category: string;
}

// Adoption signals from Figma *file* content (not the library) — detached
// instances and local (un-tokenized) styles/variables. These come from a
// different part of the Figma API than library components/tokens, so they
// get their own raw shape rather than being forced into RawComponent.
export interface RawDesignUsageSignal {
  type: "detached_instance" | "local_style" | "local_variable";
  componentName?: string; // for detached instances: which library component it diverged from
  fileName: string;
  description: string;
}

export interface NormalizedComponent {
  id: string;
  source: Source;
  name: string;
  normalizedName: string;
  path: string;
  variants: string[];
  props: string[];
  status: "matched" | "missing_in_code" | "missing_in_design" | "deprecated";
  matchedComponentId: string | null;
  confidence: number; // 0-1
}

export interface NormalizedToken {
  id: string;
  source: Source;
  name: string;
  normalizedName: string;
  value: string;
  category: string;
  tier: Tier;
  matchedTokenId: string | null;
  confidence: number; // 0-1
}

export type FindingType =
  | "component_missing_in_code"
  | "component_missing_in_design"
  | "component_renamed"
  | "variant_mismatch"
  | "token_value_mismatch"
  | "token_naming_mismatch"
  | "token_missing_semantic_layer"
  | "naming_inconsistency"
  | "deprecated_usage"
  | "hardcoded_value"
  | "detached_instance"
  | "local_style"
  | "local_variable"
  | "custom_implementation";

export type Severity = "high" | "medium" | "low";

export interface Finding {
  id: string;
  type: FindingType;
  severity: Severity;
  title: string;
  description: string;
  sourceArea: "alignment" | "adoption" | "architecture";
  evidence: string[];
  confidence: number; // 0-1
  recommendationId: string | null;
}

export interface SubScore {
  label: string;
  value: number; // 0-100
}

export interface AlignmentScore {
  overall: number;
  componentAlignment: number;
  variantAlignment: number;
  tokenAlignment: number;
  namingAlignment: number;
}

export interface AdoptionScore {
  overall: number;
  designAdoption: number;
  engineeringAdoption: number;
}

export interface ArchitectureScore {
  overall: number;
  tokenArchitecture: number;
  semanticLayer: number;
  componentHierarchy: number;
  structureConsistency: number;
}

export type RiskLevel = "low" | "medium" | "high";

export type Impact = "high" | "medium" | "low";
export type Effort = "high" | "medium" | "low";
export type RecommendationTier = "quick_win" | "medium_term" | "strategic";

export interface Recommendation {
  id: string;
  title: string;
  problem: string;
  whyItMatters: string;
  suggestedFix: string;
  impact: Impact;
  effort: Effort;
  confidence: number; // 0-1
  tier: RecommendationTier;
}

export interface TeamInsight {
  id: string;
  team: "design" | "engineering";
  title: string;
  detail: string;
  count: number;
}

export interface ScanDataSource {
  figma: "real" | "mock" | "error";
  github: "real" | "mock" | "error";
  figmaError?: string;
  githubError?: string;
}

export interface ScanReport {
  id: string;
  workspaceName: string;
  scannedAt: string;
  usedMockData?: boolean;
  componentsScanned: number;
  tokenSetsScanned: number;
  alignment: AlignmentScore;
  adoption: AdoptionScore;
  architecture: ArchitectureScore;
  riskLevel: RiskLevel;
  components: NormalizedComponent[];
  tokens: NormalizedToken[];
  findings: Finding[];
  recommendations: Recommendation[];
  teamInsights: TeamInsight[];
  dataSource?: ScanDataSource;
}

export type ScanProgressState =
  | "connecting_sources"
  | "indexing_figma"
  | "indexing_code"
  | "mapping_tokens"
  | "detecting_mismatches"
  | "scoring_system"
  | "generating_recommendations"
  | "complete";

export const SCAN_PROGRESS_SEQUENCE: { state: ScanProgressState; label: string }[] = [
  { state: "connecting_sources", label: "Connecting sources" },
  { state: "indexing_figma", label: "Indexing Figma components" },
  { state: "indexing_code", label: "Indexing code components" },
  { state: "mapping_tokens", label: "Mapping tokens" },
  { state: "detecting_mismatches", label: "Detecting mismatches" },
  { state: "scoring_system", label: "Scoring system" },
  { state: "generating_recommendations", label: "Generating recommendations" },
];
