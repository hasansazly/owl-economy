import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "mydormstash.com | Campus Marketplace",
  description:
    "MyDormStash is a campus-first marketplace for dorm deals, short stays, event drops, custom merch, and student listings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
        <footer className="border-t border-white/10 bg-[#040404]">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-white/72 sm:px-6 md:grid-cols-3">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">About Us</h2>
              <p className="mt-4 text-sm leading-7 text-white/60">
                MyDormStash is the ultimate student-first marketplace. Whether you&apos;re hunting for a
                sublet, selling last semester&apos;s gear, or finding a lost AirPod, we bridge the gap
                between campus needs and community solutions. Everything campus. All in one place.
              </p>
              <Link
                href="/about"
                className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] transition hover:text-white"
              >
                Learn more
              </Link>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Our Team</h2>
              <div className="mt-4 min-h-24 rounded-[16px] border border-white/8 bg-white/[0.03]" />
              <Link
                href="/our-team"
                className="mt-4 inline-flex text-sm font-semibold text-white/46 transition hover:text-white/70"
              >
                Team page
              </Link>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">Contact Us</h2>
              <a
                href="mailto:info@mydormstash.com"
                className="mt-4 inline-flex text-sm font-semibold text-[var(--accent)] transition hover:text-white"
              >
                info@mydormstash.com
              </a>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Instagram", "TikTok", "X"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/58"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </footer>
      </body>
    </html>
  );
}
