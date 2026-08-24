import Link from "next/link";
import { listArticles } from "@/lib/articles";

export async function Ticker() {
  const articles = await listArticles();
  const items = articles.map((article) => ({
    slug: article.slug,
    tick: article.marketTick ?? article.kicker.toUpperCase(),
    play: article.play.headline,
  }));
  const loop = [...items, ...items];

  return (
    <div className="min-w-0 flex-1 overflow-hidden">
      <div className="ticker-track flex w-max items-center gap-8 py-2 text-xs text-zinc-400">
        {loop.map((item, index) => (
          <Link
            key={`${item.slug}-${index}`}
            href={`/story/${item.slug}`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap hover:text-[#d8ff3c]"
          >
            <span className="text-[#d8ff3c]">{item.tick}</span>
            <span className="text-zinc-600">·</span>
            <span>{item.play}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
