import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ConnectFlow } from "@/components/ConnectFlow";

export default async function ConnectPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <ConnectFlow />
    </main>
  );
}
