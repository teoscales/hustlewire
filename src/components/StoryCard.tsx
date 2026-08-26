import Link from "next/link";
import type { Article } from "@/lib/types";
import { categories } from "@/lib/articles";
import { formatShortDate } from "@/lib/format";
import { btn } from "@/lib/ui";
import { StoryMark } from "./StoryMark";

function deskLabel(id: Article["category"]) {
  return categories.find((category) => category.id === id)?.label ?? id;
}

type StoryCardProps = {
  article: Article;
  featured?: boolean;
};

export function StoryCard({ article, featured = false }: StoryCardProps) {
  return (
    <Link
      href={`/story/${article.slug}`}
      className={`group flex overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 transition hover:border-[#d8ff3c]/40 hover:bg-zinc-900 ${
        featured ? "flex-col sm:flex-row" : "flex-col"
      }`}
    >
      <StoryMark
        code={article.code}
        accent={article.accent}
        ink={article.ink}
        markImage={article.markImage}
        className={featured ? "min-h-[14rem] sm:w-[42%] sm:min-h-[18rem] sm:self-stretch" : "min-h-[9.5rem]"}
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[#d8ff3c]">
            {deskLabel(article.category)}
          </span>
          <span>{formatShortDate(article.publishedAt)}</span>
          {article.marketTick ? (
            <span className="text-rose-400">{article.marketTick}</span>
          ) : null}
        </div>
        <p className="text-xs text-zinc-500">{article.kicker}</p>
        <h2
          className={`font-serif leading-[1.08] text-zinc-50 group-hover:text-[#d8ff3c] ${
            featured ? "text-3xl sm:text-4xl" : "text-2xl"
          }`}
        >
          {article.title}
        </h2>
        <p className="text-sm leading-6 text-zinc-400">{article.dek}</p>
        <span className={`${btn.primary} mt-auto w-fit px-4 py-2 text-xs`}>How to start</span>
      </div>
    </Link>
  );
}
