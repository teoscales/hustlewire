import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

function secret() {
  return process.env.HW_SECRET || "hustlewire-local-office";
}

export function newDeskId() {
  return `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const left = Buffer.from(hash, "hex");
  if (left.length !== next.length) return false;
  return timingSafeEqual(left, next);
}

export function createSessionToken(userId: string) {
  const exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = `acc.${userId}.${exp}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [kind, userId, exp, sig] = parts;
  if (!userId) return null;
  const payload = `${kind}.${userId}.${exp}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(sig);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  if (kind !== "acc" || Number(exp) < Date.now()) return null;
  return userId;
}
