import Link from "next/link";
import { UnsubscribeSection } from "@/components/UnsubscribeSection";
import { getDeskPassInfo, hasDeskPass } from "@/lib/pass";
import { deskPass } from "@/lib/premium";
import { btn } from "@/lib/ui";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Unsubscribe",
  description: "Stop Desk Pass. The news and how to start stay free.",
};

export default async function UnsubscribePage() {
  const premium = await hasDeskPass();
  const pass = await getDeskPassInfo();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-300">Account</p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        Unsubscribe from Desk Pass
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
        {premium
          ? pass?.unlimited
            ? "Owner Desk Pass does not expire. Nothing to cancel."
            : pass?.cancelAtPeriodEnd
            ? "You already unsubscribed. The desk stays until the month you paid for ends."
            : `You’re on ${deskPass.name}. Cancel here and Stripe stops charging. You keep the desk until this month ends.`
          : "You’re not on Desk Pass. Nothing to cancel."}
      </p>

      {premium && !pass?.unlimited ? (
        <div className="mt-10">
          <UnsubscribeSection
            expiresAt={pass?.expiresAt ?? undefined}
            canceling={pass?.cancelAtPeriodEnd}
          />
        </div>
      ) : (
        <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
          <p className="text-sm leading-6 text-zinc-300">
            {pass?.unlimited
              ? "This owner account keeps Desk Pass. There is nothing to cancel."
              : "No active pass on this browser. You still get the wire and the first three moves."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/" className={btn.primary}>
              Back to the wire
            </Link>
            {pass?.unlimited ? (
              <Link href="/my-desk" className={btn.ghost}>
                Open My Desk
              </Link>
            ) : (
              <Link href="/premium" className={btn.ghost}>
                See Desk Pass
              </Link>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
