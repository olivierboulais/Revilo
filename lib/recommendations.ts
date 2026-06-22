import { Finding, Recommendation, RecommendationTier, Impact, Effort } from "@/lib/types";

let recCounter = 0;
function nextRecId(): string {
  recCounter += 1;
  return `rec_${recCounter}`;
}

// ── Template fallback (used when ANTHROPIC_API_KEY is not set) ─────────────

interface Template {
  title: string;
  whyItMatters: string;
  suggestedFix: string;
  impact: Impact;
  effort: Effort;
  tier: RecommendationTier;
}

function templateForGroup(type: Finding["type"], count: number): Template {
  const templates: Record<string, Template> = {
    component_missing_in_code: {
      title: "Build the components that exist in Figma but not in code",
      whyItMatters: `${count} component${count === 1 ? "" : "s"} designers can use today have no implementation, forcing engineers to either build one-off versions or send the work back to design.`,
      suggestedFix: "Prioritize by usage frequency in design files, then implement and publish to the shared component library.",
      impact: count > 2 ? "high" : "medium",
      effort: "medium",
      tier: "medium_term",
    },
    component_missing_in_design: {
      title: "Document the code-only components in Figma",
      whyItMatters: "Designers can't discover or reuse components that only exist in code, which leads to duplicate design work and inconsistent UI.",
      suggestedFix: "Add Figma representations for these components, even as a simple first pass, so design and engineering reference the same library.",
      impact: "medium",
      effort: "low",
      tier: "quick_win",
    },
    component_renamed: {
      title: "Standardize naming for components that drifted apart",
      whyItMatters: "When design and code independently name the same thing differently, nobody can tell they're related — which leads to duplicate builds and broken handoff.",
      suggestedFix: "Pick one name per component, update the other source to match, and document the mapping until the rename is fully adopted.",
      impact: "medium",
      effort: "low",
      tier: "quick_win",
    },
    variant_mismatch: {
      title: "Reconcile variant sets between design and code",
      whyItMatters: "When a variant exists on only one side, either designers are speccing states engineers can't ship, or engineers built states design never approved.",
      suggestedFix: "For each mismatch, decide whether to add the missing variant or remove the orphaned one, then keep both sources in sync going forward.",
      impact: "medium",
      effort: "medium",
      tier: "medium_term",
    },
    token_value_mismatch: {
      title: "Fix token value mismatches between design and code",
      whyItMatters: "These are the same named token resolving to different actual values — meaning what designers see in Figma is not what ships, even though everyone assumes it is.",
      suggestedFix: "Treat one source as the source of truth, correct the other, and add a check that catches future drift before it ships.",
      impact: "high",
      effort: "low",
      tier: "quick_win",
    },
    token_naming_mismatch: {
      title: "Align token names that resolve to the same value",
      whyItMatters: "Identical colors under different names make it impossible to tell, just by reading the code or the file, that two things are meant to be the same.",
      suggestedFix: "Standardize on one naming convention and migrate references, prioritizing the tokens used most widely first.",
      impact: "low",
      effort: "low",
      tier: "quick_win",
    },
    token_missing_semantic_layer: {
      title: "Introduce a semantic layer for loosely-named tokens",
      whyItMatters: "Tokens like these describe where they were first used, not what they're for — so nobody can safely reuse or rename them without risking a visual regression somewhere unrelated.",
      suggestedFix: "Map each one to a primitive value and give it a semantic name that describes its purpose (e.g. color.action.primary.background), then update references.",
      impact: "medium",
      effort: "high",
      tier: "strategic",
    },
    hardcoded_value: {
      title: "Replace hardcoded values with token references",
      whyItMatters: "Hardcoded values can't be updated centrally, so a future token change won't reach these components — they'll silently fall out of sync again.",
      suggestedFix: "Swap each hardcoded value for the matching token reference, and add a lint rule to catch new ones before merge.",
      impact: "medium",
      effort: "medium",
      tier: "medium_term",
    },
    deprecated_usage: {
      title: "Remove deprecated components still in use",
      whyItMatters: "Every deprecated component still imported somewhere is a component the team has to maintain twice, and a trap for anyone who copies an existing usage as a starting point.",
      suggestedFix: "Find remaining usages, migrate them to the current component, then delete the deprecated version.",
      impact: "low",
      effort: "medium",
      tier: "medium_term",
    },
    custom_implementation: {
      title: "Standardize Button Architecture",
      whyItMatters: "Ad hoc duplicates usually mean the system component didn't support something engineers needed, so they built around it instead of extending it — and the next person will too.",
      suggestedFix: "Audit what the duplicates do differently from the system component, fold the real requirements back into the base component, and retire the duplicates.",
      impact: "high",
      effort: "medium",
      tier: "strategic",
    },
  };
  return (
    templates[type] ?? {
      title: `Address ${type.replace(/_/g, " ")} issues`,
      whyItMatters: `${count} finding${count === 1 ? "" : "s"} of this type were detected.`,
      suggestedFix: "Review each finding and address the root cause.",
      impact: "medium",
      effort: "medium",
      tier: "medium_term",
    }
  );
}

