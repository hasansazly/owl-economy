"use client";

import Link from "next/link";
import {
  Bell,
  Heart,
  House,
  MapPin,
  MessageCircle,
  Plus,
  Search,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { computeCampusKarma, getCampusKarmaLabel } from "@/lib/campus-identity";
import {
  getExpiryCountdown,
  getMoveOutCountdown,
  getRecentViewerCount,
  getRelativePostLabel,
  parseUrgencyMeta,
} from "@/lib/listing-urgency";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import CampusLivePreviewStrip from "@/components/campus-live-preview-strip";

const quickPills = [
  { label: "Feed", href: "/dashboard" },
  { label: "📸 Wall", href: "/campus-wall" },
  { label: "📦 Resell", href: "/sell-goods" },
  { label: "🎉 Campus Happenings", href: "/campus-happenings" },
  { label: "🔎 Lost", href: "/lost-and-found" },
  { label: "✂️ Services", href: "/campus-services" },
  { label: "🏠 Rooms", href: "/rent-room", locked: true },
  { label: "🎨 Creative", href: "/campus-creatives", locked: true },
];


type RecentListing = {
  id: string | number;
  user_id?: string | null;
  status?: string | null;
  image_url?: string | null;
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
  profiles?:
    | {
        full_name?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        avatar_url?: string | null;
      }>
    | null;
};

type CampusLiveItem = RecentListing;

type WallPost = {
  id: string | number;
  text?: string | null;
  body?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  user_id?: string | null;
  like_count?: number | null;
  comment_count?: number | null;
  profiles?:
    | {
        full_name?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        avatar_url?: string | null;
      }>
    | null;
};

type ServiceItem = {
  id: string | number;
  title?: string | null;
  category?: string | null;
  image_url?: string | null;
  price?: number | string | null;
  rate?: number | string | null;
  location?: string | null;
  created_at?: string | null;
  rating?: number | string | null;
  review_count?: number | null;
  provider_name?: string | null;
  user_id?: string | null;
  profiles?:
    | {
        full_name?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        avatar_url?: string | null;
      }>
    | null;
};

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

function getProfileData(
  profile:
    | {
        full_name?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        avatar_url?: string | null;
      }>
    | null
    | undefined,
) {
  if (Array.isArray(profile)) return profile[0] || null;
  return profile || null;
}

function getInitials(name?: string | null) {
  const parts = (name || "Temple Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function getListingEmoji(category?: string | null) {
  const value = (category || "").toLowerCase();
  if (value.includes("book")) return "📚";
  if (value.includes("service")) return "✂️";
  if (value.includes("fund")) return "💸";
  if (value.includes("event")) return "🎉";
  if (value.includes("lost")) return "🔎";
  if (value.includes("room")) return "🏠";
  if (value.includes("creative")) return "🎨";
  return "📦";
}

function getWallText(post: WallPost) {
  return post.text || post.body || post.content || "";
}

function getServiceEmoji(category?: string | null) {
  const value = (category || "").toLowerCase();
  if (value.includes("hair")) return "✂️";
  if (value.includes("nail")) return "💅";
  if (value.includes("make")) return "💄";
  if (value.includes("braid")) return "✨";
  if (value.includes("move")) return "📦";
  return "🛠️";
}

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
  const [feedListings, setFeedListings] = useState<RecentListing[]>([]);
  const [feedListingsLoading, setFeedListingsLoading] = useState(true);
  const [feedListingsError, setFeedListingsError] = useState("");
  const [wallPosts, setWallPosts] = useState<WallPost[]>([]);
  const [wallLoading, setWallLoading] = useState(true);
  const [wallError, setWallError] = useState("");
  const [likedWallPosts, setLikedWallPosts] = useState<Record<string, boolean>>({});
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
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
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      const { data: campusLiveData, error: campusLiveFetchError } = await supabase
        .from("listings")
        .select("id, title, price, category, description, poster_name, major, class_year, contact_email, email, location, created_at")
        .eq("status", "active")
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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setFeedListingsLoading(false);
      setFeedListingsError("");
      return;
    }

    let mounted = true;

    supabase
      .from("listings")
      .select("id, user_id, title, price, category, description, poster_name, major, class_year, contact_email, email, location, created_at, status, image_url, profiles(full_name, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setFeedListingsError("");
          setFeedListings([]);
        } else {
          setFeedListings((data as RecentListing[]) || []);
        }
        setFeedListingsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setWallLoading(false);
      setWallError("");
      return;
    }

    let mounted = true;

    supabase
      .from("wall_posts")
      .select("*, profiles(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setWallError("");
          setWallPosts([]);
        } else {
          setWallPosts((data as WallPost[]) || []);
        }
        setWallLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setServiceLoading(false);
      setServiceError("");
      return;
    }

    let mounted = true;

    supabase
      .from("services")
      .select("*, profiles(full_name, avatar_url)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setServiceError("");
          setServiceItems([]);
        } else {
          setServiceItems((data as ServiceItem[]) || []);
        }
        setServiceLoading(false);
      });

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

      <section className="relative z-10 mx-auto max-w-[1380px] px-4 pb-12 pt-[calc(env(safe-area-inset-top)+60px)] sm:px-6">
        <header className="mobile-top-bar flex items-center justify-between border-b border-white/10 bg-[rgba(47,45,41,0.94)] px-4 py-5 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[15px] font-medium tracking-[-0.02em] text-[#f8f5ef]">
            my<span className="text-[#7f77dd]">dorm</span>stash
          </Link>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              className="relative flex h-[34px] w-[34px] items-center justify-center rounded-[20px] border border-[rgba(107,92,231,0.5)] bg-transparent text-[#f2eee7]"
            >
              <Bell className="h-[18px] w-[18px] text-[#9B8FFF]" />
              <span className="absolute -right-1 -top-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#6B5CE7] text-[10px] font-medium text-white">
                {notificationCount}
              </span>
            </button>
            <Link
              href="/signin"
              className="inline-flex h-[34px] items-center justify-center rounded-[20px] border border-[rgba(107,92,231,0.5)] bg-transparent px-[14px] text-[13px] font-medium text-[#9B8FFF]"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="overflow-x-auto border-b border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-[12px] text-[#d0c8bb] whitespace-nowrap [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-w-max items-center gap-3 whitespace-nowrap">
            <span className="flex items-center gap-2 whitespace-nowrap">
              <span className="h-3.5 w-3.5 rounded-full bg-[#5f8c24]" />
              <span className="font-medium text-[#7fb83a]">{campusLiveItems.length || 47}</span>
              <span>Owls active now</span>
            </span>
            <span className="text-white/22">·</span>
            <span className="whitespace-nowrap">{recentListings.length || 12} new listings today</span>
            <span className="rounded-[20px] bg-[rgba(245,166,35,0.1)] px-3 py-1 font-medium text-[#F5A623]">🔥 Move-Out Season</span>
            <span className="text-white/22">·</span>
            <span className="whitespace-nowrap">{Math.max(3, Math.min(9, recentListings.length))} items sold in last hour</span>
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
          <div className="rounded-[14px] border border-[rgba(107,92,231,0.25)] bg-[rgba(107,92,231,0.10)] px-[14px] py-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-[#F0EEFF]">Got something to sell?</p>
                <p className="mt-1 line-clamp-2 text-[12px] text-[#F0EEFF]/50">Listings on Temple campus move fast</p>
              </div>
              <Link
                href="/create-listing"
                className="inline-flex h-[38px] min-w-[72px] shrink-0 items-center justify-center rounded-[20px] bg-[#6B5CE7] px-4 text-[13px] font-medium text-white"
              >
                Post
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
                    <h2 className="truncate text-[14px] font-medium tracking-[0.01em] text-white">
                      {item.title || item.category || "Campus post"}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-[12px] text-white/52">
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

        <CampusLivePreviewStrip />

        <section id="recent" className="border-t border-white/8 px-1 py-5">
          {(!feedListingsLoading || feedListings.length > 0) ? <p className="mb-3 whisper-label">recent listings</p> : null}
          {feedListingsLoading ? (
            <p className="px-2 text-[13px] text-[rgba(240,238,255,0.35)]">Loading recent listings...</p>
          ) : feedListings.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <p className="text-[13px] text-[rgba(240,238,255,0.35)]">No listings yet — be the first to post.</p>
              <Link
                href="/create-listing"
                className="mt-4 inline-flex h-[44px] items-center justify-center rounded-[20px] bg-[#6B5CE7] px-5 text-[13px] font-medium text-white"
              >
                + Post
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-1">
              {feedListings.map((listing) => {
                const profile = getProfileData(listing.profiles);

                return (
                  <Link
                    key={String(listing.id)}
                    href={`/listing/${listing.id}`}
                    className="overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]"
                  >
                    <div className="flex aspect-[4/3] w-full items-center justify-center bg-[rgba(255,255,255,0.05)]">
                      {listing.image_url ? (
                        <img src={listing.image_url} alt={listing.title || "Listing image"} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[26px]">{getListingEmoji(listing.category)}</span>
                      )}
                    </div>
                    <div className="p-[10px]">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-medium text-[#F0EEFF]">
                        {listing.title || "Campus listing"}
                      </p>
                      <p className="mt-1 text-[13px] font-medium text-[#9B8FFF]">
                        {listing.price !== null && listing.price !== undefined ? `$${listing.price}` : "Free"}
                      </p>
                      <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
                        {listing.location || "Temple campus"} · {getRelativePostLabel(listing.created_at)}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="rounded-[20px] bg-[rgba(107,92,231,0.15)] px-2 py-0.5 text-[10px] text-[#9B8FFF]">
                          {listing.category || "Resell"}
                        </span>
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={profile.full_name || "Seller"} className="h-6 w-6 rounded-full object-cover" />
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-white/8 px-1 py-5">
          {(!wallLoading || wallPosts.length > 0) ? <p className="mb-3 whisper-label">campus wall</p> : null}
          {wallLoading ? (
            <p className="px-2 text-[13px] text-[rgba(240,238,255,0.35)]">Loading campus wall...</p>
          ) : wallPosts.length === 0 ? (
            <p className="px-2 text-[13px] text-[rgba(240,238,255,0.35)]">No wall posts yet.</p>
          ) : (
            <div className="space-y-3 px-1">
              {wallPosts.map((post) => {
                const profile = getProfileData(post.profiles);
                const name = profile?.full_name || "Temple Student";
                const likeCount = post.like_count || 0;
                const commentCount = post.comment_count || 0;
                const liked = likedWallPosts[String(post.id)] || false;

                return (
                  <article
                    key={String(post.id)}
                    className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]"
                  >
                    <Link href={`/wall/${post.id}`} className="block">
                      <div className="flex items-center gap-3">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                            {getInitials(name)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-[#F0EEFF]">{name}</p>
                          <p className="text-[11px] text-[rgba(240,238,255,0.4)]">{getRelativePostLabel(post.created_at)}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[14px] leading-[1.6] text-[#F0EEFF]">{getWallText(post)}</p>
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt="Campus wall post"
                          className="mt-3 aspect-[16/9] w-full rounded-[10px] object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="mt-3 flex items-center gap-4 text-[12px] text-[rgba(240,238,255,0.4)]">
                      <button
                        type="button"
                        onClick={async () => {
                          const supabase = getSupabaseBrowserClient();
                          if (!supabase) return;
                          const nextLiked = !liked;
                          const nextCount = Math.max(0, likeCount + (nextLiked ? 1 : -1));
                          setLikedWallPosts((current) => ({ ...current, [String(post.id)]: nextLiked }));
                          setWallPosts((current) =>
                            current.map((item) =>
                              String(item.id) === String(post.id) ? { ...item, like_count: nextCount } : item,
                            ),
                          );
                          await supabase.from("wall_posts").update({ like_count: nextCount } as never).eq("id", post.id);
                        }}
                        className="inline-flex items-center gap-1"
                      >
                        <Heart className={`h-4 w-4 ${liked ? "fill-[#9B8FFF] text-[#9B8FFF]" : "text-[rgba(240,238,255,0.4)]"}`} />
                        {likeCount}
                      </button>
                      <Link href={`/wall/${post.id}`} className="inline-flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {commentCount}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-white/8 px-1 py-5">
          {(!serviceLoading || serviceItems.length > 0) ? <p className="mb-3 whisper-label">campus services</p> : null}
          {serviceLoading ? (
            <p className="px-2 text-[13px] text-[rgba(240,238,255,0.35)]">Loading campus services...</p>
          ) : serviceItems.length === 0 ? (
            <p className="px-2 text-[13px] text-[rgba(240,238,255,0.35)]">No services available yet.</p>
          ) : (
            <div className="space-y-3 px-1">
              {serviceItems.map((service) => {
                const profile = getProfileData(service.profiles);
                const providerName = profile?.full_name || service.provider_name || "Temple Student";
                const rating = Number(service.rating || 0);
                const stars = Math.max(0, Math.min(5, Math.round(rating)));

                return (
                  <Link
                    key={String(service.id)}
                    href={`/service/${service.id}`}
                    className="flex items-start gap-3 rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]"
                  >
                    <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[10px] bg-[rgba(107,92,231,0.1)] text-[22px]">
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.title || "Service"} className="h-full w-full rounded-[10px] object-cover" />
                      ) : (
                        <span>{getServiceEmoji(service.category)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium text-[#F0EEFF]">
                        {service.title || "Campus service"}
                      </p>
                      <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">{service.category || "Service"}</p>
                      <p className="mt-1 text-[13px] font-medium text-[#9B8FFF]">
                        {service.rate || service.price ? `$${service.rate || service.price}` : "Contact for rate"}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={providerName} className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[11px] text-[#9B8FFF]">
                            {getInitials(providerName)}
                          </div>
                        )}
                        <span className="text-[12px] text-[rgba(240,238,255,0.6)]">{providerName}</span>
                        <span className="text-[12px] text-[#F5A623]">{"★".repeat(stars)}{"☆".repeat(Math.max(0, 5 - stars))}</span>
                        <span className="text-[11px] text-[rgba(240,238,255,0.4)]">({service.review_count || 0})</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

      </section>

      <div className="mobile-bottom-nav border-t border-white/10 bg-[#36342f] backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1380px] grid-cols-5">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 py-2 text-[#9B8FFF]">
            <House className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-normal">Home</span>
          </Link>
          <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1 py-2 text-white/35">
            <Search className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-normal">Search</span>
          </Link>
          <Link href="/create-listing" className="flex flex-col items-center justify-center gap-1 py-2 text-white/35">
            <Plus className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-normal">Sell</span>
          </Link>
          <Link href="/campus-services" className="relative flex flex-col items-center justify-center gap-1 py-2 text-white/35">
            <span className="absolute left-1/2 top-1 ml-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#6B5CE7] text-[9px] font-medium text-white">
              2
            </span>
            <MessageCircle className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-normal">Messages</span>
          </Link>
          <Link href="/account" className="flex flex-col items-center justify-center gap-1 py-2 text-white/35">
            <User className="h-[22px] w-[22px]" />
            <span className="text-[10px] font-normal">Profile</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
