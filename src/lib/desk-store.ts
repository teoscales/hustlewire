import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { blobConfigured, blobGetDesk, blobSetDesk } from "./desk-blob";
import { kvConfigured, kvGetDesk, kvSetDesk } from "./desk-kv";
import type { WireStory } from "./desk-types";
import { ownerLogins } from "./office-auth";
import { hashPassword, newDeskId, verifyPassword } from "./password";
import { deskPass } from "./premium";
import type {
  Account,
  DeskPassRecord,
  DeskStore,
  PromoRecord,
  SaleRecord,
  WriterApplication,
} from "./desk-types";

export type {
  Account,
  DeskPassRecord,
  DeskStore,
  PassKind,
  PromoRecord,
  PromoStatus,
  PublicAccount,
  SaleRecord,
} from "./desk-types";

export function accountStatus(store: DeskStore, user: Account) {
  if (user.role === "owner") return "Owner";
  if (userHasPass(store, user.id)) return "Desk Pass";
  const writer = store.applications.find((item) => item.userId === user.id);
  if (writer?.status === "approved") return "Writer";
  if (writer?.status === "pending") return "Writer pending";
  return "Free";
}

export function officeLogins(store: DeskStore) {
  const logins = [...(store.logins ?? [])];
  const seen = new Set(
    logins.filter((item) => item.kind === "signup").map((item) => item.email),
  );
  for (const user of store.users) {
    if (user.role === "owner" || seen.has(user.email)) continue;
    logins.push({
      id: `signup-${user.id}`,
      userId: user.id,
      email: user.email,
      name: user.name,
      kind: "signup",
      role: user.role,
      status: accountStatus(store, user),
      createdAt: user.createdAt,
    });
  }
  return logins.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50);
}

function mergeById<T extends { id: string }>(left: T[], right: T[]) {
  const map = new Map<string, T>();
  for (const item of left) map.set(item.id, item);
  for (const item of right) map.set(item.id, item);
  return [...map.values()];
}

function mergeUsers(left: Account[], right: Account[]) {
  const map = new Map<string, Account>();
  for (const user of [...left, ...right]) {
    const prev = map.get(user.email);
    if (!prev) {
      map.set(user.email, user);
      continue;
    }
    map.set(user.email, {
      ...prev,
      ...user,
      role: prev.role === "owner" || user.role === "owner" ? "owner" : user.role,
      createdAt: prev.createdAt < user.createdAt ? prev.createdAt : user.createdAt,
    });
  }
  return [...map.values()];
}

