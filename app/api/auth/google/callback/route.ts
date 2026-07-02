import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, getGoogleRedirectUri } from "@/lib/google/config";
import { findUserByEmail, createUser } from "@/lib/db/users";
import { createSessionForUser } from "@/lib/auth/session";
import { getSource } from "@/lib/db/sources";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const storedState = cookieHeader.match(/google_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=invalid_state", request.url));
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(request.url),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/login?error=google_token_failed", request.url));
  }

  const tokens = await tokenRes.json();

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(new URL("/login?error=google_profile_failed", request.url));
  }

  const profile = await userInfoRes.json();
  const email = profile.email as string;

  if (!email || !profile.verified_email) {
    return NextResponse.redirect(new URL("/login?error=email_not_verified", request.url));
  }

  let user = await findUserByEmail(email);
  if (!user) {
    const placeholderPassword = randomBytes(32).toString("hex");
    const workspaceName = profile.name || email.split("@")[0];
    user = await createUser(email, placeholderPassword, workspaceName);
  }

  await createSessionForUser(user.id);

  const [figmaSource, githubSource] = await Promise.all([
    getSource(user.id, "figma"),
    getSource(user.id, "github"),
  ]);
  const hasConnectedSources =
    figmaSource?.status === "connected" || githubSource?.status === "connected";

  const redirectTo = hasConnectedSources ? "/dashboard" : "/connect";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.delete("google_oauth_state");
  return response;
}
