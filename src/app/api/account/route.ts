import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDeskStore, recordLogin, updateDeskStore } from "@/lib/desk-store";
import type { Account } from "@/lib/desk-types";
import { ACCOUNT_COOKIE, MONTH_SECONDS, accountCookie } from "@/lib/ids";
import { toPublicAccount } from "@/lib/account";
import {
  createSessionToken,
  hashPassword,
  newDeskId,
  readSessionToken,
  verifyPassword,
} from "@/lib/password";
import { isEmail, normalizeEmail } from "@/lib/video";

function sessionResponse(account: Account) {
  const res = NextResponse.json({ ok: true, account: toPublicAccount(account) });
  res.cookies.set(accountCookie(createSessionToken(account.id), MONTH_SECONDS));
  return res;
}

export async function GET() {
  const jar = await cookies();
  const userId = readSessionToken(jar.get(ACCOUNT_COOKIE)?.value);
  if (!userId) return NextResponse.json({ account: null });
  const store = await getDeskStore();
  const account = store.users.find((user) => user.id === userId);
  return NextResponse.json({ account: account ? toPublicAccount(account) : null });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: "login" | "signup";
    name?: string;
    email?: string;
    password?: string;
    privacy?: boolean;
  };
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const name = (body.name ?? "").trim().slice(0, 80);

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Add a real email" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password needs 6+ characters" }, { status: 400 });
  }

  if (body.action === "signup") {
    if (name.length < 2) {
      return NextResponse.json({ error: "Add your name" }, { status: 400 });
    }
    if (!body.privacy) {
      return NextResponse.json({ error: "Agree to the privacy policy to create an account" }, { status: 400 });
    }
    const result = await updateDeskStore((store) => {
      if (store.users.some((user) => user.email === email)) {
        return { error: "That email already has an account" as const };
      }
      const account: Account = {
        id: newDeskId(),
        email,
        name,
        passwordHash: hashPassword(password),
        role: "user",
        createdAt: new Date().toISOString(),
      };
      store.users.push(account);
      recordLogin(store, account, "signup");
      return { account };
    });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return sessionResponse(result.account);
  }

  const result = await updateDeskStore((store) => {
    const account = store.users.find((user) => user.email === email);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      return { error: "Wrong email or password" as const };
    }
    recordLogin(store, account, "login");
    return { account };
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return sessionResponse(result.account);
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(accountCookie("", 0));
  return res;
}
