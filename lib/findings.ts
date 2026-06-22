import { Finding, NormalizedComponent, RawDesignUsageSignal } from "@/lib/types";
import { ComponentMatchResult, TokenMatchResult, StructureMismatch } from "@/lib/match";

let findingCounter = 0;
function nextFindingId(): string {
  findingCounter += 1;
  return `finding_${findingCounter}`;
}

export function generateFindings(compMatch: ComponentMatchResult, tokMatch: TokenMatchResult, allComponents: NormalizedComponent[]): Finding[] {
  const findings: Finding[] = [];

  for (const c of compMatch.missingInCode) {
    findings.push({
      id: nextFindingId(),
      type: "component_missing_in_code",
      severity: "high",
      title: `${c.name} exists in Figma but not in code`,
      description: `${c.name} is defined in Figma at ${c.path} with ${c.variants.length} variant(s), but no matching implementation was found in the codebase.`,
      sourceArea: "alignment",
      evidence: [`Figma path: ${c.path}`, `Variants: ${c.variants.join(", ")}`],
      confidence: 0.95,
      recommendationId: null,
    });
  }

  for (const c of compMatch.missingInDesign) {
    findings.push({
      id: nextFindingId(),
      type: "component_missing_in_design",
      severity: "medium",
      title: `${c.name} exists in code but not in Figma`,
      description: `${c.name} is implemented at ${c.path}, but no corresponding component was found in the Figma library.`,
      sourceArea: "alignment",
      evidence: [`Code path: ${c.path}`],
      confidence: 0.9,
      recommendationId: null,
    });
  }

  for (const r of compMatch.renamed) {
    findings.push({
      id: nextFindingId(),
      type: "component_renamed",
      severity: "medium",
      title: `"${r.figma.name}" in Figma is likely "${r.github.name}" in code`,
      description: `These components share structure and likely serve the same purpose, but were named independently in each source.`,
      sourceArea: "alignment",
      evidence: [`Figma: ${r.figma.name} (${r.figma.path})`, `Code: ${r.github.name} (${r.github.path})`],
      confidence: r.figma.confidence,
      recommendationId: null,
    });
  }

  for (const v of compMatch.variantMismatches) {
    const detail = [
      v.figmaOnly.length > 0 ? `Figma-only: ${v.figmaOnly.join(", ")}` : null,
      v.githubOnly.length > 0 ? `Code-only: ${v.githubOnly.join(", ")}` : null,
    ].filter(Boolean) as string[];
    findings.push({
      id: nextFindingId(),
      type: "variant_mismatch",
      severity: "medium",
      title: `${v.figma.name} has mismatched variants between design and code`,
      description: `Design and code disagree on which variants exist for ${v.figma.name}.`,
      sourceArea: "alignment",
      evidence: detail,
      confidence: 0.9,
      recommendationId: null,
    });
  }

  for (const m of tokMatch.valueMismatches) {
    findings.push({
      id: nextFindingId(),
      type: "token_value_mismatch",
      severity: "high",
      title: `${m.figma.name} has different values in design and code`,
      description: `Design defines ${m.figma.name} as ${m.figma.value}; code defines it as ${m.github.value}.`,
      sourceArea: "alignment",
      evidence: [`Figma: ${m.figma.value}`, `Code: ${m.github.value}`],
      confidence: 1,
      recommendationId: null,
    });
  }

  for (const m of tokMatch.namingMismatches) {
    findings.push({
      id: nextFindingId(),
      type: "token_naming_mismatch",
      severity: "low",
      title: `Same color, different token names: "${m.figma.name}" vs "${m.github.name}"`,
      description: `Both tokens resolve to ${m.figma.value} but are named differently across design and code, making the relationship invisible to anyone reading either source alone.`,
      sourceArea: "alignment",
      evidence: [`Figma: ${m.figma.name}`, `Code: ${m.github.name}`],
      confidence: 0.85,
      recommendationId: null,
    });
  }

  for (const t of tokMatch.missingSemanticLayer) {
    findings.push({
      id: nextFindingId(),
      type: "token_missing_semantic_layer",
      severity: "medium",
      title: `"${t.name}" is a primitive used without a semantic layer`,
      description: `This token doesn't follow the primitive/semantic naming pattern, making it unclear what it's for or whether it's safe to change.`,
      sourceArea: "architecture",
      evidence: [`Token: ${t.name}`, `Value: ${t.value}`],
      confidence: 0.8,
      recommendationId: null,
    });
  }

  for (const t of tokMatch.hardcodedValues) {
    const componentName = t.name.split(":")[1] ?? "a component";
    findings.push({
      id: nextFindingId(),
      type: "hardcoded_value",
      severity: "medium",
      title: `${componentName} uses a hardcoded value instead of a token`,
      description: `${t.value} is written directly in code rather than referencing a design token.`,
      sourceArea: "adoption",
      evidence: [`Value: ${t.value}`],
      confidence: 0.95,
      recommendationId: null,
    });
  }

  const deprecated = allComponents.filter((c) => c.status === "deprecated");
  for (const d of deprecated) {
    findings.push({
      id: nextFindingId(),
      type: "deprecated_usage",
      severity: "medium",
      title: `${d.name} is deprecated but still present in the codebase`,
      description: `${d.name} lives at ${d.path} and has not been removed despite being superseded.`,
      sourceArea: "adoption",
      evidence: [`Path: ${d.path}`],
      confidence: 0.9,
      recommendationId: null,
    });
  }

  const chaotic = allComponents.filter(
    (c) => c.source === "github" && c.status !== "deprecated" && /\d$|final|old$/i.test(c.name)
  );
  for (const c of chaotic) {
    findings.push({
      id: nextFindingId(),
      type: "custom_implementation",
      severity: "low",
      title: `${c.name} suggests an ad hoc duplicate rather than a system component`,
      description: `Naming patterns like "${c.name}" usually indicate a one-off built outside the design system rather than an intentional extension of it.`,
      sourceArea: "adoption",
      evidence: [`Path: ${c.path}`],
      confidence: 0.7,
      recommendationId: null,
    });
  }

  return findings;
}

