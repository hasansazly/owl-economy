"use client";

import Link from "next/link";
import { ArrowLeft, Brush, Hand, Scissors, Sparkles, Star, Truck, Wrench } from "lucide-react";
import { useMemo, useState } from "react";

type ServiceCategory = "Hair Cutting" | "Braids" | "Nails" | "Makeup" | "Moving Help" | "Tech Support";

type ServiceListing = {
  id: string;
  category: ServiceCategory;
  title: string;
  provider: string;
  email: string;
  location: string;
  description: string;
  rating: string;
};

type ServiceForm = {
  category: ServiceCategory;
  title: string;
  provider: string;
  email: string;
  location: string;
  description: string;
  rating: string;
};

const categoryMeta: Record<
  ServiceCategory,
  {
    icon: typeof Scissors;
    short: string;
    template: Omit<ServiceForm, "provider" | "email">;
  }
> = {
  "Hair Cutting": {
    icon: Scissors,
    short: "Dorm trims and shape-ups.",
    template: {
      category: "Hair Cutting",
      title: "Dorm haircut appointments",
      location: "Morgan Hall / nearby campus",
      description: "Sharp cuts, shape-ups, and quick trims with flexible student hours.",
      rating: "4.9",
    },
  },
  Braids: {
    icon: Sparkles,
    short: "Protective styles and braid installs.",
    template: {
      category: "Braids",
      title: "Student braid appointments",
      location: "Temple area",
      description: "Feed-ins, knotless, and quick braid installs with easy campus scheduling.",
      rating: "4.8",
    },
  },
  Nails: {
    icon: Hand,
    short: "Nail sets and quick campus bookings.",
    template: {
      category: "Nails",
      title: "Campus nail sets",
      location: "Near main campus",
      description: "Press-ons, gel looks, and clean nail appointments with simple scheduling.",
      rating: "5.0",
    },
  },
  Makeup: {
    icon: Brush,
    short: "Soft glam and event-ready looks.",
    template: {
      category: "Makeup",
      title: "Student makeup bookings",
      location: "Temple student center area",
      description: "Soft glam, photoshoot looks, and event makeup from student artists.",
      rating: "4.9",
    },
  },
  "Moving Help": {
    icon: Truck,
    short: "Extra hands for move-in and move-out.",
    template: {
      category: "Moving Help",
      title: "Dorm moving help",
      location: "Temple campus",
      description: "Help with bins, boxes, mini-fridges, and move-day carrying around campus.",
      rating: "4.7",
    },
  },
  "Tech Support": {
    icon: Wrench,
    short: "Laptop, setup, and quick fix help.",
    template: {
      category: "Tech Support",
      title: "Student tech support",
      location: "Charles Library / campus",
      description: "Wi-Fi setup, printer help, laptop basics, and quick student tech fixes.",
      rating: "4.8",
    },
  },
};

const categories = Object.keys(categoryMeta) as ServiceCategory[];

const initialForm: ServiceForm = {
  category: "Hair Cutting",
  title: "",
  provider: "",
  email: "",
  location: "",
  description: "",
  rating: "4.8",
};

