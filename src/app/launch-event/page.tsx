"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock3, MapPin, PartyPopper, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentProfile, isVerifiedStudentLoggedIn } from "@/lib/app-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const eventTypes = ["Frat Party", "Club Meeting", "Study Jam", "Student Assoc. Event"] as const;

const eventTemplates = [
  {
    label: "Frat Party",
    eventType: "Frat Party",
    headline: "Late Night Frat Link",
    vibe: "BYOB, campus fits, and pull-up energy before the line gets wild.",
    location: "Off Broad near campus",
    startTime: "10:30 PM",
    endTime: "1:30 AM",
    extras: ["BYOB", "Late Night", "Friends"],
  },
  {
    label: "Club Meeting",
    eventType: "Club Meeting",
    headline: "Weekly Club Check-In",
    vibe: "Free pizza, quick updates, and new faces welcome.",
    location: "Student Center",
    startTime: "6:00 PM",
    endTime: "7:15 PM",
    extras: ["Free Pizza", "Open Join", "Campus Org"],
  },
  {
    label: "Study Jam",
    eventType: "Study Jam",
    headline: "Finals Grind Study Jam",
    vibe: "Finals Grind, quiet tables, and everybody locked in together.",
    location: "Charles Library",
    startTime: "8:00 PM",
    endTime: "11:00 PM",
    extras: ["Finals Grind", "Quiet", "Notes"],
  },
  {
    label: "Student Assoc. Event",
    eventType: "Student Assoc. Event",
    headline: "Student Assoc. Mixer",
    vibe: "Free pizza, quick intros, and campus networking without the awkward drag.",
    location: "Student Center South",
    startTime: "5:30 PM",
    endTime: "7:00 PM",
    extras: ["Free Pizza", "Networking", "Campus Org"],
  },
] as const;

type EventForm = {
  headline: string;
  eventType: (typeof eventTypes)[number];
  vibe: string;
  eventDate: string;
  location: string;
  startTime: string;
  endTime: string;
  major: string;
};

type EventListingInsert = {
  title: string;
  price: number;
  category: string;
  description: string;
  poster_name: string;
  major: string | null;
  class_year: string | null;
  contact_email: string | null;
  email: string | null;
  event_type: string;
  vibe: string;
  event_date: string;
  location: string;
  start_time: string;
  end_time: string;
};

const initialForm: EventForm = {
  headline: "",
  eventType: "Frat Party",
  vibe: "",
  eventDate: "",
  location: "",
  startTime: "",
  endTime: "",
  major: "",
};

