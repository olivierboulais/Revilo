import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  return (
    <div className="px-3 sm:px-6 py-6 sm:py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Settings</h1>
      <p className="text-[13px] text-gray mb-6">Account and workspace details.</p>
      <SettingsClient
        email={session.email}
        workspaceName={session.workspaceName}
        tier={session.tier}
        emailVerified={session.emailVerified}
      />
    </div>
  );
}
