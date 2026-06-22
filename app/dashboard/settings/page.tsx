import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/Button";

const tierLabel: Record<string, string> = { free: "Free", pro: "Pro Report", monitoring: "Monthly Monitoring" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  const isPaid = session.tier !== "free";

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Settings</h1>
      <p className="text-[13px] text-gray mb-6">Account and workspace details.</p>

      <div className="flex flex-col gap-4 max-w-[560px]">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14px] font-medium mb-4">Workspace</h2>
          <div className="flex items-center justify-between py-2 border-b border-line text-[13px]">
            <span className="text-gray">Workspace name</span>
            <span className="font-medium">{session.workspaceName}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-[13px]">
            <span className="text-gray">Account email</span>
            <span className="font-medium">{session.email}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14px] font-medium mb-4">Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium">{tierLabel[session.tier]}</div>
              <div className="text-[12px] text-gray mt-0.5">
                {isPaid ? "Full report access unlocked." : "Alignment Score and one finding visible."}
              </div>
            </div>
            {!isPaid && (
              <LinkButton href="/upgrade" variant="lilac" withArrow={false} className="text-[13px]">
                Upgrade
              </LinkButton>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-[14px] font-medium mb-3">Account</h2>
          <form action="/api/logout" method="POST">
            <button type="submit" className="text-[13px] font-medium px-3 py-1.5 rounded-full border border-line hover:bg-black/[0.03] transition-colors">
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
