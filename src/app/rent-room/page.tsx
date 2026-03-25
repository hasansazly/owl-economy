"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Sofa,
  Sparkles,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { DormStashLogo } from "@/components/logo";

type StayType = "Bed" | "Couch" | "Spare room";

type StayListing = {
  id: string;
  title: string;
  host: string;
  type: StayType;
  neighborhood: string;
  distance: string;
  price: number;
  maxNights: 1 | 2;
  summary: string;
  amenities: string[];
  note: string;
};

const baseListings: StayListing[] = [
  {
    id: "rr-1",
    title: "Twin bed near Morgan Hall",
    host: "Maya R.",
    type: "Bed",
    neighborhood: "Broad & Cecil",
    distance: "6 min walk to main campus",
    price: 24,
    maxNights: 2,
    summary: "Quiet overnight setup for students who need a safe crash spot after a late event or commute issue.",
    amenities: ["Fresh linens", "Wi-Fi", "Desk corner", "Late check-in"],
    note: "Temple students only. Keep it low-key and respectful.",
  },
  {
    id: "rr-2",
    title: "Budget couch stay after events",
    host: "Jordan T.",
    type: "Couch",
    neighborhood: "Diamond Street",
    distance: "9 min walk to campus",
    price: 14,
    maxNights: 1,
    summary: "Best for one night after parties, campus performances, or last-minute transit issues.",
    amenities: ["Blanket set", "Phone charging", "Bathroom access"],
    note: "No long stays, no guests, just a clean overnight reset.",
  },
  {
    id: "rr-3",
    title: "Spare room for 1-2 nights",
    host: "Nadia K.",
    type: "Spare room",
    neighborhood: "Oxford Village",
    distance: "12 min walk to campus",
    price: 32,
    maxNights: 2,
    summary: "Simple private room for short student stays, ideal for interviews, move-in overlap, or family visits overflow.",
    amenities: ["Private door", "Wi-Fi", "Lamp", "Closet space"],
    note: "Budget-friendly and student-first. No weekly or monthly arrangements.",
  },
  {
    id: "rr-4",
    title: "Soft couch close to Tech Center",
    host: "Alex P.",
    type: "Couch",
    neighborhood: "Polett Walk",
    distance: "4 min walk to Tech Center",
    price: 16,
    maxNights: 1,
    summary: "Quick overnight option for study nights, hackathons, or weather-related delays.",
    amenities: ["Wi-Fi", "Study lamp", "Filtered water"],
    note: "Only available for one-night stays and verified students.",
  },
  {
    id: "rr-5",
    title: "Affordable bed near SEPTA stop",
    host: "Chris D.",
    type: "Bed",
    neighborhood: "Temple Station",
    distance: "8 min walk to campus",
    price: 20,
    maxNights: 2,
    summary: "Good fit for commuters who need a place after late campus nights without paying hotel prices.",
    amenities: ["Pillow set", "Small fan", "Morning coffee"],
    note: "Built for short campus stays only. No long-term rental requests.",
  },
  {
    id: "rr-6",
    title: "Spare room during move-in overlap",
    host: "Sana L.",
    type: "Spare room",
    neighborhood: "North 15th",
    distance: "10 min walk to campus",
    price: 29,
    maxNights: 2,
    summary: "Helpful for students between leases, waiting on family arrival, or navigating dorm timing.",
    amenities: ["Private room", "Charging station", "Desk", "Wi-Fi"],
    note: "1-2 night cap. Not a sublet and not for long-term housing.",
  },
];

type RequestForm = {
  name: string;
  email: string;
  nights: string;
  note: string;
};

type StayForm = {
  hostName: string;
  email: string;
  title: string;
  type: StayType;
  neighborhood: string;
  distance: string;
  price: string;
  maxNights: "1" | "2";
  summary: string;
};

function isEduEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") && trimmed.endsWith(".edu");
}

