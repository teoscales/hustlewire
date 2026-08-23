import { getStartGuide } from "@/lib/articles";
import type { Article } from "@/lib/types";

const riskCopy = {
  low: "Low heat",
  medium: "Medium heat",
  high: "High heat",
};

export function StartGuide({
  article,
  unlocked = false,
}: {
  article: Article;
  unlocked?: boolean;
}) {
  const guide = getStartGuide(article);

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 lg:sticky lg:top-24">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
          How to start · free
        </p>
        {unlocked ? (
          <span className="rounded-full border border-[#d8ff3c]/40 px-2.5 py-0.5 text-[11px] font-medium text-[#d8ff3c]">
            Playbook open below
          </span>
        ) : (
          <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500">
            First three moves
          </span>
        )}
      </div>
      <h2 className="mt-3 font-serif text-2xl leading-snug text-white">{guide.headline}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">{guide.teaser}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-white/5 p-3">
          <dt className="text-[11px] text-zinc-500">Cash</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-white">{guide.capital}</dd>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <dt className="text-[11px] text-zinc-500">Speed</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-white">{guide.speed}</dd>
        </div>
        <div className="rounded-2xl bg-white/5 p-3">
          <dt className="text-[11px] text-zinc-500">Heat</dt>
          <dd className="mt-1 text-xs font-medium leading-5 text-white">{riskCopy[guide.risk]}</dd>
        </div>
      </dl>

      <ol className="mt-5 space-y-3">
        {guide.moves.map((move) => (
          <li key={move.n} className="flex gap-3 rounded-2xl border border-white/10 p-3">
            <span className="font-mono text-sm text-[#d8ff3c]">{move.n}</span>
            <div>
              <p className="text-sm font-medium text-white">{move.title}</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{move.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
