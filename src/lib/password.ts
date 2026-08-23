import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import type { AccountRole, PublicAccount } from "./desk-types";

function secret() {
  return process.env.HW_SECRET || "hustlewire-local-office";
}

const scrypt = { maxmem: 64 * 1024 * 1024 };

export type SessionAccount = PublicAccount & { exp: number };

export function newDeskId() {
  return `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32, scrypt).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32, scrypt);
  const left = Buffer.from(hash, "hex");
  if (left.length !== next.length) return false;
  return timingSafeEqual(left, next);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function same(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function createSessionToken(account: PublicAccount) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      exp,
    }),
    "utf8",
  ).toString("base64url");
  const body = `acc2.${payload}`;
  return `${body}.${sign(body)}`;
}

export function readSession(token: string | undefined): SessionAccount | null {
  if (!token) return null;
  const parts = token.split(".");

  if (parts[0] === "acc2" && parts.length === 3) {
    const body = `${parts[0]}.${parts[1]}`;
    if (!same(sign(body), parts[2])) return null;
    try {
      const parsed = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8")) as Partial<SessionAccount>;
      if (!parsed.id || !parsed.email || Number(parsed.exp) < Date.now()) return null;
      const role: AccountRole = parsed.role === "owner" ? "owner" : "user";
      return {
        id: parsed.id,
        email: parsed.email,
        name: parsed.name || parsed.email,
        role,
        exp: Number(parsed.exp),
      };
    } catch {
      return null;
    }
  }

  if (parts[0] === "acc" && parts.length === 4) {
    const [kind, userId, exp, sig] = parts;
    if (!userId) return null;
    const payload = `${kind}.${userId}.${exp}`;
    if (!same(sign(payload), sig) || Number(exp) < Date.now()) return null;
    return { id: userId, email: "", name: "", role: "user", exp: Number(exp) };
  }

  return null;
}

export function readSessionToken(token: string | undefined) {
  return readSession(token)?.id ?? null;
}