function mergeStores(remote: DeskStore, local: DeskStore): DeskStore {
  const logins = mergeById(remote.logins ?? [], local.logins ?? []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return {
    seeded: Boolean(local.seeded || remote.seeded),
    users: mergeUsers(remote.users, local.users),
    passes: mergeById(remote.passes, local.passes),
    sales: mergeById(remote.sales, local.sales),
    promos: mergeById(remote.promos, local.promos),
    applications: mergeById(remote.applications, local.applications),
    tips: mergeById(remote.tips, local.tips),
    chats: mergeById(remote.chats, local.chats),
    logins: logins.slice(0, 200),
    stories: mergeById(remote.stories ?? [], local.stories ?? []),
  };
}

async function readRemoteStore() {
  if (blobConfigured()) {
    const raw = await blobGetDesk();
    if (raw) return parseStore(raw);
  }
  if (kvConfigured()) {
    const raw = await kvGetDesk();
    if (raw) return parseStore(raw);
  }
  return null;
}

export function recordLogin(store: DeskStore, user: Account, kind: "signup" | "login") {
  if (!Array.isArray(store.logins)) store.logins = [];
  store.logins.unshift({
    id: newDeskId(),
    userId: user.id,
    email: user.email,
    name: user.name,
    kind,
    role: user.role,
    status: accountStatus(store, user),
    createdAt: new Date().toISOString(),
  });
  store.logins = store.logins.slice(0, 200);
}

const ownerVerified = new Set<string>();

function ensureOwner(store: DeskStore) {
  if (!Array.isArray(store.users)) store.users = [];
  if (!Array.isArray(store.logins)) store.logins = [];
  const emails = new Set(ownerLogins.map((owner) => owner.email));
  store.users = store.users.filter((user) => user.role !== "owner" || emails.has(user.email));

  let next: DeskStore = store;
  ownerLogins.forEach((login, index) => {
    if (!login.password) return;
    next = upsertOwner(next, login, index === 0 ? "user-owner" : `user-owner-${index + 1}`);
  });
  return next;
}

function upsertOwner(
  store: DeskStore,
  login: { email: string; password: string },
  id: string,
): DeskStore {
  const existing =
    store.users.find((user) => user.email === login.email) ??
    store.users.find((user) => user.id === id);
  if (existing) {
    const mark = `${existing.id}:${login.password}`;
    if (ownerVerified.has(mark) && existing.role === "owner" && existing.email === login.email) {
      return store;
    }
    if (
      existing.role === "owner" &&
      existing.email === login.email &&
      verifyPassword(login.password, existing.passwordHash)
    ) {
      ownerVerified.add(mark);
      return store;
    }
    return {
      ...store,
      users: store.users.map((user) =>
        user.id === existing.id
          ? {
              ...user,
              id: existing.role === "owner" ? existing.id : id,
              email: login.email,
              name: user.name || "Owner",
              passwordHash: hashPassword(login.password),
              role: "owner",
            }
          : user,
      ),
    };
  }
  const owner: Account = {
    id,
    email: login.email,
    name: "Owner",
    passwordHash: hashPassword(login.password),
    role: "owner",
    createdAt: new Date().toISOString(),
  };
  return { ...store, users: [owner, ...store.users] };
}

function emptyStore(): DeskStore {
  return {
    seeded: false,
    users: [],
    passes: [],
    sales: [],
    promos: [],
    applications: [],
    tips: [],
    chats: [],
    logins: [],
    stories: [],
  };
}

const storeDir = path.join(process.cwd(), "data");
const storePath = path.join(storeDir, "desk.json");
const tmpPath = path.join("/tmp", "hustlewire-desk.json");

function readPaths() {
  return process.env.VERCEL ? [tmpPath, storePath] : [storePath, tmpPath];
}

function writePaths() {
  return process.env.VERCEL ? [tmpPath] : [storePath];
}

function normalizeApplications(raw: unknown): WriterApplication[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<WriterApplication> & { situation?: string };
    if (!row.id) return [];
    const status =
      row.status === "approved" || row.status === "rejected" || row.status === "pending"
        ? row.status
        : "pending";
    return [
      {
        id: row.id,
        userId: typeof row.userId === "string" ? row.userId : "",
        name: row.name ?? "",
        email: row.email ?? "",
        note: row.note || row.situation || "",
        createdAt: row.createdAt ?? new Date().toISOString(),
        reviewedAt: row.reviewedAt ?? null,
        status,
      },
    ];
  });
}

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(job: () => Promise<T>) {
  const run = queue.then(job, job);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function parseStore(raw: string): DeskStore {
  const parsed = JSON.parse(raw) as Partial<DeskStore>;
  return {
    seeded: Boolean(parsed.seeded),
    users: Array.isArray(parsed.users) ? parsed.users : [],
    passes: Array.isArray(parsed.passes) ? parsed.passes : [],
    sales: Array.isArray(parsed.sales) ? parsed.sales : [],
    promos: Array.isArray(parsed.promos) ? parsed.promos : [],
    applications: normalizeApplications(parsed.applications),
    tips: Array.isArray(parsed.tips) ? parsed.tips : [],
    chats: Array.isArray(parsed.chats) ? parsed.chats : [],
    logins: Array.isArray(parsed.logins) ? parsed.logins : [],
    stories: normalizeStories(parsed.stories),
  };
}

function normalizeStories(raw: unknown): WireStory[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Partial<WireStory> & { article?: { slug?: string; title?: string } };
    if (!row.id || !row.article?.slug || !row.article?.title) return [];
    const status = row.status === "live" ? "live" : "draft";
    return [
      {
        id: row.id,
        status,
        createdAt: row.createdAt ?? new Date().toISOString(),
        updatedAt: row.updatedAt ?? row.createdAt ?? new Date().toISOString(),
        publishedAt: row.publishedAt ?? (status === "live" ? row.createdAt ?? null : null),
        article: row.article as WireStory["article"],
      },
    ];
  });
}

