"use client";

import Link from "next/link";
import {
  Bell,
  BedDouble,
  ChevronRight,
  CirclePlus,
  DoorOpen,
  GraduationCap,
  HandCoins,
  House,
  LampDesk,
  Loader2,
  MapPin,
  MessageCircle,
  Palette,
  PartyPopper,
  PenSquare,
  Scissors,
  Search,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { buildWeeklyLeaderboard, computeCampusKarma, getCampusKarmaLabel } from "@/lib/campus-identity";
import {
  getExpiryCountdown,
  getMoveOutCountdown,
  getRecentViewerCount,
  getRelativePostLabel,
  parseUrgencyMeta,
} from "@/lib/listing-urgency";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type QuickAction = {
  title: string;
  description: string;
  icon: typeof Shirt;
  badge: string;
  href?: string;
  locked?: boolean;
  hypeBadge?: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Campus Feed",
    description: "Browse the live dashboard of campus listings.",
    icon: Search,
    badge: "Feed",
    href: "/dashboard",
  },
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
    badge: "Coming Soon",
    href: "/rent-room",
    locked: true,
    hypeBadge: "Soon",
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
    badge: "Coming Soon",
    href: "/campus-creatives",
    locked: true,
    hypeBadge: "Soon",
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
  {
    title: "Campus Wall",
    description: "Moments, memes, dorm tips, and campus updates.",
    icon: PenSquare,
    badge: "Scroll",
    href: "/campus-wall",
  },
];

type RecentListing = {
  id: string | number;
  title?: string | null;
  price?: number | string | null;
  category?: string | null;
  description?: string | null;
  poster_name?: string | null;
  major?: string | null;
  class_year?: string | null;
  contact_email?: string | null;
  email?: string | null;
  location?: string | null;
  created_at?: string | null;
};

type CampusLiveItem = RecentListing;

const campusLiveOrder = ["Lost & Found", "Fundraise", "Event"] as const;

function getCampusLiveTime(createdAt?: string | null) {
  if (!createdAt) return "Live";

  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));

  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function isFratPriorityWindow(now: Date) {
  const day = now.getDay();
  const hour = now.getHours();

  return (day === 4 && hour >= 18) || day === 5 || day === 6 || (day === 0 && hour < 6);
}

function isFratPartyItem(item: CampusLiveItem) {
  const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  return text.includes("frat");
}

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

const feedTabs = ["All", "Resell", "Events", "Lost", "Services", "Wall"] as const;

type FeedTab = (typeof feedTabs)[number];

function getFeedTab(category?: string | null): FeedTab {
  const value = (category || "").toLowerCase();

  if (value.includes("lost")) return "Lost";
  if (value.includes("event") || value.includes("fundraise")) return "Events";
  if (value.includes("service")) return "Services";
  if (value.includes("wall")) return "Wall";
  return "Resell";
}

function getFeedBadgeClass(category?: string | null) {
  const tab = getFeedTab(category);

  if (tab === "Events") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-300";
  }

  if (tab === "Lost") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  if (tab === "Services") {
    return "border-sky-400/20 bg-sky-400/10 text-sky-300";
  }

  if (tab === "Wall") {
    return "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300";
  }

  return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
}

