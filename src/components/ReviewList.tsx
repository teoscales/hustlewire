"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PromoRecord } from "@/lib/desk-types";
import { formatWhen } from "@/lib/format";
import { btn } from "@/lib/ui";
import { parseVideoLink } from "@/lib/video";

export function ReviewList({ promos }: { promos: PromoRecord[] }) {
  const pending = promos.filter((promo) => promo.status === "pending");
  const done = promos.filter((promo) => promo.status !== "pending");

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-serif text-3xl text-white">Reviews</h2>
        <p className="mt-2 text-sm text-zinc-500">
          {pending.length === 0
            ? "No videos waiting."
            : `${pending.length} waiting for you.`}
        </p>
        <div className="mt-5 space-y-4">
          {pending.map((promo) => (
            <ReviewCard key={promo.id} promo={promo} />
          ))}
        </div>
      </section>
      {done.length > 0 ? (
        <section>
          <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            Already reviewed
          </h2>
          <ul className="mt-4 space-y-3">
            {done.map((promo) => (
              <li
                key={promo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-zinc-900/40 px-4 py-3 text-sm"
              >
                <div>
                  <p className="text-white">
                    {promo.name} · {promo.email}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {promo.status} · {formatWhen(promo.reviewedAt ?? promo.createdAt)}
                  </p>
                </div>
                <a href={promo.videoUrl} target="_blank" rel="noreferrer" className={btn.quiet}>
                  Open video
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function ReviewCard({ promo }: { promo: PromoRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const video = parseVideoLink(promo.videoUrl);

  async function review(action: "approve" | "reject") {
    setBusy(action);
    await fetch("/api/office/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promoId: promo.id, action, note }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <article className="rounded-3xl border-2 border-[#d8ff3c]/30 bg-zinc-900/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8ff3c]">
            Pending review
          </p>
          <h3 className="mt-2 font-serif text-2xl text-white">{promo.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{promo.email}</p>
          <p className="mt-1 text-xs text-zinc-600">
            {video?.platform ?? "Video"} · {formatWhen(promo.createdAt)}
          </p>
        </div>
        <a href={promo.videoUrl} target="_blank" rel="noreferrer" className={btn.primary}>
          Open video
        </a>
      </div>
      {promo.note ? <p className="mt-4 text-sm leading-6 text-zinc-300">{promo.note}</p> : null}
      {video?.embedUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <iframe
            title={`Promo from ${promo.name}`}
            src={video.embedUrl}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}
      <input
        value={note}
        onChange={(event) => setNote(event.target.value.slice(0, 240))}
        placeholder="Optional note for them"
        className="mt-4 w-full rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-[#d8ff3c]"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("approve")}
          className={btn.primary}
        >
          {busy === "approve" ? "Approving…" : "Approve · 1 free month"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("reject")}
          className={btn.danger}
        >
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </article>
  );
}
