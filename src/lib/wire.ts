import { articles as catalog } from "./article-data";
import type { WireStory } from "./desk-types";
import { newDeskId } from "./password";
import { categoryIds, type Article, type CategoryId, type PlayStep, type Risk } from "./types";

export type WireMoveInput = {
  title: string;
  window: string;
  body: string;
};

export type WireDraftInput = {
  slug?: string;
  code?: string;
  accent?: string;
  category?: string;
  kicker?: string;
  title?: string;
  dek?: string;
  featured?: boolean;
  marketTick?: string;
  newsHeadline?: string;
  newsBody?: string;
  playHeadline?: string;
  playTeaser?: string;
  thesis?: string;
  capital?: string;
  speed?: string;
  risk?: string;
  briefing?: string;
  moves?: WireMoveInput[];
  kit?: string;
  pitfalls?: string;
  kill?: string;
  suggestedGoals?: string;
  questions?: string;
};

export const wireAccents = ["#d8ff3c", "#7c5cff", "#ec008c", "#3cc8ff", "#ff6b2c"];

function lines(value: string | undefined) {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function paragraphs(value: string | undefined) {
  return (value ?? "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || `story-${Date.now().toString(36)}`;
}

export function makeCode(title: string, fallback = "HW") {
  const words = title
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.slice(0, 2);
  if (words[0]) return words[0].slice(0, 2);
  return fallback;
}

function asCategory(value: string | undefined): CategoryId {
  return (categoryIds as readonly string[]).includes(value ?? "") ? (value as CategoryId) : "street";
}

function asRisk(value: string | undefined): Risk {
  return value === "low" || value === "medium" || value === "high" ? value : "medium";
}

export function takenSlugs(stories: WireStory[], exceptId?: string) {
  const slugs = new Set(catalog.map((article) => article.slug));
  for (const story of stories) {
    if (story.id === exceptId) continue;
    slugs.add(story.article.slug);
  }
  return slugs;
}

export function uniqueSlug(base: string, taken: Set<string>) {
  const root = slugify(base);
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n += 1;
  return `${root}-${n}`;
}

function cleanMoves(moves: WireMoveInput[] | undefined): PlayStep[] {
  return (moves ?? [])
    .map((move) => ({
      title: (move.title ?? "").trim(),
      window: (move.window ?? "").trim() || "Day 1",
      body: (move.body ?? "").trim(),
    }))
    .filter((move) => move.title && move.body);
}

export function draftToArticle(
  draft: WireDraftInput,
  existing?: Article,
  taken?: Set<string>,
): { article?: Article; error?: string } {
  const title = (draft.title ?? "").trim();
  if (title.length < 8) return { error: "Title needs 8+ characters" };
  const dek = (draft.dek ?? "").trim();
  if (dek.length < 12) return { error: "Dek needs a real sentence" };
  const kicker = (draft.kicker ?? "").trim();
  if (kicker.length < 2) return { error: "Add a kicker" };
  const newsBody = paragraphs(draft.newsBody);
  if (newsBody.length < 2) return { error: "News needs at least two paragraphs" };
  const playHeadline = (draft.playHeadline ?? "").trim();
  const playTeaser = (draft.playTeaser ?? "").trim();
  if (playHeadline.length < 8 || playTeaser.length < 8) {
    return { error: "Add a play headline and teaser" };
  }
  const thesis = (draft.thesis ?? "").trim();
  if (thesis.length < 12) return { error: "Add a thesis" };
  const moves = cleanMoves(draft.moves);
  if (moves.length < 3) return { error: "Add at least three moves" };

  const briefing = lines(draft.briefing);
  const kit = lines(draft.kit);
  const pitfalls = lines(draft.pitfalls);
  const kill = lines(draft.kill);
  const suggestedGoals = lines(draft.suggestedGoals);
  const questions = lines(draft.questions);
  const newsHeadline = (draft.newsHeadline ?? "").trim() || title;
  const capital = (draft.capital ?? "").trim() || "$0";
  const speed = (draft.speed ?? "").trim() || "Tonight";
  const slug = existing?.slug ?? uniqueSlug(draft.slug?.trim() || title, taken ?? new Set());
  const words = `${title} ${dek} ${newsBody.join(" ")}`.split(/\s+/).length;
  const readMinutes = Math.max(3, Math.min(12, Math.round(words / 180)));
  const risk = asRisk(draft.risk);

  const article: Article = {
    slug,
    code: (draft.code ?? "").trim().slice(0, 3).toUpperCase() || makeCode(title),
    accent: wireAccents.includes(draft.accent ?? "") ? draft.accent! : existing?.accent ?? wireAccents[0],
    ink: existing?.ink ?? "#10140a",
    category: asCategory(draft.category),
    kicker,
    title,
    dek,
    publishedAt: existing?.publishedAt ?? new Date().toISOString(),
    readMinutes,
    featured: Boolean(draft.featured),
    marketTick: (draft.marketTick ?? "").trim() || undefined,
    news: { headline: newsHeadline, body: newsBody },
    play: { headline: playHeadline, teaser: playTeaser },
    playbook: {
      thesis,
      capital,
      speed,
      risk,
      briefing:
        briefing.length > 0
          ? briefing
          : [
              `The news is ${title}`,
              "Stay in the legal lane. Do not copy the crime.",
              "The product is a recap and a play, not a knockoff.",
            ],
      sequence: moves,
      numbers: [
        { label: "First posts", value: "3 tonight", note: "Same story. Same rule. No shortcuts." },
        { label: "Spend", value: capital, note: "Do not buy the bag you are covering." },
        { label: "Days on the story", value: speed, note: "If the window closes, kill it." },
        { label: "Risk", value: risk, note: "Walk if it needs stolen files or fake claims." },
      ],
      kit: kit.length > 0 ? kit : ["Phone", "Public posts and headlines", "A written line you will not cross"],
      scripts: [
        { where: "Recap open", text: `${playHeadline} ${playTeaser}` },
        { where: "Bio", text: "Recaps and the play. No files. No fake official pages." },
        { where: "Comment asking for the shortcut", text: "I don't post that. The recap stays on the channel." },
      ],
      pitfalls:
        pitfalls.length > 0
          ? pitfalls
          : ["Posting someone else's files.", "Apeing the coin you are covering.", "Calling a leak crew a studio."],
      week: moves.slice(0, 6).map((move, index) => ({
        day: ["Tonight", "Mon", "Tue", "Wed", "Thu", "Fri"][index] ?? `Day ${index + 1}`,
        move: move.title,
      })),
      kill:
        kill.length > 0
          ? kill
          : ["You needed stolen files to get views. Stop.", "A strike or a letter. Do not re-upload."],
      suggestedGoals: suggestedGoals.length > 0 ? suggestedGoals : moves.slice(0, 5).map((move) => move.title),
      questions:
        questions.length > 0
          ? questions
          : ["What is the legal lane?", "How do I post without becoming their megaphone?"],
    },
  };

  return { article };
}

export function newWireStory(article: Article, status: WireStory["status"]): WireStory {
  const now = new Date().toISOString();
  return {
    id: newDeskId(),
    status,
    createdAt: now,
    updatedAt: now,
    publishedAt: status === "live" ? now : null,
    article,
  };
}

export function liveArticles(stories: WireStory[] | undefined) {
  return (stories ?? [])
    .filter((story) => story.status === "live")
    .sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt))
    .map((story) => story.article);
}

export function articleToDraft(article: Article): WireDraftInput {
  return {
    slug: article.slug,
    code: article.code,
    accent: article.accent,
    category: article.category,
    kicker: article.kicker,
    title: article.title,
    dek: article.dek,
    featured: Boolean(article.featured),
    marketTick: article.marketTick ?? "",
    newsHeadline: article.news.headline,
    newsBody: article.news.body.join("\n\n"),
    playHeadline: article.play.headline,
    playTeaser: article.play.teaser,
    thesis: article.playbook.thesis,
    capital: article.playbook.capital,
    speed: article.playbook.speed,
    risk: article.playbook.risk,
    briefing: article.playbook.briefing.join("\n"),
    moves: article.playbook.sequence.map((step) => ({
      title: step.title,
      window: step.window,
      body: step.body,
    })),
    kit: article.playbook.kit.join("\n"),
    pitfalls: article.playbook.pitfalls.join("\n"),
    kill: article.playbook.kill.join("\n"),
    suggestedGoals: article.playbook.suggestedGoals.join("\n"),
    questions: article.playbook.questions.join("\n"),
  };
}
