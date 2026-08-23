"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/lib/ui";

export function AccountForm({
  next = "/account",
  unlock = false,
}: {
  next?: string;
  unlock?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: mode,
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setBusy(false);
      setError(data.error ?? "Could not continue");
      return;
    }
    if (unlock) {
      const checkout = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: next }),
      });
    const data = (await checkout.json().catch(() => ({}))) as { url?: string; error?: string };
      if (checkout.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      if (checkout.status === 401) {
        router.push(`/account?next=${encodeURIComponent(next)}&unlock=1`);
        return;
      }
      setBusy(false);
      setError(data.error ?? "Signed in. Stripe checkout did not start.");
      router.refresh();
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mt-8 max-w-sm">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={mode === "signup" ? btn.primary : btn.quiet}
        >
          Create account
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={mode === "login" ? btn.primary : btn.quiet}
        >
          Sign in
        </button>
      </div>
      <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
        {mode === "signup" ? (
          <label className="block text-sm text-zinc-400">
            Name
            <input
              name="name"
              required
              minLength={2}
              autoComplete="name"
              className="mt-2 w-full rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#d8ff3c]"
            />
          </label>
        ) : null}
        <label className="block text-sm text-zinc-400">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="you@email.com"
            className="mt-2 w-full rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#d8ff3c]"
          />
        </label>
        <label className="block text-sm text-zinc-400">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="mt-2 w-full rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-[#d8ff3c]"
          />
        </label>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button type="submit" disabled={busy} className={`w-full ${btn.primary}`}>
          {busy
            ? "Working…"
            : mode === "signup"
              ? unlock
                ? "Create account and unlock"
                : "Create account"
              : unlock
                ? "Sign in and unlock"
                : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function stop() {
    setBusy(true);
    await fetch("/api/account", { method: "DELETE" });
    router.push("/account");
    router.refresh();
  }

  return (
    <button type="button" onClick={() => void stop()} disabled={busy} className={btn.danger}>
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
