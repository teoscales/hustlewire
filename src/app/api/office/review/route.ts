import { NextResponse } from "next/server";
import { updateDeskStore } from "@/lib/desk-store";
import { isOwner } from "@/lib/account";

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }
  const body = (await request.json()) as {
    promoId?: string;
    action?: "approve" | "reject";
    note?: string;
  };
  if (!body.promoId || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Need a review action" }, { status: 400 });
  }

  const result = await updateDeskStore((store) => {
    const promo = store.promos.find((item) => item.id === body.promoId);
    if (!promo) return { error: "Review not found" as const };
    if (promo.status !== "pending") return { error: "Already reviewed" as const };
    promo.status = body.action === "approve" ? "approved" : "rejected";
    promo.reviewedAt = new Date().toISOString();
    promo.reviewNote = (body.note ?? "").trim().slice(0, 240);
    return { promo };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, promo: result.promo });
}
