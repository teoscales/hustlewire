import { articles as catalog } from "./article-data";
import { getDeskStore } from "./desk-store";
import { demoArticle, demoStorySlug } from "./demo-story";
import { categoryIds, type Article, type Category, type CategoryId } from "./types";
import { liveArticles } from "./wire";

export { categoryIds };
export { demoArticle, demoStorySlug };

export const categories: Category[] = [
  { id: "markets", label: "Markets", blurb: "Tape moves. Then the side door." },
  { id: "products", label: "Products", blurb: "They shipped a vibe. You ship the missing piece." },
  { id: "platforms", label: "Platforms", blurb: "The feed changed. Occupying it is the job." },
  { id: "street", label: "Street", blurb: "Plays you can start before Monday." },
];

export const stockArticles: Article[] = catalog;

export async function listArticles() {
  try {
    const store = await getDeskStore();
    const live = liveArticles(store.stories);
    const liveSlugs = new Set(live.map((article) => article.slug));
    const liveLead = live.some((article) => article.featured);
    const stock = catalog
      .filter((article) => !liveSlugs.has(article.slug))
      .map((article) => (liveLead ? { ...article, featured: false } : article));
    return [...live, ...stock];
  } catch {
    return [...catalog];
  }
}

export async function getNewsUpdatedAt() {
  const articles = await listArticles();
  let latest = 0;
  for (const article of articles) {
    const stamp = Date.parse(article.publishedAt);
    if (stamp > latest) latest = stamp;
  }
  return new Date(latest || Date.now()).toISOString();
}

export async function getArticle(slug: string) {
  const articles = await listArticles();
  return articles.find((article) => article.slug === slug);
}

export async function getFeatured() {
  const articles = await listArticles();
  return articles.find((article) => article.featured) ?? articles[0];
}

export function getDemoArticle() {
  return demoArticle;
}

export function isDemoStory(slug: string) {
  return slug === demoStorySlug;
}

export async function getByCategory(category: CategoryId) {
  const articles = await listArticles();
  return articles.filter((article) => article.category === category);
}

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function isCategoryId(value: string): value is CategoryId {
  return (categoryIds as readonly string[]).includes(value);
}

export async function getRelated(slug: string, limit = 3) {
  const articles = await listArticles();
  const current = articles.find((article) => article.slug === slug);
  if (!current) return articles.slice(0, limit);

  const sameDesk = articles.filter(
    (article) => article.slug !== slug && article.category === current.category,
  );
  const rest = articles.filter(
    (article) => article.slug !== slug && article.category !== current.category,
  );

  return [...sameDesk, ...rest].slice(0, limit);
}

function firstBeat(text: string) {
  const match = text.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : text).trim().slice(0, 170);
}

export function getStartGuide(article: Article) {
  return {
    headline: article.play.headline,
    teaser: article.play.teaser,
    capital: article.playbook.capital,
    speed: article.playbook.speed,
    risk: article.playbook.risk,
    moves: article.playbook.sequence.slice(0, 3).map((step, index) => ({
      n: String(index + 1).padStart(2, "0"),
      title: step.title,
      hint: firstBeat(step.body),
    })),
  };
}
