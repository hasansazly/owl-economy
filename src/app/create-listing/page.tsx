"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Check, ChevronDown, ImageUp, Loader2, MessageCircleMore, Share2, ShieldCheck, Sparkles, X } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

const listingTypes = ["For Sale", "Rental", "Free", "Trade", "Campus Etsy", "Borrow"] as const;
const conditions = ["New", "Good", "Fair", "Well-loved"] as const;

const typeColors: Record<string, { bg: string; text: string; emoji: string }> = {
  "For Sale": { bg: "rgba(255,62,165,0.15)", text: "#FF3EA5", emoji: "🛒" },
  Rental: { bg: "rgba(51,65,92,0.35)", text: "#C1CCE0", emoji: "🔑" },
  Free: { bg: "rgba(255,255,255,0.10)", text: "#FFFFFF", emoji: "🎁" },
  Trade: { bg: "rgba(255,62,165,0.12)", text: "#FF78C1", emoji: "🔄" },
  "Campus Etsy": { bg: "rgba(51,65,92,0.45)", text: "#D3DCF0", emoji: "🎨" },
  Borrow: { bg: "rgba(255,255,255,0.08)", text: "#FFFFFF", emoji: "🤝" },
};

const conditionStyles: Record<string, string> = {
  New: "border-[var(--accent)] bg-[rgba(255,62,165,0.1)] text-[var(--accent)]",
  Good: "border-[#c7d3ea] bg-[rgba(51,65,92,0.28)] text-[#d8e1f2]",
  Fair: "border-[#8fa0bf] bg-[rgba(51,65,92,0.18)] text-[#b0bdd4]",
  "Well-loved": "border-[#F09595] bg-[rgba(240,149,149,0.1)] text-[#F09595]",
};

const categories = [
  "Textbooks & School Supplies",
  "Electronics & Tech",
  "Furniture & Dorm Essentials",
  "Clothing & Accessories",
  "Food & Snacks",
  "Art & Handmade",
  "Sports & Outdoors",
  "Tickets & Events",
  "Other",
];

const previewEmojis = ["🖼️", "📷", "🌟", "📦", "✨"];
const quickPostTemplates = [
  {
    label: "Dorm extra",
    title: "Mini fridge for quick pickup",
    category: "Furniture & Dorm Essentials",
    description: "One photo, quick pickup, still works great for dorm life.",
    price: "40",
    location: "Morgan Hall",
  },
  {
    label: "Class item",
    title: "Used textbook bundle",
    category: "Textbooks & School Supplies",
    description: "One sentence post for a fast class pickup near campus.",
    price: "25",
    location: "Charles Library",
  },
  {
    label: "Clothes drop",
    title: "Campus hoodie for sale",
    category: "Clothing & Accessories",
    description: "Clean condition and easy meetup on campus this afternoon.",
    price: "20",
    location: "Student Center",
  },
] as const;

