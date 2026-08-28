"use client";

import { useEffect, useRef, useState } from "react";
import { btn } from "@/lib/ui";

type GiftAnnouncementProps = {
  title: string;
  body: string;
};

export function GiftAnnouncement({ title, body }: GiftAnnouncementProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#d8ff3c", "#fff6e0", "#ffffff", "#ff6b2c", "#7c5cff"];
    const bits = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight,
      r: 3 + Math.random() * 5,
      vy: 2.4 + Math.random() * 3.8,
      vx: -1.4 + Math.random() * 2.8,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 4,
    }));

    let frame = 0;
    let raf = 0;
    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const bit of bits) {
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.rot += bit.vr;
        if (bit.y > canvas.height + 20) {
          bit.y = -20;
          bit.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(bit.x, bit.y);
        ctx.rotate(bit.rot);
        ctx.fillStyle = bit.color;
        ctx.fillRect(-bit.w / 2, -bit.h / 2, bit.w, bit.h);
        ctx.restore();
      }
      frame += 1;
      if (frame < 420) raf = window.requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    raf = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(raf);
  }, [open]);

  if (!open) return null;

  async function dismiss() {
    setBusy(true);
    try {
      await fetch("/api/gift-note", { method: "POST" });
    } catch {
      // Still close so it does not trap the page.
    }
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-zinc-950/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gift-note-title"
        className="relative w-full max-w-lg rounded-3xl border-2 border-[#d8ff3c] bg-zinc-950 p-8 text-center shadow-[0_0_80px_rgba(216,255,60,0.18)]"
      >
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d8ff3c]">
          Gift from the desk
        </p>
        <h2 id="gift-note-title" className="mt-4 font-serif text-4xl leading-tight text-white">
          {title}
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-300">{body}</p>
        <button type="button" className={`${btn.primary} mt-8`} onClick={dismiss} disabled={busy}>
          {busy ? "Saving…" : "Open the desk"}
        </button>
      </div>
    </div>
  );
}
