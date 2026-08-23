import { notFound } from "next/navigation";
import { StoryCard } from "@/components/StoryCard";
import { categoryIds, getByCategory, getCategory, isCategoryId } from "@/lib/articles";

export function generateStaticParams() {
  return categoryIds.map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps<"/desk/[category]">) {
  const { category } = await params;
  const desk = getCategory(category);
  return {
    title: desk ? `${desk.label} desk` : "Desk",
    description: desk?.blurb,
  };
}

export default async function DeskPage({ params }: PageProps<"/desk/[category]">) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();

  const desk = getCategory(category);
  const stories = getByCategory(category);
  if (!desk) notFound();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        {desk.label}
      </p>
      <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        {desk.blurb}
      </h1>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {stories.map((article) => (
          <StoryCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}
