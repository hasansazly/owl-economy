import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap max-w-4xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <p className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </p>

          <div className="page-chip hidden items-center gap-2 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            About
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">About Us</p>
          <h1 className="page-title">About Us</h1>
          <p className="page-copy">
            MyDormStash is the ultimate student-first marketplace. Whether you&apos;re hunting for a
            sublet, selling last semester&apos;s gear, or finding a lost AirPod, we bridge the gap
            between campus needs and community solutions. Everything campus. All in one place.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <article className="page-card p-5">
            <h2 className="text-[16px] font-semibold text-white">What We&apos;re Building</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              MyDormStash is designed for student life as it actually moves: fast, local, and
              community-driven. From room swaps and resale to services, events, and lost-and-found,
              the goal is to make campus exchange feel simple and trustworthy.
            </p>
          </article>

          <article className="page-card p-5">
            <h2 className="text-[16px] font-semibold text-white">Why It Matters</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Students constantly need quick solutions. A cheaper desk. A short-term room. A buyer
              for last semester&apos;s gear. A way to find something lost. MyDormStash brings those
              everyday campus moments into one place.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
