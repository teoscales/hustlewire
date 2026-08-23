"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SituationTip, WriterApplication } from "@/lib/desk-types";
import { formatMoney, formatWhen } from "@/lib/format";
import { writerPay } from "@/lib/premium";
import { ReviewMark } from "./WriterDesk";

export function WriterApplications({ applications }: { applications: WriterApplication[] }) {
  const pending = applications.filter((item) => item.status === "pending");
  const done = applications.filter((item) => item.status !== "pending");

  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl text-white">Writer applications</h2>
      <p className="mt-2 text-sm text-zinc-500">
        {pending.length === 0
          ? "Nobody waiting."
          : `${pending.length} waiting. Approve them and they can send situations for ${writerPay.label} each.`}
      </p>
      <div className="mt-5 space-y-4">
        {pending.map((item) => (
          <ApplicationCard key={item.id} application={item} />
        ))}
      </div>
      {done.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {done.map((item) => (
            <li key={item.id} className="border-t border-white/10 pt-3 text-sm">
              <p className="text-white">
                {item.name} · {item.email}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {item.status} · {formatWhen(item.reviewedAt ?? item.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function ApplicationCard({ application }: { application: WriterApplication }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  async function review(action: "approve" | "reject") {
    setBusy(action);
    await fetch("/api/office/careers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: application.id, action }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <article className="border-t border-white/10 py-5">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Pending</p>
      <h3 className="mt-2 font-serif text-2xl text-white">{application.name}</h3>
      <p className="mt-1 text-sm text-zinc-400">{application.email}</p>
      <p className="mt-1 text-xs text-zinc-600">{formatWhen(application.createdAt)}</p>
      {application.note ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
          {application.note}
        </p>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No note.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("approve")}
          className="cursor-pointer text-sm text-zinc-300 underline decoration-white/25 underline-offset-4 transition hover:text-white disabled:opacity-50"
        >
          {busy === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("reject")}
          className="cursor-pointer text-sm text-rose-300/80 underline decoration-rose-300/30 underline-offset-4 transition hover:text-rose-200 disabled:opacity-50"
        >
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </article>
  );
}

export function SituationTips({ tips }: { tips: SituationTip[] }) {
  const open = tips.filter((item) => item.status === "open");
  const paid = tips.filter((item) => item.status === "paid");
  const rejected = tips.filter((item) => item.status === "rejected");
  const owed = open.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl text-white">Situations</h2>
      <p className="mt-2 text-sm text-zinc-500">
        {open.length === 0
          ? "No open tips."
          : `${open.length} open · ${formatMoney(owed)} owed · ${writerPay.label} each`}
      </p>
      <div className="mt-5 space-y-4">
        {open.map((tip) => (
          <TipCard key={tip.id} tip={tip} />
        ))}
      </div>
      {rejected.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {rejected.map((tip) => (
            <li key={tip.id} className="border-t border-white/10 pt-3 text-sm">
              <p className="text-zinc-300">{tip.note}</p>
              <ReviewMark
                tone="reject"
                label="Rejected"
                body={`${tip.reviewNote || "Passed."} · ${tip.name} · ${formatWhen(tip.reviewedAt ?? tip.createdAt)}`}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {paid.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {paid.map((tip) => (
            <li key={tip.id} className="border-t border-white/10 pt-3 text-sm">
              <p className="text-zinc-300">{tip.note}</p>
              <ReviewMark
                tone="approve"
                label="Approved"
                body={`${formatMoney(tip.amount)} · ${tip.name} · ${tip.paypalEmail ?? "no PayPal"} · ${formatWhen(tip.reviewedAt ?? tip.createdAt)}`}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function TipCard({ tip }: { tip: SituationTip }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"paid" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  async function review(action: "paid" | "reject") {
    setBusy(action);
    setError("");
    const res = await fetch("/api/office/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: tip.id, action, note: reason }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Could not update");
      return;
    }
    router.refresh();
  }

  return (
    <article className="border-t border-white/10 py-5">
      <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
        {formatMoney(tip.amount)} · {tip.name}
      </p>
      <p className="mt-1 text-sm text-zinc-400">{tip.email}</p>
      {tip.paypalEmail ? (
        <p className="mt-1 text-sm text-zinc-400">PayPal · {tip.paypalEmail}</p>
      ) : (
        <p className="mt-1 text-sm text-rose-300/80">No PayPal on this tip</p>
      )}
      <p className="mt-1 text-xs text-zinc-600">{formatWhen(tip.createdAt)}</p>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{tip.note}</p>
      <label className="mt-4 block text-sm text-zinc-500">
        Reason if you reject
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value.slice(0, 400))}
          rows={2}
          placeholder="They will see this on Careers."
          className="mt-2 w-full resize-y rounded-2xl border border-white/15 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#d8ff3c]"
        />
      </label>
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
      <div className="mt-4 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("paid")}
          className="cursor-pointer text-sm text-zinc-300 underline decoration-white/25 underline-offset-4 transition hover:text-white disabled:opacity-50"
        >
          {busy === "paid" ? "Saving…" : "Approve"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => void review("reject")}
          className="cursor-pointer text-sm text-rose-300/80 underline decoration-rose-300/30 underline-offset-4 transition hover:text-rose-200 disabled:opacity-50"
        >
          {busy === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </article>
  );
}
