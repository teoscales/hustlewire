import { NextResponse } from "next/server";
import { Resend } from "resend";

type NotifyBody = {
  business_slug?: string;
  rating?: number;
  comment?: string;
  contact?: string | null;
};

function ownerEmail() {
  return process.env.OWNER_EMAIL || process.env.HW_OWNER_EMAIL || "";
}

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  const to = ownerEmail();
  if (!key) {
    return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
  }
  if (!to) {
    return NextResponse.json({ error: "Missing OWNER_EMAIL" }, { status: 500 });
  }

  let body: NotifyBody;
  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = (body.business_slug ?? "").trim();
  const rating = Number(body.rating);
  const comment = (body.comment ?? "").trim();
  const contact = (body.contact ?? "").trim();

  if (!slug) {
    return NextResponse.json({ error: "Need a business slug" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Need a rating from 1 to 5" }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ error: "Need a comment" }, { status: 400 });
  }

  const from = process.env.RESEND_FROM_EMAIL || "HustleWire Reviews <beth.t@example.com>";
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${rating}/5 review for ${slug}`,
    text: [
      `New private review`,
      `Business: ${slug}`,
      `Rating: ${rating}/5 ${stars}`,
      `Comment: ${comment}`,
      `Contact: ${contact || "(none)"}`,
    ].join("\n"),
    html: `
      <p><strong>New private review</strong></p>
      <p>Business: ${escapeHtml(slug)}<br />
      Rating: ${rating}/5 ${stars}<br />
      Contact: ${escapeHtml(contact || "(none)")}</p>
      <p>${escapeHtml(comment)}</p>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
