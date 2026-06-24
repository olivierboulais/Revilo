import { NextResponse } from "next/server";
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID, STRIPE_MONITORING_PRICE_ID } from "@/lib/stripe/config";
import { findUserByEmail } from "@/lib/db/users";
import { updateUserTier } from "@/lib/db/users";

export async function POST(request: Request) {
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });

  const body = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle successful payment or subscription activation
  if (
    event.type === "checkout.session.completed" ||
    event.type === "invoice.payment_succeeded"
  ) {
    const session =
      event.type === "checkout.session.completed"
        ? (event.data.object as import("stripe").Stripe.Checkout.Session)
        : null;

    const email = session?.customer_email ?? (event.data.object as { customer_email?: string }).customer_email;
    const tier = session?.metadata?.tier ?? null;

    if (email && (tier === "pro" || tier === "monitoring")) {
      const user = await findUserByEmail(email);
      if (user) {
        await updateUserTier(user.id, tier);
      }
    }
  }

  // Handle subscription cancellation → downgrade to free
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const customer = await stripe.customers.retrieve(sub.customer as string);
    const email = "email" in customer ? customer.email : null;
    if (email) {
      const user = await findUserByEmail(email);
      if (user) await updateUserTier(user.id, "free");
    }
  }

  // Handle failed payment → downgrade to free
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as import("stripe").Stripe.Invoice;
    const customer = await stripe.customers.retrieve(invoice.customer as string);
    const email = "email" in customer ? customer.email : null;
    if (email) {
      const user = await findUserByEmail(email);
      if (user) await updateUserTier(user.id, "free");
    }
  }

  // Handle subscription update → sync tier to new price
  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as import("stripe").Stripe.Subscription;
    const priceId = sub.items.data[0]?.price?.id ?? null;
    let tier: "pro" | "monitoring" | "free" = "free";
    if (priceId === STRIPE_PRO_PRICE_ID) tier = "pro";
    else if (priceId === STRIPE_MONITORING_PRICE_ID) tier = "monitoring";

    const customer = await stripe.customers.retrieve(sub.customer as string);
    const email = "email" in customer ? customer.email : null;
    if (email) {
      const user = await findUserByEmail(email);
      if (user) await updateUserTier(user.id, tier);
    }
  }

  // Handle charge refund → downgrade to free
  if (event.type === "charge.refunded") {
    const charge = event.data.object as import("stripe").Stripe.Charge;
    const customer = await stripe.customers.retrieve(charge.customer as string);
    const email = "email" in customer ? customer.email : null;
    if (email) {
      const user = await findUserByEmail(email);
      if (user) await updateUserTier(user.id, "free");
    }
  }

  return NextResponse.json({ received: true });
}
