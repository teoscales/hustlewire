import Link from "next/link";
import { hasDeskPass } from "@/lib/pass";
import { getAccount } from "@/lib/account";
import { btn } from "@/lib/ui";

export async function SiteFooter() {
  const premium = await hasDeskPass();
  const account = await getAccount();

  return (
    <footer className="mt-auto border-t border-white/10 px-4 py-12 text-zinc-500 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-2xl text-white">HustleWire</p>
          <p className="mt-2 max-w-md text-sm leading-6">
            Ad-free news. How to start is free. The full playbook and your idea slot are Desk
            Pass. Not financial advice.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" className={btn.quiet}>
            Wire
          </Link>
          <Link href="/about" className={btn.quiet}>
            About
          </Link>
          <Link href="/promote" className={btn.quiet}>
            Promote
          </Link>
          {account?.role === "owner" ? (
            <Link href="/office" className={btn.quiet}>
              Office
            </Link>
          ) : null}
          <Link href="/account" className={btn.ghost}>
            Account
          </Link>
          {premium ? (
            <Link href="/unsubscribe" className={btn.danger}>
              Unsubscribe
            </Link>
          ) : null}
          {premium ? (
            <Link href="/my-desk" className={btn.primary}>
              Open My Desk
            </Link>
          ) : (
            <Link href="/premium" className={btn.primary}>
              Get Desk Pass
            </Link>
          )}
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-sm text-zinc-600">
        <Link href="/careers" className="transition hover:text-zinc-300">
          Careers
        </Link>
        <span className="px-2">·</span>
        <Link href="/privacy" className="transition hover:text-zinc-300">
          Privacy policy
        </Link>
      </p>
    </footer>
  );
}
