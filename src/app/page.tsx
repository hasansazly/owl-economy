"use client";

import Link from "next/link";
import {
  BedDouble,
  ChevronRight,
  DoorOpen,
  GraduationCap,
  HandCoins,
  LampDesk,
  Loader2,
  MapPin,
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
};

const quickPills = [
  { label: "Resell", href: "/sell-goods" },
  { label: "Rooms", href: "/rent-room" },
  { label: "Events", href: "/launch-event" },
  { label: "Lost", href: "/lost-and-found" },
  { label: "Book", href: "/campus-services" },
];

const flashDrops = [
  { title: "Valentines party", location: "1456 N 15th Broad St", time: "10 PM" },
  { title: "Ignite Temple Club fundraiser", location: "Student Center Temple", time: "Live" },
  { title: "Skylar lost her airpod", location: "Charles Library", time: "Yesterday" },
];

const quickActions: QuickAction[] = [
  {
    title: "Sell Goods",
    description: "Clothes, books, and dorm extras moving fast.",
    icon: Shirt,
    badge: "Resell",
    href: "/sell-goods",
  },
  {
    title: "The Room Swap",
    description: "Semester sublets and room-wanted posts.",
    icon: BedDouble,
    badge: "Rooms",
    href: "/rent-room",
  },
  {
    title: "Launch Events",
    description: "Parties, study jams, and pop-ups on campus.",
    icon: PartyPopper,
    badge: "Events",
    href: "/launch-event",
  },
  {
    title: "Fundraise Fast",
    description: "Fast fundraiser posts for clubs and orgs.",
    icon: HandCoins,
    badge: "Fundraise",
    href: "/fundraise-fast",
  },
  {
    title: "Campus Creatives",
    description: "Custom designs, merch, and student-made work.",
    icon: Palette,
    badge: "Create",
    href: "/campus-creatives",
  },
  {
    title: "Lost and Found",
    description: "Lost IDs, keys, and AirPods with campus karma.",
    icon: MapPin,
    badge: "Report",
    href: "/lost-and-found",
  },
  {
    title: "Campus Services",
    description: "Hair, braids, nails, tech support, and moving help.",
    icon: Scissors,
    badge: "Book",
    href: "/campus-services",
  },
];