export default function LaunchEventPage() {
  const router = useRouter();
  const [form, setForm] = useState<EventForm>(initialForm);
  const [extras, setExtras] = useState<string[]>(["Campus"]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const profile = useMemo(() => getStudentProfile(), []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setIsLoggedIn(isVerifiedStudentLoggedIn());
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(data.session) || isVerifiedStudentLoggedIn());
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(session) || isVerifiedStudentLoggedIn());
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateField = <K extends keyof EventForm>(field: K, value: EventForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleExtra = (value: string) => {
    setExtras((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
  };

  const applyTemplate = (template: (typeof eventTemplates)[number]) => {
    setForm((current) => ({
      ...current,
      headline: template.headline,
      eventType: template.eventType,
      vibe: template.vibe,
      location: template.location,
      startTime: template.startTime,
      endTime: template.endTime,
    }));
    setExtras([...template.extras]);
  };

  const liveHeadline = form.headline || "Your event headline";
  const liveVibe = form.vibe || "Quick event preview for Temple students scrolling campus right now.";

  const previewMeta = useMemo(
    () => ({
      date: form.eventDate || "Date pending",
      time: form.startTime && form.endTime ? `${form.startTime} to ${form.endTime}` : "Time pending",
      location: form.location || "Campus location pending",
    }),
    [form.endTime, form.eventDate, form.location, form.startTime],
  );

  const handlePostEvent = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setPostError("Supabase is not configured.");
      return;
    }

    if (!isLoggedIn) {
      setPostError("Log in first to post an event.");
      return;
    }

    if (
      !form.headline.trim() ||
      !form.vibe.trim() ||
      !form.eventDate.trim() ||
      !form.location.trim() ||
      !form.startTime.trim() ||
      !form.endTime.trim()
    ) {
      setPostError("Fill out the event details first.");
      return;
    }

    try {
      setPosting(true);
      setPostError("");
      setSuccessMessage("");

      const payload: EventListingInsert = {
        title: form.headline.trim(),
        price: 0,
        category: "Event",
        description: [
          `Type: ${form.eventType}`,
          `Vibe: ${form.vibe.trim()}`,
          `Date: ${form.eventDate.trim()}`,
          `Location: ${form.location.trim()}`,
          `Time: ${form.startTime.trim()} to ${form.endTime.trim()}`,
          extras.length ? `Tags: ${extras.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join(" | "),
        poster_name: profile.name.trim() || "Temple Student",
        major: profile.major.trim() || form.major.trim() || null,
        class_year: profile.classYear.trim() || null,
        contact_email: profile.email.trim() || null,
        email: profile.email.trim() || null,
        event_type: form.eventType,
        vibe: form.vibe.trim(),
        event_date: form.eventDate.trim(),
        location: form.location.trim(),
        start_time: form.startTime.trim(),
        end_time: form.endTime.trim(),
      };

      const { error } = await supabase.from("listings").insert(payload as never);

      if (error) {
        throw new Error("Could not post the event.");
      }

      setSuccessMessage("Event Live!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch (eventError) {
      setPostError(eventError instanceof Error ? eventError.message : "Could not post the event.");
    } finally {
      setPosting(false);
    }
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
            Event builder
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Launch Event</p>
          <h1 className="page-title">Launch Event</h1>
          <p className="page-copy">Build a fast Temple event post and push it live to the feed.</p>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="page-card px-4 py-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <PartyPopper className="h-4 w-4" />
              Event Prompt
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <span className="text-[13px] font-semibold text-white">Auto-Templates</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {eventTemplates.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Headline</span>
                <input
                  type="text"
                  value={form.headline}
                  onChange={(event) => updateField("headline", event.target.value)}
                  placeholder="Temple rooftop link tonight"
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div>
                <span className="text-[13px] font-semibold text-white">Category</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {eventTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("eventType", type)}
                      className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                        form.eventType === type
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
                <textarea
                  rows={3}
                  value={form.vibe}
                  onChange={(event) => updateField("vibe", event.target.value)}
                  placeholder="BYOB, free pizza, or finals grind. Keep it direct."
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Date</span>
                  <input
                    type="text"
                    value={form.eventDate}
                    onChange={(event) => updateField("eventDate", event.target.value)}
                    placeholder="Friday, April 18"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Location</span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="Student Center / Off Broad"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Major (optional)</span>
                  <input
                    type="text"
                    value={form.major}
                    onChange={(event) => updateField("major", event.target.value)}
                    placeholder="Computer Science"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">Start Time</span>
                  <input
                    type="text"
                    value={form.startTime}
                    onChange={(event) => updateField("startTime", event.target.value)}
                    placeholder="8:00 PM"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">End Time</span>
                  <input
                    type="text"
                    value={form.endTime}
                    onChange={(event) => updateField("endTime", event.target.value)}
                    placeholder="11:00 PM"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <div>
                <span className="text-[13px] font-semibold text-white">Campus Tags</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["BYOB", "Free Pizza", "Finals Grind", "Pull Up", "RSVP", "Friends"].map((item) => {
                    const active = extras.includes(item);

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleExtra(item)}
                        className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                          active
                            ? "border-[rgba(70,191,255,0.3)] bg-[rgba(70,191,255,0.12)] text-[var(--accent)]"
                            : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/78"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {postError ? (
                <div className="rounded-[14px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] px-3 py-3 text-[12px] text-[#F09595]">
                  {postError}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-[14px] border border-[rgba(70,191,255,0.25)] bg-[rgba(70,191,255,0.08)] px-3 py-3 text-[12px] font-semibold text-[var(--accent)]">
                  🎉 {successMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={handlePostEvent}
                disabled={posting}
                className="capsule-primary inline-flex w-full items-center justify-center px-5 py-3 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post Event"}
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="page-card px-4 py-4">
              <p className="section-kicker !mt-0 !px-0">Live Preview</p>
              <div className="mt-4 rounded-[18px] border border-[rgba(70,191,255,0.22)] bg-[linear-gradient(135deg,_rgba(26,34,46,0.9)_0%,_rgba(18,214,255,0.08)_100%)] p-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {form.eventType}
                </div>
                <h2 className="mt-3 font-display text-[17px] font-bold tracking-[-0.03em] text-white">{liveHeadline}</h2>
                <p className="mt-1 text-[11px] text-white/54">
                  {profile.name || "Temple Student"}
                  {profile.major ? ` · ${profile.major}` : ""}
                  {profile.classYear ? ` · ${profile.classYear}` : ""}
                </p>
                <p className="mt-2 text-[12px] leading-5 text-white/56">{liveVibe}</p>

                <div className="mt-5 space-y-2 text-[12px] text-white/60">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[var(--accent)]" />
                    <span>{previewMeta.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-[var(--accent)]" />
                    <span>{previewMeta.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[var(--accent)]" />
                    <span>{previewMeta.location}</span>
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
                    <span className="text-[11px] text-white/34">Add tags to shape the draw.</span>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
