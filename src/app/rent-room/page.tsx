"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  ImageUp,
  MapPin,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";

const stayModes = ["Semester", "Few Months", "One Month", "Short Stay"] as const;
const postTypes = ["I Have a Room", "I Need a Room"] as const;

const offerTemplates = [
  {
    label: "Semester sublet",
    stayMode: "Semester",
    title: "Spring semester sublet near campus",
    price: "$785/month",
    dates: "Jan 8 - May 10",
    location: "Morgan Hall / Cecil B. Moore area",
    description: "Private room for the full semester with desk space, closet, and easy walk to campus.",
  },
  {
    label: "Few months stay",
    stayMode: "Few Months",
    title: "3-month furnished room available",
    price: "$760/month",
    dates: "Jun 1 - Aug 31",
    location: "Near Charles Library",
    description: "Good fit for summer classes, internships, or lease overlap with a quiet student setup.",
  },
  {
    label: "Short stay",
    stayMode: "Short Stay",
    title: "Short stay crash space near campus",
    price: "$28/night",
    dates: "1-2 nights to 1 week",
    location: "Temple Station area",
    description: "Best for visiting friends, move-in overlap, or quick student stays without hotel prices.",
  },
] as const;

const seekerTemplates = [
  {
    label: "Semester needed",
    stayMode: "Semester",
    title: "Looking for semester sublet",
    price: "Up to $800/month",
    dates: "Full semester",
    location: "Close to main campus",
    description: "Looking for a semester sublet with a desk, quiet vibe, and easy walk to class.",
  },
  {
    label: "Summer room",
    stayMode: "Few Months",
    title: "Need a summer room",
    price: "Up to $750/month",
    dates: "June to August",
    location: "Near library or student center",
    description: "Need a furnished room for summer classes and a campus job from June through August.",
  },
  {
    label: "Short stay request",
    stayMode: "Short Stay",
    title: "Need short stay near campus",
    price: "Up to $35/night",
    dates: "Flexible",
    location: "Near campus transit",
    description: "Need a short stay for a few nights while waiting on move-in timing.",
  },
] as const;

const roomOffers = [
  {
    id: "offer-1",
    stayMode: "Semester",
    title: "Semester sublet with desk + closet",
    host: "Maya R.",
    campus: "Temple University",
    location: "Morgan Hall South",
    price: "$790/month",
    dates: "Jan 10 - May 12",
    description: "Quiet room, furnished, good light, and fast walk to main campus buildings.",
    photoHint: "Desk, bed, and window view",
  },
  {
    id: "offer-2",
    stayMode: "Few Months",
    title: "Summer room for 3 months",
    host: "Jordan T.",
    campus: "Temple University",
    location: "Cecil B. Moore",
    price: "$740/month",
    dates: "May 20 - Aug 20",
    description: "Ideal for internships or summer classes. Clean setup and easy move-in.",
    photoHint: "Furnished room with dresser",
  },
  {
    id: "offer-3",
    stayMode: "One Month",
    title: "One-month furnished room",
    host: "Sana L.",
    campus: "Drexel University",
    location: "University City",
    price: "$820/month",
    dates: "July only",
    description: "Flexible one-month stay with furnished basics and shared kitchen access.",
    photoHint: "Bedside table + lamp",
  },
  {
    id: "offer-4",
    stayMode: "Short Stay",
    title: "Crash pad for a few nights",
    host: "Chris D.",
    campus: "Temple University",
    location: "Near Charles Library",
    price: "$30/night",
    dates: "1-2 nights to 1 week",
    description: "Short-stay option for visiting friends, move-in overlap, or quick weekend needs.",
    photoHint: "Couch corner + side table",
  },
] as const;

const roomRequests = [
  {
    id: "request-1",
    stayMode: "Semester",
    student: "Aaliyah P.",
    campus: "Temple University",
    budget: "Up to $820/month",
    location: "Near main campus",
    description: "Looking for a semester place with a desk and a quiet weekday vibe.",
  },
  {
    id: "request-2",
    stayMode: "Few Months",
    student: "Devon S.",
    campus: "Temple University",
    budget: "Up to $780/month",
    location: "Close to SEPTA or campus",
    description: "Need a summer sublet for classes and part-time work from June to August.",
  },
  {
    id: "request-3",
    stayMode: "Short Stay",
    student: "Rina M.",
    campus: "Temple University",
    budget: "Up to $35/night",
    location: "Walkable to library",
    description: "Need a short stay for 3 nights while waiting on lease timing.",
  },
] as const;

