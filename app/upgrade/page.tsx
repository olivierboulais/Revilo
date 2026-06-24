"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

function PlanCard({
  label,
  name,
  description,
  price,
  priceSuffix,
  features,
  tier,
  variant,
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
  variant: "dark" | "outline";
  onSelect: (tier: "pro" | "monitoring") => void;
  loading: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 flex flex-col ${variant === "dark" ? "border-2 border-[#1C1C1A] bg-white" : "border border-line bg-white"}`}>
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
        variant={variant}
        className="justify-center mt-auto"
        onClick={() => onSelect(tier)}
        disabled={loading}
      >
        {loading ? "Redirecting…" : variant === "dark" ? "Unlock Full Report" : "Start Monitoring"}
      </Button>
    </div>
  );
}

export default function UpgradePage() {
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
        // Dev fallback: directly upgrade without payment
        await fetch("/api/dev/upgrade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        });
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
    <main className="flex-1 px-6 py-16">
      <div className="max-w-[820px] mx-auto">
        <div className="mb-10">
          <Logo />
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight mb-2">Unlock your full report</h1>
        <p className="text-[14px] text-gray mb-10">Pick the option that fits how you want to use Revilo.</p>

        {error && (
          <div className="mb-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[13px] text-[#B91C1C] px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PlanCard
            label="One-time"
            name="Pro Report"
            description="The full scan, unlocked once. No subscription required."
            price="$199"
            priceSuffix=" per report"
            features={["Full report, all findings", "Recommendations", "Variant-level detail", "PDF export"]}
            tier="pro"
            variant="dark"
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
            variant="outline"
            onSelect={handleSelect}
            loading={loading === "monitoring"}
          />
        </div>


        <div className="rounded-2xl bg-[#F8F7F4] border border-line p-6 mt-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-[15px] font-medium mb-1">Need help implementing the findings?</h3>
            <p className="text-[13px] text-gray">A 90-minute workshop with roadmap and prioritization, from $1,500.</p>
          </div>
          <Button variant="outline" withArrow={false}>
            Book Expert Review
          </Button>
        </div>
      </div>
    </main>
  );
}
