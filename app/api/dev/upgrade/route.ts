import { NextResponse } from "next/server";
import { getSession, setTier } from "@/lib/auth/session";

// Dev-only route: directly sets the user's tier without going through Stripe.
// Blocked in production so it can never be abused.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const tier = body.tier;
  if (tier !== "pro" && tier !== "monitoring") {
    return NextResponse.json({ error: "tier must be pro or monitoring" }, { status: 400 });
  }

  await setTier(tier);
  return NextResponse.json({ ok: true });
}
