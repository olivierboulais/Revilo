import { cookies } from "next/headers";
import { findUserById, updateUserTier } from "@/lib/db/users";
import { createDbSession, findSessionByToken, deleteSessionByToken } from "@/lib/db/sessions";

export type SubscriptionTier = "free" | "pro" | "monitoring";

export interface MockUser {
  email: string;
  workspaceName: string;
  tier: SubscriptionTier;
  emailVerified: boolean;
}

const SESSION_COOKIE = "revilo_session";

// Real implementation: the cookie now holds an opaque, random session token
// (not user data) that's looked up against the sessions table — the
// previous version stored the user's data directly in the cookie, which was
// readable and forgeable by anyone with browser dev tools. This is the
// standard server-side session pattern.
export async function getSession(): Promise<MockUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await findSessionByToken(token);
  if (!session) return null;

  const user = await findUserById(session.user_id);
  if (!user) return null;

  return {
    email: user.email,
    workspaceName: user.workspace_name,
    tier: user.tier,
    emailVerified: Boolean(user.email_verified_at),
  };
}

// Creates a real session row and sets only the opaque token in the cookie.
// Used by login (after password verification) — signup creates the user
// record separately via lib/db/users.ts, then calls this.
export async function createSessionForUser(userId: string): Promise<void> {
  const token = await createDbSession(userId);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function setTier(tier: SubscriptionTier): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const session = await findSessionByToken(token);
  if (!session) return;
  await updateUserTier(session.user_id, tier);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await deleteSessionByToken(token);
  store.delete(SESSION_COOKIE);
}
