import { NextResponse } from "next/server";
import { getAccount } from "@/lib/account";
import { updateDeskStore } from "@/lib/desk-store";
import type { WriterApplication } from "@/lib/desk-types";
import { newDeskId } from "@/lib/password";
import { isApprovedWriter, latestApplication } from "@/lib/writers";

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { note?: string };
  const note = (body.note ?? "").trim().slice(0, 400);

  const result = await updateDeskStore((store) => {
    if (!Array.isArray(store.applications)) store.applications = [];
    if (isApprovedWriter(store.applications, account.id)) {
      return { error: "You’re already on the desk" as const };
    }
    const latest = latestApplication(store.applications, account.id);
    if (latest?.status === "pending") {
      return { error: "Your application is already with the desk" as const };
    }

    const application: WriterApplication = {
      id: newDeskId(),
      userId: account.id,
      name: account.name,
      email: account.email,
      note,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      status: "pending",
    };
    store.applications.unshift(application);
    return { application };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
