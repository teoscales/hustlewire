import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { grantPromoPass, updateDeskStore } from "@/lib/desk-store";
import type { PromoRecord } from "@/lib/desk-types";
import { MONTH_SECONDS, PROMO_COOKIE, VISITOR_COOKIE, promoCookie, visitorCookie } from "@/lib/ids";
import { newDeskId } from "@/lib/password";
import { passCookie } from "@/lib/premium";
import { parseVideoLink } from "@/lib/video";

function visitorFrom(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get(VISITOR_COOKIE)?.value || newDeskId();
}

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }
  const jar = await cookies();
  const visitorId = visitorFrom(jar);
  const body = (await request.json()) as { videoUrl?: string; note?: string };
  const note = (body.note ?? "").trim().slice(0, 400);
  const video = parseVideoLink(body.videoUrl ?? "");

  if (!video) {
    return NextResponse.json(
      { error: "Paste a YouTube, TikTok, Instagram, X, or Vimeo link" },
      { status: 400 },
    );
  }

  const result = await updateDeskStore((store) => {
    const open = store.promos.find(
      (promo) => promo.userId === account.id && promo.status === "pending",
    );
    if (open) return { error: "You already have a video in review" as const };

    const promo: PromoRecord = {
      id: newDeskId(),
      visitorId,
      userId: account.id,
      name: account.name,
      email: account.email,
      videoUrl: video.url,
      note,
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: "",
      claimedAt: null,
      passId: null,
    };
    store.promos.unshift(promo);
    return { promo };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, promo: result.promo });
  res.cookies.set(visitorCookie(visitorId));
  res.cookies.set(promoCookie(result.promo.id));
  return res;
}

export async function PATCH() {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }
  const jar = await cookies();
  const promoId = jar.get(PROMO_COOKIE)?.value;

  const result = await updateDeskStore((store) => {
    const promo = store.promos.find(
      (item) =>
        item.status === "approved" &&
        (item.userId === account.id || item.id === promoId),
    );
    if (!promo) return { error: "Nothing to claim yet" as const };
    const pass = grantPromoPass(store, promo, account.id);
    return { promo, pass };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, premium: true });
  res.cookies.set(visitorCookie(result.promo.visitorId));
  res.cookies.set(passCookie("1", MONTH_SECONDS));
  return res;
}