async function readStore(): Promise<DeskStore> {
  const remote = await readRemoteStore();
  if (remote) {
    const next = ensureOwner(remote);
    if (next !== remote) await writeStore(next);
    return next;
  }
  for (const file of readPaths()) {
    try {
      const store = parseStore(await readFile(file, "utf8"));
      const next = ensureOwner(store);
      await writeStore(next);
      return next;
    } catch {
      // try the next path
    }
  }
  const empty = ensureOwner(emptyStore());
  await writeStore(empty);
  return empty;
}

async function writeStore(store: DeskStore) {
  let next = store;
  const remote = await readRemoteStore();
  if (remote) next = ensureOwner(mergeStores(remote, store));
  const body = JSON.stringify(next, null, 2);
  if (blobConfigured()) {
    try {
      await blobSetDesk(body);
    } catch {
      // Keep local cache if blob is down.
    }
  }
  if (kvConfigured()) await kvSetDesk(body);
  for (const file of writePaths()) {
    try {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
      return;
    } catch {
      // Vercel’s app filesystem is read-only; /tmp still works as a local cache.
    }
  }
}

export async function getDeskStore() {
  return enqueue(() => readStore());
}

export async function updateDeskStore<T>(fn: (store: DeskStore) => T | Promise<T>) {
  return enqueue(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
}

export function isActivePass(pass: DeskPassRecord, now = Date.now()) {
  if (pass.endedAt) return false;
  return new Date(pass.expiresAt).getTime() > now;
}

export function activePasses(store: DeskStore, now = Date.now()) {
  const latest = new Map<string, DeskPassRecord>();
  for (const pass of store.passes) {
    if (!isActivePass(pass, now)) continue;
    const key = pass.userId || pass.visitorId;
    const current = latest.get(key);
    if (!current || current.expiresAt < pass.expiresAt) {
      latest.set(key, pass);
    }
  }
  return [...latest.values()];
}

export function userHasPass(store: DeskStore, userId: string | null, now = Date.now()) {
  if (!userId) return false;
  const user = store.users.find((item) => item.id === userId);
  if (user?.role === "owner") return true;
  return store.passes.some((pass) => pass.userId === userId && isActivePass(pass, now));
}

export function visitorHasPass(store: DeskStore, visitorId: string | null, now = Date.now()) {
  if (!visitorId) return false;
  return store.passes.some((pass) => pass.visitorId === visitorId && isActivePass(pass, now));
}

export function monthBounds(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
}

export function officeStats(store: DeskStore, now = new Date()) {
  const { start, end } = monthBounds(now);
  const live = activePasses(store, now.getTime());
  const monthSales = store.sales.filter((sale) => {
    const at = new Date(sale.createdAt);
    return at >= start && at < end;
  });
  const revenue = store.sales.reduce((sum, sale) => sum + sale.amount, 0);
  const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.amount, 0);
  return {
    revenue,
    monthRevenue,
    saleCount: store.sales.length,
    monthSaleCount: monthSales.length,
    price: deskPass.price,
    activeCount: live.length,
    paidActive: live.filter((pass) => pass.kind === "paid").length,
    promoActive: live.filter((pass) => pass.kind === "promo").length,
    pendingReviews: store.promos.filter((promo) => promo.status === "pending").length,
    approvedPromos: store.promos.filter((promo) => promo.status === "approved").length,
  };
}

export function plusMonth(from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + 30);
  return next.toISOString();
}

