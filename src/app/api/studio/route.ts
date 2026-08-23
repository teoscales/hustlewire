import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getArticle } from "@/lib/articles";
import { hasDeskPass } from "@/lib/pass";
import { STUDIO_COOKIE } from "@/lib/premium";
import { mergePlaybookGoals, newGoal, newIdea, parseStudio, type Studio } from "@/lib/studio";

async function readStudio(): Promise<Studio> {
  const jar = await cookies();
  return parseStudio(jar.get(STUDIO_COOKIE)?.value);
}

function save(res: NextResponse, studio: Studio) {
  res.cookies.set({
    name: STUDIO_COOKIE,
    value: JSON.stringify({ ideas: studio.ideas.slice(0, 8) }),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function GET() {
  if (!(await hasDeskPass())) {
    return NextResponse.json({ error: "Desk Pass required" }, { status: 401 });
  }
  return NextResponse.json(await readStudio());
}

export async function PUT(request: Request) {
  if (!(await hasDeskPass())) {
    return NextResponse.json({ error: "Desk Pass required" }, { status: 401 });
  }
  const body = (await request.json()) as Studio;
  const studio = parseStudio(JSON.stringify(body));
  studio.ideas = studio.ideas.map((idea) => ({
    ...idea,
    storySlug: idea.storySlug && getArticle(idea.storySlug) ? idea.storySlug : null,
  }));
  const res = NextResponse.json(studio);
  save(res, studio);
  return res;
}

export async function POST(request: Request) {
  if (!(await hasDeskPass())) {
    return NextResponse.json({ error: "Desk Pass required" }, { status: 401 });
  }
  const body = (await request.json()) as { storySlug?: string; blank?: boolean };
  const studio = await readStudio();

  if (body.blank) {
    if (studio.ideas.length >= 8) {
      return NextResponse.json({ error: "Slot is full" }, { status: 400 });
    }
    studio.ideas.unshift(newIdea({ title: "New idea" }));
    const res = NextResponse.json(studio);
    save(res, studio);
    return res;
  }

  const article = body.storySlug ? getArticle(body.storySlug) : null;
  if (!article) {
    return NextResponse.json({ error: "Story not on the wire" }, { status: 404 });
  }

  const existing = studio.ideas.find((idea) => idea.storySlug === article.slug);
  if (existing) {
    existing.goals = mergePlaybookGoals(existing.goals, article.playbook.suggestedGoals).goals;
    const res = NextResponse.json(studio);
    save(res, studio);
    return res;
  }
  if (studio.ideas.length >= 8) {
    return NextResponse.json({ error: "Slot is full" }, { status: 400 });
  }

  studio.ideas.unshift(
    newIdea({
      title: article.play.headline.slice(0, 80),
      notes: article.play.teaser.slice(0, 800),
      storySlug: article.slug,
      goals: article.playbook.suggestedGoals.slice(0, 8).map((title) => newGoal(title, true)),
    }),
  );

  const res = NextResponse.json(studio);
  save(res, studio);
  return res;
}
