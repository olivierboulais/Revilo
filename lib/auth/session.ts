import { cookies } from "next/headers";

export type SubscriptionTier = "free" | "pro" | "monitoring";

export interface MockUser {
  email: string;
  workspaceName: string;
  tier: SubscriptionTier;
}

const SESSION_COOKIE = "revilo_session";

// Swap point: replace with a real session store (e.g. NextAuth, a JWT, or a
// database-backed session). The cookie holds a JSON-encoded MockUser for now
// because there's no database yet — this is intentionally the only place
// that needs to change when real auth lands.
export async function getSession(): Promise<MockUser | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MockUser;
  } catch {
    return null;
  }
}

export async function createSession(email: string, workspaceName: string): Promise<void> {
  const store = await cookies();
  const user: MockUser = { email, workspaceName, tier: "free" };
  store.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

// Swap point: replace with a real billing webhook handler (e.g. Stripe) that
// updates the user's tier in the database after a successful subscription.
export async function setTier(tier: SubscriptionTier): Promise<void> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return;
  const user = JSON.parse(raw) as MockUser;
  user.tier = tier;
  store.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
