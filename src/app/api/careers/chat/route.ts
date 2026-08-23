import { NextResponse } from "next/server";
import { getAccount, isOwner } from "@/lib/account";
import { updateDeskStore, getDeskStore } from "@/lib/desk-store";
import type { WriterChatMessage } from "@/lib/desk-types";
import { newDeskId } from "@/lib/password";
import { isApprovedWriter } from "@/lib/writers";

export async function GET(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const asked = url.searchParams.get("userId") ?? "";
  const owner = await isOwner();
  const store = await getDeskStore();

  if (owner) {
    const userId = asked;
    if (!userId) return NextResponse.json({ messages: [] });
    const messages = (store.chats ?? []).filter((item) => item.userId === userId);
    return NextResponse.json({ messages });
  }

  if (!isApprovedWriter(store.applications, account.id)) {
    return NextResponse.json({ error: "Not approved" }, { status: 403 });
  }

  const messages = (store.chats ?? []).filter((item) => item.userId === account.id);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const account = await getAccount();
  if (!account) {
    return NextResponse.json({ error: "Account required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { text?: string; userId?: string };
  const text = (body.text ?? "").trim().slice(0, 1000);
  if (text.length < 1) {
    return NextResponse.json({ error: "Write a message" }, { status: 400 });
  }

  const owner = await isOwner();

  const result = await updateDeskStore((store) => {
    if (!Array.isArray(store.chats)) store.chats = [];

    if (owner) {
      const userId = (body.userId ?? "").trim();
      if (!userId) return { error: "Pick a writer" as const };
      if (!isApprovedWriter(store.applications, userId)) {
        return { error: "That writer is not approved" as const };
      }
      const message: WriterChatMessage = {
        id: newDeskId(),
        userId,
        from: "owner",
        body: text,
        createdAt: new Date().toISOString(),
      };
      store.chats.push(message);
      return { message };
    }

    if (!isApprovedWriter(store.applications, account.id)) {
      return { error: "Not approved" as const };
    }
    const message: WriterChatMessage = {
      id: newDeskId(),
      userId: account.id,
      from: "writer",
      body: text,
      createdAt: new Date().toISOString(),
    };
    store.chats.push(message);
    return { message };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: result.message });
}
