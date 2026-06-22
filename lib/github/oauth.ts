import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_TOKEN_URL } from "@/lib/github/config";

export interface GithubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GithubUser {
  login: string;
  name: string | null;
}

export async function exchangeGithubCodeForToken(
  code: string,
  redirectUri: string
): Promise<GithubTokenResponse> {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(`GitHub token exchange error: ${data.error_description ?? data.error}`);
  }
  return data as GithubTokenResponse;
}

export async function getGithubUser(accessToken: string): Promise<GithubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error(`GitHub /user failed: ${res.status}`);
  return res.json();
}
