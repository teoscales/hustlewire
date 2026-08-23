import { redirect } from "next/navigation";
import { getAccount } from "@/lib/account";

export default async function OfficeLoginPage() {
  const account = await getAccount();
  if (account?.role === "owner") redirect("/office");
  redirect("/account?next=/office");
}
