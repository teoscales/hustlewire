import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fulfillCheckout, getStripe, safeNextPath } from "@/lib/stripe";
import { updateDeskStore } from "@/lib/desk-store";
import { ACCOUNT_COOKIE, MONTH_SECONDS } from "@/lib/ids";
import { passCookie } from "@/lib/premium";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const next = safeNextPath(url.searchParams.get("next"));
  if (!sessionId) {
    return NextResponse.redirect(new URL("/premium", url.origin));
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  if (session.status !== "complete") {
    return NextResponse.redirect(new URL("/premium", url.origin));
  }

  await updateDeskStore((store) => fulfillCheckout(store, session));

  const res = NextResponse.redirect(new URL(next, url.origin));
  const jar = await cookies();
  if (jar.get(ACCOUNT_COOKIE)?.value) {
    res.cookies.set(passCookie("1", MONTH_SECONDS));
  }
  return res;
}
