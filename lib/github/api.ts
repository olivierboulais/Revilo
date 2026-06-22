import { RawComponent, RawToken } from "@/lib/types";
import { GITHUB_API_BASE } from "@/lib/github/config";

// ── GitHub REST types ──────────────────────────────────────────────────────

interface TreeItem {
  path: string;
  type: "blob" | "tree";
  sha: string;
  url: string;
}

interface GitTree {
  tree: TreeItem[];
  truncated: boolean;
}

// ── HTTP helper ────────────────────────────────────────────────────────────

async function githubGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${GITHUB_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} → ${res.status}`);
  }
  return res.json();
}

async function getFileContent(owner: string, repo: string, path: string, token: string): Promise<string> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) return "";
  return res.text();
}

// ── Component detection ────────────────────────────────────────────────────

// Files that look like React component files
function isComponentFile(path: string): boolean {
  if (!/\.(tsx|jsx)$/.test(path)) return false;
  // Skip test, story, index, and type-only files
  if (/\.(test|spec|stories)\.(tsx|jsx)$/.test(path)) return false;
  if (/\/(node_modules|\.next|dist|build|coverage)\//.test(path)) return false;
  if (/\/index\.(tsx|jsx)$/.test(path)) return false;
  return true;
}

// Heuristic: PascalCase filename in a component-like directory
function isLikelyComponent(path: string): boolean {
  const filename = path.split("/").pop() ?? "";
  const name = filename.replace(/\.(tsx|jsx)$/, "");
  return /^[A-Z][a-zA-Z0-9]+$/.test(name);
}

function isTokenFile(path: string): boolean {
  if (!/\.(ts|tsx|js|jsx|json|css)$/.test(path)) return false;
  if (/\/(node_modules|\.next|dist|build)\//.test(path)) return false;
  const lower = path.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("theme") ||
    lower.includes("color") ||
    lower.includes("spacing") ||
    lower.includes("variables") ||
    lower.includes("design-system") ||
    lower.includes("foundation") ||
    lower.includes("primitive")
  );
}

// Extract exported component names from a file's source
function extractComponentsFromSource(source: string, filePath: string): string[] {
  const names: string[] = [];
  const filename = filePath.split("/").pop()?.replace(/\.(tsx|jsx)$/, "") ?? "";

  // export default function ComponentName / export default class ComponentName
  const defaultFn = source.match(/export\s+default\s+(?:function|class)\s+([A-Z][a-zA-Z0-9]*)/);
  if (defaultFn) names.push(defaultFn[1]);

  // export function ComponentName / export const ComponentName = ...
  const namedExports = [...source.matchAll(/export\s+(?:function|const|class)\s+([A-Z][a-zA-Z0-9]*)/g)];
  for (const m of namedExports) names.push(m[1]);

  // Fallback: if PascalCase filename and file has JSX, use filename as component name
  if (names.length === 0 && isLikelyComponent(filePath) && /<[A-Z]/.test(source)) {
    names.push(filename);
  }

  // Deduplicate
  return [...new Set(names)];
}

// Detect variant-like props from TypeScript union types in source
function extractVariantsFromSource(source: string): string[] {
  const variants: string[] = [];
  // type Variant = "primary" | "secondary" | ...
  const variantTypes = [...source.matchAll(/type\s+\w*[Vv]ariant\w*\s*=\s*([^;]+);/g)];
  for (const m of variantTypes) {
    const unions = [...m[1].matchAll(/"([^"]+)"/g)].map((u) => u[1]);
    variants.push(...unions);
  }
  // "variant": "primary" | "secondary" in props/interface
  const variantProps = [...source.matchAll(/variant\??:\s*([^;\n]+)/g)];
  for (const m of variantProps) {
    const unions = [...m[1].matchAll(/"([^"]+)"/g)].map((u) => u[1]);
    variants.push(...unions);
  }
  return [...new Set(variants)].slice(0, 8);
}

// Extract prop names from TypeScript interfaces / Props type
function extractPropsFromSource(source: string): string[] {
  const propsMatch = source.match(/(?:interface|type)\s+\w*[Pp]rops\w*[^{]*\{([\s\S][^}]+)\}/);
  if (!propsMatch) return [];
  const props: string[] = [];
  const propLines = [...propsMatch[1].matchAll(/^\s*(\w+)\??:/gm)];
  for (const m of propLines) props.push(m[1]);
  return props.filter((p) => !["children", "className", "style", "id", "ref"].includes(p)).slice(0, 6);
}

// ── Token extraction ───────────────────────────────────────────────────────

function extractTokensFromCss(source: string): Array<{ name: string; value: string; category: string }> {
  const tokens: Array<{ name: string; value: string; category: string }> = [];
  const cssVars = [...source.matchAll(/--([a-z][a-z0-9-]*)\s*:\s*([^;}\n]+)/g)];
  for (const m of cssVars) {
    const name = m[1].replace(/-/g, ".");
    const value = m[2].trim();
    const category = name.startsWith("color") ? "color" : name.startsWith("space") || name.startsWith("spacing") ? "spacing" : "other";
    tokens.push({ name, value, category });
  }
  return tokens;
}

function extractTokensFromJs(source: string): Array<{ name: string; value: string; category: string }> {
  const tokens: Array<{ name: string; value: string; category: string }> = [];

  // Flat exports: export const colorBluePrimary = "#3B82F6"
  const flatExports = [...source.matchAll(/export\s+const\s+([a-z][a-zA-Z0-9]*)\s*=\s*["']([^"']+)["']/g)];
  for (const m of flatExports) {
    const name = m[1].replace(/([A-Z])/g, ".$1").toLowerCase();
    const value = m[2];
    const category = name.includes("color") ? "color" : name.includes("space") || name.includes("padding") || name.includes("margin") ? "spacing" : "other";
    tokens.push({ name, value, category });
  }

  // Nested object: { blue: { 500: "#3B82F6" } }
  // Walk simple one/two-level objects exported as `colors`, `spacing`, `tokens`
  const objExports = [...source.matchAll(/export\s+(?:const|default)\s+(\w+)\s*=\s*\{([\s\S]{1,4000})\}/g)];
  for (const m of objExports) {
    const prefix = m[1].replace(/s$/, ""); // "colors" → "color"
    const body = m[2];
    const entries = [...body.matchAll(/["']?([a-zA-Z0-9._-]+)["']?\s*:\s*["']([^"']+)["']/g)];
    for (const e of entries) {
      const name = `${prefix}.${e[1]}`;
      const value = e[2];
      const category = prefix.includes("color") ? "color" : prefix.includes("space") || prefix.includes("radius") ? "spacing" : "other";
      tokens.push({ name, value, category });
    }
  }

  return tokens;
}

function extractHardcodedValues(source: string, filePath: string): Array<{ name: string; value: string; category: string }> {
  const hardcoded: Array<{ name: string; value: string; category: string }> = [];
  const componentName = filePath.split("/").pop()?.replace(/\.(tsx|jsx|ts|js)$/, "") ?? "unknown";

  // Inline hex colors in JSX/TSX style props
  const hexColors = [...source.matchAll(/:\s*["']?(#[0-9a-fA-F]{3,8})["']?/g)];
  const seen = new Set<string>();
  for (const m of hexColors) {
    const value = m[1];
    if (!seen.has(value)) {
      seen.add(value);
      hardcoded.push({
        name: `hardcoded:${componentName}:color-${value.replace("#", "")}`,
        value,
        category: "hardcoded",
      });
    }
  }

  // Inline pixel values (padding/margin/gap)
  const pxValues = [...source.matchAll(/(?:padding|margin|gap|fontSize|lineHeight)\s*:\s*["']?(\d+px)["']?/g)];
  for (const m of pxValues) {
    const value = m[1];
    if (!seen.has(value)) {
      seen.add(value);
      hardcoded.push({
        name: `hardcoded:${componentName}:size-${value}`,
        value,
        category: "hardcoded",
      });
    }
  }

  return hardcoded;
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function fetchGithubComponents(
  repo: string,
  accessToken: string
): Promise<RawComponent[]> {
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) throw new Error(`Invalid repo format: ${repo} (expected owner/repo)`);

  // Get the full file tree
  const tree = await githubGet<GitTree>(
    `/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
    accessToken
  );

  const componentFiles = tree.tree
    .filter((item) => item.type === "blob" && isComponentFile(item.path) && isLikelyComponent(item.path))
    .slice(0, 60); // cap at 60 files to avoid rate limits

  const components: RawComponent[] = [];

  // Process files in batches of 10 to avoid overwhelming the API
  const BATCH = 10;
  for (let i = 0; i < componentFiles.length; i += BATCH) {
    const batch = componentFiles.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (file) => {
        const source = await getFileContent(owner, repoName, file.path, accessToken);
        if (!source) return null;

        const names = extractComponentsFromSource(source, file.path);
        if (names.length === 0) return null;

        const pathParts = file.path.split("/");
        const dir = pathParts.slice(0, -1).join("/");
        const variants = extractVariantsFromSource(source);
        const props = extractPropsFromSource(source);

        return names.map((name) => ({
          source: "github" as const,
          name,
          path: dir,
          variants,
          props,
        }));
      })
    );

    for (const r of results) {
      if (r) components.push(...r);
    }
  }

  return components;
}

