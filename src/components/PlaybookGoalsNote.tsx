export function PlaybookGoalsNote({ titles }: { titles: string[] }) {
  if (titles.length === 0) return null;

  return (
    <div className="rounded-3xl border border-[#d8ff3c]/35 bg-zinc-900/60 p-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        Auto goals from this playbook
      </p>
      <h3 className="mt-2 font-serif text-2xl leading-snug text-white">
        Save this idea and these {titles.length} goals drop into My Desk. No extra click.
      </h3>
      <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-400">
        {titles.map((title, index) => (
          <li key={title} className="flex gap-3">
            <span className="font-mono text-xs text-[#d8ff3c]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{title}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
