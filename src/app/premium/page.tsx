import Link from "next/link";
import { accountPath, getAccount } from "@/lib/account";
import { getDeskPassInfo, hasDeskPass } from "@/lib/pass";
import { deskPass } from "@/lib/premium";
import { getDemoArticle } from "@/lib/articles";
import { btn } from "@/lib/ui";
import { UnsubscribeSection } from "@/components/UnsubscribeSection";
import { SubscribeButton } from "@/components/SubscribeButton";
import { PassRemaining } from "@/components/PassRemaining";
import { StoryView } from "@/components/StoryView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Desk Pass",
  description:
    "Free: news plus how to start. Desk Pass: full playbook and a slot for every idea you save.",
};

export default async function PremiumPage() {
  const premium = await hasDeskPass();
  const account = await getAccount();
  const pass = await getDeskPassInfo();
  const demo = getDemoArticle();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">Monthly</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
          How to start is free. The desk is paid.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
          News is ad-free. You get cash, speed, and the first three moves. Desk Pass is{" "}
          {deskPass.priceLabel} on your account: the full playbook, and My Desk.
        </p>
      </div>

      <div className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-2">
        <section
          className={`rounded-3xl border border-white/10 bg-zinc-900/40 p-6 ${
            premium ? "opacity-70" : ""
          }`}
        >
          <p className="text-xs text-zinc-500">{premium ? "Still included" : "Free · ad-free"}</p>
          <h2 className="mt-2 font-serif text-2xl">The wire</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
            <li>Every story, no ads</li>
            <li>What happened</li>
            <li>How to start: three moves, cash, speed</li>
          </ul>
        </section>
        <section
          className={`rounded-3xl p-6 ${
            premium
              ? "border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 text-white"
              : "border border-[#d8ff3c]/35 bg-zinc-900/60 text-white"
          }`}
        >
          <p className="text-xs text-[#d8ff3c]">
            {premium ? "Your plan" : `${deskPass.name} · ${deskPass.priceLabel}`}
          </p>
          <h2 className="mt-2 font-serif text-2xl">The desk</h2>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-zinc-300">
            <li>Full playbook on every story</li>
            <li>Save ideas. They all show in your slot</li>
            <li>Ask AI on each playbook, with questions for that situation</li>
          </ul>
        </section>
      </div>

      <div className="mt-8 max-w-md">
        {premium ? (
          <div className="rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
            <p className="inline-flex rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
              Unlocked
            </p>
            <p className="mt-3 font-serif text-2xl text-white">You’re on the desk</p>
            {pass?.unlimited ? (
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Desk Pass is unlimited on this account.
              </p>
            ) : pass?.expiresAt ? (
              <div className="mt-2">
                <PassRemaining expiresAt={pass.expiresAt} canceling={pass.cancelAtPeriodEnd} />
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                Playbooks are open. Save stories. They’re all in My Desk.
              </p>
            )}
            <div className="mt-5">
              <Link href="/my-desk" className={btn.primary}>
                Open My Desk
              </Link>
            </div>
          </div>
        ) : !account ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm leading-6 text-zinc-300">
              Desk Pass requires an account. Create one, then unlock.
            </p>
            <Link href={accountPath("/my-desk", true)} className={btn.primary}>
              Create account and unlock
            </Link>
            <Link href="/account" className={btn.ghost}>
              I already have an account
            </Link>
            <Link href="/promote" className={btn.quiet}>
              Or promote for 1 free month
            </Link>
          </div>
        ) : (
          <>
            <SubscribeButton from="/my-desk" />
            <Link href="/promote" className={`${btn.ghost} mt-4`}>
              Or promote for 1 free month
            </Link>
          </>
        )}
      </div>

      {!premium ? (
        <>
          <a
            href="#sample"
            className="mt-12 flex w-fit flex-col items-start gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <span>The demo desk is below</span>
            <span className="scroll-cue text-[#d8ff3c]" aria-hidden>
              ↓
            </span>
          </a>
          <section
            id="sample"
            className="mt-8 scroll-mt-24 rounded-[2rem] border-2 border-[#d8ff3c] bg-[#d8ff3c]/[0.07] p-5 sm:p-10"
          >
            <p className="inline-flex rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
              Demo
            </p>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Sample desk · 1:1
            </p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.08] text-white sm:text-5xl">
              Dummy story. Real desk layout.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300">
              Fake on purpose, not a HustleWire story. Scroll this block. The stack is 1:1 with a
              live pass: three free moves, full playbook, Ask AI, and the save action.
            </p>
            <StoryView article={demo} unlocked={false} sample />
            <div className="mt-8 max-w-md">
              <SubscribeButton from="/my-desk" />
              <p className="mt-3 text-xs text-zinc-600">
                Live stories stay locked until you have Desk Pass. This sample is not on the wire.
              </p>
            </div>
          </section>
        </>
      ) : (
        <p className="mt-12 text-sm text-zinc-500">
          You already have the live desk. Open any story on the wire.
        </p>
      )}

      {premium && !pass?.unlimited ? (
        <div className="mt-12">
          <UnsubscribeSection
            expiresAt={pass?.expiresAt ?? undefined}
            canceling={pass?.cancelAtPeriodEnd}
          />
        </div>
      ) : null}
    </main>
  );
}
