import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { FIGMA_CLIENT_ID, FIGMA_SCOPES, FIGMA_AUTHORIZE_URL, isFigmaOAuthConfigured, getRedirectUri } from "@/lib/figma/config";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  if (!isFigmaOAuthConfigured()) {
    // Honest failure instead of the old fake-connect behavior: if no real
    // Figma OAuth app exists yet, say so rather than pretending to connect.
    const url = new URL("/dashboard?connect=1", request.url);
    url.searchParams.set("error", "figma_not_configured");
    return NextResponse.redirect(url);
  }

  // CSRF protection: a random state value, verified against the cookie on
  // callback. Without this, an attacker could trick a user into completing
  // an OAuth flow that links the attacker's Figma account to the victim's
  // Revilo account (or vice versa).
  const state = randomBytes(16).toString("hex");

  const authorizeUrl = new URL(FIGMA_AUTHORIZE_URL);
  authorizeUrl.searchParams.set("client_id", FIGMA_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", getRedirectUri(request.url));
  authorizeUrl.searchParams.set("scope", FIGMA_SCOPES);
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("response_type", "code");

  const referer = request.headers.get("referer") ?? "";
  const returnPath = referer ? new URL(referer).pathname : "/dashboard";

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("figma_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  response.cookies.set("oauth_return_path", returnPath, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
