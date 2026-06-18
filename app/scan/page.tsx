import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ScanProgress } from "@/components/ScanProgress";

export default async function ScanPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <ScanProgress workspaceName={session.workspaceName} />
    </main>
  );
}
