import { FIGMA_CLIENT_ID, FIGMA_CLIENT_SECRET, FIGMA_TOKEN_URL, FIGMA_REFRESH_URL } from "@/lib/figma/config";

export interface FigmaTokenResponse {
  user_id_string: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

function basicAuthHeader(): string {
  const credentials = `${FIGMA_CLIENT_ID}:${FIGMA_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

// Exchanges an authorization code for an access token. Per Figma's docs,
// this must happen within 30 seconds of the user completing the OAuth
// grant — the code expires after that.
export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<FigmaTokenResponse> {
  const body = new URLSearchParams({
    client_id: FIGMA_CLIENT_ID!,
    client_secret: FIGMA_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    code,
    grant_type: "authorization_code",
  });

  const response = await fetch(FIGMA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma token exchange failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export interface FigmaRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Figma only keeps one access token per app per user — refreshing
// invalidates the previous one, so the caller must immediately persist the
// new token or the connection breaks.
export async function refreshFigmaToken(refreshToken: string): Promise<FigmaRefreshResponse> {
  const body = new URLSearchParams({
    client_id: FIGMA_CLIENT_ID!,
    client_secret: FIGMA_CLIENT_SECRET!,
    refresh_token: refreshToken,
  });

  const response = await fetch(FIGMA_REFRESH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma token refresh failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
