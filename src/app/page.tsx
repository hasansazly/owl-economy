"use client";

import Link from "next/link";
import {
  Bell,
  ChevronRight,
  DoorOpen,
  GraduationCap,
  LampDesk,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { computeCampusKarma, getCampusKarmaLabel } from "@/lib/campus-identity";
import { buildWeeklyLeaderboard, getCampusBadges } from "@/lib/campus-identity";
import {
  getExpiryCountdown,
  getMoveOutCountdown,
  getRecentViewerCount,
  getRelativePostLabel,
  parseUrgencyMeta,
} from "@/lib/listing-urgency";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const quickPills = [
  { label: "Feed", href: "/dashboard" },
  { label: "📸 Wall", href: "/campus-wall" },
  { label: "📦 Resell", href: "/sell-goods" },
  { label: "🏠 Rooms", href: "/rent-room", locked: true },
  { label: "🎉 Events", href: "/launch-event" },
  { label: "💸 Fundraise", href: "/fundraise-fast" },
  { label: "🔎 Lost", href: "/lost-and-found" },
  { label: "✂️ Services", href: "/campus-services" },
  { label: "🎨 Creative", href: "/campus-creatives" },
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

function getCampusLiveLabel(category: string) {
  if (category === "Lost & Found") return "Lost";
  if (category === "Fundraise") return "Fundraise";
  return "Events";
}

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

  return (day === 4 && hour >= 20) || day === 5 || day === 6 || (day === 0 && hour < 8);
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

const jumpSections = [
  { label: "F", href: "#flash" },
  { label: "L", href: "#launcher" },
  { label: "R", href: "#recent" },
  { label: "A", href: "#ai" },
];

export default function Home() {
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

  const previewItem = useMemo(
    () => recentListings.find((listing) => listing.title === activePreview) ?? recentListings[0] ?? null,
    [activePreview, recentListings],
  );
  const allVisibleIdentityListings = useMemo(
    () => [...recentListings, ...campusLiveItems],
    [campusLiveItems, recentListings],
  );
  const leaderboardPreview = useMemo(() => buildWeeklyLeaderboard(allVisibleIdentityListings), [allVisibleIdentityListings]);
  const notificationCount = useMemo(
    () => Math.min(9, Math.max(1, campusLiveItems.length + Math.min(recentListings.length, 4))),
    [campusLiveItems.length, recentListings.length],
  );

  const getKarma = (item: RecentListing | CampusLiveItem) => {
    const score = computeCampusKarma(allVisibleIdentityListings, item.contact_email || item.email || "");
    return { score, label: getCampusKarmaLabel(score) };
  };

  return (
    <main id="top" className="relative overflow-hidden bg-[#2f2d29] pb-28 text-[#f2eee7]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),_transparent_42%)]" />

      <nav className="fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-white/10 bg-[rgba(45,43,39,0.92)] px-2 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.32)] backdrop-blur-xl lg:flex">
        {jumpSections.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/46 transition hover:text-[#8d7bff]"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <section className="relative z-10 mx-auto max-w-[1380px] px-4 pb-12 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[rgba(47,45,41,0.94)] px-4 py-5 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[1.9rem] font-extrabold tracking-[-0.03em] text-[#f8f5ef] sm:text-[2.1rem]">
            my<span className="text-[#7f77dd]">dorm</span>stash
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="relative flex h-16 w-16 items-center justify-center rounded-[999px] border border-white/10 bg-[rgba(255,255,255,0.03)] text-[#f2eee7] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <Bell className="h-6 w-6 text-[#d0b56d]" />
              <span className="absolute right-2 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#f05b57] text-[14px] font-semibold text-white">
                {notificationCount}
              </span>
            </button>
            <Link
              href="/login"
              className="rounded-[18px] border border-white/14 bg-[rgba(255,255,255,0.03)] px-7 py-4 text-[13px] font-semibold text-[#f8f5ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-white/20 hover:bg-[rgba(255,255,255,0.05)]"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="border-b border-white/10 px-4 py-4 text-[13px] text-[#d0c8bb]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full bg-[#5f8c24]" />
              <span className="font-semibold text-[#7fb83a]">{campusLiveItems.length || 47}</span>
              <span>Owls active now</span>
            </span>
            <span className="text-white/22">·</span>
            <span>{recentListings.length || 12} new listings today</span>
            <span className="rounded-xl bg-[#f4ead7] px-4 py-2 font-semibold text-[#975f0a]">🔥 Move-Out Season</span>
            <span className="text-white/22">·</span>
            <span>{Math.max(3, Math.min(9, recentListings.length))} items sold in last hour</span>
          </div>
        </section>

        <section className="border-b border-white/10 px-4 py-3">
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {quickPills.map((pill) =>
              pill.locked ? (
                <div
                  key={pill.label}
                  aria-disabled="true"
                  className="shrink-0 border-b-[3px] border-transparent px-4 py-3 text-[13px] font-semibold text-white/34"
                >
                  {pill.label}
                </div>
              ) : (
                <Link
                  key={pill.label}
                  href={pill.href}
                  className={`shrink-0 border-b-[3px] px-4 py-3 text-[14px] font-semibold transition ${
                    pill.label === "Feed"
                      ? "border-[#8d7bff] text-[#8d7bff]"
                      : "border-transparent text-[#d0c8bb] hover:text-[#f3efe7]"
                  }`}
                >
                  {pill.label}
                </Link>
              ),
            )}
          </div>
        </section>

        <section className="px-4 py-3">
          <div className="rounded-[20px] border border-white/10 bg-[rgba(36,35,31,0.94)] px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-start gap-3">
              <div className="text-[34px] leading-none">⭐</div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold leading-6 text-[#f8f5ef]">
                  You&apos;re 38 karma points from &quot;Dorm Hero&quot; badge
                </p>
                <p className="mt-1 text-[13px] text-[#d0c8bb]">
                  Post a listing or return a lost item to earn points
                </p>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-[#8d7bff]" style={{ width: "62%" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-3">
          <div className="rounded-[26px] border border-[#cbc7ea] bg-[#e7e4fb] px-7 py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[18px] font-semibold text-[#443f9e]">Got something to sell?</p>
                <p className="mt-2 text-[16px] text-[#4d4bb8]">Listings on Temple campus move fast</p>
              </div>
              <Link
                href="/create-listing"
                className="shrink-0 rounded-[18px] border border-[#d9d6f6] bg-[rgba(255,255,255,0.35)] px-9 py-4 text-[16px] font-semibold text-[#ffffffb3] backdrop-blur-sm"
              >
                + Post
              </Link>
            </div>
          </div>
        </section>

        <section id="flash" className="campus-live-section px-1 py-4">
          {!campusLiveLoading && !campusLiveError && campusLiveItems.length > 0 ? (
            <div className="mb-3 flex items-center justify-between">
              <p className="campus-live-heading">
                <span className="campus-live-dot" aria-hidden="true" />
                Campus Live
              </p>
              <span className="campus-live-badge">{campusLiveItems.length} active</span>
            </div>
          ) : null}
          {moveOutCountdown ? (
            <div className="mb-3 rounded-[16px] border border-cyan-400/20 bg-cyan-400/8 px-4 py-3 text-[12px] text-white/78">
              <span className="font-semibold text-cyan-300">Move-Out Mode:</span> {moveOutCountdown}
            </div>
          ) : null}
          {campusLiveLoading ? (
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-[13px] text-white/42">
              Loading Campus Live...
            </div>
          ) : campusLiveError ? (
            <p className="px-4 py-2 text-[13px] text-[rgba(240,238,255,0.35)]">{campusLiveError}</p>
          ) : campusLiveItems.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] px-4 py-6 text-center text-[13px] text-white/42">
              No live lost and found, fundraiser, or event posts yet.
            </div>
          ) : (
            <div className="space-y-2">
              {campusLiveItems.map((item) => (
                <article
                  key={String(item.id)}
                  className="flex items-center justify-between rounded-[18px] border border-transparent px-3 py-3 transition hover:border-white/8 hover:bg-white/[0.03]"
                >
                  <div className="min-w-0 pr-3">
                    <h2 className="truncate text-[15px] font-semibold tracking-[0.01em] text-white">
                      {item.title || item.category || "Campus post"}
                    </h2>
                    <p className="mt-1 truncate text-[11px] text-white/52">
                      {item.poster_name || "Temple Student"}
                      {item.major ? ` · ${item.major}` : ""}
                      {item.class_year ? ` · ${item.class_year}` : ""}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-cyan-300/90">
                      Campus Karma {getKarma(item).score} · {getKarma(item).label}
                    </p>
                    <p className="mt-1 text-[11px] text-white/46">{getRelativePostLabel(item.created_at)}</p>
                    {getRecentViewerCount(item.id) > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-amber-300">
                        🔥 {getRecentViewerCount(item.id)} people are viewing this
                      </p>
                    ) : null}
                    {parseUrgencyMeta(item.description).flashSale || parseUrgencyMeta(item.description).moveOutMode ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {parseUrgencyMeta(item.description).flashSale ? (
                          <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-300">
                            Flash Sale
                          </span>
                        ) : null}
                        {parseUrgencyMeta(item.description).moveOutMode ? (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                            Move-Out
                          </span>
                        ) : null}
                        {getExpiryCountdown(parseUrgencyMeta(item.description).expiresAt) ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/74">
                            {getExpiryCountdown(parseUrgencyMeta(item.description).expiresAt)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/42">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-white/34" />
                      <span className="truncate">{item.location || "Temple Main Campus"}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70"
                    >
                      {getCampusLiveLabel(item.category || "Event")}
                    </button>
                    <span className="rounded-full border border-white/10 bg-[rgba(18,214,255,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                      {getCampusLiveTime(item.created_at)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="recent" className="border-t border-white/8 px-1 py-5">
          {!recentLoading && !recentError && recentListings.length > 0 ? (
            <div className="mb-3 flex items-center justify-between">
              <p className="whisper-label">Recent Listings</p>
              <Link href="/dashboard" className="text-[12px] text-white/38 transition hover:text-white/62">
                See all
              </Link>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            {recentLoading ? (
              <div className="lg:col-span-2 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-[13px] text-white/42">
                Loading recent listings...
              </div>
            ) : recentError ? (
              <p className="lg:col-span-2 p-2 text-[13px] text-[rgba(240,238,255,0.35)]">{recentError}</p>
            ) : recentListings.length === 0 ? (
              <div className="lg:col-span-2 rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-6 text-center text-[13px] text-white/42">
                No recent listings yet. When students post, they’ll appear here automatically.
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  {recentListings.map((listing) => (
                    <button
                      key={String(listing.id)}
                      type="button"
                      onMouseEnter={() => setActivePreview(listing.title ?? null)}
                      onFocus={() => setActivePreview(listing.title ?? null)}
                      onClick={() => setActivePreview(listing.title ?? null)}
                      className="flex w-full items-center justify-between rounded-[16px] border border-transparent px-2 py-3 text-left transition hover:border-white/8 hover:bg-white/[0.03]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-medium tracking-[0.01em] text-white">
                          {listing.price !== null && listing.price !== undefined ? `$${listing.price}` : listing.category || "Post"} -{" "}
                          {listing.title || "Campus listing"} - {listing.location || "Temple Main Campus"}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-white/46">
                          {getRelativePostLabel(listing.created_at)}
                        </span>
                      </span>
                      <span className="ml-3 shrink-0 rounded-full border border-white/12 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/66">
                        Peek
                      </span>
                    </button>
                  ))}
                </div>

                <aside className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-xl">
                  <div className="flex h-32 items-center justify-center rounded-[14px] border border-white/8 bg-[linear-gradient(135deg,_rgba(18,214,255,0.12),_rgba(255,255,255,0.03))] px-4 text-center text-sm font-semibold text-white/72">
                    {previewItem?.category || "Listing"}
                  </div>
                  <p className="whisper-label mt-4 text-[var(--accent)]">
                    Preview
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {previewItem?.price !== null && previewItem?.price !== undefined ? `$${previewItem?.price} - ` : ""}
                    {previewItem?.title || "Campus listing"}
                  </p>
                  <p className="mt-1 text-[11px] text-white/52">
                    {previewItem?.poster_name || "Temple Student"}
                    {previewItem?.major ? ` · ${previewItem.major}` : ""}
                    {previewItem?.class_year ? ` · ${previewItem.class_year}` : ""}
                  </p>
                  {previewItem ? (
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-cyan-300/90">
                      Campus Karma {getKarma(previewItem).score} · {getKarma(previewItem).label}
                    </p>
                  ) : null}
                  {previewItem ? (
                    <p className="mt-1 text-[11px] text-white/46">{getRelativePostLabel(previewItem.created_at)}</p>
                  ) : null}
                  {previewItem && getRecentViewerCount(previewItem.id) > 0 ? (
                    <p className="mt-1 text-[11px] font-semibold text-amber-300">
                      🔥 {getRecentViewerCount(previewItem.id)} people are viewing this
                    </p>
                  ) : null}
                  {previewItem && (parseUrgencyMeta(previewItem.description).flashSale || parseUrgencyMeta(previewItem.description).moveOutMode) ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {parseUrgencyMeta(previewItem.description).flashSale ? (
                        <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-300">
                          Flash Sale
                        </span>
                      ) : null}
                      {parseUrgencyMeta(previewItem.description).moveOutMode ? (
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                          Move-Out
                        </span>
                      ) : null}
                      {getExpiryCountdown(parseUrgencyMeta(previewItem.description).expiresAt) ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/74">
                          {getExpiryCountdown(parseUrgencyMeta(previewItem.description).expiresAt)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <p className="mt-1 text-[12px] text-white/42">{previewItem?.location || "Temple Main Campus"}</p>
                  <p className="mt-3 text-[12px] leading-6 text-white/52">
                    {parseUrgencyMeta(previewItem?.description).cleanDescription || "Open the feed to view the full post details."}
                  </p>
                </aside>
              </>
            )}
          </div>
        </section>

        <section className="border-t border-white/8 px-1 py-5">
          <p className="whisper-label mb-3">Campus Signals</p>
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
          <div className="mt-4 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
            {leaderboardPreview.length > 0 ? <p className="whisper-label">Top Sellers This Week</p> : null}
            {leaderboardPreview.length > 0 ? (
              <div className="mt-3 space-y-2">
                {leaderboardPreview.slice(0, 3).map((entry, index) => (
                  <div key={entry.email} className="flex items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-white">
                        #{index + 1} {entry.name}
                      </p>
                      <p className="mt-1 truncate text-[12px] text-white/48">
                        {entry.major || "Temple student"}
                        {entry.classYear ? ` · ${entry.classYear}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[13px] font-semibold text-cyan-300">{entry.karma} pts</p>
                      {getCampusBadges(allVisibleIdentityListings, entry.email).length > 0 ? (
                        <p className="text-[11px] text-white/44">{getCampusBadges(allVisibleIdentityListings, entry.email)[0]?.label}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] text-white/42">The weekly leaderboard appears automatically when students start posting this week.</p>
            )}
          </div>
        </section>

      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#36342f] backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1380px] grid-cols-5">
          <Link href="/" className="flex flex-col items-center gap-1 py-4 text-[#8d7bff]">
            <span className="text-[2rem] leading-none">🏠</span>
            <span className="text-[12px] font-medium">Feed</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center gap-1 py-4 text-[#d0c8bb]">
            <span className="text-[2rem] leading-none">🔎</span>
            <span className="text-[12px] font-medium">Search</span>
          </Link>
          <Link href="/create-listing" className="flex flex-col items-center gap-1 py-4 text-[#8d8177]">
            <span className="text-[2rem] font-bold leading-none">+</span>
            <span className="text-[12px] font-medium">Sell</span>
          </Link>
          <Link href="/campus-services" className="relative flex flex-col items-center gap-1 py-4 text-[#d0c8bb]">
            <span className="absolute left-1/2 top-3 ml-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#f05b57] text-[12px] font-semibold text-white">
              2
            </span>
            <span className="text-[2rem] leading-none">💬</span>
            <span className="text-[12px] font-medium">Messages</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center gap-1 py-4 text-[#d0c8bb]">
            <span className="text-[2rem] leading-none">👤</span>
            <span className="text-[12px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
