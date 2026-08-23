import { CancelPassButton } from "./SubscribeButton";
import { PassRemaining } from "./PassRemaining";

export function UnsubscribeSection({
  expiresAt,
  canceling = false,
}: {
  expiresAt?: string;
  canceling?: boolean;
}) {
  return (
    <section
      id="unsubscribe"
      className="rounded-3xl border border-rose-400/35 bg-rose-500/[0.07] p-6 sm:p-8"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
        Unsubscribe
      </p>
      <h2 className="mt-2 font-serif text-3xl text-white">
        {canceling ? "Desk Pass is ending" : "Stop Desk Pass"}
      </h2>
      {expiresAt ? (
        <div className="mt-3">
          <PassRemaining expiresAt={expiresAt} canceling={canceling} />
        </div>
      ) : (
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-300">
          Stripe stops future charges. You keep the desk until the month you already paid for
          runs out.
        </p>
      )}
      {canceling ? null : (
        <div className="mt-6">
          <CancelPassButton />
        </div>
      )}
    </section>
  );
}
