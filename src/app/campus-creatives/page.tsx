"use client";

import Link from "next/link";
import { ArrowLeft, Paintbrush, Camera, ChevronRight, Palette, Shirt, Sparkles, Sticker } from "lucide-react";

const creatorCards = [
  {
    title: "Sticker Drops",
    description: "Campus-made sticker packs, laptop decals, and small-batch design drops.",
    icon: Sticker,
    creator: "Lina M.",
    campus: "Temple University",
    price: "From $9",
  },
  {
    title: "Custom Merch",
    description: "Student-made hoodies, shirts, tote bags, and org collab pieces.",
    icon: Shirt,
    creator: "Jordan T.",
    campus: "Drexel University",
    price: "From $22",
  },
  {
    title: "Art Prints",
    description: "Illustration prints, dorm wall art, and limited-run creative bundles.",
    icon: Palette,
    creator: "Nadia K.",
    campus: "Temple University",
    price: "From $14",
  },
  {
    title: "Photo Shoots",
    description: "Grad shots, creator portraits, and quick campus content sessions.",
    icon: Camera,
    creator: "Sami R.",
    campus: "University of Pennsylvania",
    price: "From $35",
  },
];

const featuredWorks = [
  { title: "Custom owl sticker set", meta: "Designed by Tyler student", price: "$9" },
  { title: "Limited-run campus tote", meta: "Screen printed in Philly", price: "$18" },
  { title: "Dorm wall art print", meta: "Pickup near library", price: "$14" },
];

export default function CampusCreativesPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap max-w-6xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </Link>

          <div className="capsule-secondary hidden items-center gap-2 px-3.5 py-1.5 text-[12px] font-medium text-white/70 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Creator network
          </div>
        </header>

        <section className="grid gap-4 px-1 py-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="section-kicker !px-0">Campus Creatives</p>
            <h1 className="mt-3 max-w-4xl font-display text-[2.4rem] font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-[3.5rem]">
              Student-made work deserves
              <span className="hero-gradient-title block"> a campus-first storefront.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/52">
              Discover merch, prints, stickers, and student-made drops.
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="#featured"
                className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition hover:opacity-95"
              >
                Explore creator drops
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href="/create-listing"
                className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[13px] transition"
              >
                <Paintbrush className="h-4 w-4 text-[var(--accent)]" />
                Post your creative work
              </Link>
            </div>
          </div>

          <div className="agora-panel p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Creator Snapshot
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              {[
                { label: "Live creators", value: "120+" },
                { label: "Avg drop size", value: "8 items" },
                { label: "Campus reach", value: "Multi-school" },
              ].map((stat) => (
                <div key={stat.label} className="agora-panel p-3.5">
                  <p className="text-[15px] font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-white/42">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {creatorCards.map(({ title, description, icon: Icon, creator, campus, price }) => (
            <article key={title} className="agora-panel flex min-h-[200px] flex-col justify-between px-3.5 py-3.5">
              <div>
                <div className="text-[var(--accent)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-[15px] font-bold tracking-[-0.02em] text-white">
                  {title}
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-white/46">{description}</p>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-[11px] text-white/58">
                  <span>{creator}</span>
                  <span className="text-[var(--accent)]">{price}</span>
                </div>
                <p className="mt-1 text-[11px] text-white/36">{campus}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="featured" className="mt-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Featured Works</p>
            <Link href="/create-listing" className="text-[12px] text-white/42 transition hover:text-white/68">
              Creator upload
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {featuredWorks.map((item) => (
              <article key={item.title} className="agora-panel p-3.5">
                <div className="flex h-28 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(18,214,255,0.08))] text-[13px] font-semibold text-white/70">
                  {item.meta}
                </div>
                <h3 className="mt-3 text-[14px] font-semibold text-white">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-white/42">{item.meta}</span>
                  <span className="font-semibold text-[var(--accent)]">{item.price}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
