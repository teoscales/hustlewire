import { NextResponse } from "next/server";
import { isOwner } from "@/lib/account";
import { updateDeskStore } from "@/lib/desk-store";

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    action?: "paid" | "reject";
    note?: string;
  };
  if (!body.id || (body.action !== "paid" && body.action !== "reject")) {
    return NextResponse.json({ error: "Need a paid or reject action" }, { status: 400 });
  }

  const note = (body.note ?? "").trim().slice(0, 400);
  if (body.action === "reject" && note.length < 4) {
    return NextResponse.json({ error: "Add a reason they can read" }, { status: 400 });
  }

  const result = await updateDeskStore((store) => {
    const tip = store.tips?.find((item) => item.id === body.id);
    if (!tip) return { error: "Tip not found" as const };
    if (tip.status !== "open") return { error: "Already reviewed" as const };
    if (body.action === "paid") {
      tip.status = "paid";
      tip.reviewedAt = new Date().toISOString();
      return { tip };
    }
    tip.status = "rejected";
    tip.reviewNote = note;
    tip.reviewedAt = new Date().toISOString();
    tip.amount = 0;
    return { tip };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, tip: result.tip });
}
