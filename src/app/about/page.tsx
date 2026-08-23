import Link from "next/link";
import { hasDeskPass } from "@/lib/pass";
import { btn } from "@/lib/ui";

export const metadata = {
  title: "About",
};

export default async function AboutPage() {
  const premium = await hasDeskPass();
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        How this works
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        News that tells you the hustle.
      </h1>
      <div className="mt-8 space-y-5 text-base leading-8 text-zinc-400">
        <p>
          Most news stops at what happened. HustleWire is for people who read a headline and
          ask: so what do I start?
        </p>
        <p>
          The news is free and ad-free. So is how to start: cash, speed, and the first three
          moves. The full playbook is Desk Pass.
        </p>
        <p>
          On a pass you save a play as an idea. Every idea you keep shows up in My Desk as a
          slot. Open one for notes and goals.
        </p>
        <p>
          Want a month free? Make a video about the desk, send the link, and wait for review.
        </p>
        <p>
          Desk Pass is monthly and lives on your account. Cancel anytime on the unsubscribe
          page. The news stays.
        </p>
        <p>Not a broker. Not a guru. A desk.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/promote" className={btn.primary}>
          Promote for a free month
        </Link>
        {premium ? (
          <Link href="/unsubscribe" className={btn.danger}>
            Unsubscribe
          </Link>
        ) : null}
      </div>
    </main>
  );
}
