"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, Sparkles } from "lucide-react";

export default function RoomSwapPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap max-w-3xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="page-brand">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </Link>

          <div className="page-chip hidden items-center gap-2 sm:inline-flex">
            <Clock3 className="h-3.5 w-3.5 text-[var(--accent)]" />
            Coming Soon
          </div>
        </header>

        <section className="px-1 py-8 text-center">
          <p className="section-kicker !px-0">The Room Swap</p>
          <h1 className="mt-3 font-display text-[2.2rem] font-extrabold leading-[0.96] tracking-[-0.05em] text-white sm:text-[3rem]">
            Coming soon.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-white/54">
            We&apos;re tightening the sublet and short-stay flow before opening it up.
          </p>
        </section>

        <section className="page-card mx-1 p-5 text-center sm:p-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <h2 className="mt-4 text-[18px] font-semibold text-white">Locked for now</h2>
          <p className="mx-auto mt-2 max-w-lg text-[13px] leading-6 text-white/48">
            The Room Swap will be back soon with cleaner semester-sublet and room-request posting.
          </p>
          <Link href="/" className="capsule-secondary mt-6 inline-flex items-center justify-center px-5 py-2.5 text-[13px]">
            Back to Home
          </Link>
        </section>
      </section>
    </main>
  );
}
