import type { Playbook as PlaybookType } from "@/lib/types";
import { AskPlaybook } from "./AskPlaybook";

const riskCopy = {
  low: "Low heat",
  medium: "Medium heat",
  high: "High heat",
};

export function Playbook({
  slug,
  headline,
  playbook,
  sample = false,
}: {
  slug: string;
  headline: string;
  playbook: PlaybookType;
  sample?: boolean;
}) {
  return (
    <section className="mt-8 rounded-[2rem] border-2 border-[#d8ff3c] bg-[#d8ff3c]/[0.07] p-5 sm:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
          {sample ? "Sample desk · 1:1" : "Desk Pass unlocked"}
        </span>
        <span className="text-sm text-[#d8ff3c]">
          {sample ? "Fake sample. Layout only, not a HustleWire story" : "Full playbook, not the free start"}
        </span>
      </div>
      <h2 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] text-white">
        {playbook.thesis}
      </h2>

      <dl className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          ["Cash", playbook.capital],
          ["Speed", playbook.speed],
          ["Heat", riskCopy[playbook.risk]],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#d8ff3c]/20 bg-zinc-950/50 p-4">
            <dt className="text-xs text-zinc-500">{label}</dt>
            <dd className="mt-1 font-serif text-xl text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8">
        <AskPlaybook
          slug={slug}
          situation={headline}
          questions={playbook.questions}
          sample={sample}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Briefing
            </p>
            <div className="mt-4 max-w-2xl space-y-4 text-base leading-8 text-zinc-400">
              {playbook.briefing.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Exact sequence
            </p>
            <ol className="mt-5 space-y-4">
              {playbook.sequence.map((step, index) => (
                <li key={step.title} className="rounded-2xl border border-[#d8ff3c]/15 bg-zinc-950/40 p-5">
                  <p className="text-xs text-zinc-500">
                    {String(index + 1).padStart(2, "0")} · {step.window}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl text-white">{step.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Scripts
            </p>
            <ul className="mt-4 space-y-3">
              {playbook.scripts.map((script) => (
                <li key={script.where} className="rounded-2xl bg-white/5 p-4">
                  <p className="text-xs text-[#d8ff3c]">{script.where}</p>
                  <p className="mt-2 font-serif text-lg leading-7 text-white">“{script.text}”</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#d8ff3c]/20 bg-zinc-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Numbers
            </p>
            <ul className="mt-3 divide-y divide-white/10">
              {playbook.numbers.map((row) => (
                <li key={row.label} className="py-3">
                  <p className="text-xs text-zinc-500">{row.label}</p>
                  <p className="mt-1 font-serif text-xl">{row.value}</p>
                  <p className="mt-1 text-xs text-zinc-500">{row.note}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#d8ff3c]/20 bg-zinc-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">Kit</p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-zinc-400">
              {playbook.kit.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#d8ff3c]/20 bg-zinc-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">Week</p>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {playbook.week.map((row) => (
                <li key={row.day} className="grid grid-cols-[3.5rem_1fr] gap-2">
                  <span className="text-xs text-[#d8ff3c]">{row.day}</span>
                  <span className="text-zinc-400">{row.move}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-rose-500/20 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-400">
              Kill lines
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-400">
              {playbook.kill.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#d8ff3c]/20 bg-zinc-950/40 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Don’t
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-zinc-400">
              {playbook.pitfalls.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
