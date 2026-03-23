"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, Search, ShieldCheck, Sparkles, Wallet, Wifi, KeyRound, Headphones } from "lucide-react";
import { useMemo, useState } from "react";

const categories = ["All", "IDs", "Keys", "Tech", "Accessories", "Dorm Items"] as const;

const reports = [
  {
    title: "Temple ID card with owl sticker",
    category: "IDs",
    location: "Student Center South Lobby",
    time: "Posted 20 min ago",
    details: "Found near the front seating area after lunch rush.",
    icon: Wallet,
    status: "Found",
  },
  {
    title: "AirPods in pink case",
    category: "Tech",
    location: "Charles Library level 1",
    time: "Posted 1 hr ago",
    details: "Case had a small owl sticker on the back.",
    icon: Headphones,
    status: "Lost",
  },
  {
    title: "Dorm room key ring",
    category: "Keys",
    location: "Morgan Hall South",
    time: "Posted 2 hrs ago",
    details: "Silver ring with two keys and a red lanyard clip.",
    icon: KeyRound,
    status: "Found",
  },
  {
    title: "Portable hotspot charger",
    category: "Tech",
    location: "Tech Center",
    time: "Posted today",
    details: "Black charger pack left near the printer stations.",
    icon: Wifi,
    status: "Lost",
  },
];

const quickReportTemplates = [
  {
    label: "Lost AirPods",
    type: "Lost" as const,
    itemName: "AirPods in case",
    location: "Charles Library",
    time: "Today around 2 PM",
    details: "White case with a small sticker on the back.",
  },
  {
    label: "Found ID",
    type: "Found" as const,
    itemName: "Student ID card",
    location: "Student Center Lobby",
    time: "Just now",
    details: "Found near the front seating area and keeping it safe.",
  },
] as const;

export default function LostAndFoundPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState<"Lost" | "Found">("Lost");
  const [itemName, setItemName] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportTime, setReportTime] = useState("");
  const [reportDetails, setReportDetails] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const searchMatch =
        !search.trim() ||
        [item.title, item.location, item.details, item.category].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  const applyTemplate = (template: (typeof quickReportTemplates)[number]) => {
    setReportType(template.type);
    setItemName(template.itemName);
    setReportLocation(template.location);
    setReportTime(template.time);
    setReportDetails(template.details);
  };

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-5xl">
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
            Campus karma board
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Lost and Found</p>
          <h1 className="page-title">
            Lost and Found
          </h1>
          <p className="page-copy">
            A fast digital bulletin board for missing IDs, keys, tech, and dorm essentials across
            campus.
          </p>
        </section>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="page-card px-5 py-5">
            <div className="rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3">
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4 text-white/35" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search IDs, keys, AirPods, chargers..."
                  className="w-full bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-white/35"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeCategory === category
                      ? "border-[rgba(70,191,255,0.3)] bg-[rgba(70,191,255,0.08)] text-[var(--accent)]"
                      : "border-[var(--border)] bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {filteredReports.map(({ title, category, location, time, details, icon: Icon, status }) => (
                <article
                  key={`${title}-${location}`}
                  className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex rounded-[12px] border border-white/10 bg-white/5 p-2.5 text-[var(--accent)]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-white">
                            {title}
                          </h2>
                          <span className="rounded-full bg-white/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/62">
                            {category}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-white/40">{details}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                        status === "Found"
                          ? "bg-[rgba(70,191,255,0.12)] text-[var(--accent)]"
                          : "bg-[rgba(255,62,165,0.12)] text-[#ff8ac6]"
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-white/38">
                    <div className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {location}
                    </div>
                    <div className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" />
                      {time}
                    </div>
                  </div>
                </article>
              ))}

              {filteredReports.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] px-4 py-8 text-center">
                  <p className="font-display text-[16px] font-bold text-white">No matches yet</p>
                  <p className="mt-2 text-[12px] leading-5 text-white/38">
                    Try another category or search term to scan the campus board.
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="page-card px-5 py-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                <Sparkles className="h-4 w-4" />
                Post a Report
              </div>

              <div className="mt-5 flex gap-2">
                {(["Lost", "Found"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      reportType === type
                        ? "border-[rgba(255,62,165,0.3)] bg-[rgba(255,62,165,0.12)] text-[var(--accent)]"
                        : "border-[var(--border)] bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickReportTemplates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/8"
                  >
                    {template.label}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Item Name
                  </span>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(event) => setItemName(event.target.value)}
                    placeholder="Temple ID, AirPods, key ring..."
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Last Seen / Found At
                  </span>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(event) => setReportLocation(event.target.value)}
                    placeholder="Bell Tower, Tech Center, Morgan Hall"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Approx Time
                  </span>
                  <input
                    type="text"
                    value={reportTime}
                    onChange={(event) => setReportTime(event.target.value)}
                    placeholder="Today around 3 PM"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Details
                  </span>
                  <textarea
                    rows={4}
                    value={reportDetails}
                    onChange={(event) => setReportDetails(event.target.value)}
                    placeholder="Color, stickers, case, brand, or anything that helps someone identify it."
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] leading-6 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <button
                  type="button"
                  className="inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--accent)] px-4 py-3 text-[12px] font-bold text-white transition hover:opacity-90"
                >
                  Post {reportType} Report
                </button>
              </div>
            </section>

            <section className="page-card px-5 py-5">
              <p className="section-kicker !mt-0 !px-0">Community Note</p>
              <div className="mt-4 rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  Safe Returns
                </div>
                <p className="mt-3 text-[12px] leading-6 text-white/48">
                  Keep personal details minimal in public posts. Share exact identifiers only after
                  confirming the item belongs to the right student.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
