import { NextResponse } from "next/server";
import { isOwner } from "@/lib/account";

export async function POST() {
  return NextResponse.json(
    { error: "Use /account to sign in. Owner accounts open the office." },
    { status: 410 },
  );
}

export async function DELETE() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, hint: "Sign out from your account." });
}
