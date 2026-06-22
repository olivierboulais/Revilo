import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { getSource } from "@/lib/db/sources";
import { redirect } from "next/navigation";
import { SourcesClient } from "./SourcesClient";

export default async function SourcesPage() {
  const session = await getSession();
  if (!session) redirect("/signup");

  const user = await findUserByEmail(session.email);
  const [figmaSource, githubSource] = user
    ? await Promise.all([getSource(user.id, "figma"), getSource(user.id, "github")])
    : [null, null];

  return (
    <div className="px-6 py-8">
      <h1 className="text-[22px] font-semibold tracking-tight mb-1">Sources</h1>
      <p className="text-[13px] text-gray mb-6">The Figma and GitHub sources Revilo scans to build this report.</p>
      <SourcesClient
        figma={
          figmaSource?.status === "connected" && figmaSource.access_token
            ? {
                externalName: figmaSource.external_name,
                fileKey: figmaSource.figma_file_key,
                connectedAt: figmaSource.connected_at,
              }
            : null
        }
        github={
          githubSource?.status === "connected" && githubSource.access_token
            ? {
                externalName: githubSource.external_name,
                repo: githubSource.github_repo,
                connectedAt: githubSource.connected_at,
              }
            : null
        }
      />
    </div>
  );
}
