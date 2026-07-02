"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

function PlanCard({
  label,
  name,
  description,
  price,
  priceSuffix,
  features,
  tier,
  featured,
  onSelect,
  loading,
}: {
  label: string;
  name: string;
  description: string;
  price: string;
  priceSuffix: string;
  features: string[];
  tier: "pro" | "monitoring";
  featured?: boolean;
  onSelect: (tier: "pro" | "monitoring") => void;
  loading: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col ${featured ? "border-2 border-foreground bg-card" : "border border-line bg-card"}`}>
      <span className="text-[11px] uppercase tracking-wide text-gray mb-2">{label}</span>
      <h3 className="text-[18px] font-semibold mb-1">{name}</h3>
      <p className="text-[13px] text-gray mb-4">{description}</p>
      <div className="text-[28px] font-semibold mb-1">
        {price}<span className="text-[14px] text-gray font-normal">{priceSuffix}</span>
      </div>
      <ul className="text-[12.5px] text-gray flex flex-col gap-1.5 my-4">
        {features.map((f) => <li key={f}>→ {f}</li>)}
      </ul>
      <Button
        variant={featured ? "dark" : "outline"}
        withArrow={false}
        className="justify-center mt-auto"
        onClick={() => onSelect(tier)}
        disabled={loading}
      >
        {loading ? "Redirecting…" : featured ? "Unlock Full Report" : "Start Monitoring"}
      </Button>
    </div>
  );
}

export function UpgradeContent({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"pro" | "monitoring" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(tier: "pro" | "monitoring") {
    setLoading(tier);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "Stripe is not configured") {
        await fetch("/api/dev/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });
        onClose?.();
        router.push("/dashboard");
      } else {
        throw new Error(data.error ?? "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-[18px] font-semibold tracking-tight mb-1">Unlock your full report</h2>
      <p className="text-[13px] text-gray mb-6">Pick the option that fits how you want to use Revilo.</p>

      {error && (
        <div className="mb-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <PlanCard
          label="One-time"
          name="Pro Report"
          description="The full scan, unlocked once. No subscription required."
          price="$199"
          priceSuffix=" per report"
          features={["Full report, all findings", "Recommendations", "Variant-level detail", "PDF export"]}
          tier="pro"
          featured
          onSelect={handleSelect}
          loading={loading === "pro"}
        />
        <PlanCard
          label="Subscription"
          name="Monthly Monitoring"
          description="Re-scan on a cadence and track whether your system is improving."
          price="$99.99"
          priceSuffix="/mo"
          features={["Everything in Pro Report", "Automatic re-scans", "Score trend over time", "Drift alerts"]}
          tier="monitoring"
          onSelect={handleSelect}
          loading={loading === "monitoring"}
        />
      </div>

      <div className="rounded-2xl bg-surface border border-line p-5 mt-4 flex flex-col gap-2">
        <h3 className="text-[13px] font-medium">Need help implementing the findings?</h3>
        <p className="text-[12px] text-gray">A 90-minute workshop with roadmap and prioritization, from $1,500.</p>
        <a
          href="mailto:ob@olivierboulais.ca?subject=Revilo Expert Review"
          className="text-[12px] font-medium underline text-gray hover:text-foreground transition-colors"
        >
          Book Expert Review →
        </a>
      </div>
    </div>
  );
}
