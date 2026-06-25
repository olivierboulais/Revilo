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
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`GitHub API ${path} → ${res.status}`);
  }
  return res.json();
}

// Resolve canonical owner/repo for renamed/transferred repos
const resolvedRepos = new Map<string, string>();

async function resolveRepo(owner: string, repo: string, token: string): Promise<[string, string]> {
  const key = `${owner}/${repo}`;
  const cached = resolvedRepos.get(key);
  if (cached) {
    const [o, r] = cached.split("/");
    return [o, r];
  }

  try {
    const data = await githubGet<{ full_name: string }>(`/repos/${owner}/${repo}`, token);
    const [resolvedOwner, resolvedRepo] = data.full_name.split("/");
    resolvedRepos.set(key, data.full_name);
    return [resolvedOwner, resolvedRepo];
  } catch {
    return [owner, repo];
  }
}

async function getFileContent(owner: string, repo: string, path: string, token: string): Promise<string> {
  const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8_000),
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
  // Skip test, spec, story, and migration files
  if (/\.(test|spec|stories)\.(ts|tsx|js|jsx)$/.test(path)) return false;
  if (/\/(tests|__tests__|__mocks__|migrations?|migrator)\//.test(path)) return false;
  // Skip config, manifest, and re-export files
  const filename = path.split("/").pop()?.toLowerCase() ?? "";
  if (/^(package|package-lock|turbo|lerna|nx|yarn\.lock)\.json$/.test(filename)) return false;
  if (/^tsconfig(\..+)?\.json$/.test(filename)) return false;
  if (/\.(config|rc)\.(js|ts|mjs|cjs|json)$/.test(filename)) return false;
  if (/^\.(eslintrc|prettierrc|stylelintrc)/.test(filename)) return false;
  if (["index.ts", "index.js", "index.tsx", "index.mjs"].includes(filename)) return false;
  if (["changelog.md", "readme.md", "license", "license.md"].includes(filename)) return false;
  // Skip component source files — they contain UI logic, not token definitions
  if (/\/components\//.test(path) && /\.(tsx|jsx)$/.test(path)) return false;
  // Skip script/build tooling files
  if (/\/scripts\//.test(path)) return false;
  // Skip utility files that reference colors but aren't token definitions
  if (/\/(utilities|utils|helpers)\//.test(path) && !/token/i.test(filename)) return false;
  const lower = path.toLowerCase();
  return (
    lower.includes("token") ||
    lower.includes("theme") ||
    lower.includes("color") ||
    lower.includes("spacing") ||
    lower.includes("variables") ||
    lower.includes("design-system") ||
    lower.includes("foundation") ||
    lower.includes("primitive") ||
    lower.includes("palette") ||
    lower.includes("typography") ||
    lower.includes("shadow") ||
    lower.includes("border") ||
    lower.includes("motion") ||
    lower.includes("breakpoint") ||
    lower.includes("z-index") ||
    lower.includes("opacity")
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
    const unions = [...m[1].matchAll(/["']([^"']+)["']/g)].map((u) => u[1]);
    variants.push(...unions);
  }

  // type Size = "small" | "medium" | "large"
  const sizeTypes = [...source.matchAll(/type\s+\w*(?:Size|Tone|Status|Appearance|Weight)\w*\s*=\s*([^;]+);/g)];
  for (const m of sizeTypes) {
    const unions = [...m[1].matchAll(/["']([^"']+)["']/g)].map((u) => u[1]);
    variants.push(...unions);
  }

  // "variant": "primary" | "secondary" in props/interface
  const variantProps = [...source.matchAll(/(?:variant|size|tone|status|appearance|weight)\??\s*:\s*([^;\n}]+)/gi)];
  for (const m of variantProps) {
    const unions = [...m[1].matchAll(/["']([^"']+)["']/g)].map((u) => u[1]);
    variants.push(...unions);
  }

  // Discriminated union: { type: "primary" } | { type: "secondary" }
  const discUnions = [...source.matchAll(/\{\s*(?:type|kind|variant)\s*:\s*["']([^"']+)["']/g)];
  for (const m of discUnions) {
    variants.push(m[1]);
  }

  // Responsive-style objects: size: "small" | { xs: "small", md: "medium" }
  const responsiveProps = [...source.matchAll(/(?:xs|sm|md|lg|xl)\s*:\s*["']([^"']+)["']/g)];
  for (const m of responsiveProps) {
    variants.push(m[1]);
  }

  return [...new Set(variants)].slice(0, 12);
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

function guessCategory(name: string, value: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("color") || lower.includes("fill") || lower.includes("stroke") || lower.includes("bg") || lower.includes("fg")) return "color";
  if (lower.includes("space") || lower.includes("padding") || lower.includes("margin") || lower.includes("gap") || lower.includes("size")) return "spacing";
  if (lower.includes("radius") || lower.includes("border")) return "spacing";
  if (lower.includes("font") || lower.includes("text") || lower.includes("typography") || lower.includes("line.height")) return "typography";
  if (lower.includes("shadow") || lower.includes("elevation")) return "other";
  if (lower.includes("opacity") || lower.includes("z.index") || lower.includes("duration") || lower.includes("motion")) return "other";
  // Guess from value
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return "color";
  if (/^rgba?\(/.test(value) || /^hsla?\(/.test(value)) return "color";
  if (/^\d+(\.\d+)?px$/.test(value) || /^\d+(\.\d+)?rem$/.test(value)) return "spacing";
  return "other";
}

function extractTokensFromJs(source: string): Array<{ name: string; value: string; category: string }> {
  const tokens: Array<{ name: string; value: string; category: string }> = [];
  const seen = new Set<string>();

  function addToken(name: string, value: string) {
    if (seen.has(name)) return;
    seen.add(name);
    tokens.push({ name, value, category: guessCategory(name, value) });
  }

  // Flat exports: export const colorBluePrimary = "#3B82F6"
  const flatExports = [...source.matchAll(/export\s+const\s+([a-z][a-zA-Z0-9]*)\s*=\s*["']([^"']+)["']/g)];
  for (const m of flatExports) {
    const name = m[1].replace(/([A-Z])/g, ".$1").toLowerCase();
    addToken(name, m[2]);
  }

  // Nested objects: handles 1-3 levels of nesting
  // e.g. export const color = { text: 'rgba(...)' }
  // e.g. export const color = { gray: { 1: 'rgba(...)' } }
  const objExports = [...source.matchAll(/export\s+(?:const|default)\s+(\w+)(?:\s*:\s*\w+)?\s*=\s*\{([\s\S]{1,8000})\}/g)];
  for (const m of objExports) {
    const prefix = m[1].replace(/s$/, "");
    const body = m[2];
    extractNestedTokens(body, prefix, addToken);
  }

  // Standalone object assignments: const tokens = { ... }
  const standaloneObjs = [...source.matchAll(/(?:const|let|var)\s+(\w+)(?:\s*:\s*\w+)?\s*=\s*\{([\s\S]{1,8000})\}/g)];
  for (const m of standaloneObjs) {
    if (source.includes(`export`) && !source.includes(`export ${m[0].slice(0, 20)}`)) continue;
    const prefix = m[1].replace(/s$/, "");
    if (seen.has(`__obj_${prefix}`)) continue;
    seen.add(`__obj_${prefix}`);
    extractNestedTokens(m[2], prefix, addToken);
  }

  return tokens;
}

function extractNestedTokens(body: string, prefix: string, addToken: (name: string, value: string) => void) {
  // Level 1: key: 'value' or key: "value"
  const l1 = [...body.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*["']([^"']+)["']/g)];
  for (const e of l1) {
    addToken(`${prefix}.${e[1]}`, e[2]);
  }

  // Level 1: key: number (numeric values like spacing: { 1: 4, 2: 8 })
  const l1Num = [...body.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*(\d+(?:\.\d+)?)\s*[,\n}]/g)];
  for (const e of l1Num) {
    addToken(`${prefix}.${e[1]}`, e[2]);
  }

  // Level 2: nested objects like { gray: { 1: 'rgba(...)' } }
  const nestedBlocks = [...body.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*\{([^{}]{1,2000})\}/g)];
  for (const block of nestedBlocks) {
    const subPrefix = `${prefix}.${block[1]}`;
    const subBody = block[2];
    const entries = [...subBody.matchAll(/["']?([a-zA-Z0-9_.-]+)["']?\s*:\s*["']([^"']+)["']/g)];
    for (const e of entries) {
      addToken(`${subPrefix}.${e[1]}`, e[2]);
    }
    const numEntries = [...subBody.matchAll(/["']?([a-zA-Z0-9_-]+)["']?\s*:\s*(\d+(?:\.\d+)?)\s*[,\n}]/g)];
    for (const e of numEntries) {
      addToken(`${subPrefix}.${e[1]}`, e[2]);
    }
  }
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

// ── JSON token extraction ─────────────────────────────────────────────────

function extractTokensFromJson(source: string, filePath: string): Array<{ name: string; value: string; category: string }> {
  const tokens: Array<{ name: string; value: string; category: string }> = [];
  try {
    const parsed = JSON.parse(source);
    const prefix = filePath.split("/").pop()?.replace(/\.json$/, "").replace(/s$/, "") ?? "token";
    walkJsonTokens(parsed, prefix, tokens);
  } catch {
    // not valid JSON
  }
  return tokens.slice(0, 200);
}

function walkJsonTokens(obj: unknown, prefix: string, tokens: Array<{ name: string; value: string; category: string }>, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== "object") return;
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const name = `${prefix}.${key}`;
    if (typeof val === "string" || typeof val === "number") {
      const strVal = String(val);
      tokens.push({ name, value: strVal, category: guessCategory(name, strVal) });
    } else if (typeof val === "object" && val !== null) {
      // W3C Design Token format: { "$value": "...", "$type": "..." }
      const dtVal = (val as Record<string, unknown>)["$value"] ?? (val as Record<string, unknown>)["value"];
      if (typeof dtVal === "string" || typeof dtVal === "number") {
        tokens.push({ name, value: String(dtVal), category: guessCategory(name, String(dtVal)) });
      } else {
        walkJsonTokens(val, name, tokens, depth + 1);
      }
    }
  }
}

// ── Directory listing for large repos ─────────────────────────────────────

interface GithubContentItem {
  name: string;
  path: string;
  type: "file" | "dir";
}

async function listDirectory(owner: string, repo: string, path: string, token: string): Promise<GithubContentItem[]> {
  try {
    return await githubGet<GithubContentItem[]>(`/repos/${owner}/${repo}/contents/${path}`, token);
  } catch {
    return [];
  }
}

async function discoverComponentFiles(owner: string, repo: string, token: string): Promise<string[]> {
  const paths: string[] = [];

  // Try common component directory patterns
  const candidateDirs = [
    "src/components",
    "components",
    "lib/components",
    "packages",
  ];

  // First, check root to detect monorepo structure
  const root = await listDirectory(owner, repo, "", token);
  const rootDirs = root.filter(i => i.type === "dir").map(i => i.name);

  // Add monorepo package dirs that might contain components
  for (const dir of rootDirs) {
    if (dir.includes("react") || dir.includes("component") || dir.includes("ui") || dir.includes("core")) {
      candidateDirs.push(`${dir}/src/components`, `${dir}/components`, `${dir}/src`);
    }
  }

  // Check packages/ directory for monorepo setups
  if (rootDirs.includes("packages")) {
    const packages = await listDirectory(owner, repo, "packages", token);
    for (const pkg of packages.filter(i => i.type === "dir")) {
      if (pkg.name.includes("react") || pkg.name.includes("component") || pkg.name.includes("ui") || pkg.name.includes("core")) {
        candidateDirs.push(`packages/${pkg.name}/src/components`, `packages/${pkg.name}/components`, `packages/${pkg.name}/src`);
      }
    }
  }

  for (const dir of candidateDirs) {
    const items = await listDirectory(owner, repo, dir, token);
    if (items.length === 0) continue;

    // Look for component subdirectories (PascalCase dirs) or direct component files
    for (const item of items) {
      if (item.type === "dir" && /^[A-Z]/.test(item.name)) {
        // PascalCase directory — look for the main component file inside
        const subItems = await listDirectory(owner, repo, item.path, token);
        for (const sub of subItems) {
          if (sub.type === "file" && isComponentFile(sub.path) && isLikelyComponent(sub.path)) {
            paths.push(sub.path);
          }
        }
        if (paths.length >= 80) break;
      } else if (item.type === "file" && isComponentFile(item.path) && isLikelyComponent(item.path)) {
        paths.push(item.path);
      }
    }
    if (paths.length >= 80) break;
  }

  return paths.slice(0, 80);
}

async function discoverTokenFiles(owner: string, repo: string, token: string): Promise<string[]> {
  const paths: string[] = [];

  const root = await listDirectory(owner, repo, "", token);
  const rootDirs = root.filter(i => i.type === "dir").map(i => i.name);

  const candidateDirs = ["src", "lib", "tokens", "styles"];

  // Look for token-specific packages in monorepos
  for (const dir of rootDirs) {
    if (dir.includes("token") || dir.includes("theme") || dir.includes("foundation") || dir.includes("primitive")) {
      candidateDirs.push(dir, `${dir}/src`);
    }
  }

  if (rootDirs.includes("packages")) {
    const packages = await listDirectory(owner, repo, "packages", token);
    for (const pkg of packages.filter(i => i.type === "dir")) {
      if (pkg.name.includes("token") || pkg.name.includes("theme") || pkg.name.includes("foundation")) {
        candidateDirs.push(`packages/${pkg.name}/src`, `packages/${pkg.name}`);
      }
    }
  }

  for (const dir of candidateDirs) {
    const items = await listDirectory(owner, repo, dir, token);
    for (const item of items) {
      if (item.type === "file" && isTokenFile(item.path)) {
        paths.push(item.path);
      } else if (item.type === "dir" && isTokenFile(item.path + "/")) {
        const subItems = await listDirectory(owner, repo, item.path, token);
        for (const sub of subItems) {
          if (sub.type === "file" && isTokenFile(sub.path)) {
            paths.push(sub.path);
          }
        }
      }
    }
    if (paths.length >= 30) break;
  }

  return paths.slice(0, 30);
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function fetchGithubComponents(
  repo: string,
  accessToken: string
): Promise<RawComponent[]> {
  let [owner, repoName] = repo.split("/");
  if (!owner || !repoName) throw new Error(`Invalid repo format: ${repo} (expected owner/repo)`);
  [owner, repoName] = await resolveRepo(owner, repoName, accessToken);

  // Get the full file tree
  const tree = await githubGet<GitTree>(
    `/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
    accessToken
  );

  let componentFilePaths: string[];

  if (tree.truncated) {
    // Large repo — use Contents API to discover component files
    componentFilePaths = await discoverComponentFiles(owner, repoName, accessToken);
  } else {
    const allComponentPaths = tree.tree
      .filter((item) => item.type === "blob" && isComponentFile(item.path) && isLikelyComponent(item.path))
      .map((item) => item.path);

    // Prefer top-level components (fewer path segments = higher-level component)
    // e.g. polaris-react/src/components/Button/Button.tsx over
    //      polaris-react/src/components/ActionMenu/components/MenuGroup/MenuGroup.tsx
    const sorted = allComponentPaths.sort((a, b) => a.split("/").length - b.split("/").length);
    componentFilePaths = sorted.slice(0, 50);
  }

  const components: RawComponent[] = [];

  // Process files in batches of 10 to avoid overwhelming the API
  const BATCH = 10;
  for (let i = 0; i < componentFilePaths.length; i += BATCH) {
    const batch = componentFilePaths.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (filePath) => {
        const source = await getFileContent(owner, repoName, filePath, accessToken);
        if (!source) return null;

        const names = extractComponentsFromSource(source, filePath);
        if (names.length === 0) return null;

        const pathParts = filePath.split("/");
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
  let [owner, repoName] = repo.split("/");
  if (!owner || !repoName) throw new Error(`Invalid repo format: ${repo}`);
  [owner, repoName] = await resolveRepo(owner, repoName, accessToken);

  const tree = await githubGet<GitTree>(
    `/repos/${owner}/${repoName}/git/trees/HEAD?recursive=1`,
    accessToken
  );

  let tokenFilePaths: string[];
  let componentFilePaths: string[];

  if (tree.truncated) {
    tokenFilePaths = await discoverTokenFiles(owner, repoName, accessToken);
    // Reuse already-discovered component paths for hardcoded value detection
    componentFilePaths = await discoverComponentFiles(owner, repoName, accessToken);
    componentFilePaths = componentFilePaths.slice(0, 30);
  } else {
    const allTokenPaths = tree.tree
      .filter((item) => item.type === "blob" && isTokenFile(item.path))
      .map((item) => item.path);
    // Prioritize files in token/theme-specific directories over scattered matches
    const tokenDirScore = (p: string) => {
      const lower = p.toLowerCase();
      if (lower.includes("/tokens/") || lower.includes("-tokens/")) return 0;
      if (lower.includes("/theme") || lower.includes("/foundation") || lower.includes("/primitive")) return 1;
      if (lower.includes("/styles/") || lower.includes("/design-system/")) return 2;
      return 3;
    };
    tokenFilePaths = allTokenPaths
      .sort((a, b) => tokenDirScore(a) - tokenDirScore(b) || a.split("/").length - b.split("/").length)
      .slice(0, 25);
    componentFilePaths = tree.tree
      .filter((item) => item.type === "blob" && isComponentFile(item.path))
      .map((item) => item.path)
      .slice(0, 30);
  }

  const tokens: RawToken[] = [];
  const seen = new Set<string>();

  // Extract design tokens from token/theme files
  const tokenFileSources = await Promise.all(
    tokenFilePaths.map(async (filePath) => ({
      path: filePath,
      source: await getFileContent(owner, repoName, filePath, accessToken),
    }))
  );

  for (const { path, source } of tokenFileSources) {
    if (!source) continue;
    let extracted: Array<{ name: string; value: string; category: string }>;
    if (path.endsWith(".css")) {
      extracted = extractTokensFromCss(source);
    } else if (path.endsWith(".json")) {
      extracted = extractTokensFromJson(source, path);
    } else {
      extracted = extractTokensFromJs(source);
    }

    for (const t of extracted) {
      if (!seen.has(t.name)) {
        seen.add(t.name);
        tokens.push({ source: "github", ...t });
      }
    }
  }

  // Extract hardcoded values from component files
  const compFileSources = await Promise.all(
    componentFilePaths.map(async (filePath) => ({
      path: filePath,
      source: await getFileContent(owner, repoName, filePath, accessToken),
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
