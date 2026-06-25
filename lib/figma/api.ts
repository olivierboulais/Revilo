import { RawComponent, RawToken, RawDesignUsageSignal } from "@/lib/types";
import { FIGMA_API_BASE } from "@/lib/figma/config";
import { refreshFigmaToken } from "@/lib/figma/oauth";
import { updateSourceToken } from "@/lib/db/sources";

// ── Figma REST response shapes (minimal — only the fields we use) ──────────

interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
}

interface FigmaComponentSet {
  key: string;
  name: string;
  description: string;
}

interface FigmaStyle {
  key: string;
  name: string;
  styleType: "FILL" | "TEXT" | "EFFECT" | "GRID";
  description: string;
}

interface FigmaFileResponse {
  name: string;
  document: FigmaDocumentNode;
  components: Record<string, FigmaComponent>;
  componentSets: Record<string, FigmaComponentSet>;
  styles: Record<string, FigmaStyle>;
}

// ── Figma document tree node shapes (minimal for depth=2 traversal) ──────

interface FigmaDocumentNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaDocumentNode[];
  /** Style references on the node — keys are style types, values are style IDs */
  styles?: Record<string, string>;
  /** Present on INSTANCE nodes */
  componentId?: string;
}

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  valuesByMode: Record<string, unknown>;
  description: string;
}

interface FigmaVariablesResponse {
  meta: {
    variables: Record<string, FigmaVariable>;
    variableCollections: Record<string, { name: string; defaultModeId: string }>;
  };
}

// ── Token refresh helper ───────────────────────────────────────────────────

const inflightRefresh = new Map<string, Promise<string>>();

async function getFigmaToken(
  userId: string,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiresAt: string | null
): Promise<string> {
  if (!tokenExpiresAt) return accessToken;
  const expiresAt = new Date(tokenExpiresAt).getTime();
  if (Date.now() < expiresAt - 60_000) return accessToken;

  if (!refreshToken) throw new Error("Figma token expired and no refresh token available");

  const existing = inflightRefresh.get(userId);
  if (existing) return existing;

  const promise = (async () => {
    const refreshed = await refreshFigmaToken(refreshToken);
    const newExpiresAt = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
    await updateSourceToken(userId, "figma", refreshed.access_token, newExpiresAt);
    return refreshed.access_token;
  })();

  inflightRefresh.set(userId, promise);
  try {
    return await promise;
  } finally {
    inflightRefresh.delete(userId);
  }
}

// ── HTTP helper ────────────────────────────────────────────────────────────

async function figmaGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${FIGMA_API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const err = new Error(`Figma API ${path} → ${res.status}: ${body}`);
    (err as NodeJS.ErrnoException).code = String(res.status);
    throw err;
  }
  return res.json();
}

// ── Components ─────────────────────────────────────────────────────────────

export async function fetchFigmaComponents(
  userId: string,
  fileKey: string,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiresAt: string | null
): Promise<RawComponent[]> {
  const token = await getFigmaToken(userId, accessToken, refreshToken, tokenExpiresAt);
  const file = await figmaGet<FigmaFileResponse>(`/files/${fileKey}?depth=1`, token);

  // Build a map of componentSetId → set name so we can group variants
  const setNames: Record<string, string> = {};
  for (const [, cs] of Object.entries(file.componentSets ?? {})) {
    setNames[cs.key] = cs.name;
  }

  // Group components by their base name (componentSet name, or the component
  // name itself for standalone components). Figma names variants as
  // "ComponentName/VariantProp=Value, ..." — split on "/" to find the base.
  const groups: Record<string, { path: string; variants: Set<string>; props: Set<string> }> = {};

  for (const [, comp] of Object.entries(file.components ?? {})) {
    const parts = comp.name.split("/");
    const baseName = comp.componentSetId
      ? (setNames[comp.componentSetId] ?? parts[0])
      : parts[0];

    if (!groups[baseName]) {
      groups[baseName] = { path: "Figma Library", variants: new Set(), props: new Set() };
    }

    // Variant info lives in the name suffix: "Size=Large, State=Hover"
    if (parts.length > 1) {
      const variantStr = parts.slice(1).join("/");
      // Each variant dimension "Prop=Value" → collect unique values as variant labels
      for (const segment of variantStr.split(",")) {
        const [propRaw, valueRaw] = segment.split("=");
        const prop = propRaw?.trim();
        const value = valueRaw?.trim();
        if (value) {
          groups[baseName].variants.add(value.toLowerCase());
          groups[baseName].props.add(prop);
        } else if (prop) {
          groups[baseName].variants.add(prop.toLowerCase());
        }
      }
    }
  }

  return Object.entries(groups).map(([name, g]) => ({
    source: "figma" as const,
    name,
    path: g.path,
    variants: Array.from(g.variants),
    props: Array.from(g.props),
  }));
}

// ── Tokens (Variables API with styles fallback) ────────────────────────────

function resolvedTypeToCategory(type: string): string {
  if (type === "COLOR") return "color";
  if (type === "FLOAT") return "spacing";
  return "other";
}

function formatVariableValue(variable: FigmaVariable, defaultModeId: string): string {
  const val = variable.valuesByMode[defaultModeId];
  if (!val) return "";

  if (variable.resolvedType === "COLOR" && typeof val === "object" && val !== null) {
    const c = val as { r: number; g: number; b: number; a?: number };
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
  }
  if (variable.resolvedType === "FLOAT") {
    return typeof val === "number" ? `${val}px` : String(val);
  }
  return String(val);
}

