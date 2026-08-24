"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { WireDraftInput, WireMoveInput } from "@/lib/wire";
import { categoryIds } from "@/lib/types";
import { wireAccents } from "@/lib/wire";
import { btn } from "@/lib/ui";

type StoryRow = {
  id: string;
  status: "draft" | "live";
  updatedAt: string;
  publishedAt: string | null;
  slug: string;
  title: string;
  featured: boolean;
  draft: WireDraftInput;
};

const blankMove = (): WireMoveInput => ({ title: "", window: "", body: "" });

const blankDraft = (): WireDraftInput => ({
  category: "street",
  accent: wireAccents[0],
  kicker: "",
  title: "",
  dek: "",
  featured: true,
  marketTick: "",
  newsHeadline: "",
  newsBody: "",
  playHeadline: "",
  playTeaser: "",
  thesis: "",
  capital: "$0",
  speed: "Tonight",
  risk: "medium",
  briefing: "",
  moves: [blankMove(), blankMove(), blankMove()],
  kit: "",
  pitfalls: "",
  kill: "",
  suggestedGoals: "",
  questions: "",
});

const field =
  "mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#d8ff3c]";
const area = `${field} min-h-28 resize-y`;

export function WireDesk({ initial }: { initial: StoryRow[] }) {
  const router = useRouter();
  const [stories, setStories] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WireDraftInput>(blankDraft);
  const [busy, setBusy] = useState<"save" | "publish" | "unpublish" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const editing = useMemo(
    () => stories.find((story) => story.id === editingId) ?? null,
    [stories, editingId],
  );

  function patch(next: Partial<WireDraftInput>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function patchMove(index: number, next: Partial<WireMoveInput>) {
    setDraft((current) => {
      const moves = [...(current.moves ?? [blankMove(), blankMove(), blankMove()])];
      moves[index] = { ...moves[index], ...next };
      return { ...current, moves };
    });
  }

  function load(story: StoryRow | null) {
    setEditingId(story?.id ?? null);
    setDraft(story ? { ...blankDraft(), ...story.draft, moves: story.draft.moves?.length ? story.draft.moves : blankDraft().moves } : blankDraft());
    setError("");
    setNote("");
  }

  async function refreshList() {
    const res = await fetch("/api/office/wire");
    const data = (await res.json().catch(() => ({}))) as { stories?: StoryRow[] };
    if (Array.isArray(data.stories)) setStories(data.stories);
  }

  async function send(action: "save" | "publish" | "unpublish" | "delete") {
    setBusy(action);
    setError("");
    setNote("");
    try {
      const res = await fetch("/api/office/wire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          id: editingId ?? undefined,
          featured: draft.featured,
          draft,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        story?: { id: string; status: string; slug: string; title: string };
      };
      if (!res.ok) {
        setError(data.error ?? "Could not update the wire");
        return;
      }
      await refreshList();
      if (action === "delete") {
        load(null);
        setNote("Removed from the desk.");
      } else if (data.story) {
        setEditingId(data.story.id);
        setNote(
          action === "publish"
            ? "Live on the wire."
            : action === "unpublish"
              ? "Taken off the wire. Saved as a draft."
              : "Draft saved.",
        );
        router.refresh();
      }
    } catch {
      setError("Could not reach the desk.");
    } finally {
      setBusy(null);
    }
  }

  const moves = draft.moves ?? [blankMove(), blankMove(), blankMove()];

  return (
    <section className="mt-10 rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-white">Wire desk</h2>
          <p className="mt-1 max-w-xl text-sm text-zinc-400">
            Write a story here. Save a draft, then publish. Publish puts it on the homepage
            and the story page right away.
          </p>
        </div>
        <button type="button" className={btn.dark} onClick={() => load(null)}>
          New story
        </button>
      </div>

      {stories.length > 0 ? (
        <ul className="mt-5 divide-y divide-white/10 text-sm">
          {stories.map((story) => (
            <li key={story.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-white">{story.title}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {story.status === "live" ? "Live" : "Draft"}
                  {story.featured ? " · Lead" : ""}
                  {story.status === "live" ? (
                    <>
                      {" · "}
                      <Link href={`/story/${story.slug}`} className="text-[#d8ff3c] hover:underline">
                        View
                      </Link>
                    </>
                  ) : null}
                </p>
              </div>
              <button type="button" className={btn.quiet} onClick={() => load(story)}>
                {editingId === story.id ? "Editing" : "Edit"}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No desk stories yet. The first one you publish becomes the lead.</p>
      )}

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void send("save");
        }}
      >
        <fieldset className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-zinc-400">
            Kicker
            <input className={field} value={draft.kicker ?? ""} onChange={(event) => patch({ kicker: event.target.value })} placeholder="The leak" />
          </label>
          <label className="text-sm text-zinc-400">
            Desk
            <select className={field} value={draft.category ?? "street"} onChange={(event) => patch({ category: event.target.value })}>
              {categoryIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <label className="block text-sm text-zinc-400">
          Title
          <input className={field} value={draft.title ?? ""} onChange={(event) => patch({ title: event.target.value })} required />
        </label>
        <label className="block text-sm text-zinc-400">
          Dek
          <textarea className={area} value={draft.dek ?? ""} onChange={(event) => patch({ dek: event.target.value })} />
        </label>

        <fieldset className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-zinc-400">
            Code
            <input className={field} maxLength={3} value={draft.code ?? ""} onChange={(event) => patch({ code: event.target.value.toUpperCase() })} placeholder="HW" />
          </label>
          <label className="text-sm text-zinc-400">
            Tape mark
            <input className={field} value={draft.marketTick ?? ""} onChange={(event) => patch({ marketTick: event.target.value })} placeholder="SOL +1.1%" />
          </label>
          <label className="text-sm text-zinc-400">
            Color
            <select className={field} value={draft.accent ?? wireAccents[0]} onChange={(event) => patch({ accent: event.target.value })}>
              {wireAccents.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <label className="flex items-center gap-3 text-sm text-zinc-200">
          <input
            type="checkbox"
            checked={Boolean(draft.featured)}
            onChange={(event) => patch({ featured: event.target.checked })}
            className="size-4 accent-[#d8ff3c]"
          />
          Make this the lead when it publishes
        </label>

        <label className="block text-sm text-zinc-400">
          News headline
          <input className={field} value={draft.newsHeadline ?? ""} onChange={(event) => patch({ newsHeadline: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          News body
          <span className="mt-1 block text-xs text-zinc-600">Blank line between paragraphs. Need two or more.</span>
          <textarea className={`${area} min-h-40`} value={draft.newsBody ?? ""} onChange={(event) => patch({ newsBody: event.target.value })} />
        </label>

        <label className="block text-sm text-zinc-400">
          Play headline
          <input className={field} value={draft.playHeadline ?? ""} onChange={(event) => patch({ playHeadline: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Play teaser
          <textarea className={area} value={draft.playTeaser ?? ""} onChange={(event) => patch({ playTeaser: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Thesis
          <textarea className={area} value={draft.thesis ?? ""} onChange={(event) => patch({ thesis: event.target.value })} />
        </label>

        <fieldset className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-zinc-400">
            Capital
            <input className={field} value={draft.capital ?? "$0"} onChange={(event) => patch({ capital: event.target.value })} />
          </label>
          <label className="text-sm text-zinc-400">
            Speed
            <input className={field} value={draft.speed ?? "Tonight"} onChange={(event) => patch({ speed: event.target.value })} />
          </label>
          <label className="text-sm text-zinc-400">
            Risk
            <select className={field} value={draft.risk ?? "medium"} onChange={(event) => patch({ risk: event.target.value })}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
        </fieldset>

        <label className="block text-sm text-zinc-400">
          Briefing
          <span className="mt-1 block text-xs text-zinc-600">One point per line.</span>
          <textarea className={area} value={draft.briefing ?? ""} onChange={(event) => patch({ briefing: event.target.value })} />
        </label>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-zinc-300">Moves</p>
            <button
              type="button"
              className={btn.quiet}
              onClick={() => patch({ moves: [...moves, blankMove()] })}
            >
              Add move
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {moves.map((move, index) => (
              <fieldset key={index} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#d8ff3c]">Move {index + 1}</p>
                <label className="mt-3 block text-sm text-zinc-400">
                  Title
                  <input className={field} value={move.title} onChange={(event) => patchMove(index, { title: event.target.value })} />
                </label>
                <label className="mt-3 block text-sm text-zinc-400">
                  Window
                  <input className={field} value={move.window} onChange={(event) => patchMove(index, { window: event.target.value })} placeholder="Hour 1" />
                </label>
                <label className="mt-3 block text-sm text-zinc-400">
                  Body
                  <textarea className={area} value={move.body} onChange={(event) => patchMove(index, { body: event.target.value })} />
                </label>
              </fieldset>
            ))}
          </div>
        </div>

        <label className="block text-sm text-zinc-400">
          Kit
          <textarea className={area} value={draft.kit ?? ""} onChange={(event) => patch({ kit: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Pitfalls
          <textarea className={area} value={draft.pitfalls ?? ""} onChange={(event) => patch({ pitfalls: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Kill rules
          <textarea className={area} value={draft.kill ?? ""} onChange={(event) => patch({ kill: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Suggested goals
          <textarea className={area} value={draft.suggestedGoals ?? ""} onChange={(event) => patch({ suggestedGoals: event.target.value })} />
        </label>
        <label className="block text-sm text-zinc-400">
          Questions
          <textarea className={area} value={draft.questions ?? ""} onChange={(event) => patch({ questions: event.target.value })} />
        </label>

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        {note ? <p className="text-sm text-[#d8ff3c]">{note}</p> : null}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={Boolean(busy)} className={btn.quiet}>
            {busy === "save" ? "Saving…" : "Save draft"}
          </button>
          <button type="button" disabled={Boolean(busy)} className={btn.primary} onClick={() => void send("publish")}>
            {busy === "publish" ? "Publishing…" : "Publish to the wire"}
          </button>
          {editing?.status === "live" ? (
            <button type="button" disabled={Boolean(busy)} className={btn.ghost} onClick={() => void send("unpublish")}>
              {busy === "unpublish" ? "Pulling…" : "Unpublish"}
            </button>
          ) : null}
          {editing ? (
            <button type="button" disabled={Boolean(busy)} className={btn.danger} onClick={() => void send("delete")}>
              {busy === "delete" ? "Removing…" : "Delete"}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
