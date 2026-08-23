import { ClaimPassButton, PromoteForm } from "@/components/PromoteForm";
import { accountPath, getAccount } from "@/lib/account";
import { getMyPromo, hasDeskPass } from "@/lib/pass";
import { deskPass } from "@/lib/premium";
import { btn } from "@/lib/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promote",
  description:
    "Post a video about HustleWire. If it passes review, you get one month of Desk Pass free.",
};

export default async function PromotePage() {
  const account = await getAccount();
  const promo = await getMyPromo();
  const premium = await hasDeskPass();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        One free month
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        Make a video. Send the link. Get Desk Pass if it clears.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-400">
        Talk about the wire: a story, a play, why you use the desk. Paste the YouTube, TikTok,
        Instagram, X, or Vimeo link. We review it. Approved videos unlock {deskPass.name} for
        30 days. You need an account first. The free month lands on it.
      </p>

      {promo?.status === "pending" ? (
        <section className="mt-10 rounded-3xl border border-[#d8ff3c]/40 bg-[#d8ff3c]/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8ff3c]">
            In review
          </p>
          <h2 className="mt-2 font-serif text-2xl text-white">Your video is with the desk</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            We’ll check the link. Come back here after it is approved to claim the month.
          </p>
          <a href={promo.videoUrl} target="_blank" rel="noreferrer" className={`${btn.ghost} mt-5`}>
            Open your video
          </a>
        </section>
      ) : null}

      {promo?.status === "approved" ? (
        <section className="mt-10 rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
          <p className="inline-flex rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
            {promo.claimedAt ? "Claimed" : "Approved"}
          </p>
          <h2 className="mt-3 font-serif text-2xl text-white">
            {promo.claimedAt ? "Promo month is on this desk" : "The month is yours"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Desk Pass stays open for 30 days from the claim. Playbooks and My Desk included.
          </p>
          {premium ? (
            <Link href="/my-desk" className={`${btn.primary} mt-5`}>
              Open My Desk
            </Link>
          ) : (
            <ClaimPassButton promo={promo} />
          )}
        </section>
      ) : null}

      {promo?.status === "rejected" ? (
        <section className="mt-10 rounded-3xl border border-rose-400/30 bg-rose-500/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
            Not this one
          </p>
          <h2 className="mt-2 font-serif text-2xl text-white">Send a new link</h2>
          {promo.reviewNote ? (
            <p className="mt-2 text-sm leading-6 text-zinc-300">{promo.reviewNote}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Make it about HustleWire, then submit again.
            </p>
          )}
        </section>
      ) : null}

      {!account ? (
        <section className="mt-10 rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8ff3c]">
            Account required
          </p>
          <h2 className="mt-2 font-serif text-2xl text-white">Sign in before you send a link</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Promo months attach to your account, same as a paid Desk Pass.
          </p>
          <Link href={accountPath("/promote")} className={`${btn.primary} mt-5`}>
            Login to account
          </Link>
        </section>
      ) : null}

      {account && (!promo || promo.status === "rejected") ? <PromoteForm /> : null}
    </main>
  );
}
