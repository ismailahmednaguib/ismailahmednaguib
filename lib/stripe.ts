// lib/stripe.ts : إعداد Stripe
import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-08-26.dahlia",
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = getStripe();

export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  courseSlug: string;
  courseTitle: string;
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  
  const { userId, userEmail, courseSlug, courseTitle, amount, currency = "sar", successUrl, cancelUrl, metadata = {} } = params;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: courseTitle,
            description: `الالتحاق بكورس: ${courseTitle}`,
            metadata: { course_slug: courseSlug },
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      course_slug: courseSlug,
      ...metadata,
    },
    payment_intent_data: {
      metadata: {
        user_id: userId,
        course_slug: courseSlug,
        ...metadata,
      },
    },
  });

  return session;
}

export async function createPaymentIntent(params: {
  amount: number;
  currency?: string;
  userId: string;
  courseSlug: string;
  metadata?: Record<string, string>;
}) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");

  const { amount, currency = "sar", userId, courseSlug, metadata = {} } = params;

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata: {
      user_id: userId,
      course_slug: courseSlug,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

export async function handleWebhookEvent(payload: string | Buffer, signature: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export async function refundPayment(paymentIntentId: string, amount?: number) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
  });
}

export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe not configured");
  
  return stripe.customers.create({
    email,
    name,
    metadata,
  });
}