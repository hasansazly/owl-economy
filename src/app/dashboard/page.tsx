"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Bookmark, Home, Mail, Plus, Search, Settings, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getStudentProfile, isVerifiedStudentLoggedIn } from "@/lib/app-auth";
import {
  buildWeeklyLeaderboard,
  computeCampusKarma,
  countMutualClassmates,
  getCampusBadges,
  getCampusKarmaLabel,
  getPreferencePriority,
} from "@/lib/campus-identity";
import {
  getExpiryCountdown,
  getMoveOutCountdown,
  getRecentViewerCount,
  getRelativePostLabel,
  parseUrgencyMeta,
  recordUrgencyView,
} from "@/lib/listing-urgency";
import {
  buildCampusNotifications,
  getCampusNotifications,
  incrementListingView,
  isSavedListing,
  markCampusNotificationsRead,
  toggleSavedListing,
  type CampusNotification,
} from "@/lib/campus-notifications";
import { capWallFeedShare, getCampusWallSummary } from "@/lib/campus-wall";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const feedFilters = ["All", "Events", "Marketplace", "Lost & Found", "Services", "Campus Wall"] as const;
const FEED_PAGE_SIZE = 8;

type FeedFilter = (typeof feedFilters)[number];

type ListingRow = {
  id: string | number;
  user_id?: string | null;
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
  status?: string | null;
  image_url?: string | null;
};

function getFeedGroup(category: string) {
  const value = category.toLowerCase();

  if (value.includes("event")) return "Events";
  if (value.includes("lost") || value.includes("found") || value.includes("id") || value.includes("key")) {
    return "Lost & Found";
  }
  if (
    value.includes("service") ||
    value.includes("hair") ||
    value.includes("braid") ||
    value.includes("nail") ||
    value.includes("makeup") ||
    value.includes("moving") ||
    value.includes("tech support")
  ) {
    return "Services";
  }
  if (value.includes("campus wall") || value.includes("wall")) return "Campus Wall";
  return "Marketplace";
}

function getBadgeStyles(category: string) {
  const group = getFeedGroup(category);

  if (group === "Events") {
    return "border border-red-400/25 bg-red-400/12 text-red-300";
  }

  if (group === "Services") {
    return "border border-cyan-400/25 bg-cyan-400/12 text-cyan-300";
  }

  if (group === "Lost & Found") {
    return "border border-amber-300/25 bg-amber-300/12 text-amber-200";
  }

  if (group === "Campus Wall") {
    return "border border-fuchsia-400/25 bg-fuchsia-400/12 text-fuchsia-300";
  }

  return "border border-emerald-400/25 bg-emerald-400/12 text-emerald-300";
}

function getContactHref(item: ListingRow) {
  const email = item.contact_email || item.email;

  if (!email) return "";

  const subject = encodeURIComponent(`Interest in ${item.title || "listing"} on MyDormStash`);
  const body = encodeURIComponent(
    "Hi, I saw your post on MyDormStash. Is this still available to connect on campus?",
  );

  return `mailto:${email}?subject=${subject}&body=${body}`;
}

function sortListingsNewest(items: ListingRow[]) {
  return [...items].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;

    if (dateA !== dateB) return dateB - dateA;

    const idA = Number(a.id);
    const idB = Number(b.id);

    if (!Number.isNaN(idA) && !Number.isNaN(idB)) return idB - idA;

    return String(b.id).localeCompare(String(a.id));
  });
}

