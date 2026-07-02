export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

export function getGoogleRedirectUri(requestUrl: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(requestUrl).origin;
  return `${base}/api/auth/google/callback`;
}
