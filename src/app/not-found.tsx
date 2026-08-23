import Link from "next/link";
import { btn } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#d8ff3c]">Dead wire</p>
      <h1 className="mt-3 font-serif text-4xl text-white">That story is not on the desk.</h1>
      <Link href="/" className={`${btn.primary} mt-6 w-fit`}>
        Back to the wire
      </Link>
    </main>
  );
}