export default function RoomSwapPage() {
  const [activeMode, setActiveMode] = useState<(typeof stayModes)[number]>("Semester");
  const [postType, setPostType] = useState<(typeof postTypes)[number]>("I Have a Room");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [dates, setDates] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const filteredOffers = roomOffers.filter((offer) => offer.stayMode === activeMode);
  const filteredRequests = roomRequests.filter((request) => request.stayMode === activeMode);

  const applyOfferTemplate = (template: (typeof offerTemplates)[number]) => {
    setPostType("I Have a Room");
    setActiveMode(template.stayMode);
    setTitle(template.title);
    setPrice(template.price);
    setDates(template.dates);
    setLocation(template.location);
    setDescription(template.description);
  };

  const applySeekerTemplate = (template: (typeof seekerTemplates)[number]) => {
    setPostType("I Need a Room");
    setActiveMode(template.stayMode);
    setTitle(template.title);
    setPrice(template.price);
    setDates(template.dates);
    setLocation(template.location);
    setDescription(template.description);
  };

  const openChat = (heading: string, message: string) => {
    setChatTitle(heading);
    setChatMessage(message);
    setChatOpen(true);
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
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
            Room Swap
          </div>
        </header>

        <section className="grid gap-4 px-1 py-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div>
            <p className="section-kicker !px-0">The Room Swap</p>
            <h1 className="mt-3 max-w-4xl font-display text-[2.35rem] font-extrabold leading-[0.94] tracking-[-0.06em] sm:text-[3.5rem]">
              Semester and few-month
              <span className="hero-gradient-title block"> student stays first.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/52">
              Semester and few-month stays first. Room posts and room requests stay in one place.
            </p>

            <div className="mt-5 inline-flex flex-wrap rounded-full border border-white/10 bg-white/5 p-1">
              {stayModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    activeMode === mode ? "bg-white text-black" : "text-white/60 hover:bg-white/5 hover:text-white/84"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
              <div className="page-card p-3.5">
                <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                <p className="mt-3 text-[15px] font-semibold text-white">Semester + few months</p>
                <p className="mt-1 text-[11px] text-white/42">Main focus</p>
              </div>
              <div className="page-card p-3.5">
                <Clock3 className="h-4 w-4 text-[var(--accent)]" />
                <p className="mt-3 text-[15px] font-semibold text-white">1 month + short stays</p>
                <p className="mt-1 text-[11px] text-white/42">Also supported</p>
              </div>
              <div className="page-card p-3.5">
                <Search className="h-4 w-4 text-[var(--accent)]" />
                <p className="mt-3 text-[15px] font-semibold text-white">Posts + requests</p>
                <p className="mt-1 text-[11px] text-white/42">Same section</p>
              </div>
            </div>
          </div>

          <section className="page-card p-4">
            <div className="flex flex-wrap gap-2">
              {postTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPostType(item)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    postType === item
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/5 text-white/62 hover:text-white/82"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                Easy Post Template
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {postType === "I Have a Room"
                  ? offerTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => applyOfferTemplate(template)}
                        className="capsule-secondary px-3.5 py-1.5 text-[13px] font-semibold text-white/74 transition hover:bg-white/6"
                      >
                        {template.label}
                      </button>
                    ))
                  : seekerTemplates.map((template) => (
                      <button
                        key={template.label}
                        type="button"
                        onClick={() => applySeekerTemplate(template)}
                        className="capsule-secondary px-3.5 py-1.5 text-[13px] font-semibold text-white/74 transition hover:bg-white/6"
                      >
                        {template.label}
                      </button>
                    ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Spring semester sublet near campus"
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25"
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
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25"
                />
              </label>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Dates
                </span>
                <div className="flex items-center rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5">
                  <CalendarDays className="mr-3 h-4 w-4 text-[var(--accent)]" />
                  <input
                    value={dates}
                    onChange={(event) => setDates(event.target.value)}
                    placeholder="Jan 8 - May 10"
                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/25"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                  Location
                </span>
                <div className="flex items-center rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5">
                  <MapPin className="mr-3 h-4 w-4 text-[var(--accent)]" />
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Morgan Hall, Charles Library area"
                    className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/25"
                  />
                </div>
              </label>
            </div>

            <label className="mt-3 block">
              <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                Description
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the room, timing, furniture, budget, or what kind of stay you need."
                className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-white/25"
              />
            </label>

            <label className="mt-4 flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center transition hover:border-white/25">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = event.target.files;
                  if (!files) return;
                  setPhotos(Array.from(files).slice(0, 5).map((file) => file.name));
                }}
              />
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/6 text-[var(--accent)]">
                <ImageUp className="h-5 w-5" />
              </div>
              <p className="mt-3 text-[13px] font-semibold text-white">Upload room photos</p>
              <p className="mt-1 text-[11px] text-white/38">Up to 5 photos</p>
              <p className="mt-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/62">
                {photos.length ? `${photos.length} photos ready` : "No photos yet"}
              </p>
            </label>

            <button
              type="button"
              className="capsule-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold"
            >
              Post to Room Swap
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </section>

        <section className="mt-2">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="section-kicker !mt-0 !px-0">Available Rooms</p>
              <p className="mt-1 text-[12px] text-white/42">Semester and few-month stays first.</p>
            </div>
            <div className="page-chip hidden items-center gap-2 sm:inline-flex">
              <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
              Verified Student
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filteredOffers.map((offer) => (
              <article key={offer.id} className="page-card p-3.5">
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(18,214,255,0.08))] text-[13px] font-semibold text-white/70">
                  {offer.photoHint}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[16px] font-semibold text-white">{offer.title}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/46">
                      <span>{offer.host}</span>
                      <span className="rounded-full border border-[rgba(18,214,255,0.22)] bg-[rgba(18,214,255,0.08)] px-2.5 py-1 font-semibold text-[var(--accent)]">
                        Verified Student
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/66">{offer.stayMode}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-[var(--accent)]">{offer.price}</span>
                  <span className="text-white/42">{offer.dates}</span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
                  {offer.campus} • {offer.location}
                </div>
                <p className="mt-3 text-[13px] leading-5 text-white/54">{offer.description}</p>
                <button
                  type="button"
                  onClick={() =>
                    openChat(
                      offer.title,
                      `Hi ${offer.host.split(" ")[0]}, I saw your ${offer.stayMode.toLowerCase()} post on MyDormStash. Is it still available?`,
                    )
                  }
                  className="capsule-primary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-[13px] font-semibold"
                >
                  Request to Stay
                  <ChevronRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between px-1">
            <div>
              <p className="section-kicker !mt-0 !px-0">Students Looking for a Room</p>
              <p className="mt-1 text-[12px] text-white/42">Match students who still need a place.</p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs text-white/42">
              <Search className="h-3.5 w-3.5 text-[var(--accent)]" />
              Same-section demand view
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {filteredRequests.map((request) => (
              <article key={request.id} className="page-card p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">{request.student}</h2>
                    <p className="mt-2 text-xs text-white/42">{request.campus}</p>
                  </div>
                  <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/66">{request.stayMode}</span>
                </div>
                <div className="mt-3 space-y-1.5 text-[13px]">
                  <p className="text-[var(--accent)]">{request.budget}</p>
                  <p className="text-white/52">{request.location}</p>
                </div>
                <p className="mt-3 text-[13px] leading-5 text-white/54">{request.description}</p>
                <button
                  type="button"
                  onClick={() =>
                    openChat(
                      `For ${request.student}`,
                      `Hi ${request.student.split(" ")[0]}, I may have a ${request.stayMode.toLowerCase()} option that fits your post. Are you still looking?`,
                    )
                  }
                  className="capsule-secondary mt-4 inline-flex w-full items-center justify-center gap-2 px-5 py-2.5 text-[13px]"
                >
                  <Send className="h-4 w-4 text-[var(--accent)]" />
                  Message About a Match
                </button>
              </article>
            ))}
          </div>
        </section>
      </section>

      {chatOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.58)]">
          <button type="button" aria-label="Close chat" className="absolute inset-0" onClick={() => setChatOpen(false)} />
          <aside
            className="page-card absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-none border-l border-white/10 bg-[rgba(7,10,15,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-swap-chat-title"
          >
            <div className="flex items-start justify-between border-b border-white/8 px-5 py-5">
              <div>
                <p className="section-kicker !px-0 !text-white/32">Room Match Message</p>
                <h2
                  id="room-swap-chat-title"
                  className="mt-2 font-display text-[1.25rem] font-bold tracking-[-0.03em] text-white"
                >
                  {chatTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-full border border-white/10 p-2 text-white/55 transition hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 px-5 py-5">
              <div className="page-card p-4">
                <p className="text-sm leading-6 text-white/58">
                  Use this to coordinate rent, dates, room fit, roommates, and move-in timing.
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
