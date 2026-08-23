import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import {
  activePassForUser,
  getDeskStore,
  plusMonth,
  schedulePassCancel,
  updateDeskStore,
} from "@/lib/desk-store";
import { DESK_PASS_COOKIE, passCookie } from "@/lib/premium";
import { cancelStripeForUser, stripeConfigured } from "@/lib/stripe";

export async function GET() {
  const jar = await cookies();
  return NextResponse.json({ premium: jar.get(DESK_PASS_COOKIE)?.value === "1" });
}

export async function POST() {
  return NextResponse.json(
    { error: "Pay with Stripe checkout" },
    { status: 400 },
  );
}

export async function DELETE() {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const store = await getDeskStore();
  const live = activePassForUser(store, account.id);
  const stripe = await cancelStripeForUser(store, account.id);
  if (stripeConfigured() && stripe.error && stripe.scheduled.length === 0) {
    return NextResponse.json({ error: stripe.error }, { status: 502 });
  }

  const expiresAt = stripe.scheduled.length
    ? stripe.expiresAt
    : live?.expiresAt ?? plusMonth();

  await updateDeskStore((next) => schedulePassCancel(next, account.id, expiresAt));

  const res = NextResponse.json({
    ok: true,
    premium: true,
    cancelAtPeriodEnd: true,
    expiresAt,
  });
  res.cookies.set(passCookie("1", remainingSeconds(expiresAt)));
  return res;
}

function remainingSeconds(iso: string) {
  return Math.max(60, Math.ceil((Date.parse(iso) - Date.now()) / 1000));
}
