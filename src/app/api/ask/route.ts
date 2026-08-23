import { NextResponse } from "next/server";
import { getArticle, getDemoArticle, isDemoStory } from "@/lib/articles";
import { askPlaybook } from "@/lib/ask-playbook";
import { hasDeskPass } from "@/lib/pass";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    slug?: string;
    question?: string;
    sample?: boolean;
  };
  const question = body.question?.trim() ?? "";
  const article = isDemoStory(body.slug ?? "") ? getDemoArticle() : body.slug ? getArticle(body.slug) : null;
  const sample = Boolean(body.sample) && Boolean(article && isDemoStory(article.slug));

  if (!(await hasDeskPass()) && !sample) {
    return NextResponse.json({ error: "Desk Pass required" }, { status: 401 });
  }
  if (!article || question.length < 4) {
    return NextResponse.json({ error: "Need a story and a question" }, { status: 400 });
  }

  return NextResponse.json({
    answer: askPlaybook(article, question),
    situation: article.play.headline,
  });
}
