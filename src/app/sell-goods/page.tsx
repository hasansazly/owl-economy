"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackagePlus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { DormStashLogo } from "@/components/logo";
import { goodsListings, type GoodsCategory, type GoodsCondition, type GoodsListing } from "@/lib/sell-goods-data";
import { buildSellerContactHref, isVerifiedTempleEmail } from "@/lib/security";

type GoodsForm = {
  seller: string;
  email: string;
  title: string;
  category: GoodsCategory;
  condition: GoodsCondition;
  price: string;
  neighborhood: string;
  summary: string;
};

const categories: ("All" | GoodsCategory)[] = [
  "All",
  "Cosmetics",
  "Accessories",
  "Clothes",
  "Sneakers",
  "Books",
  "Dorm Essentials",
  "Electronics",
  "Other",
];

const campuses = [
  "Temple University",
  "Drexel University",
  "University of Pennsylvania",
  "Penn State University",
  "New York University",
] as const;

export default function SellGoodsPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [items, setItems] = useState<GoodsListing[]>([]);
  const [homeCampus, setHomeCampus] = useState<(typeof campuses)[number]>("Temple University");
  const [browseCampus, setBrowseCampus] = useState<"Home Campus" | (typeof campuses)[number]>("Home Campus");
  const [includeOtherCampuses, setIncludeOtherCampuses] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | GoodsCategory>("All");
  const [condition, setCondition] = useState<"All" | GoodsCondition>("All");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [selectedUploads, setSelectedUploads] = useState<string[]>([]);
  const [formState, setFormState] = useState<"idle" | "submitting" | "success">("idle");
  const [formError, setFormError] = useState("");
  const [aiShopperQuery, setAiShopperQuery] = useState("");
  const [aiShopperLoading, setAiShopperLoading] = useState(false);
  const [aiShopperError, setAiShopperError] = useState("");
  const [aiShopperResult, setAiShopperResult] = useState<{
    summary: string;
    itemIds: string[];
    nextStep: string;
  } | null>(null);
  const [sellForm, setSellForm] = useState<GoodsForm>({
    seller: "",
    email: "",
    title: "",
    category: "Cosmetics",
    condition: "New",
    price: "",
    neighborhood: "",
    summary: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(goodsListings);
      setStatus("ready");
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredItems = useMemo(() => {
    const nextItems = items.filter((item) => {
      const activeCampus = browseCampus === "Home Campus" ? homeCampus : browseCampus;
      const matchesCampus =
        browseCampus === "Home Campus"
          ? includeOtherCampuses || item.campus === homeCampus
          : item.campus === activeCampus;

      const matchesQuery =
        !query.trim() ||
        `${item.title} ${item.category} ${item.summary} ${item.neighborhood} ${item.campus}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      const matchesCategory = category === "All" || item.category === category;
      const matchesCondition = condition === "All" || item.condition === condition;

      return matchesCampus && matchesQuery && matchesCategory && matchesCondition;
    });

    nextItems.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return nextItems;
  }, [browseCampus, category, condition, homeCampus, includeOtherCampuses, items, query, sortBy]);

  const aiRecommendedItems = useMemo(() => {
    if (!aiShopperResult) return [];
    return aiShopperResult.itemIds
      .map((id) => items.find((item) => item.id === id))
      .filter((item): item is GoodsListing => Boolean(item));
  }, [aiShopperResult, items]);

  const getSellerContactHref = (item: GoodsListing) => buildSellerContactHref(item.title, item.sellerEmail);

  const formErrors = useMemo(() => {
    const errors: Partial<Record<keyof GoodsForm, string>> = {};
    if (!sellForm.seller.trim()) errors.seller = "Seller name is required.";
    if (!isVerifiedTempleEmail(sellForm.email)) {
      errors.email = "Only verified temple.edu emails can post marketplace items.";
    }
    if (!sellForm.title.trim()) errors.title = "Add a product title.";
    if (!sellForm.price || Number(sellForm.price) <= 0) {
      errors.price = "Set a valid student-friendly price.";
    }
    if (!sellForm.neighborhood.trim()) errors.neighborhood = "Add a campus meetup area.";
    if (!sellForm.summary.trim() || sellForm.summary.trim().length < 20) {
      errors.summary = "Add a short summary for buyers.";
    }
    return errors;
  }, [sellForm]);

  const refreshItems = (forceError = false) => {
    setStatus("loading");
    window.setTimeout(() => {
      if (forceError) {
        setStatus("error");
        return;
      }
      setItems((current) => (current.length ? current : goodsListings));
      setStatus("ready");
    }, 700);
  };

  const submitSellForm = () => {
    setFormError("");
    if (Object.keys(formErrors).length > 0) {
      setFormError("Please finish the student marketplace form before posting.");
      return;
    }

    setFormState("submitting");
    window.setTimeout(() => {
      const newItem: GoodsListing = {
        id: `sg-${Date.now()}`,
        title: sellForm.title.trim(),
        seller: sellForm.seller.trim(),
        sellerEmail: sellForm.email.trim().toLowerCase(),
        campus: homeCampus,
        category: sellForm.category,
        condition: sellForm.condition,
        price: Number(sellForm.price),
        neighborhood: sellForm.neighborhood.trim(),
        summary: sellForm.summary.trim(),
        details: `${sellForm.summary.trim()} Posted by a verified student seller.`,
        badges: ["Student only", sellForm.condition],
        imageHint: selectedUploads[0] ?? "New listing",
        createdAt: new Date().toISOString(),
      };

      setItems((current) => [newItem, ...current]);
      setFormState("success");
      setStatus("ready");
      setSelectedUploads([]);
    }, 800);
  };

  const getAIRecommendations = async () => {
    setAiShopperError("");

    if (!aiShopperQuery.trim()) {
      setAiShopperError("Tell AI what kind of item you need.");
      return;
    }

    try {
      setAiShopperLoading(true);
      const response = await fetch("/api/ai/goods-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: aiShopperQuery,
          homeCampus,
          browseCampus: browseCampus === "Home Campus" ? homeCampus : browseCampus,
          includeOtherCampuses,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        summary?: string;
        itemIds?: string[];
        nextStep?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "AI recommendations failed");
      }

      setAiShopperResult({
        summary: data.summary || "",
        itemIds: data.itemIds || [],
        nextStep: data.nextStep || "",
      });
    } catch (error) {
      setAiShopperError(error instanceof Error ? error.message : "AI recommendations failed");
    } finally {
      setAiShopperLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-6xl">
        <header className="page-header flex-wrap py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white/75"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <DormStashLogo href="/" compact />
          </div>

          <button
            type="button"
            onClick={() => {
              const form = document.getElementById("sell-form");
              form?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Sell an item
          </button>
        </header>

        <section className="grid gap-5 py-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Sell Goods</p>
            <h1 className="mt-2 font-display text-[1.9rem] font-bold tracking-[-0.04em] sm:text-[2.5rem]">
              Student-only marketplace for campus items.
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/56">
              Buy and sell student essentials, dorm extras, books, clothes, and electronics.
            </p>
            <p className="mt-2 text-[12px] leading-5 text-[var(--accent)]">
              Home campus: {homeCampus}. Browse other campuses for better deals.
            </p>
          </div>

          <div className="rounded-[20px] border border-[var(--border)] bg-[linear-gradient(135deg,_rgba(51,65,92,0.55),_rgba(26,29,36,0.92))] p-3.5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Access", value: "Students only" },
                { label: "Item range", value: "New + used" },
                { label: "Buying style", value: "Budget-friendly" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-[14px] border border-white/8 bg-white/5 p-3">
                  <p className="text-sm font-semibold text-white">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-white/45">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] p-3.5 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <label className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5">
              <Search className="h-4 w-4 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search items..."
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/30"
              />
            </label>

            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as "All" | GoodsCategory)}
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All categories" : item}
                </option>
              ))}
            </select>

            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value as "All" | GoodsCondition)}
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
            >
              <option value="All">All conditions</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "newest" | "price-low" | "price-high")}
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
            <select
              value={homeCampus}
              onChange={(event) => setHomeCampus(event.target.value as (typeof campuses)[number])}
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
            >
              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  Home campus: {campus}
                </option>
              ))}
            </select>

            <select
              value={browseCampus}
              onChange={(event) =>
                setBrowseCampus(event.target.value as "Home Campus" | (typeof campuses)[number])
              }
              className="rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
            >
              <option value="Home Campus">Browse home campus first</option>
              {campuses.map((campus) => (
                <option key={campus} value={campus}>
                  Browse {campus}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] text-white/70">
              <input
                type="checkbox"
                checked={includeOtherCampuses}
                onChange={(event) => setIncludeOtherCampuses(event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--accent)]"
              />
              Include cross-campus deals
            </label>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(70,191,255,0.24)] bg-[rgba(70,191,255,0.08)] px-3 py-1.5 text-[11px] text-[var(--accent)]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Students only
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/60">
              {browseCampus === "Home Campus" ? homeCampus : browseCampus}
            </div>
            <button
              type="button"
              onClick={() => refreshItems(false)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] text-white/60 transition hover:bg-white/5"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => refreshItems(true)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] text-white/45 transition hover:bg-white/5"
            >
              Test error state
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-[20px] border border-[rgba(70,191,255,0.18)] bg-[rgba(255,255,255,0.03)] p-3.5 backdrop-blur sm:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/36">AI Shopper Match</p>
              <h2 className="mt-2 font-display text-[1.35rem] font-bold tracking-[-0.03em] sm:text-[1.55rem]">
                Tell DormStash AI what you need.
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-5 text-white/48">
                Describe the item, budget, or pickup area.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(70,191,255,0.24)] bg-[rgba(70,191,255,0.08)] px-3 py-1.5 text-[11px] text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              AI match
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="flex items-center gap-3 rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              <input
                value={aiShopperQuery}
                onChange={(event) => setAiShopperQuery(event.target.value)}
                placeholder="Need a cheap orgo textbook near Charles?"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/30"
              />
            </label>

            <button
              type="button"
              onClick={getAIRecommendations}
              disabled={aiShopperLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-[#14161b] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {aiShopperLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiShopperLoading ? "Matching..." : "Match with AI"}
            </button>
          </div>

          {aiShopperError ? <p className="mt-3 text-sm text-[#F09595]">{aiShopperError}</p> : null}

          {aiShopperResult ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5">
                <p className="text-[13px] leading-5 text-white/60">{aiShopperResult.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[var(--accent)]">Next Step</p>
                <p className="mt-2 text-[13px] leading-5 text-white/52">{aiShopperResult.nextStep}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {aiRecommendedItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5 transition hover:bg-white/5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[rgba(70,191,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/62">
                        {item.campus}
                      </span>
                      <span className="text-[13px] font-semibold text-[var(--accent)]">${item.price}</span>
                    </div>
                    <Link href={`/sell-goods/${item.id}`} className="block">
                      <h3 className="mt-3 text-[15px] font-semibold text-white">{item.title}</h3>
                    </Link>
                    <div className="mt-2 flex items-center gap-2 text-[12px] text-white/58">
                      <span>{item.seller}</span>
                      {isVerifiedTempleEmail(item.sellerEmail) ? (
                        <span className="rounded-full bg-[rgba(125,156,191,0.18)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#c7d6ee]">
                          Temple Verified
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[13px] leading-5 text-white/48">{item.summary}</p>
                    <p className="mt-2 text-[11px] text-white/38">
                      {item.campus} · {item.neighborhood}
                    </p>
                    {getSellerContactHref(item) ? (
                      <a
                        href={getSellerContactHref(item) ?? "#"}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[rgba(148,163,184,0.26)] bg-[rgba(148,163,184,0.10)] px-4 py-2.5 text-[13px] font-semibold text-[#d7e5f6] transition hover:bg-[rgba(148,163,184,0.16)]"
                      >
                        Contact Seller
                      </a>
                    ) : (
                      <span className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white/40">
                        Contact unavailable
                      </span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold text-white">Marketplace listings</p>
              <p className="text-[12px] text-white/42">Browse by category, condition, and price.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] text-white/40">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--accent)]" />
              Filters on
            </div>
          </div>

          {status === "loading" ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] p-5">
                  <div className="h-32 animate-pulse rounded-[16px] bg-white/10" />
                  <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 h-10 animate-pulse rounded bg-white/10" />
                  <div className="mt-4 h-4 w-24 animate-pulse rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-[22px] border border-[rgba(240,80,80,0.28)] bg-[rgba(240,80,80,0.08)] p-6">
              <X className="h-5 w-5 text-[#F09595]" />
              <h2 className="mt-4 text-lg font-semibold">Marketplace items couldn&apos;t load.</h2>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Try refreshing again. We keep the student-only marketplace lightweight and fast.
              </p>
              <button
                type="button"
                onClick={() => refreshItems(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14161b]"
              >
                <Loader2 className="h-4 w-4" />
                Retry
              </button>
            </div>
          ) : null}

          {status === "ready" && filteredItems.length === 0 ? (
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel)] p-6">
              <Search className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="mt-4 text-lg font-semibold">No student listings match those filters.</h2>
              <p className="mt-2 text-sm leading-6 text-white/48">
                Try widening the category filter, switching condition, or clearing the search.
              </p>
            </div>
          ) : null}

          {status === "ready" && filteredItems.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] p-3.5 transition hover:bg-[var(--panel-soft)]"
                >
                  <Link href={`/sell-goods/${item.id}`} className="block">
                    <div className="flex h-28 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(70,191,255,0.08))] text-sm font-semibold text-white/70">
                      {item.imageHint}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-[rgba(70,191,255,0.10)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] text-white/62">
                        {item.campus}
                      </span>
                      <span className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] text-white/62">
                        {item.condition}
                      </span>
                    </div>

                    <h3 className="mt-3 text-[15px] font-semibold leading-5">{item.title}</h3>
                  </Link>

                  <div className="mt-2 flex items-center gap-2 text-[12px] text-white/58">
                    <span>{item.seller}</span>
                    {isVerifiedTempleEmail(item.sellerEmail) ? (
                      <span className="rounded-full bg-[rgba(148,163,184,0.14)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d7e5f6]">
                        Temple Verified
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-2 text-[13px] leading-5 text-white/48">{item.summary}</p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-white/44">{item.neighborhood}</span>
                    <span className="text-[13px] font-semibold text-[var(--accent)]">${item.price}</span>
                  </div>

                  {getSellerContactHref(item) ? (
                    <a
                      href={getSellerContactHref(item) ?? "#"}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-[rgba(148,163,184,0.26)] bg-[rgba(148,163,184,0.10)] px-4 py-2.5 text-[13px] font-semibold text-[#d7e5f6] transition hover:bg-[rgba(148,163,184,0.16)]"
                    >
                      Contact Seller
                    </a>
                  ) : (
                    <span className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-semibold text-white/40">
                      Contact unavailable
                    </span>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section id="sell-form" className="mt-7 rounded-[20px] border border-[var(--border)] bg-[var(--panel)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/36">Sell Form</p>
              <h2 className="mt-2 font-display text-[1.5rem] font-bold tracking-[-0.03em] sm:text-[1.9rem]">
                Upload and post to the student marketplace.
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-5 text-white/52">
                Keep it clear, budget-friendly, and student useful.
              </p>
            </div>
            <div className="rounded-full border border-[rgba(70,191,255,0.22)] bg-[rgba(70,191,255,0.08)] px-3 py-1.5 text-[11px] font-medium text-[var(--accent)]">
              Upload ready
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[var(--border)] bg-white/4 p-4 text-center transition hover:border-[rgba(70,191,255,0.38)] md:col-span-2">
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []).slice(0, 4);
                  setSelectedUploads(files.map((file) => file.name));
                }}
              />
              <Upload className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <p className="text-[13px] font-medium text-white/72">Upload photos</p>
                <p className="mt-1 text-[11px] text-white/38">Up to 4 images</p>
              </div>
            </label>

            {selectedUploads.length > 0 ? (
              <div className="flex flex-wrap gap-2 md:col-span-2">
                {selectedUploads.map((upload) => (
                  <div
                    key={upload}
                    className="rounded-full border border-[var(--border)] bg-white/5 px-3 py-1.5 text-[11px] text-white/65"
                  >
                    {upload}
                  </div>
                ))}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Seller name</span>
              <input
                value={sellForm.seller}
                onChange={(event) => setSellForm((current) => ({ ...current, seller: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="Your name"
              />
              {formErrors.seller ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.seller}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Student email</span>
              <input
                value={sellForm.email}
                onChange={(event) => setSellForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="you@temple.edu"
              />
              {formErrors.email ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.email}</p> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-[13px] text-white/58">Product title</span>
              <input
                value={sellForm.title}
                onChange={(event) => setSellForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="Rare Beauty blush duo"
              />
              {formErrors.title ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.title}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Category</span>
              <select
                value={sellForm.category}
                onChange={(event) => setSellForm((current) => ({ ...current, category: event.target.value as GoodsCategory }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
              >
                {categories
                  .filter((item): item is GoodsCategory => item !== "All")
                  .map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Condition</span>
              <select
                value={sellForm.condition}
                onChange={(event) => setSellForm((current) => ({ ...current, condition: event.target.value as GoodsCondition }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Price</span>
              <input
                type="number"
                min="1"
                value={sellForm.price}
                onChange={(event) => setSellForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="18"
              />
              {formErrors.price ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.price}</p> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[13px] text-white/58">Location</span>
              <input
                value={sellForm.neighborhood}
                onChange={(event) => setSellForm((current) => ({ ...current, neighborhood: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="Morgan Hall, Tech Center..."
              />
              {formErrors.neighborhood ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.neighborhood}</p> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-[13px] text-white/58">Description</span>
              <textarea
                rows={3}
                value={sellForm.summary}
                onChange={(event) => setSellForm((current) => ({ ...current, summary: event.target.value }))}
                className="w-full rounded-[12px] border border-[var(--border)] bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                placeholder="Add the key details students should know."
              />
              {formErrors.summary ? <p className="mt-1 text-xs text-[#F09595]">{formErrors.summary}</p> : null}
            </label>
          </div>

          {formError ? <p className="mt-4 text-sm text-[#F09595]">{formError}</p> : null}
          {formState === "success" ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(70,191,255,0.08)] px-4 py-2 text-[13px] text-[var(--accent)]">
              <CheckCircle2 className="h-4 w-4" />
              Item posted to the student marketplace.
            </div>
          ) : null}

          <button
            type="button"
            onClick={submitSellForm}
            disabled={formState === "submitting"}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {formState === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}
            {formState === "submitting" ? "Posting item..." : "Post this item"}
          </button>
        </section>
      </section>
    </main>
  );
}
