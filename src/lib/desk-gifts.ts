import { newDeskId } from "./password";
import type { Account, DeskAnnouncement, DeskGift, DeskPassRecord, DeskStore } from "./desk-types";
import { normalizeEmail } from "./video";

const giftNoteTitle = "You got gifted 5 months of Desk Pass";
const giftNoteBody =
  "The desk is open. Playbooks and My Desk are yours for five months. This note only shows once.";

const plannedGifts: { id: string; email: string; months: number; note: boolean }[] = [
  { id: "gift:kirilovcode@gmail.com:5", email: "kirilovcode@gmail.com", months: 5, note: true },
  {
    id: "gift:teo.tselidis@icloud.com:note",
    email: "teo.tselidis@icloud.com",
    months: 0,
    note: true,
  },
];

function plusMonths(count: number, from = new Date()) {
  const next = new Date(from);
  next.setMonth(next.getMonth() + count);
  return next.toISOString();
}

function latestActivePass(store: DeskStore, userId: string) {
  return store.passes
    .filter((pass) => pass.userId === userId && !pass.endedAt && Date.parse(pass.expiresAt) > Date.now())
    .sort((a, b) => b.expiresAt.localeCompare(a.expiresAt))[0];
}

function grantMonths(store: DeskStore, user: Account, months: number) {
  const live = latestActivePass(store, user.id);
  const from = live && Date.parse(live.expiresAt) > Date.now() ? new Date(live.expiresAt) : new Date();
  const expiresAt = plusMonths(months, from);
  if (live) {
    live.expiresAt = expiresAt;
    live.endedAt = null;
    if (live.kind !== "paid") live.kind = "gift";
    return live;
  }
  const pass: DeskPassRecord = {
    id: newDeskId(),
    visitorId: user.id,
    userId: user.id,
    kind: "gift",
    createdAt: new Date().toISOString(),
    expiresAt,
    endedAt: null,
    name: user.name,
    email: user.email,
    cancelAtPeriodEnd: false,
  };
  store.passes.push(pass);
  return pass;
}

function queueNote(store: DeskStore, gift: DeskGift, user?: Account) {
  const id = `note:${gift.id}`;
  const existing = store.announcements.find((item) => item.id === id);
  if (existing) {
    if (user && !existing.userId) existing.userId = user.id;
    return existing;
  }
  const note: DeskAnnouncement = {
    id,
    email: gift.email,
    userId: user?.id,
    title: giftNoteTitle,
    body: giftNoteBody,
    createdAt: new Date().toISOString(),
    seenAt: null,
  };
  store.announcements.push(note);
  return note;
}

export function applyDeskGifts(store: DeskStore) {
  if (!Array.isArray(store.gifts)) store.gifts = [];
  if (!Array.isArray(store.announcements)) store.announcements = [];
  let dirty = false;

  for (const plan of plannedGifts) {
    const email = normalizeEmail(plan.email);
    let gift = store.gifts.find((item) => item.id === plan.id);
    if (!gift) {
      gift = { id: plan.id, email, months: plan.months, passId: null, grantedAt: null };
      store.gifts.push(gift);
      dirty = true;
    }
    const user = store.users.find((item) => item.email === email);
    if (plan.months > 0 && user && !gift.grantedAt) {
      const pass = grantMonths(store, user, plan.months);
      gift.passId = pass.id;
      gift.grantedAt = new Date().toISOString();
      dirty = true;
    }
    if (plan.note) {
      const before = store.announcements.length;
      queueNote(store, gift, user);
      if (store.announcements.length !== before) dirty = true;
      else if (user) {
        const note = store.announcements.find((item) => item.id === `note:${gift.id}`);
        if (note && !note.userId) {
          note.userId = user.id;
          dirty = true;
        }
      }
    }
  }

  return dirty;
}

export function unreadGiftNote(store: DeskStore, email: string | undefined) {
  if (!email) return null;
  const needle = normalizeEmail(email);
  return (
    store.announcements.find(
      (item) => item.email === needle && item.seenAt === null,
    ) ?? null
  );
}

export function dismissGiftNote(store: DeskStore, email: string) {
  const note = unreadGiftNote(store, email);
  if (!note) return false;
  note.seenAt = new Date().toISOString();
  return true;
}
