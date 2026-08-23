import Link from "next/link";
import { btn } from "@/lib/ui";
import { SubscribeButton } from "./SubscribeButton";

export function Playwall({ slug }: { slug: string }) {
  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        Locked · Desk Pass
      </p>
      <h2 className="mt-3 font-serif text-3xl leading-tight text-white">
        Full sequence, numbers, scripts, week plan, kill lines.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
        You have the first three moves. Unlock the whole playbook and save this as an idea in
        your slot.
      </p>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <SubscribeButton from={`/story/${slug}`} />
        <Link href="/premium#sample" className={`${btn.ghost} mb-0.5`}>
          What’s included
        </Link>
      </div>
    </section>
  );
}
