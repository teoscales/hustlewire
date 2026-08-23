"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deskPass } from "@/lib/premium";
import { btn } from "@/lib/ui";

type Props = {
  from?: string;
  variant?: "lock" | "primary" | "ghost";
};

export function SubscribeButton({ from, variant = "primary" }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: from || "/my-desk" }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.status === 401) {
      const next = from || "/my-desk";
      router.push(`/account?next=${encodeURIComponent(next)}&unlock=1`);
      return;
    }
    if (!res.ok || !data.url) {
      setBusy(false);
      setError(data.error ?? "Could not start checkout");
      return;
    }
    window.location.href = data.url;
  }

  const styles =
    variant === "lock" ? btn.dark : variant === "ghost" ? btn.ghost : btn.primary;

  return (
    <div>
      <p className="mb-2 text-sm text-zinc-400">{deskPass.priceLabel}</p>
      <button type="button" onClick={() => void start()} disabled={busy} className={styles}>
        {busy ? "Sending you to Stripe…" : "Unlock Desk Pass"}
      </button>
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}

export function CancelPassButton({
  label = "Unsubscribe from Desk Pass",
}: {
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [sure, setSure] = useState(false);
  const [error, setError] = useState("");

  async function stop() {
    setBusy(true);
    setError("");
    const res = await fetch("/api/premium", { method: "DELETE" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not cancel on Stripe");
      return;
    }
    router.refresh();
  }

  if (!sure) {
    return (
      <button type="button" onClick={() => setSure(true)} className={btn.danger}>
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm leading-6 text-zinc-400">
        Stripe stops charging. You keep Desk Pass until this paid month ends.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => void stop()} disabled={busy} className={btn.danger}>
          {busy ? "Canceling on Stripe…" : "Yes, stop billing"}
        </button>
        <button type="button" onClick={() => setSure(false)} disabled={busy} className={btn.ghost}>
          Keep Desk Pass
        </button>
      </div>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  );
}
