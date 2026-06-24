import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = { title: "Connect sources — Revilo" };
import { ConnectFlow } from "@/components/ConnectFlow";

interface Props {
  searchParams: Promise<{ error?: string; detail?: string }>;
}

export default async function ConnectPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/signup");

  const { error, detail } = await searchParams;

  const user = await findUserByEmail(session.email);
  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];

  const figmaConnected = figmaSource?.status === "connected" && Boolean(figmaSource.access_token);
  const githubConnected = githubSource?.status === "connected" && Boolean(githubSource.access_token);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative">
      <a href="/" className="absolute top-6 left-6 text-[13px] text-gray hover:text-[#1C1C1A] transition-colors flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back
      </a>
      <div className="mb-10">
        <Logo />
      </div>
      <ConnectFlow
        figmaConnected={figmaConnected}
        figmaFileKey={figmaSource?.figma_file_key ?? null}
        githubConnected={githubConnected}
        githubRepo={githubSource?.github_repo ?? null}
        error={error ?? null}
        errorDetail={detail ?? null}
      />
    </main>
  );
}
