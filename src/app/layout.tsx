import type { Metadata } from "next";
import { connection } from "next/server";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Masthead } from "@/components/Masthead";
import { NewsUpdatedSince } from "@/components/NewsUpdatedSince";
import { SiteFooter } from "@/components/SiteFooter";
import { Ticker } from "@/components/Ticker";
import { getNewsUpdatedAt } from "@/lib/articles";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "HustleWire. The news. Then the move.",
    template: "%s · HustleWire",
  },
  description:
    "Ad-free hustler news. How to start is free. Desk Pass unlocks the playbook and your idea slot.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const since = await getNewsUpdatedAt();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950 text-zinc-50">
        <Masthead />
        <div className="flex items-stretch border-b border-white/10 bg-zinc-950">
          <NewsUpdatedSince key={since} since={since} />
          <Ticker />
        </div>
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
