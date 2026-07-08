import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { upsertSource } from "@/lib/db/sources";
import { exchangeGithubCodeForToken, getGithubUser } from "@/lib/github/oauth";
import { getGithubRedirectUri } from "@/lib/github/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const stateParts = (state ?? "").split(":");
  const csrfToken = stateParts[0];
  const returnPath = stateParts.slice(1).join(":") || "/dashboard";
  const connectUrl = new URL(returnPath, new URL(request.url).origin);
  connectUrl.searchParams.set("connect", "1");

  if (errorParam) {
    connectUrl.searchParams.set("error", "github_denied");
    return NextResponse.redirect(connectUrl);
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  const cookieJar = await cookies();
  const expectedState = cookieJar.get("github_oauth_state")?.value;

  if (!code || !state || !expectedState || state !== expectedState) {
    connectUrl.searchParams.set("error", "github_state_mismatch");
    return NextResponse.redirect(connectUrl);
  }

  const user = await findUserByEmail(session.email);
  if (!user) {
    connectUrl.searchParams.set("error", "github_user_not_found");
    return NextResponse.redirect(connectUrl);
  }

  try {
    const redirectUri = getGithubRedirectUri(request.url);
    const tokenResponse = await exchangeGithubCodeForToken(code, redirectUri);
    const ghUser = await getGithubUser(tokenResponse.access_token);
    // GitHub OAuth tokens don't expire (fine-grained tokens do but regular OAuth ones don't)
    await upsertSource(
      user.id,
      "github",
      tokenResponse.access_token,
      null, // no refresh token for GitHub
      ghUser.login,
      null  // no expiry
    );
  } catch (err) {
    console.error("GitHub OAuth callback failed:", err);
    const msg = err instanceof Error ? err.message : "unknown";
    connectUrl.searchParams.set("error", "github_token_exchange_failed");
    connectUrl.searchParams.set("detail", msg);
    return NextResponse.redirect(connectUrl);
  }

  const response = NextResponse.redirect(connectUrl);
  response.cookies.delete("github_oauth_state");
  return response;
}
