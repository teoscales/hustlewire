import { cookies } from "next/headers";
import { activePassForUser, getDeskStore, userHasPass } from "./desk-store";
import { getAccount } from "./account";
import { PROMO_COOKIE } from "./ids";
import { STUDIO_COOKIE } from "./premium";
import { parseStudio, type Studio } from "./studio";

export async function hasDeskPass() {
  const account = await getAccount();
  if (!account) return false;
  const store = await getDeskStore();
  return userHasPass(store, account.id);
}

export async function getDeskPassInfo() {
  const account = await getAccount();
  if (!account) return null;
  const store = await getDeskStore();
  const pass = activePassForUser(store, account.id);
  if (!pass) return null;
  return {
    expiresAt: pass.expiresAt,
    cancelAtPeriodEnd: Boolean(pass.cancelAtPeriodEnd),
  };
}

export async function getMyPromo() {
  const account = await getAccount();
  const jar = await cookies();
  const promoId = jar.get(PROMO_COOKIE)?.value;
  const store = await getDeskStore();
  if (account) {
    const mine = store.promos.find((item) => item.userId === account.id);
    if (mine) return mine;
  }
  if (promoId) return store.promos.find((item) => item.id === promoId) ?? null;
  return null;
}

export async function getStudio(): Promise<Studio> {
  const jar = await cookies();
  return parseStudio(jar.get(STUDIO_COOKIE)?.value);
}