function getSellerInitials(name?: string | null) {
  const parts = (name || "Temple Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

export default function DashboardPage() {
  const router = useRouter();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ListingRow | null>(null);
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const profile = useMemo(() => getStudentProfile(), []);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [savedItemIds, setSavedItemIds] = useState<Record<string, boolean>>({});
  const [avatarByUserId, setAvatarByUserId] = useState<Record<string, string>>({});
  const profileEmail = profile.email;
  const profileEventAlerts = profile.eventAlerts;
  const profileLostFoundAlerts = profile.lostFoundAlerts;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setIsLoggedIn(isVerifiedStudentLoggedIn());
      setError("Supabase is not configured.");
      return;
    }

    let mounted = true;

    const loadDashboard = async () => {
      const [{ data: sessionData }, listingsResponse] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      setIsLoggedIn(Boolean(sessionData.session) || isVerifiedStudentLoggedIn());

      if (listingsResponse.error) {
        setError("Could not load campus listings right now.");
        setListings([]);
        setAvatarByUserId({});
      } else {
        const nextListings = sortListingsNewest((listingsResponse.data as ListingRow[]) || []);
        setListings(nextListings);
        setNotifications(
          buildCampusNotifications({
            listings: nextListings,
            currentEmail: profileEmail,
            eventAlerts: profileEventAlerts,
            lostFoundAlerts: profileLostFoundAlerts,
          }),
        );
        setSavedItemIds(
          Object.fromEntries(nextListings.map((item) => [String(item.id), isSavedListing(item.id)])),
        );

        const userIds = Array.from(
          new Set(nextListings.map((item) => item.user_id).filter((value): value is string => Boolean(value))),
        );

        if (userIds.length > 0) {
          const { data: profileRows } = await supabase
            .from("profiles")
            .select("id, avatar_url")
            .in("id", userIds);

          if (!mounted) return;

          setAvatarByUserId(
            Object.fromEntries(
              ((profileRows as Array<{ id: string; avatar_url?: string | null }>) || [])
                .filter((row) => row.id && row.avatar_url)
                .map((row) => [row.id, row.avatar_url as string]),
            ),
          );
        } else {
          setAvatarByUserId({});
        }
      }

      setLoading(false);
    };

    loadDashboard();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(session) || isVerifiedStudentLoggedIn());
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [profileEmail, profileEventAlerts, profileLostFoundAlerts]);

  useEffect(() => {
    setNotifications(getCampusNotifications());
  }, []);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/signin");
    }
  }, [isLoggedIn, loading, router]);

  const visibleListings = useMemo(() => {
    const getRankingScore = (item: ListingRow) => {
      const preferenceScore = getPreferencePriority(item, {
        homeBuilding: profile.homeBuilding,
        followedBuildings: profile.followedBuildings,
        followedMajors: profile.followedMajors,
      });
      const createdAt = item.created_at ? new Date(item.created_at).getTime() : 0;
      const ageInHours = Math.max(1, (Date.now() - createdAt) / (1000 * 60 * 60));
      const recencyScore = 120 / ageInHours;
      const engagementScore = getRecentViewerCount(item.id) * 12;
      const categoryBoost = getFeedGroup(item.category || "Marketplace") === "Lost & Found" ? 8 : 0;

      return preferenceScore * 100 + recencyScore + engagementScore + categoryBoost;
    };

    const next = listings.filter((item) => {
      const category = item.category || "Marketplace";
      const group = getFeedGroup(category);
      const matchesFilter = activeFilter === "All" || group === activeFilter;
      const haystack = [item.title || "", category, item.description || "", item.location || ""]
        .concat(item.major || "")
        .join(" ")
        .toLowerCase();
      const matchesQuery = !query.trim() || haystack.includes(query.trim().toLowerCase());

      return matchesFilter && matchesQuery;
    });

    const ranked = [...sortListingsNewest(next)].sort((a, b) => getRankingScore(b) - getRankingScore(a));
    return activeFilter === "All" ? capWallFeedShare(ranked) : ranked;
  }, [activeFilter, listings, profile.followedBuildings, profile.followedMajors, profile.homeBuilding, query]);
  const renderedListings = useMemo(
    () => visibleListings.slice(0, visibleCount),
    [visibleCount, visibleListings],
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );
  const moveOutCountdown = useMemo(() => getMoveOutCountdown(), []);

  const mutualConnections = useMemo(
    () =>
      countMutualClassmates(listings, {
        currentEmail: profile.email,
        classYear: profile.classYear,
        major: profile.major,
      }),
    [listings, profile.classYear, profile.email, profile.major],
  );
  const leaderboard = useMemo(() => buildWeeklyLeaderboard(listings), [listings]);
  const myBadges = useMemo(() => getCampusBadges(listings, profile.email), [listings, profile.email]);
  const myKarma = useMemo(() => computeCampusKarma(listings, profile.email), [listings, profile.email]);

  const getItemKarma = (item: ListingRow) => {
    const email = item.contact_email || item.email || "";
    const score = computeCampusKarma(listings, email);
    return { score, label: getCampusKarmaLabel(score) };
  };

  useEffect(() => {
    setVisibleCount(FEED_PAGE_SIZE);
  }, [activeFilter, query]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + FEED_PAGE_SIZE, visibleListings.length));
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [visibleListings.length]);

  const openListingDetail = (item: ListingRow) => {
    incrementListingView(item, profile.email);
    recordUrgencyView(item.id);
    setSelectedItem(item);
  };

  const handleToggleSavedItem = (item: ListingRow) => {
    const saved = toggleSavedListing(item);
    setSavedItemIds((current) => ({ ...current, [String(item.id)]: saved }));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-6">
        <header className="mobile-top-bar border-b border-white/8 bg-[rgba(0,0,0,0.92)] py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <p className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
              <span className="text-cyan-400">my</span>dormstash<span className="text-white/88">.com</span>
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextOpen = !notificationsOpen;
                setNotificationsOpen(nextOpen);
                if (nextOpen) {
                  setNotifications(markCampusNotificationsRead());
                }
              }}
              className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/74 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Bell className="h-3.5 w-3.5" />
              Alerts
              {unreadCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-bold text-black">
                  {unreadCount}
                </span>
              ) : null}
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/74 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Home className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[12px] font-semibold text-white/74 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <Settings className="h-3.5 w-3.5" />
              Account
            </Link>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-white/35" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Temple Campus..."
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-white/28"
            />
          </label>

          {notificationsOpen ? (
            <div className="mt-4 rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-3 shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <div className="mb-2 flex items-center justify-between gap-3">
                {notifications.length > 0 ? <p className="whisper-label">Campus Alerts</p> : <span />}
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-[11px] text-white/38 transition hover:text-white/70"
                >
                  Close
                </button>
              </div>
              {notifications.length === 0 ? (
                <p className="text-[12px] leading-5 text-white/42">No alerts yet. As your feed gets more active, notifications will show up here.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-3">
                      <p className="text-[12px] font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-[12px] leading-5 text-white/46">{item.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </header>

        <section className="pt-5">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <p className="whisper-label">Following First</p>
              <p className="mt-2 text-[13px] text-white/74">
                {profile.homeBuilding
                  ? `${profile.homeBuilding} listings show up first.`
                  : "Set your home building to rank nearby listings first."}
              </p>
              {(profile.followedBuildings.length || profile.followedMajors.length) ? (
                <p className="mt-1 text-[12px] text-white/46">
                  {[
                    profile.followedBuildings.length ? `${profile.followedBuildings.length} building follow${profile.followedBuildings.length === 1 ? "" : "s"}` : "",
                    profile.followedMajors.length ? `${profile.followedMajors.length} major follow${profile.followedMajors.length === 1 ? "" : "s"}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
            </div>

            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <p className="whisper-label">Campus Connections</p>
              <p className="mt-2 text-[13px] text-white/74">
                {mutualConnections > 0
                  ? `${mutualConnections} of your classmates also use MyDormStash.`
                  : "As classmates post, your mutual connections will appear here."}
              </p>
            </div>
          </div>

          <div className="mb-4 grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <p className="whisper-label">Your Campus Reputation</p>
              <p className="mt-2 text-[22px] font-bold text-white">{myKarma}</p>
              <p className="mt-1 text-[13px] text-white/58">Karma points from real campus activity.</p>
              {myBadges.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {myBadges.map((badge) => (
                    <span
                      key={badge.id}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-300"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-white/42">Badges unlock automatically when you post, sell, or help people on campus.</p>
              )}
            </div>

            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
              {leaderboard.length > 0 ? <p className="whisper-label">Top Sellers This Week on Temple Campus</p> : null}
              {leaderboard.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {leaderboard.map((entry, index) => (
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
                        <p className="text-[11px] text-white/44">{entry.listings} listing{entry.listings === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-white/42">The leaderboard will fill as students post real listings this week.</p>
              )}
            </div>
          </div>

          {moveOutCountdown ? (
            <div className="mb-4 rounded-[18px] border border-cyan-400/20 bg-cyan-400/8 px-4 py-3">
              <p className="whisper-label text-cyan-300">Move-Out Mode</p>
              <p className="mt-2 text-[13px] text-white/78">{moveOutCountdown}</p>
            </div>
          ) : null}

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {feedFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  activeFilter === filter
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/74 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="mt-5 space-y-5">
            {[0, 1, 2].map((item) => (
              <div key={item}>
                <div className="mb-3 h-5 w-32 animate-pulse rounded bg-white/10" />
                <div className="-mx-1 flex gap-3 overflow-hidden px-1">
                  {[0, 1].map((card) => (
                    <div
                      key={card}
                      className="min-w-[260px] rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5"
                    >
                      <div className="h-32 animate-pulse rounded-[14px] bg-white/10" />
                      <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {!loading && isLoggedIn && error ? (
          <section className="mt-5 p-1 text-[13px] text-[rgba(240,238,255,0.35)]">
            {error}
          </section>
        ) : null}

        {!loading && isLoggedIn && !error ? (
          <section className="mt-5 space-y-4">
            <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <p className="whisper-label">Campus Feed</p>
              <p className="mt-2 text-[13px] text-white/74">
                Ranked by recency, your building and major preferences, and real student engagement.
              </p>
            </div>

            {renderedListings.map((item) => {
              const category = item.category || "Other";
              const contactHref = getContactHref(item);
              const karma = getItemKarma(item);
              const urgency = parseUrgencyMeta(item.description);
              const viewerCount = getRecentViewerCount(item.id);
              const expiryCountdown = getExpiryCountdown(urgency.expiresAt);
              const badges = getCampusBadges(listings, item.contact_email || item.email || "");
              const coverImage = item.image_url;
              const sellerAvatar = item.user_id ? avatarByUserId[item.user_id] : "";

              return (
                <article
                  key={String(item.id)}
                  className="rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl"
                >
                  <button type="button" onClick={() => openListingDetail(item)} className="block w-full text-left">
                    <div className="mb-3 overflow-hidden rounded-[16px] border border-white/8 bg-white/[0.03]">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={item.title || "Campus listing"}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[4/3] w-full bg-[linear-gradient(135deg,_rgba(107,92,231,0.16),_rgba(255,255,255,0.03))] px-4 py-4 text-[12px] text-[rgba(240,238,255,0.35)]">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getBadgeStyles(category)}`}>
                            {getFeedGroup(category)}
                          </span>
                          {item.price !== null && item.price !== undefined && category !== "Event" ? (
                            <span className="text-[13px] font-semibold text-cyan-300">${item.price}</span>
                          ) : null}
                        </div>
                        <h2 className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-medium leading-6 text-white">
                          {item.title || "Campus listing"}
                        </h2>
                        <div className="mt-2 flex items-center gap-2">
                          {sellerAvatar ? (
                            <img
                              src={sellerAvatar}
                              alt={item.poster_name || "Temple Student"}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(107,92,231,0.4)] bg-[rgba(107,92,231,0.2)] text-[11px] font-medium text-[#9B8FFF]">
                              {getSellerInitials(item.poster_name)}
                            </div>
                          )}
                          <p className="min-w-0 text-[12px] leading-5 text-white/52">
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-white/84">
                              {item.poster_name || "Temple Student"}
                            </span>
                            <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              {[item.major, item.class_year].filter(Boolean).join(" · ") || "Temple University"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 rounded-[14px] border border-white/10 bg-[linear-gradient(135deg,_rgba(35,42,54,0.88),_rgba(18,214,255,0.08))] px-4 py-8 text-center text-[11px] font-semibold text-white/65">
                        {category}
                      </div>
                    </div>

                    <div className="mt-3 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                      Campus Karma {karma.score} · {karma.label}
                    </div>

                    {badges.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {badges.slice(0, 2).map((badge) => (
                          <span
                            key={badge.id}
                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/74"
                          >
                            {badge.label}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <p className="mt-3 text-[11px] text-white/46">{getRelativePostLabel(item.created_at)}</p>
                    {viewerCount > 0 ? (
                      <p className="mt-1 text-[11px] font-semibold text-amber-300">🔥 {viewerCount} people are viewing this</p>
                    ) : null}

                    {urgency.flashSale || urgency.moveOutMode ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {urgency.flashSale ? (
                          <span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-rose-300">
                            Flash Sale
                          </span>
                        ) : null}
                        {urgency.moveOutMode ? (
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                            Move-Out Mode
                          </span>
                        ) : null}
                        {expiryCountdown ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/74">
                            {expiryCountdown}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <p className="mt-3 line-clamp-3 text-[13px] leading-6 text-white/48">
                      {getFeedGroup(category) === "Campus Wall"
                        ? getCampusWallSummary(item.description)
                        : urgency.cleanDescription || "Campus listing"}
                    </p>

                    <div className="mt-3 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/58">
                      {item.location || "Temple Main Campus"}
                    </div>
                  </button>

                  <div className="mt-4 flex gap-2">
                    {contactHref ? (
                      <a
                        href={contactHref}
                        className="inline-flex flex-1 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[12px] font-semibold text-white/74 transition hover:border-white/20 hover:bg-white/[0.08]"
                      >
                        Contact
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openListingDetail(item)}
                        className="inline-flex flex-1 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[12px] font-semibold text-white/74 transition hover:border-white/20 hover:bg-white/[0.08]"
                      >
                        View
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleToggleSavedItem(item)}
                      className={`inline-flex items-center justify-center rounded-[12px] border px-3 py-2.5 text-[12px] font-semibold transition ${
                        savedItemIds[String(item.id)]
                          ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                          : "border-white/10 bg-white/5 text-white/74 hover:border-white/20 hover:bg-white/[0.08]"
                      }`}
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}

            {visibleListings.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-6 text-center">
                <p className="text-[13px] text-white/42">No listings yet. Be the first to post.</p>
                <Link
                  href="/create-listing"
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-[13px] font-medium text-white"
                >
                  + Post
                </Link>
              </div>
            ) : null}

            {visibleListings.length > renderedListings.length ? (
              <div ref={loadMoreRef} className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-center text-[13px] text-white/48">
                Loading more from your campus feed...
              </div>
            ) : visibleListings.length > 0 ? (
              <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 text-center text-[13px] text-white/38">
                You&apos;re caught up for now. New campus posts will flow in here automatically.
              </div>
            ) : null}
          </section>
        ) : null}
      </section>

      {isLoggedIn ? (
        <>
          <Link
            href="/create-listing"
            className="fixed bottom-6 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_18px_36px_rgba(34,211,238,0.28)] transition hover:scale-[1.03]"
            aria-label="Post New Item"
          >
            <Plus className="h-6 w-6" />
          </Link>
        </>
      ) : null}

      {selectedItem ? (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.72)]">
          <button type="button" className="absolute inset-0" aria-label="Close detail view" onClick={() => setSelectedItem(null)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[24px] border border-white/10 bg-[#090909] p-5 shadow-[0_-16px_48px_rgba(0,0,0,0.42)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getBadgeStyles(selectedItem.category || "Marketplace")}`}>
                  {selectedItem.category || "Listing"}
                </span>
                <h2 className="mt-3 text-[20px] font-semibold text-white">{selectedItem.title || "Campus listing"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-4 text-[13px] leading-6 text-white/58">{selectedItem.description || "No description added yet."}</p>

            <div className="mt-4 space-y-2 text-[12px] text-white/48">
              <p>
                Posted by: {selectedItem.poster_name || "Temple Student"}
                {selectedItem.major ? ` · ${selectedItem.major}` : ""}
                {selectedItem.class_year ? ` · ${selectedItem.class_year}` : ""}
              </p>
              <p>
                Campus Karma: {getItemKarma(selectedItem).score} · {getItemKarma(selectedItem).label}
              </p>
              {getCampusBadges(listings, selectedItem.contact_email || selectedItem.email || "").length > 0 ? (
                <p>
                  Badges: {getCampusBadges(listings, selectedItem.contact_email || selectedItem.email || "")
                    .map((badge) => badge.label)
                    .join(" · ")}
                </p>
              ) : null}
              <p>Location: {selectedItem.location || "Temple Main Campus"}</p>
              <p>Price: {selectedItem.price !== null && selectedItem.price !== undefined ? `$${selectedItem.price}` : "Not listed"}</p>
              <p>Contact: {selectedItem.contact_email || selectedItem.email || "Contact in original section"}</p>
              <p>{getRelativePostLabel(selectedItem.created_at)}</p>
              {getRecentViewerCount(selectedItem.id) > 0 ? (
                <p className="text-amber-300">🔥 {getRecentViewerCount(selectedItem.id)} people are viewing this</p>
              ) : null}
              {parseUrgencyMeta(selectedItem.description).flashSale ? <p>Flash Sale active</p> : null}
              {parseUrgencyMeta(selectedItem.description).moveOutMode ? <p>Move-Out Mode listing</p> : null}
              {getExpiryCountdown(parseUrgencyMeta(selectedItem.description).expiresAt) ? (
                <p>{getExpiryCountdown(parseUrgencyMeta(selectedItem.description).expiresAt)}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => handleToggleSavedItem(selectedItem)}
              className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border px-5 py-3 text-[13px] font-semibold transition ${
                savedItemIds[String(selectedItem.id)]
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                  : "border-white/10 bg-white/5 text-white/74 hover:border-white/20 hover:bg-white/[0.08]"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              {savedItemIds[String(selectedItem.id)] ? "Saved for price drops" : "Save item"}
            </button>

            {getContactHref(selectedItem) ? (
              <a
                href={getContactHref(selectedItem)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-[14px] font-semibold text-black transition hover:opacity-95"
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}
