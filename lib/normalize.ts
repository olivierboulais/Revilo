import { RawComponent, RawToken, NormalizedComponent, NormalizedToken, Tier } from "@/lib/types";

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

// Lowercase, strip non-alphanumerics. Cheap but sufficient for matching
// "DropdownMenu" / "dropdown-menu" / "Dropdown Menu" to the same key, and as a
// fallback signal even when names genuinely differ (e.g. Notification/Alert),
// where the real matcher falls back to path + variant-shape similarity.
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function normalizeComponents(raw: RawComponent[]): NormalizedComponent[] {
  return raw.map((c) => ({
    id: nextId("comp"),
    source: c.source,
    name: c.name,
    normalizedName: normalizeName(c.name),
    path: c.path,
    variants: c.variants,
    props: c.props ?? [],
    status: c.source === "figma" ? "missing_in_code" : "missing_in_design", // overwritten by matcher
    matchedComponentId: null,
    confidence: 0,
  }));
}

// Primitive tokens look like `category.scale.step` (color.blue.500, space.4,
// radius.md) — generic, non-contextual. Semantic tokens describe purpose
// (color.text.default, color.action.primary.background). Anything else
// (homepage-purple, checkout-padding, card-shadow-blue) is unknown/poorly tiered.
function classifyTier(name: string, category: string): Tier {
  if (category === "hardcoded") return "unknown";

  const semanticPrefixes = ["color.text.", "color.action.", "color.surface.", "color.border.", "color.brand.", "color.purple."];
  if (semanticPrefixes.some((p) => name.startsWith(p))) return "semantic";

  const primitivePattern = /^(color\.[a-z]+\.\d+|space\.\d+|radius\.(sm|md|lg|xl)|font\.[a-z]+\.\d+)$/;
  if (primitivePattern.test(name)) return "primitive";

  return "unknown";
}

export function normalizeTokens(raw: RawToken[]): NormalizedToken[] {
  return raw.map((t) => ({
    id: nextId("tok"),
    source: t.source,
    name: t.name,
    normalizedName: normalizeName(t.name),
    value: t.value,
    category: t.category,
    tier: classifyTier(t.name, t.category),
    matchedTokenId: null,
    confidence: 0,
  }));
}
