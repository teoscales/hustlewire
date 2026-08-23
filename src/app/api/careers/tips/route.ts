import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { updateDeskStore } from "@/lib/desk-store";
import type { SituationTip } from "@/lib/desk-types";
import { newDeskId } from "@/lib/password";
import { isApprovedWriter } from "@/lib/writers";
import { writerPay } from "@/lib/premium";

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };
  const note = (body.note ?? "").trim().slice(0, 500);

  if (note.length < 12) {
    return NextResponse.json(
      { error: "Tell us the situation in a few lines" },
      { status: 400 },
    );
  }

  const result = await updateDeskStore((store) => {
    if (!Array.isArray(store.applications)) store.applications = [];
    if (!Array.isArray(store.tips)) store.tips = [];
    if (!isApprovedWriter(store.applications, account.id)) {
      return { error: "Writer desk is closed until you’re approved" as const };
    }
    const user = store.users.find((item) => item.id === account.id);
    const paypalEmail = user?.paypalEmail?.trim().toLowerCase() ?? "";
    if (!paypalEmail) {
      return { error: "Link PayPal before you send" as const };
    }

    const tip: SituationTip = {
      id: newDeskId(),
      userId: account.id,
      name: account.name,
      email: account.email,
      note,
      createdAt: new Date().toISOString(),
      amount: writerPay.perTip,
      status: "open",
      paypalEmail,
    };
    store.tips.unshift(tip);
    return { tip };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, amount: result.tip.amount });
}
