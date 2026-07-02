import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { GITHUB_CLIENT_ID, GITHUB_SCOPES, GITHUB_AUTHORIZE_URL, isGithubOAuthConfigured, getGithubRedirectUri } from "@/lib/github/config";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  if (!isGithubOAuthConfigured()) {
    const url = new URL("/dashboard?connect=1", request.url);
    url.searchParams.set("error", "github_not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");

  const authorizeUrl = new URL(GITHUB_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", GITHUB_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", getGithubRedirectUri(request.url));
  authorizeUrl.searchParams.set("scope", GITHUB_SCOPES);
  authorizeUrl.searchParams.set("state", state);

  const referer = request.headers.get("referer") ?? "";
  const returnPath = referer ? new URL(referer).pathname : "/dashboard";
  const stateWithReturn = `${state}:${returnPath}`;

  authorizeUrl.searchParams.set("state", stateWithReturn);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("github_oauth_state", stateWithReturn, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
