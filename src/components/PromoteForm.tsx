"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PromoRecord } from "@/lib/desk-types";
import { btn } from "@/lib/ui";

export function PromoteForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoUrl: String(form.get("videoUrl") ?? ""),
        note: String(form.get("note") ?? ""),
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (res.status === 401) {
      router.push("/account?next=/promote");
      return;
    }
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-8 max-w-xl space-y-4">
      <label className="block text-sm text-zinc-400">
        Video link
        <input
          name="videoUrl"
          type="url"
          required
          placeholder="YouTube, TikTok, Instagram, X, or Vimeo"
          className="mt-2 w-full rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#d8ff3c]"
        />
      </label>
      <label className="block text-sm text-zinc-400">
        Where you posted it
        <textarea
          name="note"
          rows={3}
          placeholder="TikTok, Reel, Short, whatever you made."
          className="mt-2 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-[#d8ff3c]"
        />
      </label>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button type="submit" disabled={busy} className={btn.primary}>
        {busy ? "Sending…" : "Send for review"}
      </button>
    </form>
  );
}

export function ClaimPassButton({ promo }: { promo: PromoRecord }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function claim() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/promo", { method: "PATCH" });
    const data = (await res.json()) as { error?: string };
    if (res.status === 401) {
      router.push("/account?next=/promote");
      return;
    }
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not claim");
      return;
    }
    router.push("/my-desk");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <button type="button" onClick={() => void claim()} disabled={busy} className={btn.primary}>
        {busy ? "Unlocking…" : "Claim 1 free month"}
      </button>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
