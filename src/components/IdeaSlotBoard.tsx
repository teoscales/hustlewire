"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { mergePlaybookGoals, newGoal, type Idea, type Studio } from "@/lib/studio";
import { btn } from "@/lib/ui";

type StoryOption = {
  slug: string;
  title: string;
  code: string;
  suggestedGoals: string[];
};

type IdeaSlotBoardProps = {
  initial: Studio;
  stories: StoryOption[];
};

export function IdeaSlotBoard({ initial, stories }: IdeaSlotBoardProps) {
  const [studio, setStudio] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(studio.ideas[0]?.id ?? null);
  const [status, setStatus] = useState("");
  const hydrated = useRef(false);

  const open = studio.ideas.find((idea) => idea.id === openId) ?? null;
  const openStory = stories.find((item) => item.slug === open?.storySlug);
  const playbookGoalCount = open?.goals.filter((goal) => goal.fromPlaybook).length ?? 0;

  async function persist(next: Studio, nextOpen = openId, message?: string) {
    setStudio(next);
    setOpenId(nextOpen);
    setStatus("Saving…");
    const res = await fetch("/api/studio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setStatus(res.ok ? message || "Saved" : "Could not save");
  }

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    let addedTotal = 0;
    const ideas = studio.ideas.map((idea) => {
      const story = stories.find((item) => item.slug === idea.storySlug);
      if (!story) return idea;
      const merged = mergePlaybookGoals(idea.goals, story.suggestedGoals);
      addedTotal += merged.added;
      return { ...idea, goals: merged.goals };
    });
    if (addedTotal > 0) {
      void persist({ ideas }, openId, `Loaded ${addedTotal} playbook goals automatically`);
    }
    // one-shot fill for ideas saved before auto-goals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addBlank() {
    const res = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blank: true }),
    });
    if (!res.ok) {
      setStatus("Slot is full (8 ideas)");
      return;
    }
    const next = (await res.json()) as Studio;
    setStudio(next);
    setOpenId(next.ideas[0]?.id ?? null);
    setStatus("Saved");
  }

  function patchOpen(partial: Partial<Idea>) {
    if (!open) return;
    const nextIdea = { ...open, ...partial };
    void persist({
      ideas: studio.ideas.map((idea) => (idea.id === open.id ? nextIdea : idea)),
    });
  }

  function remove(id: string) {
    const ideas = studio.ideas.filter((idea) => idea.id !== id);
    void persist({ ideas }, ideas[0]?.id ?? null);
  }

  function linkStory(storySlug: string | null) {
    if (!open) return;
    const story = stories.find((item) => item.slug === storySlug);
    if (!story) {
      patchOpen({ storySlug: null });
      return;
    }
    const merged = mergePlaybookGoals(open.goals, story.suggestedGoals);
    const nextIdea = { ...open, storySlug, goals: merged.goals };
    void persist(
      { ideas: studio.ideas.map((idea) => (idea.id === open.id ? nextIdea : idea)) },
      openId,
      merged.added > 0
        ? `Added ${merged.added} goals from the playbook`
        : "Playbook goals already on this idea",
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-[#d8ff3c]/30 bg-[#d8ff3c]/10 px-5 py-4 text-sm leading-6 text-zinc-200">
        <span className="font-medium text-[#d8ff3c]">Playbook goals load by themselves.</span>{" "}
        Save a story or link news to an idea. The checklist from that playbook drops into the
        slot. Check them off as you go.
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">{studio.ideas.length}/8 slots used</p>
        <button type="button" onClick={() => void addBlank()} className={btn.primary}>
          New idea
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {studio.ideas.map((idea) => {
          const story = stories.find((item) => item.slug === idea.storySlug);
          const done = idea.goals.filter((goal) => goal.done).length;
          const fromBook = idea.goals.filter((goal) => goal.fromPlaybook).length;
          const active = idea.id === openId;
          return (
            <button
              key={idea.id}
              type="button"
              onClick={() => setOpenId(idea.id)}
              className={`rounded-3xl border p-5 text-left transition ${
                active
                  ? "border-[#d8ff3c] bg-[#d8ff3c]/10"
                  : "border-white/10 bg-zinc-900/50 hover:border-white/25"
              }`}
            >
              <p className="text-xs text-zinc-500">
                {story ? story.code : "Custom"} · {done}/{idea.goals.length} goals
                {fromBook > 0 ? ` · ${fromBook} from playbook` : ""}
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-snug text-white">{idea.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-400">
                {idea.notes || "No notes yet."}
              </p>
            </button>
          );
        })}
        {studio.ideas.length === 0 ? (
          <button
            type="button"
            onClick={() => void addBlank()}
            className="grid min-h-[11rem] place-items-center rounded-3xl border border-dashed border-white/20 text-sm text-zinc-400 hover:border-[#d8ff3c] hover:text-[#d8ff3c]"
          >
            Save a play from a story. Goals come with it
          </button>
        ) : null}
      </div>

      {open ? (
        <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Open slot
            </p>
            <button type="button" onClick={() => remove(open.id)} className={btn.danger}>
              Remove idea
            </button>
          </div>
          <input
            value={open.title}
            onChange={(event) =>
              setStudio({
                ideas: studio.ideas.map((idea) =>
                  idea.id === open.id ? { ...idea, title: event.target.value.slice(0, 80) } : idea,
                ),
              })
            }
            onBlur={(event) => patchOpen({ title: event.target.value.slice(0, 80) })}
            className="mt-4 w-full bg-transparent font-serif text-3xl text-white outline-none"
          />
          <textarea
            value={open.notes}
            onChange={(event) =>
              setStudio({
                ideas: studio.ideas.map((idea) =>
                  idea.id === open.id ? { ...idea, notes: event.target.value.slice(0, 800) } : idea,
                ),
              })
            }
            onBlur={(event) => patchOpen({ notes: event.target.value.slice(0, 800) })}
            rows={4}
            placeholder="What you’re building."
            className="mt-3 w-full rounded-2xl border border-white/10 bg-zinc-950/50 px-4 py-3 text-sm leading-6 text-zinc-200 outline-none focus:border-[#d8ff3c]"
          />
          <label className="mt-4 block text-xs text-zinc-500">
            Linked news. Linking auto-adds playbook goals
            <select
              value={open.storySlug ?? ""}
              onChange={(event) => linkStory(event.target.value || null)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="">None</option>
              {stories.map((story) => (
                <option key={story.slug} value={story.slug}>
                  {story.code} · {story.title}
                </option>
              ))}
            </select>
          </label>
          {open.storySlug ? (
            <Link href={`/story/${open.storySlug}`} className={`${btn.primary} mt-3`}>
              Open the story
            </Link>
          ) : null}

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
              Goals
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {openStory
                ? playbookGoalCount > 0
                  ? `${playbookGoalCount} loaded from the ${openStory.code} playbook.`
                  : "Playbook goals will appear here from the linked story."
                : "Link a story and playbook goals fill this list automatically."}
            </p>
            {open.goals.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-white/15 px-4 py-6 text-sm text-zinc-500">
                No goals yet. Save or link a playbook and they land here.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {open.goals.map((goal) => (
                  <li key={goal.id} className="flex items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={goal.done}
                      onChange={() =>
                        patchOpen({
                          goals: open.goals.map((item) =>
                            item.id === goal.id ? { ...item, done: !item.done } : item,
                          ),
                        })
                      }
                      className="mt-1"
                    />
                    <span className={goal.done ? "text-zinc-500 line-through" : "text-zinc-200"}>
                      {goal.title}
                    </span>
                    {goal.fromPlaybook ? (
                      <span className="rounded-full bg-[#d8ff3c]/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#d8ff3c]">
                        Playbook
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        patchOpen({ goals: open.goals.filter((item) => item.id !== goal.id) })
                      }
                      className={`${btn.quiet} ml-auto shrink-0 px-3 py-1 text-xs`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <GoalDraft
              disabled={open.goals.length >= 8}
              onAdd={(title) => patchOpen({ goals: [...open.goals, newGoal(title)] })}
            />
          </div>
          <p className="mt-4 text-xs text-zinc-600">{status}</p>
        </section>
      ) : null}
    </div>
  );
}

function GoalDraft({ disabled, onAdd }: { disabled: boolean; onAdd: (title: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value.slice(0, 120))}
        onKeyDown={(event) => {
          if (event.key === "Enter" && value.trim()) {
            event.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
        placeholder={disabled ? "Goal cap reached" : "Add your own goal"}
        className="flex-1 rounded-full border border-white/10 bg-zinc-950 px-4 py-2 text-sm outline-none"
      />
      <button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
        className={btn.primary}
      >
        Add
      </button>
    </div>
  );
}