export default function CreateListingPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [listingType, setListingType] = useState<(typeof listingTypes)[number]>("For Sale");
  const [condition, setCondition] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [period, setPeriod] = useState("Item");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiTip, setAiTip] = useState("");
  const [trustLoading, setTrustLoading] = useState(false);
  const [trustError, setTrustError] = useState("");
  const [trustCheck, setTrustCheck] = useState<{
    safeToPost: string;
    riskLevel: string;
    summary: string;
    checks: string[];
  } | null>(null);

  const priceDisabled = listingType === "Free" || listingType === "Borrow";
  const ready =
    title.trim() &&
    category &&
    description.trim() &&
    location.trim() &&
    (priceDisabled || price);

  const previewType = typeColors[listingType];
  const previewPrice = useMemo(() => {
    if (listingType === "Free") return "Free";
    if (listingType === "Borrow") return "Borrow";
    if (!price) return "—";
    const formatted = `$${Number(price).toFixed(2)}`;
    return listingType === "Rental" ? `${formatted} / ${period.toLowerCase()}` : formatted;
  }, [listingType, period, price]);

  const handlePhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    setPhotos(files.map((file, index) => `${previewEmojis[index % previewEmojis.length]} ${file.name}`));
  };

  const applyQuickTemplate = (template: (typeof quickPostTemplates)[number]) => {
    setTitle(template.title);
    setCategory(template.category);
    setDescription(template.description);
    setPrice(template.price);
    setLocation(template.location);
  };

  const shareCopy = `${title || "New MyDormStash listing"} - ${previewPrice} - ${location || "Campus pickup"}\n${description || "Posted on MyDormStash."}`;

  const shareToInstagram = async () => {
    try {
      await navigator.clipboard.writeText(shareCopy);
    } catch {}

    if (typeof window !== "undefined") {
      window.location.href = "instagram://camera";
      window.setTimeout(() => {
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      }, 600);
    }
  };

  const shareToGroupChat = () => {
    if (typeof window !== "undefined") {
      window.location.href = `sms:&body=${encodeURIComponent(shareCopy)}`;
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "MyDormStash listing",
          text: shareCopy,
        });
      } catch {}
    }
  };

  const generateWithAI = async () => {
    setAiError("");
    setAiTip("");

    if (!aiNotes.trim()) {
      setAiError("Add a few item details so AI can draft the listing.");
      return;
    }

    try {
      setAiLoading(true);
      const response = await fetch("/api/ai/listing-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingType,
          condition,
          category,
          price,
          location,
          notes: aiNotes,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        title?: string;
        description?: string;
        categorySuggestion?: string;
        pricingTip?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "AI draft failed");
      }

      setTitle(data.title || "");
      setDescription(data.description || "");
      if (data.categorySuggestion && categories.includes(data.categorySuggestion)) {
        setCategory(data.categorySuggestion);
      }
      setAiTip(data.pricingTip || "");
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI draft failed");
    } finally {
      setAiLoading(false);
    }
  };

  const runTrustCheck = async () => {
    setTrustError("");

    if (!title.trim() && !description.trim()) {
      setTrustError("Add a title or description before running AI trust check.");
      return;
    }

    try {
      setTrustLoading(true);
      const response = await fetch("/api/ai/listing-trust-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingType,
          title,
          description,
          price,
          location,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        safeToPost?: string;
        riskLevel?: string;
        summary?: string;
        checks?: string[];
      };

      if (!response.ok) {
        throw new Error(data.error || "AI trust check failed");
      }

      setTrustCheck({
        safeToPost: data.safeToPost || "REVIEW",
        riskLevel: data.riskLevel || "MEDIUM",
        summary: data.summary || "",
        checks: data.checks || [],
      });
    } catch (error) {
      setTrustError(error instanceof Error ? error.message : "AI trust check failed");
    } finally {
      setTrustLoading(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-6 py-16 text-[var(--foreground)]">
        <div className="mx-auto max-w-xl text-center">
          <div className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] px-8 py-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(255,62,165,0.12)]">
              <Check className="h-7 w-7 text-[var(--accent)]" />
            </div>
            <h1 className="mt-5 font-display text-[22px] font-bold tracking-[-0.03em]">
              Listing posted!
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Your item <strong className="text-[var(--accent)]">&quot;{title}&quot;</strong> is now live
              on MyDormStash. Your campus will see it right away.
            </p>
            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={shareToInstagram}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black"
              >
                <Share2 className="h-4 w-4" />
                Repost to IG story
              </button>
              <button
                type="button"
                onClick={shareToGroupChat}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-5 py-3 text-sm font-bold text-[var(--foreground)]"
              >
                <MessageCircleMore className="h-4 w-4 text-[var(--accent)]" />
                Share to group chat
              </button>
              <button
                type="button"
                onClick={nativeShare}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-transparent px-5 py-3 text-sm font-bold text-white/82"
              >
                <Share2 className="h-4 w-4 text-[var(--accent)]" />
                Share anywhere
              </button>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white"
              >
                Back to home
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setPhotos([]);
                  setListingType("For Sale");
                  setCondition("");
                  setTitle("");
                  setCategory("");
                  setDescription("");
                  setPrice("");
                  setPeriod("Item");
                  setLocation("");
                }}
                className="inline-flex items-center justify-center rounded-[12px] border border-[var(--border)] bg-white/5 px-5 py-3 text-sm font-bold text-[var(--foreground)]"
              >
                Post another item
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] pb-16 text-[var(--foreground)]">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/7 bg-[rgba(20,22,27,0.96)] px-6 py-4 backdrop-blur">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <p className="font-display text-base font-bold tracking-[-0.02em]">New Listing</p>
        <button
          type="button"
          disabled={!ready}
          onClick={() => setSubmitted(true)}
          className="rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Post
        </button>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 pt-6">
        <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker !px-0 !text-white">30-Second Quick Post</p>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Fastest flow wins supply: one photo, one sentence, price, and a dorm or pickup spot.
              </p>
            </div>
            <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-2 text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickPostTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyQuickTemplate(template)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/78 transition hover:border-white/25 hover:bg-white/8"
              >
                {template.label}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[18px] border border-[rgba(18,214,255,0.18)] bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker !px-0 !text-white">AI Listing Assistant</p>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Describe the item in plain language and AI will draft the title, description, and a
                likely category for you.
              </p>
            </div>
            <div className="rounded-full bg-[rgba(18,214,255,0.12)] p-2 text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <label className="mt-4 flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">
              Item details for AI
            </span>
            <textarea
              rows={4}
              value={aiNotes}
              onChange={(event) => setAiNotes(event.target.value)}
              placeholder="Example: Black TI-84 calculator, lightly used, comes with charger and cover, can meet at Charles Library after 4 PM."
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm leading-6 outline-none placeholder:text-white/22 focus:border-[rgba(18,214,255,0.45)]"
            />
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={generateWithAI}
              disabled={aiLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? "Generating..." : "Generate with AI"}
            </button>
            {aiTip ? <p className="text-sm text-[var(--accent)]">{aiTip}</p> : null}
          </div>

          {aiError ? <p className="mt-3 text-sm text-[#F09595]">{aiError}</p> : null}
        </section>

        <section className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-kicker !px-0 !text-white">AI Trust Check</p>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Run a safety and clarity review before posting so your listing feels more trustworthy.
              </p>
            </div>
            <div className="rounded-full bg-[rgba(255,255,255,0.06)] p-2 text-[var(--accent)]">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={runTrustCheck}
              disabled={trustLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {trustLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {trustLoading ? "Checking..." : "Run AI Trust Check"}
            </button>
            {trustError ? <p className="text-sm text-[#F09595]">{trustError}</p> : null}
          </div>

          {trustCheck ? (
            <div className="mt-4 rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                    trustCheck.safeToPost === "YES"
                      ? "bg-[rgba(18,214,255,0.12)] text-[var(--accent)]"
                      : "bg-[rgba(240,149,149,0.12)] text-[#F09595]"
                  }`}
                >
                  {trustCheck.safeToPost === "YES" ? "Safe to Post" : "Needs Review"}
                </span>
                <span className="rounded-full bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/62">
                  Risk {trustCheck.riskLevel}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-white/60">{trustCheck.summary}</p>
              <div className="mt-4 space-y-2">
                {trustCheck.checks.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-white/52">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <label className="relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-dashed border-white/15 px-5 py-8 text-center transition hover:border-[rgba(255,62,165,0.4)]">
          <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0" onChange={handlePhotos} />
          <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/6">
            <ImageUp className="h-5 w-5 text-white/40" />
          </div>
          <p className="text-sm font-medium text-white/50">
            {photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""} added` : "Add photos"}
          </p>
          <p className="text-[11px] text-white/25">Tap to upload up to 5 images</p>
        </label>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {photos.map((photo) => (
              <div
                key={photo}
                className="relative flex h-[72px] w-[72px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-white/7 text-[28px]"
              >
                <span>{photo.slice(0, 2)}</span>
                <button
                  type="button"
                  onClick={() => setPhotos((current) => current.filter((item) => item !== photo))}
                  className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#E24B4A] text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Listing Type</p>
        <div className="flex flex-wrap gap-2">
          {listingTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setListingType(type)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                listingType === type
                  ? "border-[var(--accent)] bg-[rgba(255,62,165,0.1)] text-[var(--accent)]"
                  : "border-[var(--border)] text-white/50 hover:border-white/25 hover:text-white/80"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Details</p>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">Title</span>
          <input
            type="text"
            maxLength={60}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. TI-84 Calculator, Blue Dorm Rug..."
            className="rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/22 focus:border-[rgba(255,62,165,0.45)]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">Category</span>
          <div className="relative">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full appearance-none rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none focus:border-[rgba(255,62,165,0.45)]"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">Description</span>
          <textarea
            rows={4}
            maxLength={300}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe your item — condition, size, any details a buyer should know..."
            className="rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm leading-6 outline-none placeholder:text-white/22 focus:border-[rgba(255,62,165,0.45)]"
          />
          <p className="text-right text-[11px] text-white/25">{description.length} / 300</p>
        </label>

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Condition</p>
        <div className="flex flex-wrap gap-2">
          {conditions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCondition(item)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                condition === item
                  ? conditionStyles[item]
                  : "border-[var(--border)] text-white/45 hover:border-white/22 hover:text-white/75"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Pricing</p>
        <div className={`grid gap-3 sm:grid-cols-2 ${priceDisabled ? "pointer-events-none opacity-30" : ""}`}>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">
              {listingType === "Rental" ? "Rate ($)" : "Price ($)"}
            </span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/35">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0.00"
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 py-3 pl-7 pr-4 text-sm outline-none placeholder:text-white/22 focus:border-[rgba(255,62,165,0.45)]"
              />
            </div>
          </label>

          {listingType === "Rental" && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">Per</span>
              <div className="relative">
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="w-full appearance-none rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none focus:border-[rgba(255,62,165,0.45)]"
                >
                  {["Item", "Day", "Week", "Month"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </label>
          )}
        </div>

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Pickup</p>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-[0.04em] text-white/45">Location / Dorm</span>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Pollock Dorms, East Quad, Library..."
            className="rounded-[12px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/22 focus:border-[rgba(255,62,165,0.45)]"
          />
        </label>

        <div className="h-px bg-white/6" />
        <p className="section-kicker !px-0 !text-white/30">Live Preview</p>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--panel)] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/25">
            How it&apos;ll look in the stash
          </p>
          <div className="flex gap-3">
            <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[10px] bg-white/6 text-[26px]">
              {previewType.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-display text-[15px] font-bold ${
                  title.trim() ? "text-[var(--foreground)]" : "italic text-white/20"
                }`}
              >
                {title.trim() || "Your listing title"}
              </p>
              <p
                className="mt-1 text-[15px] font-semibold"
                style={{ color: previewPrice === "—" ? "rgba(255,255,255,0.3)" : previewType.text }}
              >
                {previewPrice}
              </p>
              <p className="mt-1 text-[11px] text-white/35">{location.trim() || "No location set"}</p>
              <span
                className="mt-1.5 inline-block rounded-[5px] px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: previewType.bg, color: previewType.text }}
              >
                {listingType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
