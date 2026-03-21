"use client";

import Link from "next/link";
import { ArrowLeft, BrushCleaning, Camera, ChevronRight, Palette, Shirt, Sparkles, Sticker } from "lucide-react";

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
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--divider)] bg-[rgba(0,0,0,0.82)] px-1 py-5 backdrop-blur-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            Dorm<span className="text-[var(--accent)]">Stash</span>
          </Link>

          <div className="capsule-secondary hidden items-center gap-2 px-3.5 py-1.5 text-[12px] font-medium text-white/70 sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Creator network
          </div>
        </header>

        <section className="grid gap-6 px-1 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="section-kicker !px-0">Campus Creatives</p>
            <h1 className="mt-4 max-w-4xl font-display text-[3rem] font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-[4.4rem]">
              Student-made work deserves
              <span className="hero-gradient-title block"> a campus-first storefront.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/52">
              Discover stickers, art prints, custom merch, photo sessions, and creator-made drops
              from students across campus networks without losing the local feel.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#featured"
                className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold transition hover:opacity-95"
              >
                Explore creator drops
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href="/create-listing"
                className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] transition"
              >
                <BrushCleaning className="h-4 w-4 text-[var(--accent)]" />
                Post your creative work
              </Link>
            </div>
          </div>

          <div className="agora-panel p-5">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Creator Snapshot
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Live creators", value: "120+" },
                { label: "Avg drop size", value: "8 items" },
                { label: "Campus reach", value: "Multi-school" },
              ].map((stat) => (
                <div key={stat.label} className="agora-panel p-4">
                  <p className="text-lg font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/42">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {creatorCards.map(({ title, description, icon: Icon, creator, campus, price }) => (
            <article key={title} className="agora-panel flex min-h-[220px] flex-col justify-between px-4 py-4">
              <div>
                <div className="text-[var(--accent)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 font-display text-[16px] font-bold tracking-[-0.02em] text-white">
                  {title}
                </h2>
                <p className="mt-2 text-[12px] leading-6 text-white/46">{description}</p>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3 text-[12px] text-white/58">
                  <span>{creator}</span>
                  <span className="text-[var(--accent)]">{price}</span>
                </div>
                <p className="mt-1 text-[11px] text-white/36">{campus}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="featured" className="mt-8">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Featured Works</p>
            <Link href="/create-listing" className="text-[12px] text-white/42 transition hover:text-white/68">
              Creator upload
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {featuredWorks.map((item) => (
              <article key={item.title} className="agora-panel p-4">
                <div className="flex h-36 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(18,214,255,0.08))] text-sm font-semibold text-white/70">
                  {item.meta}
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-white">{item.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[12px]">
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
