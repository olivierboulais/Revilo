import type { Metadata } from "next";

export const metadata: Metadata = { title: "Help — Revilo" };

const sections = [
  {
    title: "Getting started",
    items: [
      {
        q: "How do I connect my sources?",
        a: "Open the Connect sources drawer from the banner at the top of the dashboard. Connect Figma via OAuth, then paste your Figma file URL. Connect GitHub via OAuth, then enter your repo in owner/repo format (e.g. acme/design-system). Once both are saved, hit Run scan.",
      },
      {
        q: "What does Revilo actually scan?",
        a: "Revilo reads your Figma file for components, variants, tokens, and styles, then reads your GitHub repo for token files, component files, and Storybook stories. It compares the two to find where they've drifted apart.",
      },
      {
        q: "How long does a scan take?",
        a: "Most scans finish in 30–90 seconds depending on the size of your Figma file and repo. You'll be redirected automatically when it's done.",
      },
    ],
  },
  {
    title: "Connecting sources",
    items: [
      {
        q: "Which Figma scopes do I need to grant?",
        a: "Revilo requests file_content:read. This lets it read your file structure, components, and styles. It never writes to Figma.",
      },
      {
        q: "Can I connect a private GitHub repo?",
        a: "Yes. Revilo requests the repo scope which covers both public and private repositories.",
      },
      {
        q: "What Figma file URL formats are accepted?",
        a: "You can paste the full URL (https://www.figma.com/file/ABC123/…) or just the file key (ABC123). Both work.",
      },
      {
        q: "Can I connect multiple Figma files?",
        a: 'Yes — use the "+ Add file" button inside the drawer. Assign each file a role (Seed, Primitive, Semantic, Component, or Project) so Revilo understands the token hierarchy.',
      },
    ],
  },
  {
    title: "Reading the report",
    items: [
      {
        q: "What is the alignment score?",
        a: "The alignment score (0–100) measures how closely your Figma library matches your codebase. 100 means everything in Figma is implemented in code and vice versa.",
      },
      {
        q: "What does 'drift' mean?",
        a: "Drift is any gap between design and code — a token that exists in Figma but is missing in CSS, a component that's been renamed in one place but not the other, or a style value that no longer matches.",
      },
      {
        q: "How is the adoption rate calculated?",
        a: "Adoption measures what percentage of your codebase is using the design system tokens and components rather than raw values. Higher adoption means less one-off styling.",
      },
    ],
  },
  {
    title: "Plans & billing",
    items: [
      {
        q: "What's included in the Free plan?",
        a: "The Free plan gives you one scan with mock data so you can explore the dashboard. Connect real sources to unlock a live scan.",
      },
      {
        q: "What does Pro add?",
        a: "Pro unlocks unlimited scans, PDF exports, and full access to all report sections including Architecture and Team Insights.",
      },
      {
        q: "What does Monitoring add?",
        a: "Monitoring runs automated re-scans on a schedule and sends you email alerts when your alignment score drops significantly.",
      },
      {
        q: "How do I cancel?",
        a: "Go to Settings → Billing and click Manage subscription. You can cancel anytime; your access continues until the end of the billing period.",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        q: "How do I change my workspace name?",
        a: "Go to Settings → Workspace and update the name there.",
      },
      {
        q: "How do I disconnect a source?",
        a: "Go to Sources in the sidebar. Each connected source has a Remove source button.",
      },
      {
        q: "How do I delete my account?",
        a: "Go to Settings → scroll to the bottom → Delete account. This permanently removes all your data.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8 max-w-[720px]">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Help</h1>
      <p className="text-[13px] text-gray mb-8">Answers to common questions about Revilo.</p>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-gray mb-3">
              {section.title}
            </h2>
            <div className="flex flex-col gap-px">
              {section.items.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-line bg-white overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-black/[0.02] transition-colors">
                    <span className="text-[13.5px] font-medium">{item.q}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="flex-shrink-0 opacity-40 transition-transform group-open:rotate-180"
                    >
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 pt-1 text-[13px] text-gray leading-relaxed border-t border-line">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-lilac/30 border border-lilac/50 px-5 py-4">
        <p className="text-[13px] font-medium mb-0.5">Still need help?</p>
        <p className="text-[12.5px] text-gray">
          Email us at{" "}
          <a href="mailto:support@revilo.app" className="text-[#3B1D6E] hover:underline font-medium">
            support@revilo.app
          </a>{" "}
          and we'll get back to you within one business day.
        </p>
      </div>
    </div>
  );
}
