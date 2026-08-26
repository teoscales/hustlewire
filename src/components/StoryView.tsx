import type { Article } from "@/lib/types";
import { Playbook } from "./Playbook";
import { PlaybookGoalsNote } from "./PlaybookGoalsNote";
import { Playwall } from "./Playwall";
import { SaveIdeaButton } from "./SaveIdeaButton";
import { StartGuide } from "./StartGuide";
import { StoryMark } from "./StoryMark";
import { formatWireDate } from "@/lib/format";
import { categories } from "@/lib/articles";

export function StoryView({
  article,
  unlocked,
  alreadySaved = false,
  sample = false,
}: {
  article: Article;
  unlocked: boolean;
  alreadySaved?: boolean;
  sample?: boolean;
}) {
  const desk = categories.find((category) => category.id === article.category);
  const showDesk = unlocked || sample;

  return (
    <>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_0.8fr] lg:items-start">
        <article>
          <StoryMark
            code={article.code}
            accent={article.accent}
            ink={article.ink}
            markImage={article.storyMarkImage ?? article.markImage}
            className="min-h-[12rem] sm:min-h-[15rem]"
          />
          <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[#d8ff3c]">
              {sample ? "Demo" : article.kicker}
            </span>
            {sample ? <span>Not on the wire</span> : desk ? <span>{desk.label}</span> : null}
            <span>{formatWireDate(article.publishedAt)}</span>
            <span>{article.readMinutes} min</span>
            {article.marketTick ? <span className="text-rose-400">{article.marketTick}</span> : null}
          </div>
          <h1 className="mt-4 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-400">{article.dek}</p>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
            {sample ? "Sample copy · not on the wire" : "The news · ad-free"}
          </p>
          <h2 className="mt-3 font-serif text-2xl leading-snug text-white">
            {article.news.headline}
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-zinc-400">
            {article.news.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
        <StartGuide article={article} unlocked={showDesk} />
      </div>

      {showDesk ? (
        <div className="mt-6 space-y-4">
          <PlaybookGoalsNote titles={article.playbook.suggestedGoals} />
          <div className="flex flex-wrap items-center gap-4 rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 px-6 py-5">
            <p className="flex-1 text-sm leading-6 text-zinc-200">
              <span className="font-medium text-[#d8ff3c]">
                {sample ? "Sample action." : "Pass action."}
              </span>{" "}
              {sample
                ? "On a real pass, saving puts this play in your slot and loads these goals."
                : "Saving puts this play in your slot and loads the playbook goals automatically."}
            </p>
            <SaveIdeaButton
              slug={article.slug}
              already={alreadySaved}
              goalCount={article.playbook.suggestedGoals.length}
              sample={sample}
            />
          </div>
        </div>
      ) : (
        <Playwall slug={article.slug} />
      )}

      {showDesk ? (
        <Playbook
          slug={article.slug}
          headline={article.play.headline}
          playbook={article.playbook}
          sample={sample}
        />
      ) : null}
    </>
  );
}
