import Link from "next/link";
import { accountPath, getAccount } from "@/lib/account";
import { getDeskPassInfo, hasDeskPass } from "@/lib/pass";
import { btn } from "@/lib/ui";

export async function PassStatus() {
  const account = await getAccount();
  const premium = await hasDeskPass();
  const pass = premium ? await getDeskPassInfo() : null;

  if (!account) {
    return (
      <div className="flex items-center gap-2">
        <Link href={accountPath("/account")} className={btn.ghost}>
          Account
        </Link>
        <Link href={accountPath("/my-desk", true)} className={btn.primary}>
          Get Desk Pass
        </Link>
      </div>
    );
  }

  if (premium) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/account" className={btn.ghost}>
          Account
        </Link>
        <Link href="/my-desk" className={`${btn.ghost} gap-2 px-2 py-1.5 pl-3`}>
          <span className="flex items-center gap-1.5 text-[#d8ff3c]">
            <span className="h-2 w-2 rounded-full bg-[#d8ff3c]" />
            {pass?.cancelAtPeriodEnd ? "Ending" : "Pass"}
          </span>
          <span className="rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold text-zinc-950">
            My Desk
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/account" className={btn.ghost}>
        Account
      </Link>
      <Link href="/premium" className={btn.primary}>
        Get Desk Pass
      </Link>
    </div>
  );
}
