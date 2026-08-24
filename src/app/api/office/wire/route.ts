import { NextResponse } from "next/server";
import { isOwner } from "@/lib/account";
import { getDeskStore, updateDeskStore } from "@/lib/desk-store";
import type { WireStory } from "@/lib/desk-types";
import {
  articleToDraft,
  draftToArticle,
  newWireStory,
  takenSlugs,
  type WireDraftInput,
} from "@/lib/wire";

type Body = {
  action?: "save" | "publish" | "unpublish" | "delete";
  id?: string;
  featured?: boolean;
  draft?: WireDraftInput;
};

export async function GET() {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }
  const store = await getDeskStore();
  const stories = [...(store.stories ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({
    stories: stories.map((story) => ({
      id: story.id,
      status: story.status,
      updatedAt: story.updatedAt,
      publishedAt: story.publishedAt,
      slug: story.article.slug,
      title: story.article.title,
      featured: Boolean(story.article.featured),
      draft: articleToDraft(story.article),
    })),
  });
}

export async function POST(request: Request) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "Owner login required" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Body;
  const action = body.action;
  if (action !== "save" && action !== "publish" && action !== "unpublish" && action !== "delete") {
    return NextResponse.json({ error: "Need a wire action" }, { status: 400 });
  }

  const result = await updateDeskStore((store) => {
    if (!Array.isArray(store.stories)) store.stories = [];
    const now = new Date().toISOString();

    if (action === "delete") {
      const existing = store.stories.find((story) => story.id === body.id);
      if (!existing) return { error: "Story not found" as const };
      store.stories = store.stories.filter((story) => story.id !== body.id);
      return { story: existing };
    }

    if (action === "unpublish") {
      const existing = store.stories.find((story) => story.id === body.id);
      if (!existing) return { error: "Story not found" as const };
      existing.status = "draft";
      existing.updatedAt = now;
      existing.article = { ...existing.article, featured: false };
      return { story: existing };
    }

    const built = draftToArticle(
      body.draft ?? {},
      store.stories.find((story) => story.id === body.id)?.article,
      takenSlugs(store.stories, body.id),
    );
    if (built.error || !built.article) return { error: built.error ?? "Could not build the story" };

    const article = {
      ...built.article,
      featured: Boolean(body.featured ?? body.draft?.featured),
    };

    if (action === "publish" && article.featured) {
      for (const story of store.stories) {
        if (story.id === body.id) continue;
        story.article = { ...story.article, featured: false };
      }
    }

    let story: WireStory;
    if (body.id) {
      const existing = store.stories.find((item) => item.id === body.id);
      if (!existing) return { error: "Story not found" as const };
      existing.article = {
        ...article,
        slug: existing.article.slug,
        publishedAt: action === "publish" ? now : existing.article.publishedAt,
      };
      existing.updatedAt = now;
      if (action === "publish") {
        existing.status = "live";
        existing.publishedAt = now;
      }
      story = existing;
    } else {
      story = newWireStory(article, action === "publish" ? "live" : "draft");
      if (action === "publish") {
        story.article = { ...story.article, publishedAt: now, featured: article.featured };
      }
      store.stories.unshift(story);
    }

    return { story };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    story: {
      id: result.story.id,
      status: result.story.status,
      slug: result.story.article.slug,
      title: result.story.article.title,
    },
  });
}
