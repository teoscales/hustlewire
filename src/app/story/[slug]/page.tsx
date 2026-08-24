import Link from "next/link";
import { notFound } from "next/navigation";
import { StoryCard } from "@/components/StoryCard";
import { StoryView } from "@/components/StoryView";
import { categories, getArticle, getRelated } from "@/lib/articles";
import { getStudio, hasDeskPass } from "@/lib/pass";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/story/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Story" };
  return {
    title: article.title,
    description: article.dek,
  };
}

export default async function StoryPage({ params }: PageProps<"/story/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const desk = categories.find((category) => category.id === article.category);
  const related = await getRelated(article.slug);
  const premium = await hasDeskPass();
  const studio = premium ? await getStudio() : null;
  const alreadySaved = Boolean(studio?.ideas.some((idea) => idea.storySlug === article.slug));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-[#d8ff3c]">
          Wire
        </Link>
        <span className="mx-2 text-zinc-700">/</span>
        <Link href={`/desk/${article.category}`} className="hover:text-[#d8ff3c]">
          {desk?.label}
        </Link>
      </p>

      <StoryView article={article} unlocked={premium} alreadySaved={alreadySaved} />

      <section className="mt-16">
        <p className="mb-5 text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
          More on the wire
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <StoryCard key={item.slug} article={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
