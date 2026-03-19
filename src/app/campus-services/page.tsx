"use client";

import Link from "next/link";
import { ArrowLeft, Brush, Hand, Scissors, Send, Sparkles, Star, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";

type ServiceCategory = {
  title: string;
  description: string;
  icon: typeof Scissors;
  provider: string;
  handle: string;
  rating: string;
  accent: string;
};

const services: ServiceCategory[] = [
  {
    title: "Hair Cutting",
    description: "Sharp trims, shape-ups, and clean-up appointments in dorm-friendly setups.",
    icon: Scissors,
    provider: "Aaliyah R.",
    handle: "AR",
    rating: "4.9",
    accent: "from-[#46bfff] to-[#8ad7ff]",
  },
  {
    title: "Braids",
    description: "Student braiders offering knotless, feed-ins, and quick protective styles.",
    icon: Sparkles,
    provider: "Jada T.",
    handle: "JT",
    rating: "4.8",
    accent: "from-[#ff8ec8] to-[#ffc3e3]",
  },
  {
    title: "Nails",
    description: "Press-ons, gel sets, and campus-ready nail appointments with easy booking.",
    icon: Hand,
    provider: "Mia C.",
    handle: "MC",
    rating: "5.0",
    accent: "from-[#d7def0] to-[#ffffff]",
  },
  {
    title: "Makeup",
    description: "Soft glam, event looks, and photoshoot-ready touchups from student artists.",
    icon: Brush,
    provider: "Sami K.",
    handle: "SK",
    rating: "4.9",
    accent: "from-[#ffb07c] to-[#ffd1ad]",
  },
  {
    title: "Moving Help",
    description: "Book extra hands for mini-fridges, bins, boxes, and move-out day hustle.",
    icon: Truck,
    provider: "Devon P.",
    handle: "DP",
    rating: "4.7",
    accent: "from-[#9fb3d9] to-[#d9e2f3]",
  },
];

const quickRequests: Record<string, string> = {
  "Hair Cutting": "Hey! I’d like to request a haircut this week. What times are you free?",
  Braids: "Hi! I’m looking to book a braids appointment. Can I request your next openings?",
  Nails: "Hey! I want to book a nail set soon. What schedule options do you have?",
  Makeup: "Hi! I’m trying to schedule a makeup session. Do you have availability this week?",
  "Moving Help": "Hey! I need help moving dorm items. What time slots can I request?",
};

export default function CampusServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = selectedService ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedService]);

  const openChat = (service: ServiceCategory) => {
    setSelectedService(service);
    setMessage(`Hi ${service.provider.split(" ")[0]}! I'm interested in ${service.title.toLowerCase()}.`);
  };

  const closeChat = () => {
    setSelectedService(null);
    setMessage("");
  };

  const requestSchedule = () => {
    if (!selectedService) return;
    setMessage(quickRequests[selectedService.title]);
  };

  return (
    <main className="min-h-screen bg-[#0B0E14] text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/7 bg-[rgba(11,14,20,0.94)] px-1 py-5 backdrop-blur">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <Link href="/" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            Dorm<span className="text-[var(--accent)]">Stash</span>
          </Link>

          <div className="hidden rounded-full border border-[var(--border)] bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-white/60 sm:inline-flex">
            Student pros live
          </div>
        </header>

        <section className="px-1 pt-8 text-center">
          <p className="section-kicker">Campus Services</p>
          <h1 className="mt-3 font-display text-[1.95rem] font-bold uppercase tracking-[0.22em] text-white sm:text-[2.4rem]">
            Campus Services
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-6 text-white/42 sm:text-[15px]">
            Message student-led providers for grooming, glam, and move-day help without leaving the
            DormStash flow.
          </p>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {services.map(({ title, description, icon: Icon, provider, handle, rating, accent }) => (
            <article
              key={title}
              className="flex min-h-[250px] flex-col justify-between rounded-[18px] border border-white/10 bg-white/5 px-4 py-4 transition hover:scale-[0.99] hover:bg-white/[0.07]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex rounded-[12px] border border-white/10 bg-white/5 p-2.5 text-[var(--accent)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2.5 py-1 text-[11px] font-semibold text-white/72">
                    <Star className="h-3.5 w-3.5 fill-current text-[var(--accent)]" />
                    {rating}
                  </div>
                </div>

                <h2 className="mt-6 font-display text-[15px] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                  {title}
                </h2>
                <p className="mt-1.5 text-[11px] leading-5 text-white/40">{description}</p>

                <div className="mt-5 flex items-center gap-3 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-[13px] font-bold text-[#0B0E14]`}
                  >
                    {handle}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{provider}</p>
                    <p className="mt-1 text-[11px] text-white/40">Temple student provider</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openChat({ title, description, icon: Icon, provider, handle, rating, accent })}
                className="mt-5 inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--accent)] px-4 py-3 text-[12px] font-bold text-white transition hover:opacity-90"
              >
                Message to Schedule
              </button>
            </article>
          ))}
        </section>
      </section>

      {selectedService ? (
        <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.58)]">
          <button type="button" aria-label="Close chat" className="absolute inset-0" onClick={closeChat} />
          <aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0F131B] shadow-[0_24px_80px_rgba(0,0,0,0.42)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campus-services-chat-title"
          >
            <div className="flex items-start justify-between border-b border-white/8 px-5 py-5">
              <div>
                <p className="section-kicker !px-0 !text-white/32">Schedule Chat</p>
                <h2
                  id="campus-services-chat-title"
                  className="mt-2 font-display text-[1.3rem] font-bold tracking-[-0.03em] text-white"
                >
                  {selectedService.title}
                </h2>
                <p className="mt-2 text-[13px] text-white/42">Chat with {selectedService.provider}</p>
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
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${selectedService.accent} text-[12px] font-bold text-[#0B0E14]`}
                  >
                    {selectedService.handle}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{selectedService.provider}</p>
                    <p className="mt-1 text-[11px] text-white/40">Usually replies in under an hour</p>
                  </div>
                </div>

                <p className="mt-4 rounded-[14px] border border-white/8 bg-[rgba(255,255,255,0.03)] px-3 py-3 text-[13px] leading-6 text-white/62">
                  Let them know what service you need, your preferred day, and any timing details.
                </p>

                <button
                  type="button"
                  onClick={requestSchedule}
                  className="mt-4 inline-flex rounded-full border border-[rgba(70,191,255,0.3)] bg-[rgba(70,191,255,0.08)] px-4 py-2 text-[12px] font-semibold text-[var(--accent)] transition hover:bg-[rgba(70,191,255,0.14)]"
                >
                  Request Schedule
                </button>
              </div>
            </div>

            <div className="border-t border-white/8 px-5 py-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.04em] text-white/45">
                  Message
                </span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Type your availability, service request, and any notes..."
                  className="w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-[var(--accent)] px-4 py-3 text-[12px] font-bold text-white transition hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="rounded-[12px] border border-white/10 bg-white/5 px-4 py-3 text-[12px] font-semibold text-white/70 transition hover:bg-white/8"
                >
                  Close
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
