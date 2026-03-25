"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  ChevronRight,
  Clock3,
  Home,
  ImagePlus,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

type StayMode = "Semester" | "Few Months" | "One Month" | "Short Stay";
type PostIntent = "I Have a Room" | "I Need a Room";

type RoomOffer = {
  id: string;
  title: string;
  host: string;
  campus: string;
  location: string;
  stayMode: StayMode;
  price: string;
  dates: string;
  description: string;
  photoHint: string;
};

type RoomRequest = {
  id: string;
  student: string;
  campus: string;
  target: StayMode;
  budget: string;
  location: string;
  description: string;
};

const stayModes: StayMode[] = ["Semester", "Few Months", "One Month", "Short Stay"];

const offerTemplates = [
  {
    label: "Semester sublet",
    stayMode: "Semester" as StayMode,
    title: "Spring semester sublet near campus",
    price: "$785/month",
    dates: "Jan 8 - May 10",
    location: "Morgan Hall / Cecil B. Moore area",
    description:
      "Private room available for the full semester with desk space, closet, and easy walk to campus.",
  },
  {
    label: "Few months stay",
    stayMode: "Few Months" as StayMode,
    title: "3-month furnished room available",
    price: "$760/month",
    dates: "Jun 1 - Aug 31",
    location: "Near Charles Library",
    description:
      "Good fit for summer classes, internships, or lease overlap. Quiet setup and student-friendly move-in.",
  },
  {
    label: "Short stay",
    stayMode: "Short Stay" as StayMode,
    title: "Short stay crash space near campus",
    price: "$28/night",
    dates: "1-2 nights to 1 week",
    location: "Temple Station area",
    description:
      "Best for visiting friends, move-in overlap, or quick student stays without hotel prices.",
  },
] as const;

const seekerTemplates = [
  {
    label: "Semester needed",
    target: "Semester" as StayMode,
    budget: "Up to $800/month",
    location: "Close to main campus",
    description: "Looking for a semester sublet with a desk, quiet vibe, and easy walk to class.",
  },
  {
    label: "Summer room",
    target: "Few Months" as StayMode,
    budget: "Up to $750/month",
    location: "Near library or student center",
    description: "Need a furnished room for summer classes and a campus job from June through August.",
  },
  {
    label: "Short stay request",
    target: "Short Stay" as StayMode,
    budget: "Up to $35/night",
    location: "Near campus transit",
    description: "Need a short stay for a few nights while waiting on move-in timing.",
  },
] as const;

const roomOffers: RoomOffer[] = [
  {
    id: "offer-1",
    title: "Semester sublet with desk + closet",
    host: "Maya R.",
    campus: "Temple University",
    location: "Morgan Hall South",
    stayMode: "Semester",
    price: "$790/month",
    dates: "Jan 10 - May 12",
    description: "Quiet room, furnished, good light, and fast walk to main campus buildings.",
    photoHint: "Desk, bed, and window view",
  },
  {
    id: "offer-2",
    title: "Summer room for 3 months",
    host: "Jordan T.",
    campus: "Temple University",
    location: "Cecil B. Moore",
    stayMode: "Few Months",
    price: "$740/month",
    dates: "May 20 - Aug 20",
    description: "Ideal for internships or summer classes. Clean setup and easy move-in.",
    photoHint: "Furnished room with dresser",
  },
  {
    id: "offer-3",
    title: "One-month furnished room",
    host: "Sana L.",
    campus: "Drexel University",
    location: "University City",
    stayMode: "One Month",
    price: "$820/month",
    dates: "July only",
    description: "Flexible one-month stay with furnished basics and shared kitchen access.",
    photoHint: "Bedside table + lamp",
  },
  {
    id: "offer-4",
    title: "Crash pad for a few nights",
    host: "Chris D.",
    campus: "Temple University",
    location: "Near Charles Library",
    stayMode: "Short Stay",
    price: "$30/night",
    dates: "1-2 nights to 1 week",
    description: "Short-stay option for visiting friends, move-in overlap, or quick weekend needs.",
    photoHint: "Couch corner + side table",
  },
];

const roomRequests: RoomRequest[] = [
  {
    id: "request-1",
    student: "Aaliyah P.",
    campus: "Temple University",
    target: "Semester",
    budget: "Up to $820/month",
    location: "Near main campus",
    description: "Looking for a semester place with a desk and a quiet weekday vibe.",
  },
  {
    id: "request-2",
    student: "Devon S.",
    campus: "Temple University",
    target: "Few Months",
    budget: "Up to $780/month",
    location: "Close to SEPTA or campus",
    description: "Need a summer sublet for classes and part-time work from June to August.",
  },
  {
    id: "request-3",
    student: "Rina M.",
    campus: "Temple University",
    target: "Short Stay",
    budget: "Up to $35/night",
    location: "Walkable to library",
    description: "Need a short stay for 3 nights while waiting on lease timing.",
  },
];

