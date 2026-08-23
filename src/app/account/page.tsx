import Link from "next/link";
import { AccountForm, SignOutButton } from "@/components/AccountForm";
import { SubscribeButton } from "@/components/SubscribeButton";
import { UnsubscribeSection } from "@/components/UnsubscribeSection";
import { PassRemaining } from "@/components/PassRemaining";
import { getAccount } from "@/lib/account";
import { getDeskPassInfo, hasDeskPass } from "@/lib/pass";
import { deskPass } from "@/lib/premium";
import { btn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Account",
};

function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; unlock?: string }>;
}) {
  const query = await searchParams;
  const account = await getAccount();
  const premium = await hasDeskPass();
  const pass = await getDeskPassInfo();
  const next = safeNext(query.next);
  const unlock = query.unlock === "1";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        Your account
      </p>
      <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">
        {account ? account.name : "Login to your account"}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
        {account
          ? "Desk Pass lives on this account. Sign out here when you’re done."
          : `Create an account to unlock Desk Pass (${deskPass.priceLabel}). The news stays free without one.`}
      </p>

      {account ? (
        <div className="mt-10 space-y-6">
          <section className="rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-[#d8ff3c]">
              {account.role === "owner" ? "Owner" : "Signed in"}
            </p>
            <p className="mt-2 font-serif text-2xl text-white">{account.email}</p>
            {pass?.unlimited ? (
              <p className="mt-2 text-sm text-zinc-300">Desk Pass is unlimited on this account.</p>
            ) : pass?.expiresAt ? (
              <div className="mt-2">
                <PassRemaining expiresAt={pass.expiresAt} canceling={pass.cancelAtPeriodEnd} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-300">
                {premium
                  ? "Desk Pass is on this account."
                  : "No Desk Pass yet. Unlock it to open playbooks and My Desk."}
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              {premium ? (
                <Link href="/my-desk" className={btn.primary}>
                  Open My Desk
                </Link>
              ) : unlock ? (
                <SubscribeButton from={next} />
              ) : (
                <Link href="/premium" className={btn.primary}>
                  Get Desk Pass
                </Link>
              )}
              {account.role === "owner" ? (
                <Link href="/office" className={btn.ghost}>
                  Office
                </Link>
              ) : null}
              <SignOutButton />
            </div>
          </section>
          {premium && !pass?.unlimited ? (
            <UnsubscribeSection
              expiresAt={pass?.expiresAt ?? undefined}
              canceling={pass?.cancelAtPeriodEnd}
            />
          ) : null}
        </div>
      ) : (
        <>
          {unlock ? (
            <p className="mt-6 rounded-3xl border border-[#d8ff3c]/40 bg-[#d8ff3c]/10 px-5 py-4 text-sm text-zinc-200">
              Desk Pass needs an account. Create one or sign in, then it unlocks.
            </p>
          ) : null}
          <AccountForm next={next} unlock={unlock} />
        </>
      )}
    </main>
  );
}
