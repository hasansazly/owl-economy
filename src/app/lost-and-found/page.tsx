"use client";

import Link from "next/link";
import { ArrowLeft, Clock3, KeyRound, MapPin, Search, ShieldCheck, Sparkles, Wallet, Wifi } from "lucide-react";
import { useMemo, useState } from "react";

type ReportCategory = "IDs" | "Keys" | "Tech" | "Accessories" | "Dorm Items";

type ReportItem = {
  id: string;
  type: "Lost" | "Found";
  category: ReportCategory;
  itemName: string;
  location: string;
  time: string;
  details: string;
};

const categories = ["All", "IDs", "Keys", "Tech", "Accessories", "Dorm Items"] as const;

const quickReportTemplates = [
  {
    label: "Lost AirPods",
    type: "Lost" as const,
    category: "Tech" as const,
    itemName: "AirPods in case",
    location: "Charles Library",
    time: "Today around 2 PM",
    details: "White case with a sticker on the back.",
  },
  {
    label: "Found ID",
    type: "Found" as const,
    category: "IDs" as const,
    itemName: "Student ID card",
    location: "Student Center Lobby",
    time: "Just now",
    details: "Found near the front seating area and keeping it safe.",
  },
  {
    label: "Lost Keys",
    type: "Lost" as const,
    category: "Keys" as const,
    itemName: "Dorm key ring",
    location: "Morgan Hall",
    time: "This afternoon",
    details: "Silver ring with two keys and a small tag.",
  },
] as const;

const categoryIcons: Record<ReportCategory, typeof Wallet> = {
  IDs: Wallet,
  Keys: KeyRound,
  Tech: Wifi,
  Accessories: Sparkles,
  "Dorm Items": ShieldCheck,
};

export default function LostAndFoundPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState<"Lost" | "Found">("Lost");
  const [reportCategory, setReportCategory] = useState<ReportCategory>("Tech");
  const [itemName, setItemName] = useState("");
  const [reportLocation, setReportLocation] = useState("");
  const [reportTime, setReportTime] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [formError, setFormError] = useState("");
  const [postedMessage, setPostedMessage] = useState("");

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const searchMatch =
        !search.trim() ||
        [item.itemName, item.location, item.details, item.category, item.type]
          .join(" ")
          .toLowerCase()
          .includes(search.trim().toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, reports, search]);

  const applyTemplate = (template: (typeof quickReportTemplates)[number]) => {
    setReportType(template.type);
    setReportCategory(template.category);
    setItemName(template.itemName);
    setReportLocation(template.location);
    setReportTime(template.time);
    setReportDetails(template.details);
    setFormError("");
    setPostedMessage("");
  };

  const submitReport = () => {
    setFormError("");
    setPostedMessage("");

    if (!itemName.trim() || !reportLocation.trim() || !reportTime.trim() || !reportDetails.trim()) {
      setFormError("Fill out the report first.");
      return;
    }

    const newReport: ReportItem = {
      id: `report-${Date.now()}`,
      type: reportType,
      category: reportCategory,
      itemName: itemName.trim(),
      location: reportLocation.trim(),
      time: reportTime.trim(),
      details: reportDetails.trim(),
    };

    setReports((current) => [newReport, ...current]);
    setActiveCategory(reportCategory);
    setPostedMessage(`${reportType} report posted.`);
    setItemName("");
    setReportLocation("");
    setReportTime("");
    setReportDetails("");
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
            Campus karma
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Lost and Found</p>
          <h1 className="page-title">Lost and Found</h1>
          <p className="page-copy">Post one clean report so the right student can spot it fast.</p>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
          <section className="page-card px-4 py-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Post a Report
            </div>

            <div className="mt-5 space-y-5">
              <div className="flex gap-2">
                {(["Lost", "Found"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReportType(type)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                      reportType === type
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-white/56 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[13px] font-semibold text-white">Quick Templates</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickReportTemplates.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Category</span>
                <select
                  value={reportCategory}
                  onChange={(event) => setReportCategory(event.target.value as ReportCategory)}
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white outline-none focus:border-[rgba(70,191,255,0.35)]"
                >
                  {categories
                    .filter((category) => category !== "All")
                    .map((category) => (
                      <option key={category} value={category} className="bg-[#0b0e14] text-white">
                        {category}
                      </option>
                    ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Item Name</span>
                <input
                  type="text"
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="Temple ID, AirPods, key ring..."
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Location</span>
                  <input
                    type="text"
                    value={reportLocation}
                    onChange={(event) => setReportLocation(event.target.value)}
                    placeholder="Bell Tower, Morgan Hall, library"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Approx Time</span>
                  <input
                    type="text"
                    value={reportTime}
                    onChange={(event) => setReportTime(event.target.value)}
                    placeholder="Today around 3 PM"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Details</span>
                <textarea
                  rows={4}
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  placeholder="Color, case, sticker, brand, or anything that helps identify it."
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              {formError ? (
                <div className="rounded-[14px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] px-3 py-3 text-[12px] text-[#F09595]">
                  {formError}
                </div>
              ) : null}

              {postedMessage ? (
                <div className="rounded-[14px] border border-cyan-400/20 bg-cyan-400/8 px-3 py-3 text-[12px] font-semibold text-cyan-300">
                  {postedMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={submitReport}
                className="inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--accent)] px-4 py-2.5 text-[12px] font-bold text-white transition hover:opacity-90"
              >
                Post {reportType} Report
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="page-card px-4 py-4">
              <div className="rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-white/35" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search reports..."
                    className="w-full bg-transparent text-[13px] text-[var(--foreground)] outline-none placeholder:text-white/35"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                      activeCategory === category
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-white/56 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            {filteredReports.length === 0 ? (
              <section className="page-card px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <ShieldCheck className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h2 className="mt-4 text-[18px] font-semibold text-white">No reports yet</h2>
                <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-white/46">
                  This board stays empty until students post real lost or found reports.
                </p>
              </section>
            ) : (
              <section className="space-y-3">
                {filteredReports.map((report) => {
                  const Icon = categoryIcons[report.category];

                  return (
                    <article key={report.id} className="page-card px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="inline-flex rounded-[12px] border border-white/10 bg-white/5 p-2 text-[var(--accent)]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-[14px] font-semibold text-white">{report.itemName}</h2>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/62">
                                {report.category}
                              </span>
                            </div>
                            <p className="mt-2 text-[12px] leading-5 text-white/46">{report.details}</p>
                          </div>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${
                            report.type === "Found"
                              ? "bg-[rgba(70,191,255,0.12)] text-[var(--accent)]"
                              : "bg-white/8 text-white/68"
                          }`}
                        >
                          {report.type}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-white/40">
                        <div className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {report.location}
                        </div>
                        <div className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {report.time}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            <section className="page-card px-4 py-4">
              <p className="section-kicker !mt-0 !px-0">Community Note</p>
              <div className="mt-4 rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/54">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  Safe Returns
                </div>
                <p className="mt-3 text-[12px] leading-6 text-white/46">
                  Keep public posts simple. Share exact proof only after confirming the item belongs to the right student.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
