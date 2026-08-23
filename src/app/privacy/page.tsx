export const metadata = {
  title: "Privacy policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">
        Legal
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.05] text-white sm:text-5xl">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-zinc-500">Last updated 23 August 2026</p>
      <div className="mt-8 space-y-8 text-base leading-8 text-zinc-400">
        <section>
          <h2 className="font-serif text-2xl text-white">Who we are</h2>
          <p className="mt-3">
            HustleWire is a news and Desk Pass site. Contact:{" "}
            <a href="mailto:nexonagencyeu@gmail.com" className="text-zinc-200 underline">
              nexonagencyeu@gmail.com
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Name, email, and a hashed password when you create an account.</li>
            <li>Sign-in and sign-up time (login events).</li>
            <li>Desk Pass status: free, paid, promo, cancelled, writer, or owner.</li>
            <li>Payment details handled by Stripe. We store customer and subscription IDs, not full card numbers.</li>
            <li>PayPal email if you apply as a writer.</li>
            <li>Promo video links, writer applications, situations, and chat with the desk.</li>
            <li>A session cookie so you stay signed in.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">What staff can see</h2>
          <p className="mt-3">
            HustleWire staff and the owner can see new login account email addresses and the
            status of each account (for example Free, Desk Pass, Writer, or Owner), plus when
            that person created an account or signed in. This is so the desk can run the site,
            review writers, and support Desk Pass. Staff cannot see your password.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">Why we use it</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>To run your account and keep you signed in (contract).</li>
            <li>To sell and manage Desk Pass through Stripe (contract).</li>
            <li>To review writers, situations, and promo videos (contract / legitimate interest).</li>
            <li>To see new logins and account status in the office (legitimate interest: security and operations).</li>
            <li>To email you about your account or pass if needed.</li>
          </ul>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">Who else gets data</h2>
          <p className="mt-3">
            Stripe processes payments. The site is hosted on infrastructure such as Vercel.
            Those companies only get what they need to run their service. We do not sell your
            email list.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">How long we keep it</h2>
          <p className="mt-3">
            Account data stays while the account is open. Login events are kept so staff can
            see recent sign-ins. You can ask us to delete your account and we will remove it
            unless we must keep a record of a paid order.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">Your rights</h2>
          <p className="mt-3">
            You can ask for a copy of your data, a correction, or deletion. You can object to
            staff login logs where the law allows. Email{" "}
            <a href="mailto:nexonagencyeu@gmail.com" className="text-zinc-200 underline">
              nexonagencyeu@gmail.com
            </a>
            . If you are in the EU/UK you can complain to your data protection authority.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-2xl text-white">Cookies</h2>
          <p className="mt-3">
            We use a session cookie to know who is signed in. Desk Pass also uses that
            account. No ad trackers on this desk.
          </p>
        </section>
      </div>
    </main>
  );
}
