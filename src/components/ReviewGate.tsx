"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = "rate" | "thanks" | "form" | "sent";

const labels = ["", "Hated it", "Disliked it", "It was OK", "Liked it", "Loved it"];

export function ReviewGate({
  slug,
  businessName,
  googleReviewLink,
}: {
  slug: string;
  businessName: string;
  googleReviewLink: string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [step, setStep] = useState<Step>("rate");
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pick(value: number) {
    setRating(value);
    setError("");
    if (value >= 4) setStep("thanks");
    else setStep("form");
  }

  useEffect(() => {
    if (step !== "thanks") return;
    if (!googleReviewLink) return;
    const id = window.setTimeout(() => {
      window.location.assign(googleReviewLink);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [step, googleReviewLink]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1 || rating > 3) return;
    const trimmedComment = comment.trim();
    if (!trimmedComment) {
      setError("Share a few details about your visit.");
      return;
    }

    setBusy(true);
    setError("");
    const payload = {
      business_slug: slug,
      rating,
      comment: trimmedComment.slice(0, 2000),
      contact: contact.trim().slice(0, 200) || null,
    };

    try {
      const { error: saveError } = await supabase.from("reviews").insert(payload);
      if (saveError) {
        setError("Could not post your review. Try again.");
        return;
      }
      await fetch("/api/notify-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStep("sent");
    } catch {
      setError("Could not post your review. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const shown = hover || rating;
  const initial = (businessName.trim().charAt(0) || "?").toUpperCase();

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center px-5 py-10">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] text-lg font-medium text-[#1a73e8]">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[16px] font-medium leading-5 text-[#202124]">{businessName}</p>
          <p className="mt-0.5 text-[13px] text-[#5f6368]">Rate and review</p>
        </div>
      </div>

      {step === "thanks" || step === "sent" ? (
        <div className="mt-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center">
            <StarIcon filled className="h-12 w-12" />
          </div>
          <h1 className="mt-4 text-[22px] font-normal leading-7 text-[#202124]">
            {step === "thanks" ? "Thanks for the review" : "Your review was posted"}
          </h1>
          <p className="mt-2 text-[14px] leading-5 text-[#5f6368]">
            {step === "thanks"
              ? googleReviewLink
                ? "Taking you to Google to share it publicly."
                : "Your rating means a lot."
              : "Thanks for sharing your experience."}
          </p>
        </div>
      ) : (
        <>
          <h1 className="mt-8 text-[22px] font-normal leading-7 text-[#202124]">
            Rate your experience
          </h1>

          <div className="mt-5 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = shown >= value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  onMouseEnter={() => setHover(value)}
                  onFocus={() => setHover(value)}
                  onBlur={() => setHover(0)}
                  onClick={() => pick(value)}
                  className="flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-90 sm:h-14 sm:w-14"
                >
                  <StarIcon filled={filled} className="h-10 w-10 sm:h-11 sm:w-11" />
                </button>
              );
            })}
          </div>
          <p className="mt-1 h-5 text-center text-[13px] text-[#5f6368]">
            {shown ? labels[shown] : ""}
          </p>
        </>
      )}

      {step === "form" ? (
        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
          <label className="block text-[13px] font-medium text-[#5f6368]">
            Share more about your experience at this place
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value.slice(0, 2000))}
              required
              rows={4}
              placeholder="What was it like?"
              className="mt-2 w-full resize-none rounded-lg border border-[#dadce0] bg-white px-3.5 py-3 text-[16px] text-[#202124] outline-none placeholder:text-[#80868b] focus:border-[#1a73e8] focus:shadow-[inset_0_0_0_1px_#1a73e8]"
            />
          </label>
          <label className="block text-[13px] font-medium text-[#5f6368]">
            Email or phone <span className="font-normal">(optional)</span>
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value.slice(0, 200))}
              type="text"
              inputMode="email"
              autoComplete="off"
              placeholder="So the business can follow up"
              className="mt-2 w-full rounded-lg border border-[#dadce0] bg-white px-3.5 py-3 text-[16px] text-[#202124] outline-none placeholder:text-[#80868b] focus:border-[#1a73e8] focus:shadow-[inset_0_0_0_1px_#1a73e8]"
            />
          </label>
          {error ? <p className="text-[13px] text-[#d93025]">{error}</p> : null}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-[#1a73e8] px-6 py-2 text-[14px] font-medium text-white shadow-sm transition hover:bg-[#1557b0] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
        </form>
      ) : null}
    </main>
  );
}

function StarIcon({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className ?? ""} ${filled ? "fill-[#fbbc04]" : "fill-[#dadce0]"}`}
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}
