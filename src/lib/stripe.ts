import Stripe from "stripe";
import { deskPass } from "./premium";
import type { DeskStore } from "./desk-types";
import { plusMonth, startPaidPass } from "./desk-store";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

export function siteUrl(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/my-desk";
  return value;
}

export function periodEndIso(subscription: Stripe.Subscription) {
  const unix =
    "current_period_end" in subscription && typeof subscription.current_period_end === "number"
      ? subscription.current_period_end
      : subscription.items.data[0]?.current_period_end;
  return typeof unix === "number" ? new Date(unix * 1000).toISOString() : plusMonth();
}

export async function fulfillCheckout(store: DeskStore, session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId || session.mode !== "subscription") return { ok: false as const };

  if (store.sales.some((sale) => sale.stripeSessionId === session.id)) {
    return { ok: true as const, already: true };
  }

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  let expiresAt = plusMonth();
  if (subscriptionId) {
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    expiresAt = periodEndIso(subscription);
  }

  const account = store.users.find((user) => user.id === userId);
  if (account) {
    if (customerId) account.stripeCustomerId = customerId;
    if (subscriptionId) account.stripeSubscriptionId = subscriptionId;
  }

  startPaidPass(
    store,
    {
      visitorId: session.metadata?.visitorId || `stripe-${userId}`,
      userId,
      name: account?.name || session.customer_details?.name || "Desk Pass",
      email: account?.email || session.customer_email || "",
      expiresAt,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      stripeSessionId: session.id,
    },
  );

  return { ok: true as const, already: false };
}

export async function cancelStripeForUser(store: DeskStore, userId: string) {
  if (!stripeConfigured()) {
    return { scheduled: [] as string[], expiresAt: plusMonth(), error: "Stripe is not connected" };
  }

  const account = store.users.find((user) => user.id === userId);
  const stripe = getStripe();
  const subscriptionIds = new Set<string>();
  const customerIds = new Set<string>();

  if (account?.stripeSubscriptionId) subscriptionIds.add(account.stripeSubscriptionId);
  if (account?.stripeCustomerId) customerIds.add(account.stripeCustomerId);

  for (const pass of store.passes) {
    if (pass.userId !== userId) continue;
    if (pass.stripeSubscriptionId) subscriptionIds.add(pass.stripeSubscriptionId);
    if (pass.stripeCustomerId) customerIds.add(pass.stripeCustomerId);
  }

  if (customerIds.size === 0 && account?.email) {
    const customers = await stripe.customers.list({ email: account.email, limit: 5 });
    for (const customer of customers.data) customerIds.add(customer.id);
  }

  for (const customerId of customerIds) {
    const list = await stripe.subscriptions.list({ customer: customerId, limit: 20 });
    for (const sub of list.data) {
      if (sub.status === "incomplete_expired") continue;
      subscriptionIds.add(sub.id);
    }
  }

  const scheduled: string[] = [];
  let expiresAt = plusMonth();
  let error: string | undefined;

  for (const id of subscriptionIds) {
    try {
      let subscription = await stripe.subscriptions.retrieve(id);
      if (subscription.status !== "canceled" && !subscription.cancel_at_period_end) {
        subscription = await stripe.subscriptions.update(id, { cancel_at_period_end: true });
      }
      expiresAt = periodEndIso(subscription);
      scheduled.push(id);
    } catch (caught) {
      const code = caught && typeof caught === "object" && "code" in caught ? String(caught.code) : "";
      if (code === "resource_missing") continue;
      error = caught instanceof Error ? caught.message : "Could not cancel on Stripe";
    }
  }

  return { scheduled, expiresAt, error };
}

export function deskPassLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (priceId) return { price: priceId, quantity: 1 };
  return {
    quantity: 1,
    price_data: {
      currency: "usd",
      unit_amount: deskPass.stripeCents,
      recurring: { interval: "month" },
      product_data: {
        name: deskPass.name,
        description: "Full playbooks and My Desk. Billed monthly.",
      },
    },
  };
}
