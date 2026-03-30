"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, ChevronRight, HandCoins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const feedFilters = ["All", "Events", "Fundraisers"] as const;
const tagFilters = [
  {
    label: "Events",
    match: (item: HappeningsItem) => item.category === "Event",
    href: "/launch-event",
  },
  {
    label: "Fundraisers",
    match: (item: HappeningsItem) => item.category === "Fundraise",
    href: "/fundraise-fast?template=fundraisers",
  },
  {
    label: "Club Activities",
    match: (item: HappeningsItem) =>
      item.category === "Event" && /club|assoc|meeting|student org/i.test(`${item.title} ${item.description}`),
    href: "/launch-event?template=club-activities",
  },
  {
    label: "Meetups",
    match: (item: HappeningsItem) =>
      item.category === "Event" && /meetup|mixer|hang|link up|link-up/i.test(`${item.title} ${item.description}`),
    href: "/launch-event?template=meetups",
  },
  {
    label: "Volunteer",
    match: (item: HappeningsItem) =>
      /volunteer|donation|drive|service/i.test(`${item.title} ${item.description}`),
    href: "/launch-event?template=volunteer",
  },
  {
    label: "Frat Party/Party",
    match: (item: HappeningsItem) =>
      item.category === "Event" && /frat|party|byob/i.test(`${item.title} ${item.description}`),
    href: "/launch-event?template=frat-party",
  },
] as const;

type FeedFilter = (typeof feedFilters)[number];

type HappeningsItem = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  location?: string | null;
  created_at?: string | null;
  poster_name?: string | null;
  major?: string | null;
  class_year?: string | null;
};

function getRelativeTime(createdAt?: string | null) {
  if (!createdAt) return "just posted";

  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function CampusHappeningsPage() {
  const [items, setItems] = useState<HappeningsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FeedFilter>("All");
  const [activeTag, setActiveTag] = useState<string>("Events");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    let mounted = true;

    supabase
      .from("listings")
      .select("id, title, description, category, location, created_at, poster_name, major, class_year")
      .eq("status", "active")
      .in("category", ["Event", "Fundraise"])
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!mounted) return;

        if (fetchError) {
          setError("Could not load Campus Happenings.");
          setItems([]);
        } else {
          setItems((data as HappeningsItem[]) || []);
        }

        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const visibleItems = useMemo(() => {
    const activeTagRule = tagFilters.find((tag) => tag.label === activeTag);

    return items.filter((item) => {
      const matchesCategory =
        activeFilter === "All" ||
        (activeFilter === "Events" && item.category === "Event") ||
        (activeFilter === "Fundraisers" && item.category === "Fundraise");
      const matchesTag = activeTagRule ? activeTagRule.match(item) : true;
      return matchesCategory && matchesTag;
    });
  }, [activeFilter, activeTag, items]);

  return (
    <main className="page-shell">
      <section className="page-wrap">
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
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Campus Happenings
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Campus Happenings</p>
          <h1 className="page-title">Campus Happenings</h1>
          <p className="page-copy">Events and fundraisers, merged into one live campus surface.</p>
        </section>

        <section className="mt-6 space-y-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {feedFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition ${
                  activeFilter === filter
                    ? "border-[rgba(107,92,231,0.4)] bg-[rgba(107,92,231,0.14)] text-[#9B8FFF]"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tagFilters.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => setActiveTag(tag.label)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition ${
                  activeTag === tag.label
                    ? "border-[rgba(107,92,231,0.4)] bg-[rgba(107,92,231,0.14)] text-[#9B8FFF]"
                    : "border-white/10 bg-white/5 text-white/60"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-3">
          {tagFilters.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="page-card flex items-center justify-between gap-4 px-4 py-4"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-white">{tag.label}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/45">
                  {tag.label === "Fundraisers"
                    ? "Use the fundraiser flow with a faster campus-ready template."
                    : `Open a ready-made ${tag.label.toLowerCase()} template in the existing event flow.`}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white/35" />
            </Link>
          ))}
        </section>

        <section className="mt-6 space-y-3">
          {loading ? <p className="text-[13px] text-white/45">Loading Campus Happenings...</p> : null}
          {!loading && error ? <p className="text-[13px] text-white/45">{error}</p> : null}
          {!loading && !error && visibleItems.length === 0 ? (
            <p className="text-[13px] text-white/45">No happenings here yet. New events and fundraisers will appear automatically.</p>
          ) : null}
          {!loading && !error
            ? visibleItems.map((item) => (
                <article key={String(item.id)} className="page-card px-4 py-4">
                  <div className="flex items-center gap-2">
                    {item.category === "Fundraise" ? (
                      <HandCoins className="h-4 w-4 text-[#F5A623]" />
                    ) : (
                      <CalendarDays className="h-4 w-4 text-[#9B8FFF]" />
                    )}
                    <span className="text-[12px] text-white/45">
                      {item.category === "Fundraise" ? "Fundraiser" : "Event"} · {getRelativeTime(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 text-[14px] font-medium text-white">{item.title || "Campus happening"}</p>
                  <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/45">{item.description || "No details yet."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
                    <span>{item.location || "Temple campus"}</span>
                    <span>·</span>
                    <span>
                      {item.poster_name || "Temple Student"}
                      {item.major ? ` · ${item.major}` : ""}
                      {item.class_year ? ` · ${item.class_year}` : ""}
                    </span>
                  </div>
                </article>
              ))
            : null}
        </section>
      </section>
    </main>
  );
}
