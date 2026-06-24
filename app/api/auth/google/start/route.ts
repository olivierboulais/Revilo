import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, isGoogleOAuthConfigured, getGoogleRedirectUri } from "@/lib/google/config";
import { randomBytes } from "crypto";

export async function GET(request: Request) {
  if (!isGoogleOAuthConfigured()) {
    const url = new URL("/signup", request.url);
    url.searchParams.set("error", "google_not_configured");
    return NextResponse.redirect(url);
  }

  const state = randomBytes(16).toString("hex");

  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID!);
  authorizeUrl.searchParams.set("redirect_uri", getGoogleRedirectUri(request.url));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10,
  });
  return response;
}
