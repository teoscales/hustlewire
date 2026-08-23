import { cookies } from "next/headers";
import { getDeskStore } from "./desk-store";
import type { PublicAccount } from "./desk-types";
import { ACCOUNT_COOKIE } from "./ids";
import { readSession } from "./password";

export function toPublicAccount(account: {
  id: string;
  email: string;
  name: string;
  role: PublicAccount["role"];
}): PublicAccount {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
  };
}

export async function getAccount(): Promise<PublicAccount | null> {
  const jar = await cookies();
  const session = readSession(jar.get(ACCOUNT_COOKIE)?.value);
  if (!session) return null;
  try {
    const store = await getDeskStore();
    const account =
      store.users.find((user) => user.id === session.id) ??
      (session.email ? store.users.find((user) => user.email === session.email) : undefined);
    if (account) return toPublicAccount(account);
  } catch {
    // Session still signs them in if the store is empty or down.
  }
  if (session.email) return toPublicAccount(session);
  return null;
}

export async function isOwner() {
  const account = await getAccount();
  return account?.role === "owner";
}

export function accountPath(next?: string, unlock = false) {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (unlock) params.set("unlock", "1");
  const query = params.toString();
  return query ? `/account?${query}` : "/account";
}
