import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/AccountForm";
import { ReviewList } from "@/components/ReviewList";
import { WriterApplications, SituationTips } from "@/components/WriterApplications";
import { OwnerChats } from "@/components/WriterChat";
import { activePasses, getDeskStore, officeStats } from "@/lib/desk-store";
import { formatMoney, formatWhen } from "@/lib/format";
import { isOwner } from "@/lib/account";
import { deskPass } from "@/lib/premium";
import { writerThreads } from "@/lib/writers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Office",
};

export default async function OfficePage() {
  if (!(await isOwner())) redirect("/account?next=/office");

  const store = await getDeskStore();
  const stats = officeStats(store);
  const recentSales = [...store.sales]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);
  const live = activePasses(store).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const logins = [...(store.logins ?? [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
            Owner desk
          </p>
          <h1 className="mt-3 font-serif text-4xl text-white sm:text-5xl">Office</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400">
            Sales, who has Desk Pass, promo videos, and writer applications.
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <section className="rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#d8ff3c]">Sales</p>
          <p className="mt-3 font-serif text-4xl text-white">{formatMoney(stats.revenue)}</p>
          <p className="mt-2 text-sm text-zinc-400">
            {stats.saleCount} paid · {formatMoney(stats.monthRevenue)} this month (
            {stats.monthSaleCount})
          </p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#d8ff3c]">Desk Pass</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.activeCount}</p>
          <p className="mt-2 text-sm text-zinc-400">
            {stats.paidActive} paid · {stats.promoActive} promo month
          </p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-[#d8ff3c]">Reviews</p>
          <p className="mt-3 font-serif text-4xl text-white">{stats.pendingReviews}</p>
          <p className="mt-2 text-sm text-zinc-400">{stats.approvedPromos} approved</p>
        </section>
      </div>

      <section className="mt-10 rounded-3xl border-2 border-[#d8ff3c] bg-[#d8ff3c]/10 p-6">
        <h2 className="font-serif text-2xl text-white">New logins</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Every new account and sign-in. Email and status only.
        </p>
        {logins.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Nobody has signed in yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {logins.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-white">{item.email}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.name} · {item.kind === "signup" ? "New account" : "Signed in"} ·{" "}
                    {formatWhen(item.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-zinc-950 px-3 py-1 text-xs font-semibold text-[#d8ff3c]">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
        <h2 className="font-serif text-2xl text-white">Recent paid unlocks</h2>
        {recentSales.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No sales yet. Each {deskPass.priceLabel} unlock lands here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10 text-sm">
            {recentSales.map((sale) => (
              <li key={sale.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-white">{sale.name ?? "Guest unlock"}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {sale.email ?? "No email"} · {formatWhen(sale.createdAt)}
                  </p>
                </div>
                <span className="font-medium text-[#d8ff3c]">{formatMoney(sale.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-zinc-900/40 p-6">
        <h2 className="font-serif text-2xl text-white">On Desk Pass now</h2>
        <p className="mt-1 text-sm text-zinc-500">{live.length} active</p>
        <ul className="mt-4 divide-y divide-white/10 text-sm">
          {live.map((pass) => (
            <li key={pass.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-white">{pass.name ?? "Guest"}</p>
                <p className="mt-1 text-xs text-zinc-500">{pass.email ?? pass.visitorId}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  pass.kind === "promo"
                    ? "bg-[#d8ff3c]/15 text-[#d8ff3c]"
                    : "bg-white/10 text-zinc-200"
                }`}
              >
                {pass.kind === "promo" ? "Promo month" : `Paid · ${deskPass.priceLabel}`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12">
        <ReviewList promos={store.promos} />
      </div>
      <WriterApplications applications={store.applications ?? []} />
      <SituationTips tips={store.tips ?? []} />
      <OwnerChats threads={writerThreads(store)} />
    </main>
  );
}
