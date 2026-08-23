import { NextResponse } from "next/server";
import { isOwner } from "@/lib/account";
import { updateDeskStore } from "@/lib/desk-store";

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    action?: "approve" | "reject";
  };
  if (!body.id || (body.action !== "approve" && body.action !== "reject")) {
    return NextResponse.json({ error: "Need an approve or reject" }, { status: 400 });
  }

  const result = await updateDeskStore((store) => {
    const application = store.applications?.find((item) => item.id === body.id);
    if (!application) return { error: "Application not found" as const };
    if (application.status !== "pending") return { error: "Already reviewed" as const };
    if (body.action === "approve" && !application.userId) {
      return { error: "No account on this application" as const };
    }
    application.status = body.action === "approve" ? "approved" : "rejected";
    application.reviewedAt = new Date().toISOString();
    return { application };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