export default function Home() {
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");
  const [selectedTab, setSelectedTab] = useState<FeedTab>("All");
  const [assistantReply, setAssistantReply] = useState<{
    answer: string;
    suggestedRoute: string;
    suggestedAction: string;
  } | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");
  const [campusLiveItems, setCampusLiveItems] = useState<CampusLiveItem[]>([]);
  const [campusLiveLoading, setCampusLiveLoading] = useState(true);
  const [campusLiveError, setCampusLiveError] = useState("");
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const moveOutCountdown = useMemo(() => getMoveOutCountdown(), []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setRecentLoading(false);
      setRecentError("");
      setCampusLiveLoading(false);
      setCampusLiveError("");
      return;
    }

    let mounted = true;

    const loadRecentListings = async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("id, title, price, category, description, poster_name, major, class_year, contact_email, email, location, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: campusLiveData, error: campusLiveFetchError } = await supabase
        .from("listings")
        .select("id, title, price, category, description, poster_name, major, class_year, contact_email, email, location, created_at")
        .in("category", [...campusLiveOrder])
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (error) {
        setRecentError("Could not load recent listings.");
        setRecentListings([]);
      } else {
        const items = (data as RecentListing[]) || [];
        setRecentListings(items);
        setActivePreview(items[0]?.title ?? null);
      }

      setRecentLoading(false);

      if (campusLiveFetchError) {
        setCampusLiveError("Could not load Campus Live.");
        setCampusLiveItems([]);
      } else {
        const now = new Date();

        const items = ((campusLiveData as CampusLiveItem[]) || []).sort((a, b) => {
          const categoryA = a.category || "";
          const categoryB = b.category || "";
          const fratPriorityActive = isFratPriorityWindow(now);
          const fratA = fratPriorityActive && categoryA === "Event" && isFratPartyItem(a);
          const fratB = fratPriorityActive && categoryB === "Event" && isFratPartyItem(b);
          const orderA = campusLiveOrder.indexOf(categoryA as (typeof campusLiveOrder)[number]);
          const orderB = campusLiveOrder.indexOf(categoryB as (typeof campusLiveOrder)[number]);

          if (fratA !== fratB) {
            if (categoryA === "Lost & Found") return -1;
            if (categoryB === "Lost & Found") return 1;
            return fratA ? -1 : 1;
          }

          if (orderA !== orderB) return orderA - orderB;

          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        });

        setCampusLiveItems(items);
      }

      setCampusLiveLoading(false);
    };

    loadRecentListings();

    return () => {
      mounted = false;
    };
  }, []);

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

  const previewItem = useMemo(
    () => recentListings.find((listing) => listing.title === activePreview) ?? recentListings[0] ?? null,
    [activePreview, recentListings],
  );
  const allVisibleIdentityListings = useMemo(() => {
    const merged = [...recentListings, ...campusLiveItems];
    const deduped = new Map<string, RecentListing | CampusLiveItem>();

    merged.forEach((item) => {
      deduped.set(String(item.id), item);
    });

    return [...deduped.values()].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [campusLiveItems, recentListings]);
  const leaderboardPreview = useMemo(() => buildWeeklyLeaderboard(allVisibleIdentityListings), [allVisibleIdentityListings]);
  const filteredFeed = useMemo(() => {
    if (selectedTab === "All") return allVisibleIdentityListings;
    return allVisibleIdentityListings.filter((item) => getFeedTab(item.category) === selectedTab);
  }, [allVisibleIdentityListings, selectedTab]);
  const hotItems = useMemo(() => filteredFeed.slice(0, 2), [filteredFeed]);
  const browseItems = useMemo(() => recentListings.slice(0, 4), [recentListings]);
  const activityItems = useMemo(() => allVisibleIdentityListings.slice(0, 4), [allVisibleIdentityListings]);
  const notifCount = Math.min(9, Math.max(1, campusLiveItems.length + recentListings.length));

  const getKarma = (item: RecentListing | CampusLiveItem) => {
    const score = computeCampusKarma(allVisibleIdentityListings, item.contact_email || item.email || "");
    return { score, label: getCampusKarmaLabel(score) };
  };

  return (
    <main id="top" className="relative overflow-hidden bg-[#000000] pb-32 text-white">
      <div className="startup-orb left-[-180px] top-[80px] h-[240px] w-[240px] bg-[rgba(18,214,255,0.08)]" />
      <div className="startup-orb right-[-140px] top-[180px] h-[280px] w-[280px] bg-[rgba(255,255,255,0.03)]" />
      <div className="relative z-10 mx-auto max-w-[680px]">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/8 bg-[rgba(0,0,0,0.92)] px-4 py-3 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[15px] font-semibold text-white">
            my<span className="text-[var(--accent)]">dorm</span>stash
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/72"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-semibold text-black">
                {notifCount}
              </span>
            </button>
            <Link
              href="/login"
              className="rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-black transition hover:brightness-110"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="overflow-x-auto border-b border-white/8 bg-[rgba(255,255,255,0.02)] px-4 py-2 text-[12px] text-white/62 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-2 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <span className="font-semibold text-emerald-300">{campusLiveItems.length || 0}</span> live on campus
            </span>
            <span className="text-white/24">·</span>
            <span>{recentListings.length} recent posts</span>
            {moveOutCountdown ? (
              <>
                <span className="text-white/24">·</span>
                <span className="rounded-md bg-white/6 px-2 py-0.5 text-[11px] font-medium text-white/78">
                  Move-Out Mode {moveOutCountdown}
                </span>
              </>
            ) : null}
          </div>
        </section>

        <section className="border-b border-white/8 px-4">
          <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {feedTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedTab(tab)}
                className={`shrink-0 border-b-2 px-3 py-3 text-[13px] font-medium transition ${
                  selectedTab === tab
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-transparent text-white/48 hover:text-white/72"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 pt-3">
          <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <p className="text-[13px] font-semibold text-white">Everything campus. All in one place.</p>
            <p className="mt-1 text-[12px] text-white/52">
              The student network for what you need. Buy, sell, and connect with your community instantly.
            </p>
          </div>
        </section>

        <section className="px-4 pt-3">
          <div className="rounded-[14px] border border-[rgba(127,119,221,0.35)] bg-[rgba(127,119,221,0.12)] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Got something to post?</p>
                <p className="mt-1 text-[12px] text-white/58">Listings, events, services, and campus moments all move from here.</p>
              </div>
              <Link
                href="/create-listing"
                className="shrink-0 rounded-lg bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-black"
              >
                + Post
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pt-3">
          <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            <div className="flex items-start gap-3">
              <div className="text-lg">⭐</div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-white">
                  {leaderboardPreview[0]
                    ? `Top seller this week: ${leaderboardPreview[0].name}`
                    : 'Campus karma starts as soon as students post'}
                </p>
                <p className="mt-1 text-[12px] text-white/52">
                  {leaderboardPreview[0]
                    ? `${leaderboardPreview[0].karma} points this week · ${leaderboardPreview[0].major || "Temple student"}`
                    : "Post, help, and return lost items to build your campus identity."}
                </p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-white/8">
                  <div className="h-1.5 rounded-full bg-[var(--accent)]" style={{ width: `${leaderboardPreview[0] ? 72 : 38}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="flash" className="px-4 pb-1 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-white">Hot right now</p>
            <Link href="/dashboard" className="text-[13px] text-[var(--accent)]">
              See all
            </Link>
          </div>
          {recentLoading || campusLiveLoading ? (
            <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-[13px] text-white/42">
              Loading feed...
            </div>
          ) : recentError || campusLiveError ? (
            <div className="rounded-[14px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] p-4 text-[13px] text-[#F09595]">
              {recentError || campusLiveError}
            </div>
          ) : hotItems.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-4 text-[13px] text-white/42">
              No listings yet. New campus posts will appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {hotItems.map((item) => {
                const urgency = parseUrgencyMeta(item.description);
                const priceLabel =
                  item.price !== null && item.price !== undefined && Number(item.price) > 0
                    ? `$${item.price}`
                    : getFeedTab(item.category);

                return (
                  <article
                    key={String(item.id)}
                    className="overflow-hidden rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.02)]"
                  >
                    <div className="relative flex h-36 items-center justify-center bg-[linear-gradient(135deg,_rgba(18,214,255,0.12),_rgba(255,255,255,0.03))] text-4xl">
                      {getFeedTab(item.category) === "Events"
                        ? "🎉"
                        : getFeedTab(item.category) === "Lost"
                          ? "🔍"
                          : getFeedTab(item.category) === "Services"
                            ? "✂️"
                            : getFeedTab(item.category) === "Wall"
                              ? "📸"
                              : "📦"}
                      {getRecentViewerCount(item.id) > 0 ? (
                        <span className="absolute left-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white">
                          🔥 {getRecentViewerCount(item.id)} viewing
                        </span>
                      ) : (
                        <span className="absolute left-3 top-3 rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-white">
                          Just posted
                        </span>
                      )}
                      {getExpiryCountdown(urgency.expiresAt) ? (
                        <span className="absolute right-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-semibold text-white">
                          {getExpiryCountdown(urgency.expiresAt)}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className="text-[14px] font-semibold text-white">{item.title || "Campus post"}</h2>
                          <p className="mt-1 text-[12px] text-white/48">
                            {item.location || "Temple Main Campus"} · {getRelativePostLabel(item.created_at)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[15px] font-semibold text-[var(--accent)]">{priceLabel}</span>
                      </div>
                      <p className="mt-2 text-[11px] text-white/62">
                        {item.poster_name || "Temple Student"}
                        {item.major ? ` · ${item.major}` : ""}
                        {item.class_year ? ` · ${item.class_year}` : ""}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-200 text-[9px] font-semibold text-black">
                            {(item.poster_name || "TS")
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                          <span className="text-[11px] text-white/52">⭐ {getKarma(item).score} karma</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70"
                          >
                            Save
                          </button>
                          <Link
                            href="/dashboard"
                            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-[12px] font-semibold text-black"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="px-4 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-white">Campus activity</p>
            <Link href="/dashboard" className="text-[13px] text-[var(--accent)]">
              See all
            </Link>
          </div>
          <div className="overflow-hidden rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.02)]">
            {activityItems.length === 0 ? (
              <div className="p-4 text-[13px] text-white/42">Campus activity will appear here once students start posting.</div>
            ) : (
              activityItems.map((item) => (
                <div
                  key={`activity-${item.id}`}
                  className="flex items-center gap-3 border-b border-white/8 px-4 py-3 last:border-b-0"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                    {(item.poster_name || "TS")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1 text-[13px] text-white">
                    <span className="font-semibold">{item.poster_name || "Temple Student"}</span>{" "}
                    <span className="text-white/72">
                      posted {item.title || item.category || "something new"} in {getFeedTab(item.category)}
                    </span>
                  </div>
                  <span className="text-[11px] text-white/42">{getCampusLiveTime(item.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="px-4 pt-4">
          <div className="rounded-[14px] border border-orange-300/20 bg-orange-200/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-white">Move-Out Mode is live</p>
                <p className="mt-1 text-[12px] text-white/58">Rugs, lamps, mini fridges, and bins move fastest here.</p>
              </div>
              <Link
                href="/sell-goods"
                className="shrink-0 rounded-lg bg-orange-500 px-3 py-2 text-[12px] font-semibold text-white"
              >
                List now
              </Link>
            </div>
          </div>
        </section>

        <section id="recent" className="px-4 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-white">Browse nearby</p>
            <Link href="/dashboard" className="text-[13px] text-[var(--accent)]">
              See all
            </Link>
          </div>
          {recentLoading ? (
            <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-[13px] text-white/42">
              Loading nearby listings...
            </div>
          ) : recentError ? (
            <div className="rounded-[14px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] p-4 text-[13px] text-[#F09595]">
              {recentError}
            </div>
          ) : browseItems.length === 0 ? (
            <div className="rounded-[14px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-4 text-[13px] text-white/42">
              No recent listings yet. The grid will fill automatically when students post.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {browseItems.map((listing) => (
                <button
                  key={String(listing.id)}
                  type="button"
                  onMouseEnter={() => setActivePreview(listing.title ?? null)}
                  onFocus={() => setActivePreview(listing.title ?? null)}
                  onClick={() => setActivePreview(listing.title ?? null)}
                  className="overflow-hidden rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.02)] text-left transition hover:border-white/18"
                >
                  <div className="relative flex h-24 items-center justify-center bg-[rgba(255,255,255,0.04)] text-3xl">
                    {getFeedTab(listing.category) === "Events"
                      ? "🎉"
                      : getFeedTab(listing.category) === "Lost"
                        ? "🔍"
                        : getFeedTab(listing.category) === "Services"
                          ? "✂️"
                          : getFeedTab(listing.category) === "Wall"
                            ? "📸"
                            : "📦"}
                    <span className={`absolute right-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-semibold ${getFeedBadgeClass(listing.category)}`}>
                      {getFeedTab(listing.category)}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-[12px] font-semibold text-white">{listing.title || "Campus listing"}</p>
                    <p className="mt-1 text-[13px] font-semibold text-[var(--accent)]">
                      {listing.price !== null && listing.price !== undefined && Number(listing.price) > 0
                        ? `$${listing.price}`
                        : getFeedTab(listing.category)}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-white/44">{listing.location || "Temple Main Campus"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section id="launcher" className="px-4 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-white">Explore tools</p>
            <span className="text-[12px] text-white/38">Everything else</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ title, description, icon: Icon, badge, href, locked, hypeBadge }) => {
              const card = (
                <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.02)] p-3 transition hover:border-white/18">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-white/76" />
                    </div>
                    <div className="flex items-center gap-2">
                      {hypeBadge ? (
                        <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                          {hypeBadge}
                        </span>
                      ) : null}
                      <ChevronRight className="h-4 w-4 text-white/28" />
                    </div>
                  </div>
                  <p className="mt-3 text-[14px] font-semibold text-white">{title}</p>
                  <p className="mt-1 text-[12px] leading-5 text-white/44">{description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/66">
                      {badge}
                    </span>
                    {locked ? <span className="text-[10px] uppercase tracking-[0.14em] text-white/34">Locked</span> : null}
                  </div>
                </div>
              );

              return locked || !href ? (
                <div key={title} aria-disabled="true">
                  {card}
                </div>
              ) : (
                <Link key={title} href={href}>
                  {card}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="px-4 pt-4">
          <div className="space-y-1">
            {supportCards.map(({ title, text, icon: Icon, href }) => {
              const row = (
                <div className="flex items-center justify-between gap-3 border-b border-white/8 py-3 last:border-b-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-white/72" />
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-white">{title}</p>
                      <p className="truncate text-[12px] text-white/42">{text}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/28" />
                </div>
              );

              return href ? (
                <Link key={title} href={href}>
                  {row}
                </Link>
              ) : (
                <div key={title}>{row}</div>
              );
            })}
          </div>
        </section>

        <section id="ai" className="px-4 py-4">
          <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/46">AI Reply</p>
            {assistantReply ? (
              <div className="mt-3 space-y-2">
                <p className="text-[13px] leading-6 text-white/72">{assistantReply.answer}</p>
                <p className="text-[12px] text-[var(--accent)]">{assistantReply.suggestedRoute}</p>
                <p className="text-[12px] text-white/46">{assistantReply.suggestedAction}</p>
              </div>
            ) : (
              <p className="mt-3 text-[13px] leading-6 text-white/46">
                Use the command line below to ask where to post, browse, or start.
              </p>
            )}
            {assistantError ? <p className="mt-3 text-[12px] text-[#F09595]">{assistantError}</p> : null}
          </div>
        </section>

        {previewItem ? (
          <section className="px-4 pb-2">
            <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">Peek</p>
              <p className="mt-2 text-[14px] font-semibold text-white">
                {previewItem.price !== null && previewItem.price !== undefined && Number(previewItem.price) > 0 ? `$${previewItem.price} · ` : ""}
                {previewItem.title || "Campus listing"}
              </p>
              <p className="mt-1 text-[12px] text-white/48">
                {previewItem.poster_name || "Temple Student"}
                {previewItem.major ? ` · ${previewItem.major}` : ""}
                {previewItem.class_year ? ` · ${previewItem.class_year}` : ""}
              </p>
              <p className="mt-2 text-[12px] leading-6 text-white/56">
                {parseUrgencyMeta(previewItem.description).cleanDescription || "Open the dashboard to view the full details."}
              </p>
            </div>
          </section>
        ) : null}

        <div className="sticky bottom-[86px] z-20 flex justify-end px-4 pb-2">
          <Link
            href="/sell-goods"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-black shadow-[0_8px_24px_rgba(18,214,255,0.26)]"
          >
            <CirclePlus className="h-4 w-4" />
            Sell something
          </Link>
        </div>

        <nav className="sticky bottom-0 z-30 border-t border-white/8 bg-[rgba(0,0,0,0.94)] px-2 py-2 backdrop-blur-xl">
          <div className="grid grid-cols-5">
            <Link href="/" className="flex flex-col items-center gap-1 py-1 text-[var(--accent)]">
              <House className="h-4 w-4" />
              <span className="text-[10px]">Feed</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 py-1 text-white/48">
              <Search className="h-4 w-4" />
              <span className="text-[10px]">Search</span>
            </Link>
            <Link href="/create-listing" className="flex flex-col items-center gap-1 py-1 text-white/48">
              <CirclePlus className="h-4 w-4" />
              <span className="text-[10px]">Post</span>
            </Link>
            <Link href="/campus-services" className="flex flex-col items-center gap-1 py-1 text-white/48">
              <MessageCircle className="h-4 w-4" />
              <span className="text-[10px]">Book</span>
            </Link>
            <Link href="/account" className="flex flex-col items-center gap-1 py-1 text-white/48">
              <UserRound className="h-4 w-4" />
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </nav>
      </div>

      <div className="fixed inset-x-0 bottom-[58px] z-40 px-4">
        <div className="mx-auto flex max-w-[680px] items-center gap-3 rounded-full border border-white/12 bg-[rgba(10,10,10,0.96)] px-4 py-3 shadow-[0_18px_36px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
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
          </button>
        </div>
      </div>
    </main>
  );
}
