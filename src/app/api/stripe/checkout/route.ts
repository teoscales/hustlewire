import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { getDeskStore } from "@/lib/desk-store";
import { VISITOR_COOKIE, visitorCookie } from "@/lib/ids";
import { newDeskId } from "@/lib/password";
import { deskPass } from "@/lib/premium";
import {
  deskPassLineItem,
  getStripe,
  safeNextPath,
  siteUrl,
  stripeConfigured,
} from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not connected. Add STRIPE_SECRET_KEY to .env.local." },
      { status: 503 },
    );
  }

  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { from?: string };
  const next = safeNextPath(body.from);
  const jar = await cookies();
  const visitorId = jar.get(VISITOR_COOKIE)?.value || newDeskId();
  const origin = siteUrl(request);
  const stripe = getStripe();
  const store = await getDeskStore();
  const user = store.users.find((item) => item.id === account.id);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      ...(user?.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: account.email }),
      client_reference_id: account.id,
      allow_promotion_codes: true,
      line_items: [deskPassLineItem()],
      success_url: `${origin}/api/stripe/complete?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(next)}`,
      cancel_url: `${origin}/premium`,
      metadata: {
        userId: account.id,
        visitorId,
      },
      subscription_data: {
        metadata: {
          userId: account.id,
        },
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start Stripe checkout" }, { status: 500 });
    }

    const res = NextResponse.json({ url: session.url, price: deskPass.priceLabel });
    res.cookies.set(visitorCookie(visitorId));
    return res;
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Stripe checkout failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
