"use client";

import { useState } from "react";
import { btn } from "@/lib/ui";

type Message = { role: "user" | "ai"; text: string };

export function AskPlaybook({
  slug,
  situation,
  questions,
  sample = false,
}: {
  slug: string;
  situation: string;
  questions: string[];
  sample?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setInput("");
    setBusy(true);
    setMessages((current) => [...current, { role: "user", text }]);
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, question: text, sample }),
    });
    const data = (await res.json()) as { answer?: string; error?: string };
    setMessages((current) => [
      ...current,
      {
        role: "ai",
        text: data.answer ?? data.error ?? "Could not answer.",
      },
    ]);
    setBusy(false);
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-zinc-900/50 p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
            Ask AI · this situation
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-snug text-white">{situation}</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
            Suggested questions are for this play only. No API key. Answers come from this
            playbook.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled={busy}
            onClick={() => void ask(question)}
            className={`${btn.quiet} max-w-full text-left`}
          >
            {question}
          </button>
        ))}
      </div>

      {messages.length > 0 ? (
        <div className="mt-6 max-h-80 space-y-3 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                message.role === "user"
                  ? "ml-8 bg-white/5 text-white"
                  : "mr-4 bg-[#d8ff3c]/10 text-zinc-200"
              }`}
            >
              {message.text}
            </div>
          ))}
          {busy ? <p className="text-xs text-zinc-500">Reading this playbook…</p> : null}
        </div>
      ) : null}

      <form
        className="mt-5 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value.slice(0, 400))}
          placeholder="Ask something about this exact play…"
          className="flex-1 rounded-full border border-white/10 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-[#d8ff3c]"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length < 4}
          className={btn.primary}
        >
          Ask
        </button>
      </form>
    </section>
  );
}
