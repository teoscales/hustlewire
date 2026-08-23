"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btn } from "@/lib/ui";

export function SaveIdeaButton({
  slug,
  already,
  goalCount,
  sample = false,
}: {
  slug: string;
  already: boolean;
  goalCount: number;
  sample?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(already);

  async function save() {
    setBusy(true);
    const res = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storySlug: slug }),
    });
    setBusy(false);
    if (!res.ok) return;
    setDone(true);
    router.refresh();
  }

  if (sample) {
    return (
      <Link href="/account?next=/my-desk&unlock=1" className={btn.primary}>
        Unlock to save this play · {goalCount} goals
      </Link>
    );
  }

  if (done) {
    return (
      <Link href="/my-desk" className={btn.primary}>
        Open this idea on My Desk · {goalCount} goals
      </Link>
    );
  }

  return (
    <button type="button" onClick={save} disabled={busy} className={btn.primary}>
      {busy ? "Saving…" : `Save this play to My Desk · ${goalCount} goals`}
    </button>
  );
}