function buildContactHref(title: string, email: string) {
  const subject = encodeURIComponent(`Schedule for ${title} on MyDormStash`);
  const body = encodeURIComponent(
    "Hi, I saw your service on MyDormStash. Are you available to schedule a time on campus?",
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

export default function CampusServicesPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("Hair Cutting");
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [form, setForm] = useState<ServiceForm>(initialForm);
  const [formError, setFormError] = useState("");
  const [postedMessage, setPostedMessage] = useState("");

  const filteredServices = useMemo(
    () => services.filter((service) => service.category === activeCategory),
    [activeCategory, services],
  );

  const updateField = <K extends keyof ServiceForm>(field: K, value: ServiceForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyTemplate = (category: ServiceCategory) => {
    const template = categoryMeta[category].template;
    setForm((current) => ({
      ...current,
      category,
      title: template.title,
      location: template.location,
      description: template.description,
      rating: template.rating,
    }));
    setActiveCategory(category);
    setFormError("");
    setPostedMessage("");
  };

  const submitService = () => {
    setFormError("");
    setPostedMessage("");

    if (
      !form.provider.trim() ||
      !form.email.trim() ||
      !form.title.trim() ||
      !form.location.trim() ||
      !form.description.trim()
    ) {
      setFormError("Fill out the service post first.");
      return;
    }

    const newListing: ServiceListing = {
      id: `service-${Date.now()}`,
      category: form.category,
      title: form.title.trim(),
      provider: form.provider.trim(),
      email: form.email.trim().toLowerCase(),
      location: form.location.trim(),
      description: form.description.trim(),
      rating: form.rating,
    };

    setServices((current) => [newListing, ...current]);
    setActiveCategory(form.category);
    setPostedMessage("Service live.");
    setForm(initialForm);
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

          <div className="page-chip hidden sm:inline-flex">Service board</div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Campus Services</p>
          <h1 className="page-title">Campus Services</h1>
          <p className="page-copy">Post a student service fast, then let people contact you to schedule.</p>
        </section>

        <section className="mt-4">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const Icon = categoryMeta[category].icon;
              const active = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-semibold transition ${
                    active
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {category}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.96fr_1.04fr]">
          <section className="page-card px-4 py-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Post a Service
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <span className="text-[13px] font-semibold text-white">Quick Templates</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => applyTemplate(category)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Service Category</span>
                <select
                  value={form.category}
                  onChange={(event) => updateField("category", event.target.value as ServiceCategory)}
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] text-white outline-none focus:border-[rgba(70,191,255,0.35)]"
                >
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-[#0b0e14] text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Dorm haircut appointments"
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[13px] font-semibold text-white">Your Name</span>
                  <input
                    type="text"
                    value={form.provider}
                    onChange={(event) => updateField("provider", event.target.value)}
                    placeholder="Aaliyah R."
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>

                <label className="block">
                  <span className="text-[13px] font-semibold text-white">Contact Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="you@temple.edu"
                    className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Location</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Student Center / Morgan Hall"
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <label className="block">
                <span className="text-[13px] font-semibold text-white">Description</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  placeholder="Say what you offer, when you’re free, and what students should know."
                  className="mt-2 w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-white/25 focus:border-[rgba(70,191,255,0.35)]"
                />
              </label>

              <div>
                <span className="text-[13px] font-semibold text-white">Rating</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["4.5", "4.7", "4.8", "4.9", "5.0"].map((value) => {
                    const active = form.rating === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => updateField("rating", value)}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                          active
                            ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                            : "border-white/10 bg-white/5 text-white/64 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Star className={`h-3.5 w-3.5 ${active ? "fill-current" : ""}`} />
                          {value}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError ? (
                <div className="rounded-[14px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] px-3 py-3 text-[12px] text-[#F09595]">
                  {formError}
                </div>
              ) : null}

              {postedMessage ? (
                <div className="rounded-[14px] border border-cyan-400/20 bg-cyan-400/8 px-3 py-3 text-[12px] font-semibold text-cyan-300">
                  {postedMessage}
                </div>
              ) : null}

              <button
                type="button"
                onClick={submitService}
                className="capsule-primary inline-flex w-full items-center justify-center px-5 py-3 text-[13px] font-semibold"
              >
                Post Service
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="page-card px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="section-kicker !mt-0 !px-0">Live Services</p>
                  <p className="mt-2 text-[13px] text-white/48">{categoryMeta[activeCategory].short}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-white/70">
                  {activeCategory}
                </div>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="page-card px-4 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Sparkles className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <h2 className="mt-4 text-[18px] font-semibold text-white">No services posted yet</h2>
                <p className="mx-auto mt-2 max-w-md text-[13px] leading-6 text-white/46">
                  This category is empty right now. Use the form to post the first service listing.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredServices.map((service) => {
                  const Icon = categoryMeta[service.category].icon;

                  return (
                    <article key={service.id} className="page-card flex flex-col gap-4 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-[var(--accent)]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-semibold text-white">{service.title}</h3>
                            <p className="mt-1 text-[12px] text-white/42">{service.provider}</p>
                          </div>
                        </div>

                        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/72">
                          <Star className="h-3.5 w-3.5 fill-current text-[var(--accent)]" />
                          {service.rating}
                        </div>
                      </div>

                      <p className="text-[13px] leading-6 text-white/54">{service.description}</p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/45">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{service.category}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{service.location}</span>
                      </div>

                      <a
                        href={buildContactHref(service.title, service.email)}
                        className="inline-flex w-full items-center justify-center rounded-[12px] border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-[12px] font-semibold text-cyan-300 transition hover:bg-cyan-400/14"
                      >
                        Contact to Schedule
                      </a>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
