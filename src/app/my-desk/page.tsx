import { redirect } from "next/navigation";
import { articles } from "@/lib/articles";
import { getAccount } from "@/lib/account";
import { getDeskPassInfo, getStudio, hasDeskPass } from "@/lib/pass";
import { IdeaSlotBoard } from "@/components/IdeaSlotBoard";
import { PassRemaining } from "@/components/PassRemaining";
import { UnsubscribeSection } from "@/components/UnsubscribeSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Desk",
};

export default async function MyDeskPage() {
  const account = await getAccount();
  if (!account) redirect("/account?next=/my-desk");
  const premium = await hasDeskPass();
  if (!premium) redirect("/premium");
  const pass = await getDeskPassInfo();

  const studio = await getStudio();
  const stories = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    code: article.code,
    suggestedGoals: article.playbook.suggestedGoals,
  }));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        Your slot
      </p>
      <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">My Desk</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
        Save a play from any story. Playbook goals load into that idea automatically. You
        will see them in the slot, tagged Playbook.
      </p>
      {pass ? (
        <div className="mt-3 max-w-xl">
          <PassRemaining expiresAt={pass.expiresAt} canceling={pass.cancelAtPeriodEnd} />
        </div>
      ) : null}
      <div className="mt-10">
        <IdeaSlotBoard initial={studio} stories={stories} />
      </div>
      <div className="mt-16">
        <UnsubscribeSection
          expiresAt={pass?.expiresAt}
          canceling={pass?.cancelAtPeriodEnd}
        />
      </div>
    </main>
  );
}
