import Link from "next/link";
import { StoryCard } from "@/components/StoryCard";
import { categories, getFeatured, listArticles } from "@/lib/articles";
import { hasDeskPass } from "@/lib/pass";
import { btn } from "@/lib/ui";

export default async function Home() {
  const featured = await getFeatured();
  const articles = await listArticles();
  const rest = articles.filter((article) => article.slug !== featured.slug);
  const tape = articles.filter((article) => article.marketTick);
  const premium = await hasDeskPass();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#d8ff3c]">
          Ad-free news desk
        </p>
        <h1 className="mt-4 font-serif text-5xl leading-[1.02] text-white sm:text-6xl">
          What happened. How to start. Then the full play.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
          Read the story for free. Get the first three moves. Desk Pass unlocks the playbook and
          a slot for every idea you save.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {premium ? (
            <Link href="/my-desk" className={btn.primary}>
              Open My Desk
            </Link>
          ) : (
            <Link href="/premium" className={btn.primary}>
              Get Desk Pass
            </Link>
          )}
          <Link href={`/story/${featured.slug}`} className={btn.ghost}>
            Read the lead
          </Link>
          <Link href="/promote" className={btn.quiet}>
            Promote for a free month
          </Link>
        </div>
      </section>

      <div className="mt-12">
        <StoryCard article={featured} featured />
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div>
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            On the wire
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {rest.map((article) => (
              <StoryCard key={article.slug} article={article} />
            ))}
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-900/40 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">Tape</p>
          <ul className="mt-4 divide-y divide-white/10">
            {tape.map((article) => (
              <li key={article.slug} className="py-3 first:pt-0 last:pb-0">
                <p className="text-xs text-rose-400">{article.marketTick}</p>
                <p className="mt-1 font-serif text-lg leading-snug text-white">
                  {article.news.headline}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-zinc-600">Editorial marks, not live quotes.</p>
        </aside>
      </section>

      <section className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/desk/${category.id}`}
            className="rounded-3xl border border-white/10 bg-zinc-900/40 p-5 transition hover:border-[#d8ff3c]/40"
          >
            <p className="text-sm font-medium text-[#d8ff3c]">{category.label}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{category.blurb}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
