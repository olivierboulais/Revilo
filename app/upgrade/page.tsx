import { getSession, setTier } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";

async function upgrade(formData: FormData) {
  "use server";
  const tier = String(formData.get("tier") ?? "");
  if (tier === "pro" || tier === "monitoring") {
    // Swap point: replace with a real Stripe (or similar) checkout session,
    // then update the tier from the billing webhook rather than directly here.
    await setTier(tier);
  }
  redirect("/dashboard");
}

export default async function UpgradePage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  return (
    <main className="flex-1 px-6 py-16">
      <div className="max-w-[820px] mx-auto">
        <div className="mb-10">
          <Logo />
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight mb-2">Unlock your full report</h1>
        <p className="text-[14px] text-gray mb-10">Pick the option that fits how you want to use Revilo.</p>

        <form action={upgrade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border-2 border-[#1C1C1A] bg-white p-6 flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-gray mb-2">One-time</span>
            <h3 className="text-[18px] font-semibold mb-1">Pro Report</h3>
            <p className="text-[13px] text-gray mb-4">The full scan, unlocked once. No subscription required.</p>
            <div className="text-[28px] font-semibold mb-1">
              $199<span className="text-[14px] text-gray font-normal"> per report</span>
            </div>
            <ul className="text-[12.5px] text-gray flex flex-col gap-1.5 my-4">
              <li>→ Full report, all findings</li>
              <li>→ Recommendations</li>
              <li>→ Variant-level detail</li>
              <li>→ PDF export</li>
            </ul>
            <Button type="submit" name="tier" value="pro" variant="dark" className="justify-center mt-auto">
              Unlock Full Report
            </Button>
          </div>

          <div className="rounded-2xl border border-line bg-white p-6 flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-gray mb-2">Subscription</span>
            <h3 className="text-[18px] font-semibold mb-1">Monthly Monitoring</h3>
            <p className="text-[13px] text-gray mb-4">Re-scan on a cadence and track whether your system is improving.</p>
            <div className="text-[28px] font-semibold mb-1">
              $49<span className="text-[14px] text-gray font-normal">/mo</span>
            </div>
            <ul className="text-[12.5px] text-gray flex flex-col gap-1.5 my-4">
              <li>→ Everything in Pro Report</li>
              <li>→ Automatic re-scans</li>
              <li>→ Score trend over time</li>
              <li>→ Drift alerts</li>
            </ul>
            <Button type="submit" name="tier" value="monitoring" variant="outline" className="justify-center mt-auto">
              Start Monitoring
            </Button>
          </div>
        </form>

        <p className="text-[11px] text-gray mt-4">Monthly Monitoring pricing is an early placeholder and may change before launch.</p>

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
