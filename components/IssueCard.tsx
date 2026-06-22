import { Finding } from "@/lib/types";
import { SeverityDot, confidenceLabel } from "@/components/Visuals";

// Extracts a short "subject" (component/token name) from a finding's title
// so it can be shown as a standalone visual element rather than buried mid-sentence.
// Falls back to the full title if no clean subject can be extracted.
function extractSubject(finding: Finding): { subject: string; rest: string } {
  const title = finding.title;
  // Titles are authored as `"X exists in..."`, `"X has different values..."`,
  // `'"X" in Figma is likely "Y"...'`, etc. — the subject is the leading
  // quoted or capitalized token before the first verb-ish phrase.
  const quoted = title.match(/^"([^"]+)"/);
  if (quoted) return { subject: quoted[1], rest: title.slice(quoted[0].length).trim() };

  const words = title.split(" ");
  // Take the leading run of capitalized/identifier-looking words as the subject.
  let i = 0;
  while (i < words.length && /^[A-Z][a-zA-Z0-9]*$/.test(words[i])) i++;
  if (i === 0) i = 1; // always take at least one word
  return { subject: words.slice(0, i).join(" "), rest: words.slice(i).join(" ") };
}

const issueTypeLabel: Record<Finding["type"], string> = {
  component_missing_in_code: "Missing in code",
  component_missing_in_design: "Missing in design",
  component_renamed: "Possibly renamed",
  variant_mismatch: "Variant mismatch",
  token_value_mismatch: "Token value mismatch",
  token_naming_mismatch: "Token naming mismatch",
  token_missing_semantic_layer: "Missing semantic layer",
  naming_inconsistency: "Naming inconsistency",
  deprecated_usage: "Deprecated, still in use",
  hardcoded_value: "Hardcoded value",
  detached_instance: "Detached instance",
  local_style: "Untokenized local style",
  local_variable: "Untokenized local variable",
  custom_implementation: "Ad hoc duplicate",
};

export function IssueCard({ finding }: { finding: Finding }) {
  const { subject, rest } = extractSubject(finding);

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-line last:border-b-0">
      <SeverityDot severity={finding.severity} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
          <span className="text-[13.5px] font-semibold text-[#1C1C1A]">{subject}</span>
          <span className="text-[11px] uppercase tracking-wide text-gray bg-[#F3F1EC] px-1.5 py-0.5 rounded">
            {issueTypeLabel[finding.type]}
          </span>
        </div>
        {rest && <p className="text-[12px] text-gray leading-relaxed mb-1.5">{rest}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          {finding.evidence.slice(0, 2).map((e, i) => (
            <span key={i} className="text-[10.5px] text-gray bg-[#F8F7F4] px-1.5 py-0.5 rounded font-mono">
              {e}
            </span>
          ))}
          <span className="text-[10.5px] text-gray/70 ml-auto">{confidenceLabel(finding.confidence)}</span>
        </div>
      </div>
    </div>
  );
}

// Collapsible group wrapper for issue categories, per PRD: "Each category
// should be collapsible. Do not show everything expanded by default."
export function CollapsibleIssueGroup({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="rounded-2xl border border-line bg-white overflow-hidden group" open={defaultOpen}>
      <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
        <span className="text-[13.5px] font-medium">{title}</span>
        <span className="flex items-center gap-2">
          <span className="text-[11px] text-gray bg-[#F3F1EC] px-2 py-0.5 rounded-full">{count}</span>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-gray transition-transform group-open:rotate-180">
            <path d="M2 4L5.5 7.5L9 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-2 border-t border-line">{children}</div>
    </details>
  );
}
