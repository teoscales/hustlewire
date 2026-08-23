"use client";

import { useEffect, useRef, useState } from "react";
import type { WriterChatMessage } from "@/lib/desk-types";
import { formatWhen } from "@/lib/format";
import { btn } from "@/lib/ui";

export function WriterChat({
  userId,
  asOwner = false,
  initial,
  title = "Chat with the desk",
}: {
  userId?: string;
  asOwner?: boolean;
  initial: WriterChatMessage[];
  title?: string;
}) {
  const [messages, setMessages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const query = asOwner && userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const id = window.setInterval(() => {
      void fetch(`/api/careers/chat${query}`)
        .then((res) => res.json())
        .then((data: { messages?: WriterChatMessage[] }) => {
          if (Array.isArray(data.messages)) setMessages(data.messages);
        })
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(id);
  }, [asOwner, userId]);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get("text") ?? "").trim();
    if (!text) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/careers/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, userId }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: WriterChatMessage;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send");
      return;
    }
    form.reset();
    if (data.message) setMessages((current) => [...current, data.message!]);
  }

  const mine = asOwner ? "owner" : "writer";

  return (
    <section className="rounded-[2rem] border border-white/15 bg-zinc-950 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d8ff3c]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {asOwner
          ? "They see this on Careers. You see it here."
          : "Support sees this in the office."}
      </p>
      <div
        ref={scroller}
        className="mt-4 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900/60 p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">No messages yet.</p>
        ) : (
          messages.map((item) => {
            const self = item.from === mine;
            return (
              <div key={item.id} className={`flex ${self ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                    self
                      ? "bg-[#d8ff3c] text-zinc-950"
                      : "bg-white/10 text-zinc-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{item.body}</p>
                  <p className={`mt-1 text-[10px] uppercase tracking-[0.12em] ${self ? "text-zinc-700" : "text-zinc-500"}`}>
                    {item.from === "owner" ? "Owner" : "Writer"} · {formatWhen(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={(event) => void send(event)} className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block min-w-[12rem] flex-1 text-sm text-zinc-400">
          Message
          <textarea
            name="text"
            required
            rows={2}
            placeholder="Write to the other desk."
            className="mt-2 w-full resize-none rounded-2xl border border-white/15 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-[#d8ff3c]"
          />
        </label>
        <button type="submit" disabled={busy} className={btn.primary}>
          {busy ? "Sending…" : "Send"}
        </button>
      </form>
      {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
    </section>
  );
}

export function OwnerChats({
  threads,
}: {
  threads: { userId: string; name: string; email: string; messages: WriterChatMessage[] }[];
}) {
  const [open, setOpen] = useState(threads[0]?.userId ?? "");
  const current = threads.find((item) => item.userId === open) ?? threads[0];

  if (threads.length === 0) {
    return (
      <section className="mt-12">
        <h2 className="font-serif text-3xl text-white">Writer chat</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Approve a writer and a thread shows up here, and on their Careers page.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="font-serif text-3xl text-white">Writer chat</h2>
      <p className="mt-2 text-sm text-zinc-500">Same thread they see on Careers.</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {threads.map((thread) => {
          const last = thread.messages.at(-1);
          const active = current?.userId === thread.userId;
          return (
            <button
              key={thread.userId}
              type="button"
              onClick={() => setOpen(thread.userId)}
              className={`rounded-full px-4 py-2 text-left text-sm ${
                active
                  ? "bg-[#d8ff3c] font-semibold text-zinc-950"
                  : "border border-white/15 text-zinc-300 hover:border-[#d8ff3c] hover:text-white"
              }`}
            >
              <span className="block">{thread.name}</span>
              <span className={`block text-xs ${active ? "text-zinc-700" : "text-zinc-500"}`}>
                {last ? last.body.slice(0, 28) : "No messages"}
              </span>
            </button>
          );
        })}
      </div>
      {current ? (
        <div className="mt-6">
          <WriterChat
            key={current.userId}
            asOwner
            userId={current.userId}
            initial={current.messages}
            title={`${current.name} · ${current.email}`}
          />
        </div>
      ) : null}
    </section>
  );
}