export default function RentRoomPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [listings, setListings] = useState<StayListing[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [stayType, setStayType] = useState<"All" | StayType>("All");
  const [budget, setBudget] = useState<"all" | "20" | "30">("all");
  const [nightFilter, setNightFilter] = useState<"all" | "1" | "2">("all");
  const [zone, setZone] = useState("all");

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingState, setBookingState] = useState<"idle" | "submitting" | "success">("idle");
  const [bookingError, setBookingError] = useState("");
  const [requestForm, setRequestForm] = useState<RequestForm>({
    name: "",
    email: "",
    nights: "1",
    note: "",
  });

  const [postState, setPostState] = useState<"idle" | "submitting" | "success">("idle");
  const [postError, setPostError] = useState("");
  const [stayForm, setStayForm] = useState<StayForm>({
    hostName: "",
    email: "",
    title: "",
    type: "Bed",
    neighborhood: "",
    distance: "",
    price: "",
    maxNights: "1",
    summary: "",
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setListings(baseListings);
      setSelectedId(baseListings[0].id);
      setStatus("ready");
    }, 700);

    return () => window.clearTimeout(timer);
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesQuery =
        !query.trim() ||
        `${listing.title} ${listing.neighborhood} ${listing.summary} ${listing.amenities.join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());

      const matchesType = stayType === "All" || listing.type === stayType;
      const matchesBudget =
        budget === "all" || (budget === "20" ? listing.price <= 20 : listing.price <= 30);
      const matchesNights =
        nightFilter === "all" || Number(nightFilter) <= Number(listing.maxNights);
      const matchesZone =
        zone === "all" ||
        listing.neighborhood.toLowerCase().includes(zone.toLowerCase());

      return matchesQuery && matchesType && matchesBudget && matchesNights && matchesZone;
    });
  }, [budget, listings, nightFilter, query, stayType, zone]);

  const selectedListing =
    filteredListings.find((listing) => listing.id === selectedId) ?? filteredListings[0] ?? null;

  useEffect(() => {
    if (selectedListing && selectedListing.id !== selectedId) {
      setSelectedId(selectedListing.id);
    }
  }, [selectedId, selectedListing]);

  const requestErrors = useMemo(() => {
    const errors: Partial<Record<keyof RequestForm, string>> = {};
    if (!requestForm.name.trim()) errors.name = "Your name is required.";
    if (!isEduEmail(requestForm.email)) errors.email = "Use a valid .edu email.";
    const nights = Number(requestForm.nights);
    if (!(nights === 1 || nights === 2)) errors.nights = "Only 1-2 nights are allowed.";
    if (selectedListing && nights > selectedListing.maxNights) {
      errors.nights = `This stay only allows up to ${selectedListing.maxNights} night${selectedListing.maxNights === 2 ? "s" : ""}.`;
    }
    return errors;
  }, [requestForm, selectedListing]);

  const stayErrors = useMemo(() => {
    const errors: Partial<Record<keyof StayForm, string>> = {};
    if (!stayForm.hostName.trim()) errors.hostName = "Host name is required.";
    if (!isEduEmail(stayForm.email)) errors.email = "Use a valid .edu email.";
    if (!stayForm.title.trim()) errors.title = "Add a stay title.";
    if (!stayForm.neighborhood.trim()) errors.neighborhood = "Add a nearby campus area.";
    if (!stayForm.distance.trim()) errors.distance = "Add a short campus distance note.";
    if (!stayForm.price || Number(stayForm.price) <= 0) errors.price = "Enter a budget-friendly nightly price.";
    if (!stayForm.summary.trim() || stayForm.summary.trim().length < 20) {
      errors.summary = "Add a short, helpful summary.";
    }
    return errors;
  }, [stayForm]);

  const refreshListings = (forceError = false) => {
    setStatus("loading");
    window.setTimeout(() => {
      if (forceError) {
        setStatus("error");
        return;
      }
      setListings((current) => (current.length ? current : baseListings));
      setStatus("ready");
    }, 700);
  };

  const submitBookingRequest = () => {
    setBookingError("");
    if (Object.keys(requestErrors).length > 0) {
      setBookingError("Please fix the request details before sending.");
      return;
    }
    setBookingState("submitting");
    window.setTimeout(() => {
      setBookingState("success");
    }, 800);
  };

  const submitStayForm = () => {
    setPostError("");
    if (Object.keys(stayErrors).length > 0) {
      setPostError("Please complete the short-stay form before posting.");
      return;
    }

    setPostState("submitting");
    window.setTimeout(() => {
      const nextListing: StayListing = {
        id: `rr-${Date.now()}`,
        title: stayForm.title.trim(),
        host: stayForm.hostName.trim(),
        type: stayForm.type,
        neighborhood: stayForm.neighborhood.trim(),
        distance: stayForm.distance.trim(),
        price: Number(stayForm.price),
        maxNights: Number(stayForm.maxNights) as 1 | 2,
        summary: stayForm.summary.trim(),
        amenities: ["Student host", "Budget-friendly", "Short stay only"],
        note: "New stay posted by a verified student host.",
      };

      setListings((current) => [nextListing, ...current]);
      setSelectedId(nextListing.id);
      setPostState("success");
      setStatus("ready");
    }, 900);
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
              const form = document.getElementById("post-stay-form");
              form?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Post a Stay
          </button>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">Rent a Room</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              Affordable student short stays near campus.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/56">
              Find a bed, couch, or spare room for just 1-2 nights. This is built for Temple
              students who need safe, budget-friendly short stays, not long-term rentals.
            </p>
          </div>

          <div className="page-card bg-[linear-gradient(135deg,_rgba(51,65,92,0.55),_rgba(26,29,36,0.92))] p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Typical Nightly Price", value: "$14-$32", icon: Wallet },
                { label: "Stay Length", value: "1-2 nights", icon: Clock3 },
                { label: "Student-first Rule", value: "No long-term rentals", icon: ShieldCheck },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                  <p className="mt-4 text-lg font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-white/45">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-card p-5">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
            <label className="flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3">
              <Search className="h-4 w-4 text-white/35" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search affordable short stays..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
              />
            </label>

            <select
              value={stayType}
              onChange={(event) => setStayType(event.target.value as "All" | StayType)}
              className="rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="All">All stay types</option>
              <option value="Bed">Bed</option>
              <option value="Couch">Couch</option>
              <option value="Spare room">Spare room</option>
            </select>

            <select
              value={budget}
              onChange={(event) => setBudget(event.target.value as "all" | "20" | "30")}
              className="rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="all">Any budget</option>
              <option value="20">Up to $20/night</option>
              <option value="30">Up to $30/night</option>
            </select>

            <select
              value={nightFilter}
              onChange={(event) => setNightFilter(event.target.value as "all" | "1" | "2")}
              className="rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="all">1-2 nights</option>
              <option value="1">1 night only</option>
              <option value="2">Up to 2 nights</option>
            </select>

            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              className="rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="all">All areas</option>
              <option value="broad">Broad & Cecil</option>
              <option value="diamond">Diamond Street</option>
              <option value="oxford">Oxford Village</option>
              <option value="tech">Tech Center</option>
              <option value="temple">Temple Station</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(70,191,255,0.24)] bg-[rgba(70,191,255,0.08)] px-3 py-1.5 text-xs text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Student-focused, short stays only
            </div>
            <button
              type="button"
              onClick={() => refreshListings(false)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5"
            >
              Refresh listings
            </button>
            <button
              type="button"
              onClick={() => refreshListings(true)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/5"
            >
              Test error state
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Available short stays</p>
                <p className="text-sm text-white/42">
                  Budget-friendly spots for one or two nights near Temple.
                </p>
              </div>
            </div>

            {status === "loading" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-[20px] border border-[var(--border)] bg-[var(--panel)] p-5"
                  >
                    <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                    <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-white/10" />
                    <div className="mt-3 h-12 animate-pulse rounded bg-white/10" />
                    <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  </div>
                ))}
              </div>
            ) : null}

            {status === "error" ? (
              <div className="rounded-[22px] border border-[rgba(240,80,80,0.28)] bg-[rgba(240,80,80,0.08)] p-6">
                <AlertCircle className="h-5 w-5 text-[#F09595]" />
                <h2 className="mt-4 text-lg font-semibold">Listings couldn&apos;t load right now.</h2>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Try refreshing again. The short-stay board is meant for quick student needs, so we keep
                  it lightweight and retry-friendly.
                </p>
                <button
                  type="button"
                  onClick={() => refreshListings(false)}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14161b]"
                >
                  <Loader2 className="h-4 w-4" />
                  Retry loading
                </button>
              </div>
            ) : null}

            {status === "ready" && filteredListings.length === 0 ? (
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel)] p-6">
                <Search className="h-5 w-5 text-[var(--accent)]" />
                <h2 className="mt-4 text-lg font-semibold">No short stays match those filters.</h2>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  Try widening the budget, switching to all stay types, or clearing the neighborhood filter.
                </p>
              </div>
            ) : null}

            {status === "ready" && filteredListings.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredListings.map((listing) => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => setSelectedId(listing.id)}
                    className={`rounded-[20px] border p-5 text-left transition ${
                      selectedListing?.id === listing.id
                        ? "border-[rgba(70,191,255,0.42)] bg-[rgba(70,191,255,0.08)]"
                        : "border-[var(--border)] bg-[var(--panel)] hover:bg-[var(--panel-soft)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/65">
                        {listing.type}
                      </span>
                      <span className="text-sm font-semibold text-[var(--accent)]">
                        ${listing.price}/night
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold">{listing.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/48">{listing.summary}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/45">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                        {listing.neighborhood}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5 text-[var(--accent)]" />
                        Up to {listing.maxNights} night{listing.maxNights === 2 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--panel)] p-6">
              {selectedListing ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[rgba(70,191,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      {selectedListing.type}
                    </span>
                    <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/60">
                      {selectedListing.maxNights} night max
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em]">
                    {selectedListing.title}
                  </h2>
                  <p className="mt-2 text-sm text-white/46">Hosted by {selectedListing.host}</p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/32">Budget</p>
                      <p className="mt-2 text-lg font-semibold text-[var(--accent)]">
                        ${selectedListing.price}/night
                      </p>
                    </div>
                    <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/32">Location</p>
                      <p className="mt-2 text-sm font-medium text-white">{selectedListing.distance}</p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-white/52">{selectedListing.summary}</p>

                  <div className="mt-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/32">What&apos;s included</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedListing.amenities.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-white/68"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[16px] border border-[rgba(70,191,255,0.2)] bg-[rgba(51,65,92,0.32)] p-4">
                    <p className="text-sm leading-6 text-white/56">{selectedListing.note}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingOpen(true);
                      setBookingState("idle");
                      setBookingError("");
                    }}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                    Request this stay
                  </button>
                </>
              ) : (
                <div className="py-8 text-center text-white/45">
                  Select a stay to see the short-stay details.
                </div>
              )}
            </div>
          </aside>
        </section>

        <section id="post-stay-form" className="mt-10 rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/36">Post a Stay</p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em]">
                Offer a bed, couch, or spare room for 1-2 nights.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">
                Keep it student-focused, affordable, and near campus. DormStash short stays are not for
                long-term rentals or month-to-month housing.
              </p>
            </div>
            <div className="rounded-full border border-[rgba(70,191,255,0.22)] bg-[rgba(70,191,255,0.08)] px-4 py-2 text-xs font-medium text-[var(--accent)]">
              Short stays only
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Host name</span>
              <input
                value={stayForm.hostName}
                onChange={(event) => setStayForm((current) => ({ ...current, hostName: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="Your name"
              />
              {stayErrors.hostName ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.hostName}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Temple email</span>
              <input
                value={stayForm.email}
                onChange={(event) => setStayForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="you@temple.edu"
              />
              {stayErrors.email ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.email}</p> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-white/58">Stay title</span>
              <input
                value={stayForm.title}
                onChange={(event) => setStayForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="Affordable couch near campus"
              />
              {stayErrors.title ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.title}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Stay type</span>
              <select
                value={stayForm.type}
                onChange={(event) =>
                  setStayForm((current) => ({ ...current, type: event.target.value as StayType }))
                }
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
              >
                <option value="Bed">Bed</option>
                <option value="Couch">Couch</option>
                <option value="Spare room">Spare room</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Max stay length</span>
              <select
                value={stayForm.maxNights}
                onChange={(event) =>
                  setStayForm((current) => ({ ...current, maxNights: event.target.value as "1" | "2" }))
                }
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
              >
                <option value="1">1 night</option>
                <option value="2">2 nights</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Nearby area</span>
              <input
                value={stayForm.neighborhood}
                onChange={(event) => setStayForm((current) => ({ ...current, neighborhood: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="Broad & Cecil"
              />
              {stayErrors.neighborhood ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.neighborhood}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Distance from campus</span>
              <input
                value={stayForm.distance}
                onChange={(event) => setStayForm((current) => ({ ...current, distance: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="8 min walk to main campus"
              />
              {stayErrors.distance ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.distance}</p> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-white/58">Price per night</span>
              <input
                type="number"
                min="1"
                value={stayForm.price}
                onChange={(event) => setStayForm((current) => ({ ...current, price: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="18"
              />
              {stayErrors.price ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.price}</p> : null}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-white/58">Short summary</span>
              <textarea
                rows={4}
                value={stayForm.summary}
                onChange={(event) => setStayForm((current) => ({ ...current, summary: event.target.value }))}
                className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                placeholder="Explain the setup, vibe, and why it works well for short student stays."
              />
              {stayErrors.summary ? <p className="mt-1 text-xs text-[#F09595]">{stayErrors.summary}</p> : null}
            </label>
          </div>

          {postError ? <p className="mt-4 text-sm text-[#F09595]">{postError}</p> : null}
          {postState === "success" ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[rgba(70,191,255,0.08)] px-4 py-2 text-sm text-[var(--accent)]">
              <CheckCircle2 className="h-4 w-4" />
              Stay posted successfully.
            </div>
          ) : null}

          <button
            type="button"
            onClick={submitStayForm}
            disabled={postState === "submitting"}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {postState === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserRound className="h-4 w-4" />}
            {postState === "submitting" ? "Posting stay..." : "Post this stay"}
          </button>
        </section>
      </section>

      {bookingOpen && selectedListing ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(0,0,0,0.55)] px-4">
          <div className="w-full max-w-lg rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.36)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/36">Booking Request</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.03em]">
                  {selectedListing.title}
                </h2>
                <p className="mt-2 text-sm text-white/45">
                  {selectedListing.type} in {selectedListing.neighborhood} · up to {selectedListing.maxNights} night{selectedListing.maxNights === 2 ? "s" : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBookingOpen(false)}
                className="rounded-full border border-[var(--border)] p-2 text-white/55 transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bookingState === "success" ? (
              <div className="mt-6 rounded-[18px] border border-[rgba(70,191,255,0.24)] bg-[rgba(70,191,255,0.08)] p-5">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="mt-4 text-lg font-semibold">Request sent</h3>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  The host will review your short-stay request. DormStash keeps this flow focused on
                  affordable 1-2 night student stays only.
                </p>
                <button
                  type="button"
                  onClick={() => setBookingOpen(false)}
                  className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14161b]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm text-white/58">Your name</span>
                    <input
                      value={requestForm.name}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                      placeholder="Full name"
                    />
                    {requestErrors.name ? <p className="mt-1 text-xs text-[#F09595]">{requestErrors.name}</p> : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/58">Temple email</span>
                    <input
                      value={requestForm.email}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, email: event.target.value }))
                      }
                      className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                      placeholder="you@temple.edu"
                    />
                    {requestErrors.email ? <p className="mt-1 text-xs text-[#F09595]">{requestErrors.email}</p> : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/58">How many nights?</span>
                    <select
                      value={requestForm.nights}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, nights: event.target.value }))
                      }
                      className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                    >
                      <option value="1">1 night</option>
                      <option value="2">2 nights</option>
                    </select>
                    {requestErrors.nights ? <p className="mt-1 text-xs text-[#F09595]">{requestErrors.nights}</p> : null}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm text-white/58">Short note to host</span>
                    <textarea
                      rows={4}
                      value={requestForm.note}
                      onChange={(event) =>
                        setRequestForm((current) => ({ ...current, note: event.target.value }))
                      }
                      className="w-full rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3 text-sm outline-none"
                      placeholder="Why you need the short stay and what time you’d arrive."
                    />
                  </label>
                </div>

                {bookingError ? <p className="mt-4 text-sm text-[#F09595]">{bookingError}</p> : null}

                <button
                  type="button"
                  onClick={submitBookingRequest}
                  disabled={bookingState === "submitting"}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {bookingState === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {bookingState === "submitting" ? "Sending request..." : "Send booking request"}
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
