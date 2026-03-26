"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const categories = ["All", "Textbooks", "Mini-Fridges", "Electronics", "Sublets"] as const;

type ListingRow = {
  id: string | number;
  title: string;
  price: number | string;
  category: string;
  description: string | null;
};

type ListingForm = {
  title: string;
  price: string;
  category: string;
  description: string;
};

const initialForm: ListingForm = {
  title: "",
  price: "",
  category: "Textbooks",
  description: "",
};

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [form, setForm] = useState<ListingForm>(initialForm);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    let mounted = true;

    const loadDashboard = async () => {
      const [{ data: sessionData }, listingsResponse] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from("listings").select("id, title, price, category, description"),
      ]);

      if (!mounted) return;

      setIsLoggedIn(Boolean(sessionData.session));

      if (listingsResponse.error) {
        setError("Could not load campus listings right now.");
        setListings([]);
      } else {
        setListings((listingsResponse.data as ListingRow[]) || []);
      }

      setLoading(false);
    };

    loadDashboard();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesQuery =
        !query.trim() ||
        [item.title, item.category, item.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, listings, query]);

  const handlePostItem = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setPostError("Supabase is not configured.");
      return;
    }

    if (!isLoggedIn) {
      setPostError("You must be logged in to post.");
      return;
    }

    if (!form.title.trim() || !form.price.trim() || !form.category.trim() || !form.description.trim()) {
      setPostError("Please fill out all item fields.");
      return;
    }

    const parsedPrice = Number(form.price);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setPostError("Please enter a valid price.");
      return;
    }

    try {
      setPosting(true);
      setPostError("");

      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: form.title.trim(),
          price: parsedPrice,
          category: form.category.trim(),
          description: form.description.trim(),
        })
        .select("id, title, price, category, description")
        .single();

      if (insertError || !data) {
        throw new Error("Could not post the item.");
      }

      setListings((current) => [data as ListingRow, ...current]);
      setForm(initialForm);
      setPostOpen(false);
    } catch (postItemError) {
      setPostError(postItemError instanceof Error ? postItemError.message : "Could not post the item.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-6">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(0,0,0,0.92)] py-4 backdrop-blur-xl">
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
        </header>

        <section className="pt-5">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  activeCategory === category
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                    : "border-white/10 bg-white/5 text-white/74 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5"
              >
                <div className="h-36 animate-pulse rounded-[14px] bg-white/10" />
                <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="mt-3 h-6 w-24 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </section>
        ) : null}

        {!loading && error ? (
          <section className="mt-5 rounded-[18px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] p-4 text-[13px] text-[#F09595]">
            {error}
          </section>
        ) : null}

        {!loading && !error ? (
          <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {filteredListings.map((item) => (
              <article
                key={String(item.id)}
                className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl"
              >
                <div className="relative">
                  <div className="flex h-36 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_rgba(35,42,54,0.88),_rgba(18,214,255,0.08))] px-4 text-center text-[13px] font-semibold text-white/70">
                    {item.category}
                  </div>
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-cyan-400 px-2.5 py-1 text-[11px] font-bold text-black">
                    ${item.price}
                  </span>
                </div>

                <h2 className="mt-3 text-[15px] font-semibold leading-5 text-white">{item.title}</h2>
                <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/42">
                  {item.description || "Campus listing"}
                </p>

                <div className="mt-3">
                  <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/58">
                    Temple Main Campus
                  </span>
                </div>
              </article>
            ))}

            {filteredListings.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-6 text-center text-[13px] text-white/42 sm:col-span-2 xl:col-span-4">
                No listings found yet.
              </div>
            ) : null}
          </section>
        ) : null}
      </section>

      {isLoggedIn ? (
        <>
          <button
            type="button"
            onClick={() => setPostOpen(true)}
            className="fixed bottom-6 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_18px_36px_rgba(34,211,238,0.28)] transition hover:scale-[1.03]"
            aria-label="Post New Item"
          >
            <Plus className="h-6 w-6" />
          </button>

          {postOpen ? (
            <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.68)]">
              <button
                type="button"
                aria-label="Close post form"
                className="absolute inset-0"
                onClick={() => setPostOpen(false)}
              />
              <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[24px] border border-white/10 bg-[#090909] p-5 shadow-[0_-16px_48px_rgba(0,0,0,0.42)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                      Post an Item
                    </p>
                    <h2 className="mt-1 text-[20px] font-semibold text-white">New listing</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPostOpen(false)}
                    className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-[12px] text-white/48">Title</span>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                      placeholder="Mini fridge in good condition"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] text-white/48">Price</span>
                    <input
                      value={form.price}
                      onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                      className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                      placeholder="40"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] text-white/48">Category</span>
                    <select
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                    >
                      {categories.filter((item) => item !== "All").map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-[12px] text-white/48">Description</span>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, description: event.target.value }))
                      }
                      className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                      placeholder="Great for dorm storage and still runs cold."
                    />
                  </label>
                </div>

                {postError ? <p className="mt-3 text-[12px] text-[#F09595]">{postError}</p> : null}

                <button
                  type="button"
                  onClick={handlePostItem}
                  disabled={posting}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-cyan-400 px-5 py-3 text-[14px] font-semibold text-black transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {posting ? "Posting..." : "Post an Item"}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
