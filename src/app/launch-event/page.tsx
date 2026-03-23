"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock3, MapPin, PartyPopper, Sparkles, Ticket, Users } from "lucide-react";
import { useMemo, useState } from "react";

const eventTypes = ["Party", "Study Jam", "Club Event", "Popup", "Open Mic", "Signup"] as const;

const promoTips = [
  "Lead with the vibe first so students instantly know why it matters.",
  "Keep the time window tight and easy to scan on mobile.",
  "Use a clear location students already recognize on campus.",
] as const;

const quickEventTemplates = [
  {
    label: "Study Jam",
    headline: "Late Night Study Jam",
    type: "Study Jam",
    description: "Open tables, low-pressure study energy, and a quick campus meetup before exams hit.",
    location: "Charles Library",
    startTime: "8:00 PM",
    endTime: "10:00 PM",
    cta: "Pull up with your notes",
  },
  {
    label: "Popup",
    headline: "Campus Popup Drop",
    type: "Popup",
    description: "Quick student popup with limited stock and fast campus pickup.",
    location: "Student Center",
    startTime: "1:00 PM",
    endTime: "3:00 PM",
    cta: "Come early for first pick",
  },
] as const;

export default function LaunchEventPage() {
  const [headline, setHeadline] = useState("");
  const [eventType, setEventType] = useState<(typeof eventTypes)[number]>("Party");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [cta, setCta] = useState("");
  const [extras, setExtras] = useState<string[]>(["Free Entry"]);

  const toggleExtra = (value: string) => {
    setExtras((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const applyTemplate = (template: (typeof quickEventTemplates)[number]) => {
    setHeadline(template.headline);
    setEventType(template.type as (typeof eventTypes)[number]);
    setDescription(template.description);
    setLocation(template.location);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
    setCta(template.cta);
  };

  const liveHeadline = headline || "Your event headline";
  const liveDescription =
    description ||
    "Drop the vibe, why people should show up, and what makes this worth stopping by for tonight.";
  const eventMeta = useMemo(
    () => ({
      date: eventDate || "Date pending",
      time: startTime && endTime ? `${startTime} to ${endTime}` : "Time pending",
      location: location || "Campus location coming soon",
      cta: cta || "RSVP / pull up",
    }),
    [cta, endTime, eventDate, location, startTime],
  );

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/7 bg-[rgba(20,22,27,0.96)] px-1 py-5 backdrop-blur">
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

          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-white/60 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Event builder
          </div>
        </header>

        <section className="px-1 pt-8 text-center">
          <p className="section-kicker">Launch Event</p>
          <h1 className="mt-3 font-display text-[1.95rem] font-bold uppercase tracking-[0.22em] text-white sm:text-[2.35rem]">
            Launch Event
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-6 text-white/42 sm:text-[15px]">
            Spin up parties, study jams, club activations, and pop-up moments with a fast listing
            flow that matches the rest of MyDormStash.
          </p>
        </section>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[20px] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <PartyPopper className="h-4 w-4" />
              Event Prompt
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <span className="text-[13px] font-semibold text-white">Quick Templates</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickEventTemplates.map((template) => (
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
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Headline</span>
                <p className="mt-1 text-[12px] leading-5 text-white/38">
                  Lead with the drop, collab, or reason students should stop scrolling.
                </p>
                <input
                  type="text"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Late Night Study Jam at Charles"
                  className="mt-3 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div>
                <span className="text-[13px] font-semibold text-white">Event Type</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        eventType === type
                          ? "border-[rgba(70,191,255,0.3)] bg-[rgba(70,191,255,0.08)] text-[var(--accent)]"
                          : "border-[var(--border)] bg-white/5 text-white/50 hover:border-white/25 hover:text-white/80"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">The Vibe</span>
                <p className="mt-1 text-[12px] leading-5 text-white/38">
                  Keep it short, specific, and social. What should people expect when they pull up?
                </p>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Open invite for Temple students with music, snacks, and low-pressure networking before midterms hit."
                  className="mt-3 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] leading-6 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Event Date
                  </span>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(event) => setEventDate(event.target.value)}
                    placeholder="Friday, March 22"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Location
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Student Center South Lobby"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    Start Time
                  </span>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    placeholder="7:00 PM"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                    End Time
                  </span>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(event) => setEndTime(event.target.value)}
                    placeholder="10:00 PM"
                    className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Call to Action</span>
                <p className="mt-1 text-[12px] leading-5 text-white/38">
                  Tell students what to do next: RSVP, show up, bring friends, or sign up.
                </p>
                <input
                  type="text"
                  value={cta}
                  onChange={(event) => setCta(event.target.value)}
                  placeholder="RSVP now and bring your roommate"
                  className="mt-3 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div>
                <span className="text-[13px] font-semibold text-white">Quick Tags</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Free Entry", "Food", "Live DJ", "RSVP", "Giveaway", "Club Members"].map((item) => {
                    const active = extras.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleExtra(item)}
                        className={`rounded-full border px-3 py-2 text-[12px] font-semibold transition ${
                          active
                            ? "border-[rgba(255,62,165,0.3)] bg-[rgba(255,62,165,0.12)] text-[var(--accent)]"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/78"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-[20px] border border-white/10 bg-white/5 px-5 py-5">
              <p className="section-kicker !mt-0 !px-0">Live Preview</p>
              <div className="mt-4 rounded-[18px] border border-[rgba(255,62,165,0.25)] bg-[linear-gradient(135deg,_rgba(51,65,92,0.65)_0%,_rgba(255,62,165,0.12)_100%)] p-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {eventType}
                </div>
                <h2 className="mt-4 font-display text-[19px] font-bold tracking-[-0.03em] text-white">
                  {liveHeadline}
                </h2>
                <p className="mt-3 text-[13px] leading-6 text-white/50">{liveDescription}</p>

                <div className="mt-5 space-y-2 text-[12px] text-white/58">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                    <span>{eventMeta.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[var(--accent)]" />
                    <span>{eventMeta.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--accent)]" />
                    <span>{eventMeta.location}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {extras.length > 0 ? (
                    extras.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/72"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-[11px] text-white/34">Add quick tags to highlight the draw.</span>
                  )}
                </div>

                <div className="mt-5 inline-flex rounded-[12px] bg-[var(--accent)] px-4 py-3 text-[12px] font-bold text-white">
                  {eventMeta.cta}
                </div>
              </div>
            </section>

            <section className="rounded-[20px] border border-white/10 bg-white/5 px-5 py-5">
              <p className="section-kicker !mt-0 !px-0">Promotion Tips</p>
              <div className="mt-4 space-y-3">
                {promoTips.map((tip, index) => (
                  <div
                    key={tip}
                    className="flex items-start gap-3 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-3"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(70,191,255,0.12)] text-[12px] font-bold text-[var(--accent)]">
                      {index + 1}
                    </span>
                    <p className="text-[12px] leading-5 text-white/55">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/50">
                  <Users className="h-4 w-4 text-[var(--accent)]" />
                  Best Use Cases
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Study Jam", "Fundraiser Collab", "Open Mic", "Club Mixer", "Popup Drop"].map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/72"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 text-[12px] text-white/42">
                  <Ticket className="h-4 w-4 text-[var(--accent)]" />
                  Add the key reason to pull up right in the headline.
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
