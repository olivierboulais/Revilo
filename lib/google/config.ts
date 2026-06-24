export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUri(requestUrl: string): string {
  const url = new URL(requestUrl);
  return `${url.origin}/api/auth/google/callback`;
}
