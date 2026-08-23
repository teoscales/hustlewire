"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SituationTip, WriterApplication, WriterChatMessage } from "@/lib/desk-types";
import { formatMoney, formatWhen } from "@/lib/format";
import { writerPay } from "@/lib/premium";
import { btn } from "@/lib/ui";
import { WriterChat } from "./WriterChat";

export function WriterDesk({
  application,
  approved,
  paypalEmail,
  tips,
  messages,
}: {
  application: WriterApplication | null;
  approved: boolean;
  paypalEmail: string;
  tips: SituationTip[];
  messages: WriterChatMessage[];
}) {
  if (approved) {
    return (
      <section className="mt-10 space-y-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
            You’re in
          </p>
          <h2 className="mt-2 font-serif text-3xl text-white">Earn {writerPay.label} a situation</h2>
          <p className="mt-3 text-base leading-7 text-zinc-400">
            Send something that hits hustlers: a fee, a shutdown, a city rule, a supplier going
            cheap, or a lane they can use to make money. Don’t write the story. Tell us what
            happened. We write it. You get {writerPay.label}.
          </p>
        </div>
        <PaypalForm paypalEmail={paypalEmail} />
        {paypalEmail ? <SituationForm /> : null}
        <WriterChat initial={messages} />
        <TipList tips={tips} />
      </section>
    );
  }

  if (application?.status === "pending") {
    return (
      <section className="mt-10 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
          Application
        </p>
        <h2 className="mt-2 font-serif text-2xl text-white">With the desk</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          If you’re approved, this page opens a desk to send situations for {writerPay.label}{" "}
          each.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10 max-w-2xl">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
        Apply
      </p>
      <h2 className="mt-2 font-serif text-2xl text-white">
        {application?.status === "rejected" ? "Not this round" : "Join the desk"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Apply here. If the desk says yes, you send short situations and get {writerPay.label}{" "}
        each, after you link PayPal.
      </p>
      <ApplyForm />
    </section>
  );
}

function ApplyForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const res = await fetch("/api/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: String(new FormData(form).get("note") ?? "") }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401) {
      router.push("/account?next=/careers");
      return;
    }
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not apply");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="mt-5 space-y-4">
      <label className="block text-sm text-zinc-400">
        Optional note
        <textarea
          name="note"
          rows={3}
          placeholder="Where you notice situations. Cities, shops, platforms."
          className="mt-2 w-full resize-y border-b border-white/15 bg-transparent py-2 text-sm leading-6 text-white outline-none focus:border-[#d8ff3c]"
        />
      </label>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="cursor-pointer text-sm text-zinc-300 underline decoration-white/25 underline-offset-4 transition hover:text-white hover:decoration-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Sending…" : "Apply"}
      </button>
    </form>
  );
}

function PaypalForm({ paypalEmail }: { paypalEmail: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const res = await fetch("/api/careers/paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: String(new FormData(form).get("email") ?? "") }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not link PayPal");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="max-w-xl rounded-[2rem] border-2 border-sky-400 bg-sky-400/10 p-6 sm:p-8"
    >
      <p className="inline-flex rounded-full bg-sky-400 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
        PayPal
      </p>
      {paypalEmail ? (
        <p className="mt-4 text-sm leading-6 text-sky-100/80">
          Paying {writerPay.label} to <span className="text-white">{paypalEmail}</span>. Change
          it below if you need to.
        </p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-sky-100/80">
          Link the email on your PayPal before you send a situation. That’s where the{" "}
          {writerPay.label} goes.
        </p>
      )}
      <label className="mt-5 block text-sm text-sky-100/70">
        PayPal email
        <input
          name="email"
          type="email"
          required
          defaultValue={paypalEmail}
          autoComplete="email"
          placeholder="you@email.com"
          className="mt-2 w-full border-b border-sky-400/40 bg-transparent py-2 text-sm text-white outline-none focus:border-sky-300"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 cursor-pointer text-sm text-sky-200 underline decoration-sky-400/50 underline-offset-4 transition hover:text-white hover:decoration-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Saving…" : paypalEmail ? "Update PayPal" : "Link PayPal"}
      </button>
    </form>
  );
}

function SituationForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const res = await fetch("/api/careers/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: String(new FormData(form).get("note") ?? "") }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send");
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="max-w-xl rounded-[2rem] border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6 sm:p-8"
    >
      <p className="inline-flex rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-950">
        Situation
      </p>
      <p className="mt-4 font-serif text-2xl text-white">What happened</p>
      <p className="mt-2 text-sm leading-6 text-zinc-300">
        What hit hustlers, or what they could use to make money. Don’t write the story.
      </p>
      <label className="mt-5 block text-sm text-zinc-400">
        The situation
        <textarea
          name="note"
          required
          minLength={12}
          rows={6}
          placeholder="A fee, a shutdown, a city rule, a supplier. The hustle hiding in it."
          className="mt-3 w-full resize-y rounded-2xl border border-[#d8ff3c]/40 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#d8ff3c]"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      <button type="submit" disabled={busy} className={`${btn.primary} mt-5`}>
        {busy ? "Sending…" : `Send it · ${writerPay.label}`}
      </button>
    </form>
  );
}

function TipList({ tips }: { tips: SituationTip[] }) {
  if (tips.length === 0) return null;
  const owed = tips
    .filter((item) => item.status === "open")
    .reduce((sum, item) => sum + item.amount, 0);
  const paid = tips
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="max-w-xl border-t border-white/10 pt-5">
      <p className="text-sm text-zinc-400">
        {tips.length} sent · {formatMoney(paid)} paid · {formatMoney(owed)} owed
      </p>
      <ul className="mt-4 space-y-4">
        {tips.map((tip) => (
          <li key={tip.id} className="text-sm">
            <p className="leading-6 text-zinc-300">{tip.note}</p>
            {tip.status === "rejected" ? (
              <ReviewMark
                tone="reject"
                label="Rejected"
                body={tip.reviewNote || "The desk passed on this one."}
              />
            ) : tip.status === "paid" ? (
              <ReviewMark
                tone="approve"
                label="Approved"
                body={`${formatMoney(tip.amount)} · ${formatWhen(tip.reviewedAt ?? tip.createdAt)}`}
              />
            ) : (
              <p className="mt-1 text-xs text-zinc-600">
                {formatMoney(tip.amount)} · waiting · {formatWhen(tip.createdAt)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewMark({
  tone,
  label,
  body,
}: {
  tone: "approve" | "reject";
  label: string;
  body: string;
}) {
  const box =
    tone === "approve"
      ? "mt-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3"
      : "mt-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3";
  const title =
    tone === "approve"
      ? "text-xs uppercase tracking-[0.14em] text-emerald-300"
      : "text-xs uppercase tracking-[0.14em] text-rose-300";

  return (
    <div className={box}>
      <p className={title}>{label}</p>
      <p className="mt-2 leading-6 text-zinc-200">{body}</p>
    </div>
  );
}
