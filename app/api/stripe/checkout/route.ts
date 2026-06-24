import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_MONITORING_PRICE_ID, isStripeConfigured } from "@/lib/stripe/config";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const tier = body.tier as string;
  if (tier !== "pro" && tier !== "monitoring") {
    return NextResponse.json({ error: "tier must be pro or monitoring" }, { status: 400 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

  const priceId = tier === "pro" ? STRIPE_PRO_PRICE_ID : STRIPE_MONITORING_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: `STRIPE_${tier.toUpperCase()}_PRICE_ID not configured` }, { status: 503 });
  }

  const origin = new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: tier === "pro" ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: session.email,
    success_url: `${origin}/connect?upgraded=${tier}`,
    cancel_url: `${origin}/upgrade`,
    metadata: { email: session.email, tier },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
