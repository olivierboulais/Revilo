import { NextResponse } from "next/server";
import { STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_MONITORING_PRICE_ID, isStripeConfigured } from "@/lib/stripe/config";

// Debug-only: shows configured price IDs and lists real prices from Stripe.
// Remove this route before going fully public.
export async function GET() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET_KEY!, { apiVersion: "2026-05-27.dahlia" });

  const prices = await stripe.prices.list({ limit: 20, active: true, expand: ["data.product"] });

  return NextResponse.json({
    configured: {
      STRIPE_PRO_PRICE_ID: STRIPE_PRO_PRICE_ID ?? "(not set)",
      STRIPE_MONITORING_PRICE_ID: STRIPE_MONITORING_PRICE_ID ?? "(not set)",
    },
    available_prices: prices.data.map((p) => ({
      id: p.id,
      product: typeof p.product === "object" && p.product && "name" in p.product ? (p.product as { name: string }).name : p.product,
      amount: p.unit_amount,
      currency: p.currency,
      recurring: p.recurring?.interval ?? "one_time",
    })),
  });
}
