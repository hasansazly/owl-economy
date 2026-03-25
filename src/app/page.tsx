"use client";

import Link from "next/link";
import {
  BedDouble,
  ChevronRight,
  Clock3,
  DoorOpen,
  GraduationCap,
  HandCoins,
  LampDesk,
  Loader2,
  MapPin,
  Package,
  Palette,
  PartyPopper,
  Scissors,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

type QuickAction = {
  title: string;
  description: string;
  icon: typeof Shirt;
  badge: string;
  href?: string;
  hypeBadge?: string;
  disabled?: boolean;
};

const flashDrops = [
  { title: "Valentines party ", location: "1456 N 15th Broad St", time: "10 PM" },
  { title: "Ignite Temple Club fundraiser", location: "Student Center Temple", time: "Live" },
  { title: "Skylar lost her airpod", location: "Charles Library", time: "yesterday" },
];

const quickActions: QuickAction[] = [
  {
    title: "Sell Goods",
    description: "Clothes, sneakers, books, and dorm extras students want right now.",
    icon: Shirt,
    badge: "Resell",
    href: "/sell-goods",
  },
  {
    title: "The Room Swap",
    description:
      "Semester sublets, few-month stays, one-month options, and short stays, plus room-wanted posts in one place.",
    icon: BedDouble,
    badge: "Rooms",
    href: "/rent-room",
  },
  {
    title: "Launch Events",
    description: "Push parties, study jams, pop-ups, signups, and event-side campus drops.",
    icon: PartyPopper,
    badge: "Events",
    href: "/launch-event",
  },
  {
    title: "Fundraise Fast",
    description: "Run science club drives, cookie drops, bake sales, and student fundraiser pushes.",
    icon: HandCoins,
    badge: "Fundraise",
    href: "/fundraise-fast",
  },
  {
    title: "Campus Creatives",
    description: "Show custom designs, merch, and Temple-made creative work.",
    icon: Palette,
    badge: "Create",
    href: "/campus-creatives",
  },
  {
    title: "Lost and Found",
    description: "A digital bulletin board for lost IDs, keys, or Airpods. No fees, just campus karma.",
    icon: MapPin,
    badge: "Report",
    href: "/lost-and-found",
  },
  {
    title: "Campus Services",
    description: "Book student-led pros for hair cutting, braids, nails, tech support, or moving help.",
    icon: Scissors,
    badge: "Book",
    href: "/campus-services",
  },
];

const recentListings = [
  { title: "Mini fridge + mirror combo", meta: "Morgan Hall South", price: "$40" },
  { title: "One-night crash space", meta: "Near Cecil B. Moore", price: "$28" },
  { title: "Cookie drop fundraiser box", meta: "Pickup after 4 PM", price: "$12" },
  { title: "Custom owl sticker set", meta: "Designed by Tyler student", price: "$9" },
];

const supportCards = [
  {
    title: "Move-Out Mode",
    text: "Quickly list storage bins, rugs, mirrors, and mini fridges.",
    icon: DoorOpen,
  },
  {
    title: "Academic Essentials",
    text: "Buy, sell, or borrow textbooks and desk gear, or launch a student-led study jam.",
    icon: LampDesk,
    href: "/academic-essentials",
  },
  {
    title: "Campus Verified",
    text: "Built for students who want faster, cleaner, dorm-first discovery.",
    icon: GraduationCap,
  },
];

export default function Home() {
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [assistantReply, setAssistantReply] = useState<{
    answer: string;
    suggestedRoute: string;
    suggestedAction: string;
  } | null>(null);

  const askAssistant = async () => {
    setAssistantError("");

    if (!assistantQuestion.trim()) {
      setAssistantError("Ask MyDormStash AI a question first.");
      return;
    }

    try {
      setAssistantLoading(true);
      const response = await fetch("/api/ai/campus-concierge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: assistantQuestion }),
      });

      const data = (await response.json()) as {
        error?: string;
        answer?: string;
        suggestedRoute?: string;
        suggestedAction?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "AI assistant failed");
      }

      setAssistantReply({
        answer: data.answer || "",
        suggestedRoute: data.suggestedRoute || "",
        suggestedAction: data.suggestedAction || "",
      });
    } catch (error) {
      setAssistantError(error instanceof Error ? error.message : "AI assistant failed");
    } finally {
      setAssistantLoading(false);
    }
  };

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="startup-orb left-[-120px] top-[120px] h-[240px] w-[240px] bg-[rgba(18,214,255,0.12)]" />
      <div className="startup-orb right-[-80px] top-[32px] h-[320px] w-[320px] bg-[rgba(30,58,138,0.18)]" />
      <div className="startup-grid absolute inset-0" />

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--divider)] bg-[rgba(0,0,0,0.82)] px-1 py-5 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="capsule-secondary hidden items-center gap-2 px-3.5 py-1.5 text-[12px] font-medium text-white/70 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Temple campus live
            </div>
            <Link
              href="/login"
              className="capsule-primary inline-flex items-center justify-center px-4 py-2 text-[12px] font-semibold transition hover:opacity-95"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="grid gap-5 px-1 pt-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-6 lg:pt-8">
          <div className="order-2 lg:order-1">
            <div className="flex flex-wrap gap-2">
              <div className="startup-chip px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78">
                Temple campus live
              </div>
            </div>

            <h1 className="mt-4 max-w-4xl font-display text-[2.35rem] font-extrabold leading-[0.95] tracking-[-0.055em] sm:text-[3.6rem] lg:mt-5 lg:text-[5.5rem]">
              <span className="hero-gradient-title">Everything campus.</span>
              <span className="mt-2 block text-[var(--accent)]">All in one place.</span>
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/52 sm:mt-4 sm:text-[15px]">
              The platform for everything campus. Buy, sell, and connect with the students around you instantly.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row">
              <Link
                href="#top"
                className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold transition hover:opacity-95"
              >
                Browse MyDormStash
                <ChevronRight className="h-4 w-4" />
              </Link>

              <Link
                href="/create-listing"
                className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] transition"
              >
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Create a listing
              </Link>
            </div>

            <div className="agora-panel mt-5 px-4 py-3 sm:mt-6">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-white/45" />
                <input
                  type="search"
                  placeholder="Search dorm items, short stays, sticker drops, late-night finds..."
                  className="w-full bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-white/35"
                />
              </div>
            </div>
          </div>

          <div className="order-1 agora-panel overflow-hidden p-4 sm:p-5 lg:order-2">
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(18,214,255,0.85)]" />
                Flash Drops
              </div>
              <span className="text-[12px] text-[rgba(255,255,255,0.6)]">3 active</span>
            </div>

            <div className="mt-4 space-y-2.5">
              {flashDrops.map((drop) => (
                <article
                  key={drop.title}
                  className="agora-panel flex items-center justify-between px-3.5 py-3 transition hover:bg-white/[0.05]"
                >
                  <div className="min-w-0">
                    <h2 className="truncate text-[13px] font-medium text-[var(--foreground)]">
                      {drop.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/38">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{drop.location}</span>
                    </div>
                  </div>
                  <span className="ml-4 rounded-full bg-[rgba(18,214,255,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                    {drop.time}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="agora-divider mt-8" />

        <p className="section-kicker mt-7 px-1">Everything Else</p>

        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickActions.map(({ title, description, icon: Icon, badge, href, hypeBadge, disabled }) => {
            const cardClassName = `agora-panel relative flex min-h-[168px] flex-col justify-between px-4 py-4 transition ${
              disabled ? "cursor-default" : "hover:-translate-y-0.5 hover:bg-white/[0.05]"
            }`;

            const content = (
              <>
                {hypeBadge ? (
                  <span className="absolute right-4 top-4 rounded-full border border-amber-400/30 bg-amber-400/14 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.22)]">
                    {hypeBadge}
                  </span>
                ) : null}

                <div className={`text-[var(--accent)] ${disabled ? "opacity-90" : ""}`}>
                  <Icon className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-white">
                    {title}
                  </h2>
                  <p className="mt-1.5 max-w-[28ch] text-[11px] leading-5 text-white/46">{description}</p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    disabled
                      ? "pointer-events-none border border-white/12 bg-white/6 text-white/52"
                      : "border border-white/10 bg-[rgba(18,214,255,0.08)] text-[var(--accent)]"
                  }`}
                >
                  {badge}
                </span>
              </>
            );

            if (disabled || !href) {
              return (
                <div key={title} className={cardClassName}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={title} href={href} className={cardClassName}>
                {content}
              </Link>
            );
          })}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Recent Listings</p>
            <Link href="#top" className="text-[12px] text-white/42 transition hover:text-white/68">
              See all
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentListings.map((listing) => (
              <article
                key={listing.title}
                className="agora-panel min-w-[220px] p-4"
              >
                <div className="flex items-center justify-between">
                  <Package className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-[12px] font-semibold text-[var(--accent)]">
                    {listing.price}
                  </span>
                </div>
                <h3 className="mt-4 text-[13px] font-medium text-[var(--foreground)]">
                  {listing.title}
                </h3>
                <p className="mt-1.5 text-[11px] text-white/38">{listing.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-3">
          {supportCards.map(({ title, text, icon: Icon, href }) => {
            const content = (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-[16px] font-bold tracking-[-0.02em] text-white">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-white/46">{text}</p>
                </div>
                <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              </div>
            );

            if (href) {
              return (
                <Link
                  key={title}
                  href={href}
                  className="agora-panel block px-5 py-4 transition hover:bg-white/[0.05]"
                >
                  {content}
                </Link>
              );
            }

            return (
              <article
                key={title}
                className="agora-panel px-5 py-4 transition hover:bg-white/[0.05]"
              >
                {content}
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="agora-panel p-5">
            <p className="section-kicker !mt-0 !px-0">MyDormStash AI</p>
            <h2 className="mt-3 font-display text-[1.35rem] font-bold tracking-[-0.03em] text-white sm:text-[1.6rem]">
              Ask where to post, browse, or start
            </h2>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/48 sm:text-[14px]">
              Get a fast recommendation for the right MyDormStash flow based on what you need right now.
            </p>

            <div className="mt-5 rounded-[16px] border border-white/10 bg-white/5 p-3">
              <textarea
                rows={4}
                value={assistantQuestion}
                onChange={(event) => setAssistantQuestion(event.target.value)}
                placeholder="Example: I need to raise money for my student org this weekend. Where should I post?"
                className="w-full resize-none bg-transparent px-1 py-1 text-sm leading-6 outline-none placeholder:text-white/25"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={askAssistant}
                disabled={assistantLoading}
                className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {assistantLoading ? "Thinking..." : "Ask MyDormStash AI"}
              </button>
              {assistantError ? <p className="text-sm text-[#F09595]">{assistantError}</p> : null}
            </div>
          </div>

          <div className="agora-panel p-5">
            <p className="section-kicker !mt-0 !px-0">AI Reply</p>
            {assistantReply ? (
              <div className="mt-4 space-y-4">
                <p className="text-[14px] leading-6 text-white/72">{assistantReply.answer}</p>
                <div className="rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                    Suggested Route
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{assistantReply.suggestedRoute}</p>
                  <p className="mt-2 text-[13px] leading-6 text-white/48">{assistantReply.suggestedAction}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[16px] border border-dashed border-white/10 bg-[rgba(255,255,255,0.02)] p-5">
                <p className="text-sm leading-6 text-white/42">
                  Ask a question about selling, rooms, fundraisers, services, lost items, or events and the AI concierge will guide you to the best MyDormStash flow.
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="agora-divider mt-8" />

        <section className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#top"
            className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold transition hover:opacity-95"
          >
            Browse MyDormStash
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            href="/create-listing"
            className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] transition"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Create a listing
          </Link>

          <div className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] text-white/68">
            <Clock3 className="h-4 w-4 text-[var(--accent)]" />
            Fresh listings every day
          </div>
        </section>
      </section>
    </main>
  );
}
