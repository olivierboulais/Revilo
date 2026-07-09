import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation — Revilo",
  description: "Learn how Revilo scans your design system, calculates scores, and generates findings.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-[22px] font-semibold tracking-tight mb-6 pb-3 border-b border-[rgba(28,28,26,.1)]">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}

function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[15px] font-semibold mb-2">{title}</h3>
      <div className="text-[14px] text-[#706F6A] leading-relaxed flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Score({ label, weight, description }: { label: string; weight: string; description: string }) {
  return (
    <div className="flex gap-4 items-start py-3 border-b border-[rgba(28,28,26,.06)] last:border-0">
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[13.5px] font-medium text-[#1C1C1A]">{label}</span>
          <span className="text-[11px] text-[#706F6A] bg-[#F3F1EC] px-2 py-0.5 rounded-full">{weight}</span>
        </div>
        <p className="text-[13px] text-[#706F6A] leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function Callout({ type, children }: { type: "info" | "tip" | "warn"; children: React.ReactNode }) {
  const styles = {
    info: "bg-[#F0F7FF] border-[#BFDBFE] text-[#1E40AF]",
    tip: "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]",
    warn: "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]",
  };
  const icons = {
    info: <path d="M8 7v4M8 5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
    tip: <path d="M5 8l2.5 2.5L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    warn: <><path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 6V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="8" cy="11" r="0.6" fill="currentColor"/></>,
  };
  return (
    <div className={`rounded-xl border px-4 py-3 flex gap-3 items-start text-[13px] leading-relaxed ${styles[type]}`}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">{icons[type]}</svg>
      <div>{children}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { href: "#overview", label: "Overview" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#alignment", label: "Alignment Score" },
  { href: "#adoption", label: "Adoption Score" },
  { href: "#architecture", label: "Architecture Score" },
  { href: "#findings", label: "Findings & severity" },
  { href: "#pages", label: "Dashboard pages" },
  { href: "#data-sources", label: "Data sources" },
  { href: "#faq", label: "FAQ" },
];

export default function DocsPage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F8F7F4", minHeight: "100vh", color: "#1C1C1A", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        .docs-nav-link{font-size:13px;color:#706F6A;text-decoration:none;padding:5px 10px;border-radius:8px;transition:background .15s;display:block}
        .docs-nav-link:hover{background:rgba(28,28,26,.05)}
        .docs-layout{display:grid;grid-template-columns:220px 1fr;gap:64px}
        .docs-sidebar{position:sticky;top:80px;height:fit-content;padding-top:16px}
        @media(max-width:768px){
          .docs-layout{display:block}
          .docs-sidebar{display:none}
        }
      `}</style>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(248,247,244,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(28,28,26,.08)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="88" height="27" aria-label="REVILO" role="img" viewBox="0 0 169 52" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="dl0" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="0" y="0" width="23" height="52"><path fillRule="evenodd" clipRule="evenodd" d="M0 0H22.1756V51.696H0V0Z" fill="white"/></mask><g mask="url(#dl0)"><path fillRule="evenodd" clipRule="evenodd" d="M21.456 21.5995V8.85651C21.456 2.95251 18.816 -0.000488281 13.536 -0.000488281H0V51.6965H6.912V33.9985V30.8165V24.9125V23.0415V6.26351H11.448C13.512 6.26351 14.544 7.51251 14.544 10.0075V20.3905V21.1675V24.9125H11.448H9.819L11.602 33.1785L15.624 51.6965H22.176L17.352 30.1675C20.088 28.9685 21.456 26.1125 21.456 21.5995Z" fill="#1C1C1A"/></g><mask id="dl1" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="34" y="0" width="18" height="52"><path fillRule="evenodd" clipRule="evenodd" d="M34.4141 0.000244141H51.5501V51.696H34.4141V0.000244141Z" fill="white"/></mask><g mask="url(#dl1)"><path fillRule="evenodd" clipRule="evenodd" d="M34.4141 51.6962H51.5501V45.4312H41.3261V28.2232H50.3981V21.9602H41.3261V6.26324H51.5501V0.000244141H34.4141V51.6962Z" fill="#1C1C1A"/></g><mask id="dl2" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="61" y="0" width="26" height="52"><path fillRule="evenodd" clipRule="evenodd" d="M61.1953 0H86.1073V51.6959H61.1953V0Z" fill="white"/></mask><g mask="url(#dl2)"><path fillRule="evenodd" clipRule="evenodd" d="M73.6513 39.456L68.0353 0H61.1953L69.5473 51.696H77.7553L86.1073 0H79.2673L73.6513 39.456Z" fill="#1C1C1A"/></g><mask id="dl3" style={{maskType:"luminance"}} maskUnits="userSpaceOnUse" x="0" y="0" width="169" height="52"><path fillRule="evenodd" clipRule="evenodd" d="M0 51.696H168.262V0H0V51.696Z" fill="white"/></mask><g mask="url(#dl3)"><path fillRule="evenodd" clipRule="evenodd" d="M97.2734 51.696H104.185V0H97.2734V51.696Z" fill="#1C1C1A"/><path fillRule="evenodd" clipRule="evenodd" d="M124.771 0H117.859V51.696H134.275V45.432H124.771V0Z" fill="#1C1C1A"/><path fillRule="evenodd" clipRule="evenodd" d="M161.348 42.412C161.348 44.422 160.438 45.432 158.608 45.432H155.078C153.018 45.432 151.989 44.422 151.989 42.412V9.29195C151.989 7.27195 152.998 6.26195 155.008 6.26195H158.248C160.308 6.26195 161.348 7.27195 161.348 9.29195V42.412ZM159.978 0.00195312H153.358C147.838 0.00195312 145.078 2.95195 145.078 8.85095V42.912C145.078 48.771 147.858 51.691 153.428 51.691H159.909C165.478 51.691 168.258 48.771 168.258 42.912V8.85095C168.258 2.95195 165.498 0.00195312 159.978 0.00195312Z" fill="#1C1C1A"/></g></svg>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link href="/" style={{ fontSize: 13, color: "#706F6A", textDecoration: "none" }}>← Home</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 500, background: "#1C1C1A", color: "#fff", borderRadius: 999, padding: "7px 18px", textDecoration: "none" }}>Run Free Scan</Link>
          </div>
        </div>
      </nav>

      <div className="docs-layout" style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 80px" }}>
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706F6A", marginBottom: 12 }}>On this page</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="docs-nav-link">{item.label}</a>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ paddingTop: 16, minWidth: 0 }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C3AED", marginBottom: 12 }}>Documentation</p>
            <h1 style={{ fontSize: 36, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 16 }}>How Revilo works</h1>
            <p style={{ fontSize: 15, color: "#706F6A", lineHeight: 1.7, maxWidth: 600 }}>
              Revilo connects to your Figma file and GitHub repository, compares what's defined in design against what's built in code, and gives your team a clear score with actionable findings.
            </p>
          </div>

          <Section id="overview" title="Overview">
            <Sub title="What Revilo measures">
              <p>Revilo answers one question: <strong style={{ color: "#1C1C1A" }}>how closely does your design system in Figma match the components and tokens in your codebase?</strong></p>
              <p>It produces three scores — Alignment, Adoption, and Architecture — each measuring a different dimension of design system health. These scores are backed by specific findings (individual issues) and recommendations (suggested fixes with effort and impact estimates).</p>
            </Sub>
            <Sub title="What you need">
              <p>To get a real report you need two things connected:</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                <li><strong style={{ color: "#1C1C1A" }}>Figma</strong> — a published component library or any file with components and styles/variables</li>
                <li><strong style={{ color: "#1C1C1A" }}>GitHub</strong> — a React codebase with <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.tsx</code> / <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.jsx</code> component files and token files</li>
              </ul>
              <p>If you haven't connected sources yet, the dashboard shows a sample report based on a built-in design system example so you can explore the interface first.</p>
            </Sub>
          </Section>

          <Section id="how-it-works" title="How it works">
            <Sub title="Step 1 — Connect sources">
              <p>You authorize Revilo to read your Figma file and GitHub repository via OAuth. Revilo only requests read access — it never writes to either source.</p>
            </Sub>
            <Sub title="Step 2 — Scan">
              <p>When you click <em>Run scan</em>, Revilo fetches data from both sources in parallel:</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <li><strong style={{ color: "#1C1C1A" }}>From Figma:</strong> all components and component sets (grouped by their variant dimensions), all tokens via the Variables API or Styles API fallback, and usage signals like detached instances and local styles applied directly in the file.</li>
                <li><strong style={{ color: "#1C1C1A" }}>From GitHub:</strong> PascalCase <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.tsx</code>/<code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.jsx</code> files in <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>src/components</code>, <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>components</code>, or <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>packages/*</code>. Token files in paths containing <em>token</em>, <em>theme</em>, <em>color</em>, <em>spacing</em>, etc. Reads CSS variables, JS/TS nested objects, and JSON (including W3C Design Token format).</li>
              </ul>
            </Sub>
            <Sub title="Step 3 — Normalize and match">
              <p>All component and token names are normalized (lowercase, punctuation removed) so <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>Button/Primary</code> in Figma matches <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>Button.tsx</code> in GitHub. Revilo then pairs every Figma component with its GitHub counterpart, and every Figma token with its GitHub equivalent.</p>
              <p>Components are matched by exact normalized name. A small synonym table handles known renames (e.g. <em>Notification</em> → <em>Alert</em>). Tokens are matched by name first, then by value (same value but different name = naming mismatch).</p>
            </Sub>
            <Sub title="Step 4 — Score and surface findings">
              <p>Each match produces data that feeds into the three scores and a list of findings. The scan typically completes in 10–30 seconds depending on library size.</p>
            </Sub>
          </Section>

          <Section id="alignment" title="Alignment Score">
            <Sub title="What it measures">
              <p>Alignment asks: <strong style={{ color: "#1C1C1A" }}>are the same components and tokens defined in both Figma and your code, with the same shape?</strong></p>
              <p>A score of 100 means every Figma component has a matching component in code with identical variants, and every token has the same name and value on both sides. Lower scores mean things exist in one place but not the other, or their definitions have drifted apart.</p>
            </Sub>
            <Sub title="How it's calculated">
              <p>Alignment is a weighted average of four sub-scores:</p>
              <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(28,28,26,.1)", padding: "4px 20px", marginTop: 8 }}>
                <Score label="Component Alignment" weight="35%" description="Matched Figma components ÷ total Figma components. A component is matched when its normalized name exists as a GitHub component file." />
                <Score label="Variant Alignment" weight="20%" description="Among matched components, how many have the same variant set on both sides. A Button with primary/secondary/ghost in Figma but only primary/secondary in code is a variant mismatch." />
                <Score label="Token Alignment" weight="30%" description="Figma tokens with no name or value mismatch ÷ total Figma tokens. Requires both sources to be connected." />
                <Score label="Naming Alignment" weight="15%" description="Starts at 100. Each renamed component (matched via synonym) or token naming mismatch deducts 8 points." />
              </div>
            </Sub>
            <Callout type="info">
              Component matching is currently name-based. If your team uses different names for the same thing (e.g. <em>Chip</em> in Figma and <em>Tag</em> in code), it will show as missing unless the synonym table covers it. AI-assisted fuzzy matching is on the roadmap.
            </Callout>
          </Section>

          <Section id="adoption" title="Adoption Score">
            <Sub title="What it measures">
              <p>Adoption asks: <strong style={{ color: "#1C1C1A" }}>is your team actually going through the design system — or working around it?</strong></p>
              <p>A high adoption score means designers are using shared library components (not detaching and restyling them) and engineers are using design tokens (not hardcoding colors and spacing directly in component files).</p>
            </Sub>
            <Sub title="How it's calculated">
              <p>Adoption is split evenly between the design and engineering perspectives:</p>
              <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(28,28,26,.1)", padding: "4px 20px", marginTop: 8 }}>
                <Score label="Design Adoption (50%)" weight="From Figma" description="Starts at 100. Penalized by detached instances (frames or groups whose name matches a library component — a signal the instance was detached and manually restyled) and local styles/variables applied directly instead of through the shared library. Scaled relative to library size." />
                <Score label="Engineering Adoption (50%)" weight="From GitHub" description="Starts at 100. Penalized by: deprecated component usage (−6 pts each), chaotic component naming like Button2 or CardFinal (−5 pts each), and hardcoded hex colors or pixel values found directly in component files (−4 pts each)." />
              </div>
            </Sub>
            <Callout type="tip">
              The biggest quick win for adoption is usually hardcoded values in component files. The Findings page will list every instance with the file path so engineers know exactly where to replace them with tokens.
            </Callout>
          </Section>

          <Section id="architecture" title="Architecture Score">
            <Sub title="What it measures">
              <p>Architecture asks: <strong style={{ color: "#1C1C1A" }}>is your design system built on a solid structural foundation?</strong></p>
              <p>This covers whether your token system follows the right hierarchy (base values → semantic purpose tokens), whether your component organization in Figma maps to your folder structure in code, and whether naming is clean and intentional.</p>
            </Sub>
            <Sub title="How it's calculated">
              <div style={{ background: "white", borderRadius: 16, border: "1px solid rgba(28,28,26,.1)", padding: "4px 20px", marginTop: 8 }}>
                <Score label="Token Architecture" weight="30%" description="What percentage of Figma tokens have a classifiable tier (primitive or semantic). Tokens named things like homepage-purple or checkout-padding can't be classified and are flagged as unknown." />
                <Score label="Semantic Layer" weight="25%" description="Ratio of semantic tokens to primitive tokens. A healthy system has purpose-driven tokens (color.action.primary.background) built on top of base values (color.blue.500), not just raw values used directly everywhere." />
                <Score label="Component Hierarchy" weight="25%" description="Penalized by chaotic naming in GitHub — components ending in numbers, 'old', or 'final' suggest the hierarchy has broken down." />
                <Score label="Structure Consistency" weight="20%" description="For each matched component, compares Figma's grouping (e.g. Foundations/Forms) against the GitHub folder (e.g. src/components/forms). Flags mismatches where Figma has categories but GitHub is a flat folder." />
              </div>
            </Sub>
            <Sub title="Token tiers explained">
              <p>Revilo classifies each token into one of three tiers:</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <li><strong style={{ color: "#1C1C1A" }}>Primitive</strong> — raw values with no semantic meaning. Example: <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>color.blue.500 = #3B82F6</code></li>
                <li><strong style={{ color: "#1C1C1A" }}>Semantic</strong> — purpose-driven tokens that reference primitives. Example: <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>color.action.primary.background = color.blue.500</code></li>
                <li><strong style={{ color: "#1C1C1A" }}>Unknown</strong> — can't be classified, usually because of ad-hoc naming. Example: <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>homepage-purple</code></li>
              </ul>
              <p>The classification is based on the token's name structure, not its value. A semantic token should describe <em>where and how</em> it's used, not what the value is.</p>
            </Sub>
          </Section>

          <Section id="findings" title="Findings & severity">
            <Sub title="What a finding is">
              <p>A finding is a specific, detected issue in your design system. Each finding belongs to one of the three score areas (Alignment, Adoption, Architecture) and has a severity level.</p>
            </Sub>
            <Sub title="Severity levels">
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                {[
                  { level: "High", color: "#EF4444", bg: "#FEF2F2", desc: "Likely causing real inconsistencies visible to users or slowing down teams. Should be addressed soon." },
                  { level: "Medium", color: "#FBBF24", bg: "#FFFBEB", desc: "Worth fixing in the next sprint. Creates technical debt and makes the system harder to maintain." },
                  { level: "Low", color: "#9CA3AF", bg: "#F9FAFB", desc: "Polish items. Low impact individually but accumulate over time." },
                ].map(({ level, color, bg, desc }) => (
                  <div key={level} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 16px", background: bg, borderRadius: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1C1C1A", marginBottom: 2 }}>{level}</p>
                      <p style={{ fontSize: 13, color: "#706F6A", lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Sub>
            <Sub title="Finding types">
              <p>The most common finding types and what they mean:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                {[
                  { type: "Component missing in code", desc: "A Figma component has no matching file in GitHub. Either it hasn't been built yet or it was named differently." },
                  { type: "Component missing in design", desc: "A GitHub component has no Figma counterpart. It may be a legacy component or one built without a design spec." },
                  { type: "Variant mismatch", desc: "A component exists on both sides but with different variant options — e.g. Figma has a 'danger' variant that code doesn't implement." },
                  { type: "Token value mismatch", desc: "The same token name exists in both Figma and code but with different values — e.g. color.border.default is #E5E7EB in Figma but #D1D5DB in code." },
                  { type: "Token naming mismatch", desc: "Same token value but different names across Figma and code. Creates confusion about which token to use." },
                  { type: "Hardcoded value", desc: "A color or spacing value used directly in a component file instead of referencing a token. Makes global updates harder." },
                  { type: "Detached instance", desc: "A Figma component instance that was detached and manually restyled — a signal the library didn't support the use case." },
                  { type: "Local style", desc: "A style defined within a Figma file rather than pulled from a shared library." },
                  { type: "Missing semantic layer", desc: "A primitive token used directly in a component without a semantic alias. Makes theming and global changes harder." },
                ].map(({ type, desc }) => (
                  <div key={type} style={{ padding: "10px 14px", background: "white", borderRadius: 10, border: "1px solid rgba(28,28,26,.08)" }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#1C1C1A", marginBottom: 3 }}>{type}</p>
                    <p style={{ fontSize: 12.5, color: "#706F6A", lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </Sub>
          </Section>

          <Section id="pages" title="Dashboard pages">
            {[
              { page: "Overview", path: "/dashboard", desc: "Top-level snapshot. Shows all three scores, your biggest risks, team drift breakdown (are designers or engineers creating more drift?), and top recommendations. The trend chart shows how scores have moved across your last several scans." },
              { page: "Alignment", path: "/dashboard/alignment", desc: "Full list of alignment findings — components that exist only in Figma or only in code, variant mismatches, and token name/value discrepancies. Filterable by severity and finding type." },
              { page: "Adoption", path: "/dashboard/adoption", desc: "Engineering and design adoption breakdown. Shows hardcoded values in component files with file paths, detached Figma instances, and local styles. The most actionable page for reducing drift fast." },
              { page: "Architecture", path: "/dashboard/architecture", desc: "Token tier distribution (primitive vs. semantic vs. unknown), component hierarchy issues, and structure consistency findings. Useful for long-term system health." },
              { page: "Team Insights", path: "/dashboard/team-insights", desc: "Splits findings by team — which issues are coming from the design side vs. the engineering side. Helps direct conversations and accountability." },
              { page: "Recommendations", path: "/dashboard/recommendations", desc: "All recommendations ranked by impact and effort. Each recommendation is linked to the finding(s) it addresses and includes a suggested fix." },
              { page: "Sources", path: "/dashboard/sources", desc: "Manage your connected Figma and GitHub sources. Reconnect, add Figma file keys, change the GitHub repo, or disconnect." },
            ].map(({ page, path, desc }) => (
              <Sub key={page} title={page}>
                <p style={{ marginBottom: 4 }}>
                  <code style={{ fontSize: 12, background: "#F3F1EC", padding: "2px 6px", borderRadius: 4, color: "#706F6A" }}>{path}</code>
                </p>
                <p>{desc}</p>
              </Sub>
            ))}
          </Section>

          <Section id="data-sources" title="Data sources">
            <Sub title="Figma — Variables vs. Styles">
              <p>Revilo tries the <strong style={{ color: "#1C1C1A" }}>Figma Variables API</strong> first. This is available on Figma Professional and above and gives full token names and values.</p>
              <p>If the Variables API returns a 403 (plan restriction), Revilo falls back to the <strong style={{ color: "#1C1C1A" }}>Styles API</strong>. It then fetches the actual style node from Figma to get the fill color, typography spec, or effect value. The yellow notice on your dashboard tells you which mode is active.</p>
            </Sub>
            <Sub title="GitHub — what gets read">
              <p>Revilo walks your repo's git tree and reads:</p>
              <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                <li>PascalCase <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.tsx</code>/<code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>.jsx</code> files in component directories</li>
                <li>Files with <em>token</em>, <em>theme</em>, <em>color</em>, <em>spacing</em>, <em>variables</em>, <em>foundation</em>, <em>primitive</em> in their path</li>
                <li>CSS custom properties (<code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>--token-name</code>), JS/TS exports, JSON (including W3C Design Token format)</li>
              </ul>
              <p>It skips test files, story files, config files, and <code style={{ fontSize: 12, background: "#F3F1EC", padding: "1px 5px", borderRadius: 4 }}>node_modules</code>. For large repos, it uses the Contents API to discover files by directory rather than walking the full tree.</p>
            </Sub>
            <Callout type="warn">
              Revilo only requests <strong>read</strong> access to both Figma and GitHub. It never writes, creates branches, or modifies files.
            </Callout>
          </Section>

          <Section id="faq" title="FAQ">
            {[
              { q: "Why are my scores based on sample data?", a: "You'll see sample data until you connect both Figma and GitHub sources. Go to Sources in the sidebar to connect them, then run a scan." },
              { q: "My component exists in code but Revilo says it's missing.", a: "Check that the file is PascalCase (e.g. Button.tsx, not button.tsx), not in a test or story file, and lives under a recognized component directory (src/components, components, packages/*/src). The component must also export the name from the file." },
              { q: "Figma says I need Enterprise for Variables.", a: "If the Figma Variables API returns a 403, Revilo automatically falls back to your Styles. You'll see a yellow notice on the dashboard. Token name analysis still works; value comparisons use the style node values fetched via the Figma REST API." },
              { q: "Why is my Adoption score low even though we use the design system?", a: "The most common cause is hardcoded values — hex colors or pixel sizes written directly in component files instead of referencing tokens. Check the Adoption page for the specific files and values." },
              { q: "How does Revilo detect detached instances?", a: "It walks the Figma file at depth 2 looking for FRAME or GROUP nodes whose name matches a known library component. These are likely instances that were detached and converted to regular frames." },
              { q: "Can I connect multiple Figma files?", a: "Yes. On the Sources page you can add multiple Figma files and assign each a role (seed variables, primitive tokens, semantic tokens, component library, or project file). Revilo fetches all of them and merges the data." },
              { q: "How often should I rescan?", a: "After any significant design or code change. The Monitoring plan runs automatic scans and sends an email if scores drop significantly." },
            ].map(({ q, a }) => (
              <Sub key={q} title={q}>
                <p>{a}</p>
              </Sub>
            ))}
          </Section>

          <div style={{ marginTop: 16, padding: "24px 28px", background: "white", borderRadius: 20, border: "1px solid rgba(28,28,26,.1)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Ready to scan your design system?</p>
              <p style={{ fontSize: 13, color: "#706F6A" }}>Connect Figma and GitHub and get your first report in under a minute.</p>
            </div>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 500, background: "#1C1C1A", color: "#fff", borderRadius: 999, padding: "10px 22px", textDecoration: "none", whiteSpace: "nowrap" }}>Run Free Scan →</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
