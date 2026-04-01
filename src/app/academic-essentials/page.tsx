"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Clock3,
  LampDesk,
  PencilLine,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

const quickTemplates = [
  {
    label: "Textbook sale",
    title: "Organic Chemistry textbook + notes",
    category: "Textbooks",
    description: "Used but clean copy with highlighted chapters and exam notes. Pickup near Charles Library after class.",
    price: "$28",
    location: "Charles Library",
  },
  {
    label: "Desk gear",
    title: "Desk lamp + organizer set",
    category: "Desk Gear",
    description: "Dorm desk setup in good shape with lamp, tray, and pen holder. Easy campus meetup tonight.",
    price: "$14",
    location: "Morgan Hall",
  },
  {
    label: "Study jam",
    title: "Late Night Study Jam",
    category: "Study Jam",
    description: "Open tables, quiet focus, shared snacks, and room for anyone cramming before exams.",
    price: "Free",
    location: "Student Center",
  },
] as const;

const importantStudyList = [
  "Textbooks, class notes, and course packets students usually need first.",
  "Chargers, extension cords, desk lamps, and calculators for late study sessions.",
  "Quiet meetup location, time window, and whether the post is for sale, borrow, or free.",
  "Condition details so buyers know if pages are highlighted, worn, or missing extras.",
  "Fast pickup instructions near the library, dorm lobby, or student center.",
] as const;

export default function AcademicEssentialsPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Textbooks");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [postType, setPostType] = useState<"Sell" | "Borrow" | "Study Jam">("Sell");

  const applyTemplate = (template: (typeof quickTemplates)[number]) => {
    setTitle(template.title);
    setCategory(template.category);
    setDescription(template.description);
    setPrice(template.price);
    setLocation(template.location);
    setPostType(template.category === "Study Jam" ? "Study Jam" : "Sell");
  };

  const previewMeta = useMemo(() => {
    const livePrice = price || (postType === "Study Jam" ? "Free" : "$0");
    const liveLocation = location || "Campus location";
    return `${livePrice} • ${liveLocation}`;
  }, [location, postType, price]);

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-6xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="page-brand">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </Link>

          <div className="page-chip hidden items-center gap-2 sm:inline-flex">
            <BookOpen className="h-3.5 w-3.5 text-[var(--accent)]" />
            Study flow
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Academic Essentials</p>
          <h1 className="page-title">Academic Essentials</h1>
          <p className="page-copy">
            Buy, sell, or borrow textbooks and desk gear, or launch a student-led study jam with a
            posting flow built for fast campus coordination.
          </p>
        </section>

        <section className="mt-7 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="page-card px-5 py-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <PencilLine className="h-4 w-4" />
              Easy Post Template
            </div>

            <div className="mt-5">
              <p className="text-[13px] font-semibold text-white">Quick Templates</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickTemplates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="capsule-secondary px-4 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/6"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Post Type
                </span>
                <select
                  value={postType}
                  onChange={(event) => setPostType(event.target.value as "Sell" | "Borrow" | "Study Jam")}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                >
                  <option>Sell</option>
                  <option>Borrow</option>
                  <option>Study Jam</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Category
                </span>
                <input
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="Textbooks, Desk Gear, Study Jam"
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Headline
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Calculus textbook + study guide"
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Description
                </span>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="One clean sentence about condition, class fit, and where students can meet you."
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Price
                </span>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="$28 or Free"
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Dorm / Location
                </span>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Charles Library, Morgan Hall, Student Center"
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create-listing"
                className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
              >
                Post This Flow
                <ChevronRight className="h-4 w-4" />
              </Link>
              <div className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm text-white/70">
                <Clock3 className="h-4 w-4 text-[var(--accent)]" />
                Built for fast study-week posting
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="page-card px-5 py-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                <ClipboardList className="h-4 w-4" />
                Important Study List
              </div>
              <div className="mt-5 space-y-3">
                {importantStudyList.map((item) => (
                  <div
                    key={item}
                    className="rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/62"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="page-card px-5 py-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                <ScanSearch className="h-4 w-4" />
                Live Preview
              </div>
              <div className="mt-5 rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[rgba(18,214,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    {category || "Academic"}
                  </span>
                  <LampDesk className="h-4 w-4 text-[var(--accent)]" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{title || "Your academic post headline"}</h2>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  {description ||
                    "Your listing or study jam summary will appear here so students can scan it fast."}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/38">
                  {postType} • {previewMeta}
                </p>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(18,214,255,0.24)] bg-[rgba(18,214,255,0.08)] px-3 py-1.5 text-xs text-[var(--accent)]">
                <Sparkles className="h-3.5 w-3.5" />
                Good academic posts are clear, quick, and pickup-friendly
              </div>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
