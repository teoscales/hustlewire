import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  robots: { index: false, follow: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${roboto.className} fixed inset-0 z-50 flex flex-col overflow-auto bg-white text-[#202124]`}
    >
      {children}
    </div>
  );
}