const recentListings = [
  {
    title: "Mini Fridge",
    meta: "Morgan Hall",
    price: "$40",
    preview: "Compact fridge with clean white finish and quick dorm pickup.",
  },
  {
    title: "Crash Space",
    meta: "Cecil B. Moore",
    price: "$28",
    preview: "Short-stay setup for a quick overnight near campus.",
  },
  {
    title: "Cookie Drop",
    meta: "Pickup after 4 PM",
    price: "$12",
    preview: "Fresh fundraiser box posted by a student org.",
  },
  {
    title: "Owl Sticker Set",
    meta: "Tyler student",
    price: "$9",
    preview: "Creator-made sticker pack with campus-style artwork.",
  },
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

const jumpSections = [
  { label: "F", href: "#flash" },
  { label: "L", href: "#launcher" },
  { label: "R", href: "#recent" },
  { label: "A", href: "#ai" },
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
  const [activePreview, setActivePreview] = useState(recentListings[0].title);

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

  const previewItem =
    recentListings.find((listing) => listing.title === activePreview) ?? recentListings[0];

  return (
    <main id="top" className="relative min-h-screen overflow-hidden bg-[#000000] pb-36 text-white">
      <div className="startup-orb left-[-160px] top-[60px] h-[220px] w-[220px] bg-[rgba(140,29,64,0.22)]" />
      <div className="startup-orb right-[-120px] top-[120px] h-[260px] w-[260px] bg-[rgba(255,255,255,0.04)]" />
      <div className="startup-grid absolute inset-0 opacity-40" />

      <nav className="fixed right-3 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-white/10 bg-[rgba(8,8,8,0.84)] px-2 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        {jumpSections.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/46 transition hover:text-[var(--accent)]"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-12 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[rgba(5,5,5,0.9)] px-1 py-4 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[1.2rem] font-extrabold tracking-[0.01em] sm:text-[1.35rem]">
            <span className="text-[#37c8ff]">my</span>dormstash<span className="text-white">.com</span>
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-white/12 bg-white px-4 py-2 text-[13px] font-semibold text-black transition hover:opacity-95"
          >
            Log in
          </Link>
        </header>

        <section className="px-1 pb-6 pt-5">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            Temple Campus Live
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-[2.1rem] font-extrabold leading-[0.98] tracking-[0.01em] text-white sm:text-[2.8rem]">
            Everything campus.
            <span className="mt-1 block text-[var(--accent)]">All in one place.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/62 sm:text-[14px]">
            The student network for what you need. Buy, sell, and connect with your community instantly.
          </p>
        </section>

        <section className="border-t border-white/8 px-1 py-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickPills.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="shrink-0 rounded-full border border-white/14 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/76 transition hover:border-white/22 hover:bg-white/[0.08]"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </section>

        <section id="flash" className="border-t border-white/8 px-1 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Flash Drops</p>
            <span className="text-[12px] text-white/48">3 active</span>
          </div>
          <div className="space-y-2">
            {flashDrops.map((drop) => (
              <article
                key={drop.title}
                className="flex items-center justify-between rounded-[18px] border border-transparent px-3 py-3 transition hover:border-white/8 hover:bg-white/[0.03]"
              >
                <div className="min-w-0 pr-3">
                  <h2 className="truncate text-[15px] font-semibold tracking-[0.01em] text-white">{drop.title}</h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/42">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-white/34" />
                    <span className="truncate">{drop.location}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    {drop.title.includes("party")
                      ? "Events"
                      : drop.title.includes("fundraiser")
                        ? "Fundraise"
                        : "Lost"}
                  </button>
                  <span className="rounded-full border border-white/10 bg-[rgba(18,214,255,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                    {drop.time}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="launcher" className="border-t border-white/8 px-1 py-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Everything Else</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ title, description, icon: Icon, badge, href }) => (
              <Link
                key={title}
                href={href || "#"}
                className="group rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_16px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl transition hover:border-white/18 hover:bg-white/[0.05]"
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <Icon className="h-5 w-5 text-white/78" />
                    </div>
                    <div className="mt-4 min-w-0">
                      <h2 className="truncate text-[15px] font-semibold tracking-[0.01em] text-white">{title}</h2>
                      <p className="mt-1 text-[12px] leading-5 text-white/46">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      {badge}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-white/32 transition group-hover:text-white/58" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="recent" className="border-t border-white/8 px-1 py-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Recent Listings</p>
            <Link href="#top" className="text-[12px] text-white/38 transition hover:text-white/62">
              See all
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <div className="space-y-1">
              {recentListings.map((listing) => (
                <button
                  key={listing.title}
                  type="button"
                  onMouseEnter={() => setActivePreview(listing.title)}
                  onFocus={() => setActivePreview(listing.title)}
                  onClick={() => setActivePreview(listing.title)}
                  className="flex w-full items-center justify-between rounded-[16px] border border-transparent px-2 py-3 text-left transition hover:border-white/8 hover:bg-white/[0.03]"
                >
                  <span className="min-w-0 truncate text-[14px] font-medium tracking-[0.01em] text-white">
                    {listing.price} - {listing.title} - {listing.meta}
                  </span>
                  <span className="ml-3 shrink-0 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/66">
                    Peek
                  </span>
                </button>
              ))}
            </div>

            <aside className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-xl">
              <div className="flex h-32 items-center justify-center rounded-[14px] border border-white/8 bg-[linear-gradient(135deg,_rgba(158,27,50,0.18),_rgba(255,255,255,0.03))] text-center text-sm font-semibold text-white/72">
                {previewItem.title}
              </div>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                Preview
              </p>
              <p className="mt-2 text-sm text-white">{previewItem.price} - {previewItem.title}</p>
              <p className="mt-1 text-[12px] text-white/42">{previewItem.meta}</p>
              <p className="mt-3 text-[12px] leading-6 text-white/52">{previewItem.preview}</p>
            </aside>
          </div>
        </section>

        <section className="border-t border-white/8 px-1 py-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">Campus Signals</p>
          <div className="space-y-1">
            {supportCards.map(({ title, text, icon: Icon, href }) => {
              const content = (
                <div className="flex items-center justify-between rounded-[18px] border border-transparent px-2 py-3 transition hover:border-white/8 hover:bg-white/[0.03]">
                  <div className="flex min-w-0 items-center gap-3 pr-4">
                    <Icon className="h-4 w-4 shrink-0 text-white/72" />
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold tracking-[0.03em] text-white">{title}</h2>
                      <p className="truncate text-[12px] text-white/38">{text}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/28" />
                </div>
              );

              return href ? (
                <Link key={title} href={href}>
                  {content}
                </Link>
              ) : (
                <div key={title}>{content}</div>
              );
            })}
          </div>
        </section>

        <section id="ai" className="border-t border-white/8 px-1 py-5">
          <div className="rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_18px_36px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/54">AI Reply</p>
            {assistantReply ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-6 text-white/72">{assistantReply.answer}</p>
                <div className="rounded-[14px] border border-white/8 bg-white/[0.02] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                    Suggested Route
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">{assistantReply.suggestedRoute}</p>
                  <p className="mt-2 text-[13px] leading-6 text-white/48">{assistantReply.suggestedAction}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-white/42">
                Use the fixed command line to ask about selling, rooms, fundraisers, services, lost items, or events.
              </p>
            )}
            {assistantError ? <p className="mt-4 text-sm text-white/58">{assistantError}</p> : null}
          </div>
        </section>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-[rgba(5,5,5,0.92)] px-4 py-3 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-5xl items-center gap-3 rounded-full border border-white/12 bg-[rgba(255,255,255,0.05)] px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.32)]">
          <Search className="h-4 w-4 shrink-0 text-white/42" />
          <input
            type="search"
            value={assistantQuestion}
            onChange={(event) => setAssistantQuestion(event.target.value)}
            placeholder="Ask MyDormStash AI where to post, browse, or start..."
            className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/28"
          />
          <button
            type="button"
            onClick={askAssistant}
            disabled={assistantLoading}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-40"
          >
            {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>
      </div>
    </main>
  );
}
