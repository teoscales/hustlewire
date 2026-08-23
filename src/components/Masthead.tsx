import Link from "next/link";
import { categories } from "@/lib/articles";
import { isOwner } from "@/lib/account";
import { PassStatus } from "./PassStatus";

const nav = [
  { href: "/", label: "Wire" },
  ...categories.map((category) => ({
    href: `/desk/${category.id}`,
    label: category.label,
  })),
  { href: "/my-desk", label: "My Desk" },
  { href: "/promote", label: "Promote" },
  { href: "/about", label: "About" },
];

export async function Masthead() {
  const owner = await isOwner();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#d8ff3c] font-serif text-lg text-zinc-950">
            H
          </span>
          <span className="font-serif text-xl tracking-tight">HustleWire</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {owner ? (
            <Link
              href="/office"
              className="hidden rounded-full border border-[#d8ff3c]/40 px-3 py-1.5 text-sm font-medium text-[#d8ff3c] sm:inline-flex"
            >
              Office
            </Link>
          ) : null}
          <PassStatus />
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300"
          >
            {item.label}
          </Link>
        ))}
        {owner ? (
          <Link
            href="/office"
            className="shrink-0 rounded-full bg-[#d8ff3c] px-3 py-1 text-xs font-semibold text-zinc-950"
          >
            Office
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