function buildFromTemplate(findings: Finding[], type: Finding["type"]): Recommendation {
  const template = templateForGroup(type, findings.length);
  const avgConfidence =
    Math.round((findings.reduce((sum, f) => sum + f.confidence, 0) / findings.length) * 100) / 100;
  return {
    id: nextRecId(),
    title: template.title,
    problem: findings[0].description,
    whyItMatters: template.whyItMatters,
    suggestedFix: template.suggestedFix,
    impact: template.impact,
    effort: template.effort,
    confidence: avgConfidence,
    tier: template.tier,
  };
}

// ── AI-backed path (Claude) ────────────────────────────────────────────────

async function callClaudeForRecommendations(findings: Finding[]): Promise<Recommendation[]> {
  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const groupedSummary = Object.entries(
    findings.reduce<Record<string, Finding[]>>((acc, f) => {
      (acc[f.type] = acc[f.type] ?? []).push(f);
      return acc;
    }, {})
  )
    .map(([type, fs]) => `${type} (${fs.length}): ${fs.map((f) => f.description).slice(0, 3).join("; ")}`)
    .join("\n");

  const systemPrompt = `You are an expert design-system consultant.
Given a list of design-system drift findings, return a JSON array of recommendations.
Each recommendation must have these exact fields:
  title (string), problem (string), whyItMatters (string), suggestedFix (string),
  impact ("high"|"medium"|"low"), effort ("high"|"medium"|"low"),
  tier ("quick_win"|"medium_term"|"strategic")

Return ONLY valid JSON — no markdown, no explanation.`;

  const userPrompt = `Design system drift findings:\n${groupedSummary}\n\nReturn the recommendations JSON array.`;

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "[]";
  const parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
  if (!Array.isArray(parsed)) throw new Error("Claude response was not an array");

  return parsed.map((r) => ({
    id: nextRecId(),
    title: String(r.title ?? ""),
    problem: String(r.problem ?? ""),
    whyItMatters: String(r.whyItMatters ?? ""),
    suggestedFix: String(r.suggestedFix ?? ""),
    impact: (["high", "medium", "low"].includes(r.impact) ? r.impact : "medium") as Impact,
    effort: (["high", "medium", "low"].includes(r.effort) ? r.effort : "medium") as Effort,
    confidence: 0.8,
    tier: (["quick_win", "medium_term", "strategic"].includes(r.tier) ? r.tier : "medium_term") as RecommendationTier,
  }));
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function generateRecommendations(findings: Finding[]): Promise<Recommendation[]> {
  if (findings.length === 0) return [];

  // Use Claude when the API key is available
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callClaudeForRecommendations(findings);
    } catch (err) {
      console.error("Claude recommendations failed, falling back to templates:", err);
    }
  }

  // Template fallback
  const recommendations: Recommendation[] = [];
  const types: Finding["type"][] = [
    "component_missing_in_code",
    "component_missing_in_design",
    "component_renamed",
    "variant_mismatch",
    "token_value_mismatch",
    "token_naming_mismatch",
    "token_missing_semantic_layer",
    "hardcoded_value",
    "deprecated_usage",
    "custom_implementation",
  ];

  for (const type of types) {
    const group = findings.filter((f) => f.type === type);
    if (group.length > 0) {
      recommendations.push(buildFromTemplate(group, type));
    }
  }

  return recommendations;
}
