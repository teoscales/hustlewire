import { getAccount } from "./account";
import { getDeskStore } from "./desk-store";
import type { SituationTip, WriterApplication, WriterChatMessage } from "./desk-types";
import { writerPay } from "./premium";

export { writerPay };

export function latestApplication(
  applications: WriterApplication[] | undefined,
  userId: string,
) {
  return (
    (applications ?? [])
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  );
}

export function isApprovedWriter(
  applications: WriterApplication[] | undefined,
  userId: string,
) {
  return (applications ?? []).some(
    (item) => item.userId === userId && item.status === "approved",
  );
}

export function tipsForUser(tips: SituationTip[] | undefined, userId: string) {
  return (tips ?? []).filter((item) => item.userId === userId);
}

export function tipTotals(tips: SituationTip[]) {
  const owed = tips
    .filter((item) => item.status === "open")
    .reduce((sum, item) => sum + item.amount, 0);
  const paid = tips
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);
  return { count: tips.length, owed, paid, rate: writerPay.perTip };
}

export async function getWriterDesk() {
  const account = await getAccount();
  if (!account) {
    return {
      account: null,
      application: null,
      approved: false,
      paypalEmail: "",
      tips: [],
      messages: [] as WriterChatMessage[],
    };
  }
  const store = await getDeskStore();
  const user = store.users.find((item) => item.id === account.id);
  const application = latestApplication(store.applications, account.id);
  const approved = isApprovedWriter(store.applications, account.id);
  return {
    account,
    application,
    approved,
    paypalEmail: user?.paypalEmail ?? "",
    tips: tipsForUser(store.tips, account.id),
    messages: (store.chats ?? []).filter((item) => item.userId === account.id),
  };
}

export function writerThreads(store: {
  applications: WriterApplication[];
  chats?: WriterChatMessage[];
}) {
  const approved = (store.applications ?? []).filter((item) => item.status === "approved");
  const seen = new Set<string>();
  const threads = [];
  for (const application of approved) {
    if (!application.userId || seen.has(application.userId)) continue;
    seen.add(application.userId);
    const messages = (store.chats ?? []).filter((item) => item.userId === application.userId);
    threads.push({
      userId: application.userId,
      name: application.name,
      email: application.email,
      messages,
    });
  }
  return threads.sort((a, b) => {
    const aAt = a.messages.at(-1)?.createdAt ?? "";
    const bAt = b.messages.at(-1)?.createdAt ?? "";
    return bAt.localeCompare(aAt);
  });
}
