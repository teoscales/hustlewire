"use client";

import { useEffect, useState } from "react";
import { formatTimeLeft, formatWireDate } from "@/lib/format";

export function PassRemaining({
  expiresAt,
  canceling = false,
}: {
  expiresAt: string;
  canceling?: boolean;
}) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const left = formatTimeLeft(expiresAt, now);
  const until = formatWireDate(expiresAt);

  if (canceling) {
    return (
      <p className="text-sm leading-6 text-zinc-300">
        Unsubscribed. Desk Pass stays until <span className="text-white">{until}</span>.{" "}
        {left} left. Stripe will not bill again.
      </p>
    );
  }

  return (
    <p className="text-sm leading-6 text-zinc-300">
      Desk Pass is active until <span className="text-white">{until}</span> ({left} left).
    </p>
  );
}