// Turns Figma file-content usage signals (detached instances, local styles,
// local variables) into Finding objects. Kept separate from
// generateFindings because these don't go through component/token
// matching — they're standalone signals about how design files are
// actually being used, not comparisons against code.
export function generateDesignUsageFindings(signals: RawDesignUsageSignal[]): Finding[] {
  return signals.map((s) => {
    if (s.type === "detached_instance") {
      return {
        id: nextFindingId(),
        type: "detached_instance" as const,
        severity: "medium" as const,
        title: `${s.componentName ?? "A component"} instance was detached in "${s.fileName}"`,
        description: s.description,
        sourceArea: "adoption" as const,
        evidence: [`File: ${s.fileName}`],
        confidence: 0.85,
        recommendationId: null,
      };
    }
    const isLocalStyle = s.type === "local_style";
    const localType: "local_style" | "local_variable" = isLocalStyle ? "local_style" : "local_variable";
    return {
      id: nextFindingId(),
      type: localType,
      severity: "low" as const,
      title: `Untokenized ${isLocalStyle ? "local style" : "local variable"} used in "${s.fileName}"`,
      description: s.description,
      sourceArea: "adoption" as const,
      evidence: [`File: ${s.fileName}`],
      confidence: 0.75,
      recommendationId: null,
    };
  });
}

// Turns Figma↔GitHub structure mismatches into findings for the
// "System Structure Alignment" check. A mismatch here means a component is
// categorized in the Figma library (e.g. under "Forms") but its code
// implementation has no corresponding folder-level grouping.
export function generateStructureFindings(mismatches: StructureMismatch[]): Finding[] {
  return mismatches.map((m) => ({
    id: nextFindingId(),
    type: "naming_inconsistency" as const, // closest existing bucket for structural/organizational drift
    severity: "low" as const,
    title: `${m.figma.name} is grouped under "${m.figmaGroup}" in Figma but has no matching folder structure in code`,
    description: `Figma organizes ${m.figma.name} under ${m.figma.path}, but its code implementation sits in a flat "${m.githubGroup}" folder with no equivalent grouping.`,
    sourceArea: "architecture" as const,
    evidence: [`Figma: ${m.figma.path}`, `Code: ${m.github.path}`],
    confidence: 0.7,
    recommendationId: null,
  }));
}
