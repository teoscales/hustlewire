import { articles as data } from "./article-data";
import { demoArticle, demoStorySlug } from "./demo-story";
import { categoryIds, type Article, type Category, type CategoryId } from "./types";

export { categoryIds };
export { demoArticle, demoStorySlug };

export const categories: Category[] = [
  { id: "markets", label: "Markets", blurb: "Tape moves. Then the side door." },
  { id: "products", label: "Products", blurb: "They shipped a vibe. You ship the missing piece." },
  { id: "platforms", label: "Platforms", blurb: "The feed changed. Occupying it is the job." },
  { id: "street", label: "Street", blurb: "Plays you can start before Monday." },
];

export const articles: Article[] = data;

/** Live masthead clock: seconds since the newest story landed on the wire. */
export function getNewsUpdatedAt() {
  let latest = 0;
  for (const article of articles) {
    const stamp = Date.parse(article.publishedAt);
    if (stamp > latest) latest = stamp;
  }
  return new Date(latest || Date.now()).toISOString();
}

export function getArticle(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getFeatured() {
  return articles.find((article) => article.featured) ?? articles[0];
}

export function getDemoArticle() {
  return demoArticle;
}

export function isDemoStory(slug: string) {
  return slug === demoStorySlug;
}

export function getByCategory(category: CategoryId) {
  return articles.filter((article) => article.category === category);
}

export function getCategory(id: string) {
  return categories.find((category) => category.id === id);
}

export function isCategoryId(value: string): value is CategoryId {
  return (categoryIds as readonly string[]).includes(value);
}

export function getRelated(slug: string, limit = 3) {
  const current = getArticle(slug);
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