export async function fetchGithubTokens(
  repo: string,
  accessToken: string
): Promise<RawToken[]> {
  const [owner, repoName] = repo.split("/");
  if (!owner || !repoName) throw new Error(`Invalid repo format: ${repo}`);

  const tree = await githubGet<GitTree>(
    `/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
    accessToken
  );

  const tokenFiles = tree.tree
    .filter((item) => item.type === "blob" && isTokenFile(item.path))
    .slice(0, 20);

  // Also grab component files for hardcoded value detection
  const componentFiles = tree.tree
    .filter((item) => item.type === "blob" && isComponentFile(item.path))
    .slice(0, 30);

  const tokens: RawToken[] = [];
  const seen = new Set<string>();

  // Extract design tokens from token/theme files
  const tokenFileSources = await Promise.all(
    tokenFiles.map(async (f) => ({
      path: f.path,
      source: await getFileContent(owner, repoName, f.path, accessToken),
    }))
  );

  for (const { path, source } of tokenFileSources) {
    if (!source) continue;
    const extracted = path.endsWith(".css")
      ? extractTokensFromCss(source)
      : extractTokensFromJs(source);

    for (const t of extracted) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        tokens.push({ source: "github", ...t });
      }
    }
  }

  // Extract hardcoded values from component files
  const compFileSources = await Promise.all(
    componentFiles.map(async (f) => ({
      path: f.path,
      source: await getFileContent(owner, repoName, f.path, accessToken),
    }))
  );

  for (const { path, source } of compFileSources) {
    if (!source) continue;
    for (const t of extractHardcodedValues(source, path)) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        tokens.push({ source: "github", ...t });
      }
    }
  }

  return tokens;
}
