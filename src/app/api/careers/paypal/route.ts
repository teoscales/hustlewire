import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { updateDeskStore } from "@/lib/desk-store";
import { isApprovedWriter } from "@/lib/writers";
import { isEmail, normalizeEmail } from "@/lib/video";

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const paypalEmail = normalizeEmail(body.email ?? "");
  if (!isEmail(paypalEmail)) {
    return NextResponse.json({ error: "Add the email on your PayPal" }, { status: 400 });
  }

  const result = await updateDeskStore((store) => {
    if (!isApprovedWriter(store.applications, account.id)) {
      return { error: "Writer desk is closed until you’re approved" as const };
    }
    const user = store.users.find((item) => item.id === account.id);
    if (!user) return { error: "Account not found" as const };
    user.paypalEmail = paypalEmail;
    return { paypalEmail };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, paypalEmail: result.paypalEmail });
}
