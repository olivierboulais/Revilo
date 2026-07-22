import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security — Revilo",
  description: "How Revilo protects your data and OAuth tokens.",
};

const items = [
  {
    title: "Read-only access",
    body: "Revilo only requests read permissions for your Figma and GitHub accounts. We cannot modify, delete, or write to either platform.",
  },
  {
    title: "Token security",
    body: "Your OAuth tokens are encrypted at rest using AES-256-GCM and never exposed outside our servers. They are decrypted only at the moment an API call is made on your behalf.",
  },
  {
    title: "No code storage",
    body: "We scan your repository but never store your source code. Only component names, token values, and structural metadata are retained to generate your report.",
  },
  {
    title: "Revoke access anytime",
    body: "You can disconnect Figma and GitHub from your Revilo settings at any time. Disconnecting immediately removes our stored token — we can no longer access your data.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-[#F5F4F0] px-6 py-24">
      <div className="max-w-[640px] mx-auto">
        <p className="text-[12px] font-semibold tracking-widest text-[#7C3AED] uppercase mb-4">Security</p>
        <h1 className="text-[40px] font-light tracking-tight leading-tight mb-4">
          How Revilo protects your data
        </h1>
        <p className="text-[15px] text-[#6B6B67] mb-16 leading-relaxed">
          Revilo connects to Figma and GitHub on your behalf. Here&apos;s exactly what we access, how we store it, and how you stay in control.
        </p>

        <div className="flex flex-col gap-px border border-[#E5E4E0] rounded-2xl overflow-hidden">
          {items.map((item, i) => (
            <div key={i} className="bg-white px-8 py-7 last:rounded-b-2xl first:rounded-t-2xl border-b border-[#E5E4E0] last:border-0">
              <h2 className="text-[16px] font-medium mb-2">{item.title}</h2>
              <p className="text-[14px] text-[#6B6B67] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[13px] text-[#6B6B67]">
          Questions?{" "}
          <a href="mailto:security@revilo.design" className="text-[#1C1C1A] underline underline-offset-2">
            security@revilo.design
          </a>
        </p>
      </div>
    </main>
  );
}
