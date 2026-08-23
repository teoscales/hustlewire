import { NextResponse } from "next/server";
import { fulfillCheckout, getStripe, periodEndIso } from "@/lib/stripe";
import { endUserPass, plusMonth, syncPassPeriod, updateDeskStore } from "@/lib/desk-store";
import type { Stripe } from "stripe";

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  const raw = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
    parent?: { subscription_details?: { subscription?: string | { id: string } | null } };
  };
  const value = raw.subscription ?? raw.parent?.subscription_details?.subscription;
  return typeof value === "string" ? value : value?.id;
}

function passForSubscription(
  store: { users: { id: string; stripeSubscriptionId?: string }[]; passes: { stripeSubscriptionId?: string; userId?: string; stripeCustomerId?: string }[] },
  subscription: Stripe.Subscription,
) {
  const userId =
    subscription.metadata?.userId ||
    store.users.find((user) => user.stripeSubscriptionId === subscription.id)?.id;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  return (
    userId ||
    store.passes.find(
      (pass) =>
        pass.stripeSubscriptionId === subscription.id ||
        (customerId && pass.stripeCustomerId === customerId),
    )?.userId
  );
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 503 });
  }

  const raw = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await updateDeskStore((store) => fulfillCheckout(store, event.data.object));
  }

  if (event.type === "invoice.paid") {
    const invoice = event.data.object;
    if (invoice.billing_reason === "subscription_create") {
      return NextResponse.json({ received: true });
    }
    const subscriptionId = invoiceSubscriptionId(invoice);
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    let expiresAt = plusMonth();
    if (subscriptionId) {
      try {
        const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
        expiresAt = periodEndIso(subscription);
      } catch {
        /* keep plusMonth fallback */
      }
    }
    if (subscriptionId || customerId) {
      await updateDeskStore((store) => {
        for (const pass of store.passes) {
          const match =
            (subscriptionId && pass.stripeSubscriptionId === subscriptionId) ||
            (customerId && pass.stripeCustomerId === customerId && pass.kind === "paid");
          if (match && !pass.cancelAtPeriodEnd) {
            pass.endedAt = null;
            pass.expiresAt = expiresAt;
          }
        }
      });
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const expiresAt = periodEndIso(subscription);
    await updateDeskStore((store) => {
      const userId = passForSubscription(store, subscription);
      if (!userId) return;
      if (subscription.status === "canceled") {
        const account = store.users.find((user) => user.id === userId);
        if (account) account.stripeSubscriptionId = undefined;
        endUserPass(store, userId);
        return;
      }
      syncPassPeriod(store, userId, expiresAt, Boolean(subscription.cancel_at_period_end));
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await updateDeskStore((store) => {
      const userId = passForSubscription(store, subscription);
      if (userId) {
        const account = store.users.find((user) => user.id === userId);
        if (account) account.stripeSubscriptionId = undefined;
        endUserPass(store, userId);
      }
    });
  }

  return NextResponse.json({ received: true });
}
