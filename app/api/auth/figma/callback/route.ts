import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/users";
import { upsertSource } from "@/lib/db/sources";
import { exchangeCodeForToken } from "@/lib/figma/oauth";
import { getRedirectUri } from "@/lib/figma/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  const connectUrl = new URL("/connect", request.url);

  // The user rejected the OAuth grant — Figma's docs note no callback
  // fires in that case, but handle it defensively in case that changes.
  if (errorParam) {
    connectUrl.searchParams.set("error", "figma_denied");
    return NextResponse.redirect(connectUrl);
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  // CSRF check: the state we generated in /start must match what Figma
  // sent back. A mismatch means this callback didn't originate from a
  // flow we started.
  const cookieStore = request.headers.get("cookie") ?? "";
  const stateCookieMatch = cookieStore.match(/figma_oauth_state=([^;]+)/);
  const expectedState = stateCookieMatch?.[1];

  if (!code || !state || !expectedState || state !== expectedState) {
    connectUrl.searchParams.set("error", "figma_state_mismatch");
    return NextResponse.redirect(connectUrl);
  }

  const user = await findUserByEmail(session.email);
  if (!user) {
    connectUrl.searchParams.set("error", "figma_user_not_found");
    return NextResponse.redirect(connectUrl);
  }

  try {
    const redirectUri = getRedirectUri(request.url);
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);
    await upsertSource(user.id, "figma", tokenResponse.access_token, tokenResponse.refresh_token);
  } catch (err) {
    console.error("Figma OAuth callback failed:", err);
    connectUrl.searchParams.set("error", "figma_token_exchange_failed");
    return NextResponse.redirect(connectUrl);
  }

  const response = NextResponse.redirect(connectUrl);
  response.cookies.delete("figma_oauth_state");
  return response;
}