export async function fetchFigmaTokens(
  userId: string,
  fileKey: string,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiresAt: string | null
): Promise<RawToken[]> {
  const token = await getFigmaToken(userId, accessToken, refreshToken, tokenExpiresAt);

  // Try the Variables endpoint (Enterprise only)
  try {
    const vars = await figmaGet<FigmaVariablesResponse>(`/files/${fileKey}/variables/local`, token);
    const tokens: RawToken[] = [];
    const collections = vars.meta.variableCollections ?? {};

    for (const [, variable] of Object.entries(vars.meta.variables ?? {})) {
      // Find the collection to get the default mode
      const collection = Object.values(collections).find(
        (c) => variable.valuesByMode && Object.keys(variable.valuesByMode)[0] === c.defaultModeId
      ) ?? Object.values(collections)[0];

      const defaultModeId = collection?.defaultModeId ?? Object.keys(variable.valuesByMode ?? {})[0];
      tokens.push({
        source: "figma",
        name: variable.name.replace(/\//g, ".").toLowerCase(),
        value: formatVariableValue(variable, defaultModeId),
        category: resolvedTypeToCategory(variable.resolvedType),
      });
    }
    return tokens;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    // 403 = Enterprise plan required — fall back to styles
    if (code !== "403") throw err;
  }

  // Fallback: extract tokens from the file's styles map (available on all plans)
  const file = await figmaGet<FigmaFileResponse>(`/files/${fileKey}?depth=1`, token);
  const tokens: RawToken[] = [];

  for (const [, style] of Object.entries(file.styles ?? {})) {
    const category = style.styleType === "FILL" ? "color" : style.styleType === "TEXT" ? "typography" : "other";
    tokens.push({
      source: "figma",
      name: style.name.replace(/\//g, ".").toLowerCase(),
      value: "", // style values require node traversal — name quality still analysable
      category,
    });
  }
  return tokens;
}

// ── Usage signals (detached instances / local styles) ─────────────────────

const MAX_SIGNALS = 50;

/**
 * Detect design-quality signals in a Figma file:
 * - Detached instances: FRAME/GROUP nodes whose name matches a known component
 * - Local styles: styles defined in the file rather than pulled from a library
 */
export async function fetchFigmaUsageSignals(
  userId: string,
  fileKey: string,
  accessToken: string,
  refreshToken: string | null,
  tokenExpiresAt: string | null
): Promise<RawDesignUsageSignal[]> {
  const token = await getFigmaToken(userId, accessToken, refreshToken, tokenExpiresAt);

  // Fetch file at depth=2: gives us pages + top-level frames without the full tree
  const file = await figmaGet<FigmaFileResponse>(`/files/${fileKey}?depth=2`, token);

  const signals: RawDesignUsageSignal[] = [];

  // ── 1. Detached instances ──────────────────────────────────────────────
  // Build a set of known component names (base names, without variant suffixes)
  const componentNames = new Set<string>();
  for (const comp of Object.values(file.components ?? {})) {
    const baseName = comp.name.split("/")[0].trim();
    if (baseName) componentNames.add(baseName);
  }
  for (const cs of Object.values(file.componentSets ?? {})) {
    const baseName = cs.name.split("/")[0].trim();
    if (baseName) componentNames.add(baseName);
  }

  // Walk the document tree looking for non-INSTANCE nodes with component-like names
  const detachedTypes = new Set(["FRAME", "GROUP"]);

  function walkForDetached(node: FigmaDocumentNode, pageName: string) {
    if (signals.length >= MAX_SIGNALS) return;

    if (detachedTypes.has(node.type) && node.type !== "INSTANCE") {
      const nodeName = node.name.trim();
      if (componentNames.has(nodeName)) {
        signals.push({
          type: "detached_instance",
          componentName: nodeName,
          fileName: file.name,
          description: `"${nodeName}" on page "${pageName}" is a ${node.type} that matches component name — likely a detached instance`,
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        if (signals.length >= MAX_SIGNALS) return;
        walkForDetached(child, pageName);
      }
    }
  }

  // Pages are the top-level children of the document
  for (const page of file.document?.children ?? []) {
    walkForDetached(page, page.name);
  }

  // ── 2. Local styles ────────────────────────────────────────────────────
  // Collect all style IDs referenced in the document nodes
  const referencedStyleIds = new Set<string>();

  function walkForStyles(node: FigmaDocumentNode) {
    if (node.styles) {
      for (const styleId of Object.values(node.styles)) {
        referencedStyleIds.add(styleId);
      }
    }
    if (node.children) {
      for (const child of node.children) {
        walkForStyles(child);
      }
    }
  }

  for (const page of file.document?.children ?? []) {
    walkForStyles(page);
  }

  // Styles defined in file.styles are local to this file. Any style that appears
  // in the file's styles map (keyed by node ID) is local, not from a shared library.
  const localStyleIds = new Set(Object.keys(file.styles ?? {}));

  for (const styleId of Array.from(referencedStyleIds)) {
    if (signals.length >= MAX_SIGNALS) break;

    if (localStyleIds.has(styleId)) {
      const style = file.styles[styleId];
      signals.push({
        type: "local_style",
        componentName: style.name,
        fileName: file.name,
        description: `"${style.name}" is a local ${style.styleType.toLowerCase()} style — not from a shared library`,
      });
    }
  }

  // Also flag local styles that exist in the file but aren't referenced in nodes
  // (these are still signals of non-library style usage)
  for (const [styleId, style] of Object.entries(file.styles ?? {})) {
    if (signals.length >= MAX_SIGNALS) break;
    if (referencedStyleIds.has(styleId)) continue; // already reported above

    signals.push({
      type: "local_style",
      componentName: style.name,
      fileName: file.name,
      description: `"${style.name}" is an unused local ${style.styleType.toLowerCase()} style`,
    });
  }

  return signals.slice(0, MAX_SIGNALS);
}