export default function RoomSwapPage() {
  const [activeMode, setActiveMode] = useState<StayMode>("Semester");
  const [intent, setIntent] = useState<PostIntent>("I Have a Room");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dates, setDates] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [chatTarget, setChatTarget] = useState<RoomOffer | RoomRequest | null>(null);
  const [chatType, setChatType] = useState<"offer" | "request">("offer");
  const [chatMessage, setChatMessage] = useState("");

  const filteredOffers = useMemo(
    () => roomOffers.filter((offer) => offer.stayMode === activeMode),
    [activeMode],
  );

  const filteredRequests = useMemo(
    () => roomRequests.filter((request) => request.target === activeMode),
    [activeMode],
  );

  const applyOfferTemplate = (template: (typeof offerTemplates)[number]) => {
    setIntent("I Have a Room");
    setActiveMode(template.stayMode);
    setTitle(template.title);
    setPrice(template.price);
    setDates(template.dates);
    setLocation(template.location);
    setDescription(template.description);
  };

  const applySeekerTemplate = (template: (typeof seekerTemplates)[number]) => {
    setIntent("I Need a Room");
    setActiveMode(template.target);
    setTitle(`Looking for ${template.target.toLowerCase()} stay`);
    setPrice(template.budget);
    setDates(template.target === "Semester" ? "Full semester" : template.target === "Few Months" ? "2-3 months" : "Flexible");
    setLocation(template.location);
    setDescription(template.description);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoNames(Array.from(files).slice(0, 5).map((file) => file.name));
  };

  const openOfferChat = (offer: RoomOffer) => {
    setChatType("offer");
    setChatTarget(offer);
    setChatMessage(`Hi ${offer.host.split(" ")[0]}, I saw your ${offer.stayMode.toLowerCase()} post on MyDormStash. Is it still available?`);
  };

  const openRequestChat = (request: RoomRequest) => {
    setChatType("request");
    setChatTarget(request);
    setChatMessage(`Hi ${request.student.split(" ")[0]}, I may have a ${request.target.toLowerCase()} option that fits your post. Are you still looking?`);
  };

  const closeChat = () => {
    setChatTarget(null);
    setChatMessage("");
  };

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
            <Home className="h-3.5 w-3.5 text-[var(--accent)]" />
            Room Swap
          </div>
        </header>

        <section className="grid gap-6 px-1 py-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="section-kicker !px-0">The Room Swap</p>
            <h1 className="mt-4 max-w-4xl font-display text-[3rem] font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-[4.5rem]">
              Semester and few-month
              <span className="hero-gradient-title block"> student stays first.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-white/52">
              Focused on semester sublets, 2 to 3 month stays, one-month room options, and short stays from
              1 to 2 nights up to a week. Students can post rooms and also post what they are looking for in
              the same place.
            </p>

            <div className="mt-7 inline-flex flex-wrap rounded-full border border-white/10 bg-white/5 p-1.5">
              {stayModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeMode === mode ? "bg-white text-black" : "text-white/60 hover:bg-white/5 hover:text-white/84"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Best for", value: "Semester + few months", icon: BedDouble },
                { label: "Also supports", value: "1 month + short stays", icon: Clock3 },
                { label: "Built for", value: "Room posts and room requests", icon: Search },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="page-card p-4">
                  <Icon className="h-4 w-4 text-[var(--accent)]" />
                  <p className="mt-4 text-lg font-semibold text-white">{value}</p>
                  <p className="mt-1 text-xs text-white/42">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <section className="page-card p-5">
            <div className="flex flex-wrap gap-2">
              {(["I Have a Room", "I Need a Room"] as PostIntent[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIntent(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    intent === item
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/62 hover:text-white/82"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                Easy Post Template
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {intent === "I Have a Room"
                  ? offerTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => applyOfferTemplate(template)}
                        className="capsule-secondary px-4 py-2 text-sm font-semibold text-white/74 transition hover:bg-white/6"
                      >
                        {template.label}
                      </button>
                    ))
                  : seekerTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => applySeekerTemplate(template)}
                        className="capsule-secondary px-4 py-2 text-sm font-semibold text-white/74 transition hover:bg-white/6"
                      >
                        {template.label}
                      </button>
                    ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={intent === "I Have a Room" ? "Spring semester sublet near campus" : "Looking for summer room near campus"}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Price / Budget
                </span>
                <input
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder={activeMode === "Short Stay" ? "$28/night" : "$780/month"}
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Dates
                </span>
                <div className="flex items-center rounded-[14px] border border-white/10 bg-white/5 px-4 py-3">
                  <CalendarDays className="mr-3 h-4 w-4 text-[var(--accent)]" />
                  <input
                    value={dates}
                    onChange={(event) => setDates(event.target.value)}
                    placeholder={activeMode === "Semester" ? "Jan 8 - May 10" : activeMode === "Few Months" ? "Jun 1 - Aug 31" : activeMode === "One Month" ? "July only" : "1-2 nights to 1 week"}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Location
                </span>
                <div className="flex items-center rounded-[14px] border border-white/10 bg-white/5 px-4 py-3">
                  <MapPin className="mr-3 h-4 w-4 text-[var(--accent)]" />
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Morgan Hall, Charles Library area, Cecil B. Moore"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                Description
              </span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={
                  intent === "I Have a Room"
                    ? "Describe the room, furniture, roommates, walk to campus, and why this is a good fit."
                    : "Describe what kind of room you need, budget, timing, and preferred setup."
                }
                className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 outline-none placeholder:text-white/25"
              />
            </label>

            <label
              className={`mt-5 flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-[18px] border border-dashed px-5 py-8 text-center transition ${
                dragActive
                  ? "border-[rgba(18,214,255,0.45)] bg-[rgba(18,214,255,0.07)]"
                  : "border-white/15 bg-white/[0.02] hover:border-white/25"
              }`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                handleFiles(event.dataTransfer.files);
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/6 text-[var(--accent)]">
                <ImagePlus className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">Upload room photos</p>
              <p className="mt-2 text-xs text-white/38">Drag and drop or tap to add up to 5 photos</p>
              <p className="mt-4 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/62">
                {photoNames.length ? `${photoNames.length} photos ready` : "No photos yet"}
              </p>
            </label>

            <button
              type="button"
              className="capsule-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
            >
              Post to Room Swap
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </section>

        <section className="mt-3">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="section-kicker !mt-0 !px-0">Available Rooms</p>
              <p className="mt-2 text-sm text-white/42">Semester and few-month stays are prioritized first.</p>
            </div>
            <div className="page-chip hidden items-center gap-2 sm:inline-flex">
              <BadgeCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
              Verified Student
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filteredOffers.map((offer) => (
              <article key={offer.id} className="page-card p-4">
                <div className="flex h-44 items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(18,214,255,0.08))] text-sm font-semibold text-white/70">
                  {offer.photoHint}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{offer.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/46">
                      <span>{offer.host}</span>
                      <span className="rounded-full border border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] px-2.5 py-1 font-semibold text-[var(--accent)]">
                        Verified Student
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/66">{offer.stayMode}</span>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[var(--accent)]">{offer.price}</span>
                  <span className="text-white/42">{offer.dates}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {offer.campus} • {offer.location}
                </div>

                <p className="mt-4 text-sm leading-6 text-white/54">{offer.description}</p>

                <button
                  type="button"
                  onClick={() => openOfferChat(offer)}
                  className="capsule-primary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
                >
                  Request to Stay
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="section-kicker !mt-0 !px-0">Students Looking for a Room</p>
              <p className="mt-2 text-sm text-white/42">Post requests and match students who still need a place.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-white/42">
              <Search className="h-3.5 w-3.5 text-[var(--accent)]" />
              Same-section demand view
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {filteredRequests.map((request) => (
              <article key={request.id} className="page-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{request.student}</h2>
                    <p className="mt-2 text-xs text-white/42">{request.campus}</p>
                  </div>
                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/66">{request.target}</span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-[var(--accent)]">{request.budget}</p>
                  <p className="text-white/52">{request.location}</p>
                </div>

                <p className="mt-4 text-sm leading-6 text-white/54">{request.description}</p>

                <button
                  type="button"
                  onClick={() => openRequestChat(request)}
                  className="capsule-secondary mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm"
                >
                  <Send className="h-4 w-4 text-[var(--accent)]" />
                  Message About a Match
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      {chatTarget ? (
        <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.58)]">
          <button type="button" aria-label="Close chat" className="absolute inset-0" onClick={closeChat} />
          <aside
            className="page-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-none border-l border-white/10 bg-[rgba(7,10,15,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-swap-chat-title"
          >
            <div className="flex items-start justify-between border-b border-white/8 px-5 py-5">
              <div>
                <p className="section-kicker !px-0 !text-white/32">
                  {chatType === "offer" ? "Request to Stay" : "Room Match Message"}
                </p>
                <h2
                  id="room-swap-chat-title"
                  className="mt-2 font-display text-[1.25rem] font-bold tracking-[-0.03em] text-white"
                >
                  {chatType === "offer" ? (chatTarget as RoomOffer).title : `For ${(chatTarget as RoomRequest).student}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="page-card p-4">
                <p className="text-sm leading-6 text-white/58">
                  Use this to quickly coordinate timing, room fit, move-in details, or short-stay availability.
                </p>
              </div>
            </div>

            <div className="border-t border-white/8 px-5 py-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-white/45">
                  Message
                </span>
                <textarea
                  rows={4}
                  value={chatMessage}
                  onChange={(event) => setChatMessage(event.target.value)}
                  placeholder="Ask about rent, dates, vibe, roommates, and move-in timing..."
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25"
                />
              </label>

              <button
                type="button"
                className="capsule-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
