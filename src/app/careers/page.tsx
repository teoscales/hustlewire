import Link from "next/link";
import { WriterDesk } from "@/components/WriterDesk";
import { accountPath, getAccount } from "@/lib/account";
import { writerPay } from "@/lib/premium";
import { getWriterDesk } from "@/lib/writers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers",
  description:
    "Apply here to send short situations. If you’re approved, you get $2 each after you link PayPal. We write the story.",
};

export default async function CareersPage() {
  const account = await getAccount();
  const writer = await getWriterDesk();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">Careers</p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        Story writer
      </h1>
      <div className="mt-6 max-w-2xl space-y-5 text-base leading-8 text-zinc-400">
        <p>Apply on this page. The desk has to say yes first.</p>
        <p>
          Then you send situations that hit hustlers, or that hustlers can use to make money.
          Don’t write the story. {writerPay.label} each, paid to PayPal.
        </p>
      </div>

      {account ? (
        account.role === "owner" ? (
          <p className="mt-8 text-sm text-zinc-500">
            Owner reviews applications in the office.
          </p>
        ) : (
          <WriterDesk
            application={writer.application}
            approved={writer.approved}
            paypalEmail={writer.paypalEmail}
            tips={writer.tips}
            messages={writer.messages}
          />
        )
      ) : (
        <p className="mt-8 text-sm text-zinc-400">
          <Link
            href={accountPath("/careers")}
            className="underline underline-offset-4 hover:text-white"
          >
            Login to your account
          </Link>{" "}
          first, then come back here to apply.
        </p>
      )}
    </main>
  );
}
