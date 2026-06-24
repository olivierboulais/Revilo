// Real Figma OAuth app credentials, once one exists. Until then these are
// undefined and the start/callback routes return a clear error instead of
// silently behaving like the old mock-connect flow.
//
// Setup (blocked on a real account — see README "Figma OAuth setup"):
//   1. Create an OAuth app at https://www.figma.com/developers/apps
//   2. Add redirect URLs:
//        https://<your-production-domain>/api/auth/figma/callback
//        http://localhost:3000/api/auth/figma/callback   (for local dev)
//   3. Select scopes: file_content:read, file_variables:read
//   4. Set FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET in the environment

export const FIGMA_CLIENT_ID = process.env.FIGMA_CLIENT_ID?.trim();
export const FIGMA_CLIENT_SECRET = process.env.FIGMA_CLIENT_SECRET?.trim();

export const FIGMA_SCOPES = "file_content:read";
export const FIGMA_AUTHORIZE_URL = "https://www.figma.com/oauth";
export const FIGMA_TOKEN_URL = "https://api.figma.com/v1/oauth/token";
export const FIGMA_REFRESH_URL = "https://api.figma.com/v1/oauth/refresh";
export const FIGMA_API_BASE = "https://api.figma.com/v1";

export function isFigmaOAuthConfigured(): boolean {
  return Boolean(FIGMA_CLIENT_ID && FIGMA_CLIENT_SECRET);
}

export function getRedirectUri(requestUrl: string): string {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}/api/auth/figma/callback`;
}
