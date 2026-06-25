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

  // Semantic tokens describe purpose/context rather than raw values
  const semanticPrefixes = [
    "color.text.", "color.action.", "color.surface.", "color.border.",
    "color.brand.", "color.bg.", "color.fg.", "color.icon.",
    "color.interactive.", "color.decorative.", "color.critical.",
    "color.warning.", "color.success.", "color.highlight.",
    "color.backdrop.", "color.overlay.", "color.link.",
    "button.", "input.", "card.", "badge.", "banner.", "nav.",
    "border.color.", "border.width.", "shadow.", "motion.",
    "font.family.", "font.weight.", "line.height.", "letter.spacing.",
    "z.index.", "breakpoint.", "duration.", "ease.",
  ];
  if (semanticPrefixes.some((p) => name.startsWith(p))) return "semantic";

  // Semantic patterns: multi-segment purpose-driven names
  if (/^(text|bg|fg|fill|stroke|surface|border|shadow|overlay)\.[a-z]/.test(name)) return "semantic";

  // Primitive tokens: raw scale values (color.blue.500, gray.1, space.4, etc.)
  const primitivePattern = /^(color\.[a-z]+\.\d+|[a-z]+\.\d+|space\.\d+|spacing\.\d+|radius\.(sm|md|lg|xl|full|\d+)|font\.(size|weight)\.\d+|size\.\d+|opacity\.\d+)$/;
  if (primitivePattern.test(name)) return "primitive";

  // Named color scales (gray.1 through gray.16, blue.100, etc.)
  if (/^[a-z]+\.(light|dark|\d{1,3})$/.test(name)) return "primitive";

  // Tokens with standard category prefixes and at least 2 segments are likely structured
  if (/^(color|spacing|radius|font|shadow|border|size|opacity|z)\.[a-z]/.test(name) && name.split(".").length >= 2) {
    return name.split(".").length >= 3 ? "semantic" : "primitive";
  }

  return "unknown";
}

export function normalizeTokens(raw: RawToken[]): NormalizedToken[] {
  return raw.map((t) => {
    // If the token came from a file with a known role, use it as a tier hint
    const tierHint = (t as RawToken & { tierHint?: string }).tierHint;
    let tier = classifyTier(t.name, t.category);
    if (tier === "unknown" && tierHint === "primitive") tier = "primitive";
    if (tier === "unknown" && tierHint === "semantic") tier = "semantic";

    return {
      id: nextId("tok"),
      source: t.source,
      name: t.name,
      normalizedName: normalizeName(t.name),
      value: t.value,
      category: t.category,
      tier,
      matchedTokenId: null,
      confidence: 0,
    };
  });
}
