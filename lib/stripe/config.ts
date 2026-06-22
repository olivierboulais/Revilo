export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Set these in your Stripe dashboard → Products → copy the Price ID
export const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;
export const STRIPE_MONITORING_PRICE_ID = process.env.STRIPE_MONITORING_PRICE_ID;

export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}
