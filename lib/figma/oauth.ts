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
  const tokenUrl = new URL(FIGMA_TOKEN_URL);
  tokenUrl.searchParams.set("client_id", FIGMA_CLIENT_ID!);
  tokenUrl.searchParams.set("client_secret", FIGMA_CLIENT_SECRET!);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(tokenUrl.toString(), {
    method: "POST",
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
  const refreshUrl = new URL(FIGMA_REFRESH_URL);
  refreshUrl.searchParams.set("client_id", FIGMA_CLIENT_ID!);
  refreshUrl.searchParams.set("client_secret", FIGMA_CLIENT_SECRET!);
  refreshUrl.searchParams.set("refresh_token", refreshToken);

  const response = await fetch(refreshUrl.toString(), {
    method: "POST",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Figma token refresh failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
