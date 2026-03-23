"use client";

import Link from "next/link";
import { ArrowLeft, Check, HandCoins, MapPin, Wallet } from "lucide-react";
import { useState } from "react";

const paymentOptions = [
  { id: "venmo", label: "Venmo", detailLabel: "Handle", placeholder: "@scienceclub" },
  { id: "cash", label: "Cash on Site" },
  { id: "digital", label: "MyDormStash Digital Pay" },
] as const;

const quickFundraisers = [
  {
    label: "Donut drop",
    headline: "Warm Donuts - Robotics Club",
    description: "Help the Robotics Team get to Nationals. All proceeds go toward travel and build costs.",
    price: "12",
    location: "Bell Tower",
    startTime: "11:00 AM",
    endTime: "1:00 PM",
  },
  {
    label: "Cookie table",
    headline: "Study Week Cookie Sale",
    description: "Funds support our student org event budget. Every box helps cover supplies and campus programming.",
    price: "8",
    location: "Student Center Lobby",
    startTime: "2:00 PM",
    endTime: "4:00 PM",
  },
] as const;

export default function FundraiseFastPage() {
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venmoHandle, setVenmoHandle] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string[]>(["venmo"]);

  const togglePaymentMethod = (method: string) => {
    setPaymentMethod((current) =>
      current.includes(method) ? current.filter((item) => item !== method) : [...current, method],
    );
  };

  const applyTemplate = (template: (typeof quickFundraisers)[number]) => {
    setHeadline(template.headline);
    setDescription(template.description);
    setPrice(template.price);
    setLocation(template.location);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
  };

  const headlineCount = headline.length;
  const descriptionLines = description
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean).length;

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-4xl">
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
            Fundraiser builder
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Fundraise Fast</p>
          <h1 className="page-title">
            Fundraise Fast
          </h1>
          <p className="page-copy">
            Build a clear, campus-ready fundraiser listing with a strong hook, a short why, and
            fast logistics students can scan in seconds.
          </p>
        </section>

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="page-card px-5 py-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <HandCoins className="h-4 w-4" />
              Listing Prompt
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <span className="text-[13px] font-semibold text-white">Quick Templates</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickFundraisers.map((template) => (
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
                <span className="text-[13px] font-semibold text-white">Headline (The Hook)</span>
                <p className="mt-1 text-[12px] leading-5 text-white/38">
                  Keep it under 50 characters. What are you selling or doing?
                </p>
                <input
                  type="text"
                  maxLength={50}
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Warm Krispy Kreme Donuts - Science Club"
                  className="mt-3 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
                <p className="mt-2 text-right text-[11px] text-white/28">{headlineCount} / 50</p>
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">The Why (Description)</span>
                <p className="mt-1 text-[12px] leading-5 text-white/38">
                  Tell students exactly where their money is going in 2 sentences.
                </p>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Help the Robotics Team get to Nationals. All proceeds cover travel kits and competition fees."
                  className="mt-3 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] leading-6 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
                <p className="mt-2 text-right text-[11px] text-white/28">{descriptionLines} / 2 sentence target</p>
              </label>

              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-[13px] font-semibold text-white">The Logistics (Quick Info)</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                      Price Point
                    </span>
                    <div className="mt-2 flex rounded-[14px] border border-white/10 bg-white/5">
                      <span className="flex items-center px-4 text-[14px] text-white/45">$</span>
                      <input
                        type="text"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        placeholder="Enter amount"
                        className="w-full bg-transparent py-3 pr-4 text-[14px] outline-none placeholder:text-white/25"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                      Pickup/Event Location
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      placeholder="Bell Tower, Student Center Lobby"
                      className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                    />
                  </label>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
                      Start Time
                    </span>
                    <input
                      type="text"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      placeholder="11:00 AM"
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
                      placeholder="2:00 PM"
                      className="mt-2 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                    />
                  </label>
                </div>

                <p className="mt-3 text-[12px] leading-5 text-white/34">
                  Fast fundraisers usually perform best in a 2 to 4 hour window.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-[13px] font-semibold text-white">Payment Method</span>
                </div>

                <div className="mt-4 space-y-3">
                  {paymentOptions.map((option) => {
                    const selected = paymentMethod.includes(option.id);

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-4 py-4 transition hover:bg-white/8 ${
                          selected ? "border-[rgba(70,191,255,0.28)] bg-[rgba(70,191,255,0.08)]" : "border-white/10 bg-white/5"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => togglePaymentMethod(option.id)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--accent)]"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold text-white">{option.label}</p>
                          {"detailLabel" in option && selected ? (
                            <div className="mt-3 flex items-center rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-2.5">
                              <span className="pr-2 text-[12px] uppercase tracking-[0.04em] text-white/35">
                                {option.detailLabel}
                              </span>
                              <input
                                type="text"
                                value={venmoHandle}
                                onChange={(event) => setVenmoHandle(event.target.value)}
                                placeholder={option.placeholder}
                                className="w-full bg-transparent text-[13px] outline-none placeholder:text-white/25"
                              />
                            </div>
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="page-card px-5 py-5">
              <p className="section-kicker !mt-0 !px-0">Preview</p>
              <div className="mt-4 rounded-[18px] border border-[rgba(255,62,165,0.22)] bg-[linear-gradient(180deg,_rgba(255,62,165,0.08)_0%,_rgba(26,29,36,1)_100%)] p-4">
                <div className="inline-flex rounded-full bg-[rgba(255,255,255,0.08)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                  Fundraise
                </div>
                <h2 className="mt-4 font-display text-[19px] font-bold tracking-[-0.03em] text-white">
                  {headline || "Your fundraiser headline"}
                </h2>
                <p className="mt-3 text-[13px] leading-6 text-white/50">
                  {description ||
                    "Explain where the money goes and why students should show up. Keep it short, specific, and easy to trust."}
                </p>
                <div className="mt-5 grid gap-2 text-[12px] text-white/58">
                  <p>Price: {price ? `$${price}` : "$[Enter Amount]"}</p>
                  <p>Location: {location || "[Bell Tower, Student Center Lobby]"}</p>
                  <p>
                    Time: {startTime || "[Start Time]"} to {endTime || "[End Time]"}
                  </p>
                </div>
              </div>
            </section>

            <section className="page-card px-5 py-5">
              <p className="section-kicker !mt-0 !px-0">Checklist</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Hook stays under 50 characters", done: headlineCount > 0 && headlineCount <= 50 },
                  { label: "Description explains where money goes", done: description.trim().length > 0 },
                  { label: "Time window feels fast and focused", done: Boolean(startTime && endTime) },
                  { label: "At least one payment method selected", done: paymentMethod.length > 0 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-3 py-3"
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        item.done ? "bg-[rgba(70,191,255,0.12)] text-[var(--accent)]" : "bg-white/7 text-white/25"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[12px] text-white/55">{item.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