export function startPaidPass(
  store: DeskStore,
  who: {
    visitorId: string;
    userId: string;
    name: string;
    email: string;
    expiresAt?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeSessionId?: string;
  },
) {
  const existing = store.passes.find(
    (pass) => pass.userId === who.userId && isActivePass(pass),
  );
  if (existing) {
    if (who.expiresAt) existing.expiresAt = who.expiresAt;
    if (who.stripeCustomerId) existing.stripeCustomerId = who.stripeCustomerId;
    if (who.stripeSubscriptionId) existing.stripeSubscriptionId = who.stripeSubscriptionId;
    if (who.stripeSessionId) existing.stripeSessionId = who.stripeSessionId;
    existing.kind = "paid";
    existing.endedAt = null;
    existing.cancelAtPeriodEnd = false;
    let sale: SaleRecord | null = null;
    if (
      who.stripeSessionId &&
      !store.sales.some((row) => row.stripeSessionId === who.stripeSessionId)
    ) {
      sale = {
        id: newDeskId(),
        passId: existing.id,
        visitorId: who.visitorId,
        userId: who.userId,
        amount: deskPass.price,
        createdAt: new Date().toISOString(),
        name: who.name,
        email: who.email,
        stripeSessionId: who.stripeSessionId,
      };
      store.sales.push(sale);
    }
    return { pass: existing, sale, created: false };
  }

  const now = new Date().toISOString();
  const pass: DeskPassRecord = {
    id: newDeskId(),
    visitorId: who.visitorId,
    userId: who.userId,
    kind: "paid",
    createdAt: now,
    expiresAt: who.expiresAt ?? plusMonth(),
    endedAt: null,
    name: who.name,
    email: who.email,
    stripeCustomerId: who.stripeCustomerId,
    stripeSubscriptionId: who.stripeSubscriptionId,
    stripeSessionId: who.stripeSessionId,
    cancelAtPeriodEnd: false,
  };
  const sale: SaleRecord = {
    id: newDeskId(),
    passId: pass.id,
    visitorId: who.visitorId,
    userId: who.userId,
    amount: deskPass.price,
    createdAt: now,
    name: who.name,
    email: who.email,
    stripeSessionId: who.stripeSessionId,
  };
  store.passes.push(pass);
  store.sales.push(sale);
  return { pass, sale, created: true };
}

export function endUserPass(store: DeskStore, userId: string) {
  const now = new Date().toISOString();
  for (const pass of store.passes) {
    if (pass.userId === userId && isActivePass(pass)) {
      pass.endedAt = now;
    }
  }
}

export function schedulePassCancel(store: DeskStore, userId: string, expiresAt: string) {
  for (const pass of store.passes) {
    if (pass.userId === userId && isActivePass(pass)) {
      pass.cancelAtPeriodEnd = true;
      pass.expiresAt = expiresAt;
      pass.endedAt = null;
    }
  }
}

export function syncPassPeriod(
  store: DeskStore,
  userId: string,
  expiresAt: string,
  cancelAtPeriodEnd: boolean,
) {
  for (const pass of store.passes) {
    if (pass.userId === userId && isActivePass(pass)) {
      pass.expiresAt = expiresAt;
      pass.cancelAtPeriodEnd = cancelAtPeriodEnd;
      pass.endedAt = null;
    }
  }
}

export function activePassForUser(store: DeskStore, userId: string) {
  return store.passes.find((pass) => pass.userId === userId && isActivePass(pass)) ?? null;
}

export function grantPromoPass(store: DeskStore, promo: PromoRecord, userId?: string) {
  if (promo.passId) {
    const existing = store.passes.find((pass) => pass.id === promo.passId);
    if (existing) {
      if (userId && !existing.userId) existing.userId = userId;
      if (userId) promo.userId = userId;
      return existing;
    }
  }
  const now = new Date().toISOString();
  const pass: DeskPassRecord = {
    id: newDeskId(),
    visitorId: promo.visitorId,
    userId: userId ?? promo.userId,
    kind: "promo",
    createdAt: now,
    expiresAt: plusMonth(),
    endedAt: null,
    name: promo.name,
    email: promo.email,
    cancelAtPeriodEnd: false,
  };
  store.passes.push(pass);
  promo.claimedAt = now;
  promo.passId = pass.id;
  if (userId) promo.userId = userId;
  return pass;
}
