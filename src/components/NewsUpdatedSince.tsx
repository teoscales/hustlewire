"use client";

import { useEffect, useState } from "react";
import { formatElapsed } from "@/lib/format";

export function NewsUpdatedSince({ since }: { since: string }) {
  const start = Date.parse(since);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [since]);

  return (
    <p className="flex shrink-0 items-center gap-2 border-r border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 sm:px-5">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#d8ff3c]/70" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-[#d8ff3c]" />
      </span>
      <span className="hidden sm:inline">News updated since</span>
      <span className="sm:hidden">Since</span>
      <time
        dateTime={since}
        className="min-w-[4.75rem] tabular-nums text-[#d8ff3c]"
        suppressHydrationWarning
      >
        {now == null ? "--:--:--" : formatElapsed(now - start)}
      </time>
    </p>
  );
}
