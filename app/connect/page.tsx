import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ConnectFlow } from "@/components/ConnectFlow";

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function ConnectPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/signup");

  const { error } = await searchParams;

  const user = await findUserByEmail(session.email);
  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];

  const figmaConnected = figmaSource?.status === "connected" && Boolean(figmaSource.access_token);
  const githubConnected = githubSource?.status === "connected" && Boolean(githubSource.access_token);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <Logo />
      </div>
      <ConnectFlow
        figmaConnected={figmaConnected}
        figmaFileKey={figmaSource?.figma_file_key ?? null}
        githubConnected={githubConnected}
        githubRepo={githubSource?.github_repo ?? null}
        error={error ?? null}
      />
    </main>
  );
}
