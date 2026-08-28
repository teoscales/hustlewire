import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { dismissGiftNote } from "@/lib/desk-gifts";
import { updateDeskStore } from "@/lib/desk-store";

export async function POST() {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  await updateDeskStore((store) => {
    dismissGiftNote(store, account.email);
    return { ok: true as const };
  });
  return NextResponse.json({ ok: true });
}
