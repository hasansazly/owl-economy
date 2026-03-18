import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BookOpen,
  CalendarRange,
  HousePlus,
  Paintbrush2,
  Search,
  Shirt,
  Sparkles,
  Store,
  TicketPlus,
  Users,
} from "lucide-react";

const categories = [
  {
    name: "Sell Goods",
    description: "Clothes, sneakers, books, and everyday finds circulating student-to-student.",
    icon: Shirt,
  },
  {
    name: "Rent a Room",
    description: "Offer a couch, spare room, or quick 1 to 2 night stay for extra income.",
    icon: HousePlus,
  },
  {
    name: "Launch Events",
    description: "Promote parties, study jams, pop-ups, and new student-led experiences.",
    icon: TicketPlus,
  },
  {
    name: "Fundraise",
    description: "Run cookie drops, bake sales, and club campaigns with stronger campus reach.",
    icon: BadgeDollarSign,
  },
  {
    name: "Sticker and Art",
    description: "Share custom designs, dorm prints, and merch made by Temple creatives.",
    icon: Paintbrush2,
  },
  {
    name: "Campus Services",
    description: "Find tutors, photographers, resellers, and helpers for student-side hustles.",
    icon: Users,
  },
];

const highlights = [
  {
    title: "One marketplace, many hustle lanes",
    description:
      "Students can sell products, book short stays, run events, or raise money without leaving campus culture behind.",
    icon: Sparkles,
  },
  {
    title: "Search what matters first",
    description:
      "The homepage is built around discovery so students can jump into books, rooms, merch, or events immediately.",
    icon: Search,
  },
  {
    title: "Built for Temple rhythms",
    description:
      "From late-night study jams to weekend pop-ups, every section is tuned to how Temple students actually move.",
    icon: CalendarRange,
  },
];

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative isolate overflow-hidden border-b border-[rgba(157,34,53,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(157,34,53,0.18),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#fff7f8_50%,_#fff1f3_100%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[linear-gradient(180deg,_rgba(157,34,53,0.06),_rgba(157,34,53,0.12))] lg:block" />

        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
          <header className="flex flex-col gap-4 rounded-[2rem] border border-[rgba(157,34,53,0.12)] bg-white/90 px-5 py-4 shadow-[0_18px_50px_rgba(157,34,53,0.10)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-3xl uppercase tracking-[0.14em] text-[var(--temple-cherry)]">
                The Owl Economy
              </p>
              <p className="text-sm text-[var(--muted)]">Temple University&apos;s student marketplace</p>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="#categories"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--temple-cherry)]"
              >
                Browse Categories
              </Link>
              <Link
                href="#post"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--temple-cherry)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#821b2b]"
              >
                Post a Listing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </nav>
          </header>

          <div className="grid items-center gap-12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(157,34,53,0.12)] bg-white px-4 py-2 text-sm font-medium text-[var(--muted)] shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--temple-cherry)]" />
                Marketplace energy for every Temple hustle
              </div>

              <h1 className="mt-6 font-display text-6xl uppercase leading-none tracking-[0.04em] text-[var(--foreground)] sm:text-7xl lg:text-[6.4rem]">
                Buy, host, fundraise, and
                <span className="block text-[var(--temple-cherry)]">build on campus.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-8 text-[var(--muted)]">
                The Owl Economy brings Temple students into one multi-category space to trade goods,
                post short stays, launch events, support club fundraisers, and showcase original art.
              </p>

              <form className="mt-8 rounded-[1.75rem] border border-[rgba(157,34,53,0.12)] bg-white p-3 shadow-[0_20px_60px_rgba(157,34,53,0.10)]">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--temple-cherry)]" />
                    <input
                      type="search"
                      placeholder="Search books, rooms, events, merch, bake sales..."
                      className="h-14 w-full rounded-[1.25rem] border border-[rgba(157,34,53,0.10)] bg-[#fffafb] pl-12 pr-4 text-base text-[var(--foreground)] outline-none transition placeholder:text-[#9e7b80] focus:border-[var(--temple-cherry)]"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-[1.25rem] bg-[var(--temple-cherry)] px-6 text-base font-semibold text-white transition hover:bg-[#821b2b]"
                  >
                    Search
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-[2rem] border border-[rgba(157,34,53,0.14)] bg-[linear-gradient(180deg,_#9d2235_0%,_#7f1a2b_100%)] p-7 text-white shadow-[0_24px_70px_rgba(157,34,53,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Trending This Week
              </p>
              <div className="mt-6 space-y-4">
                {[
                  "Used econ books under $40",
                  "One-night room near Main Campus",
                  "Study jam RSVP for midterms",
                  "Cookie drop fundraiser for student orgs",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/12 bg-white/10 px-4 py-4 text-base font-medium backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] bg-white px-5 py-5 text-[var(--foreground)]">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-[var(--temple-cherry)]" />
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--temple-cherry)]">
                    Why students use it
                  </p>
                </div>
                <p className="mt-3 text-xl font-semibold">
                  One search bar, six categories, and a Temple-first identity from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-kicker">Marketplace Categories</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
              Six ways The Owl Economy keeps campus moving.
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-8 text-[var(--muted)]">
            Built to support everything from peer-to-peer resale to short stays, club money runs,
            and Temple-made creative work.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map(({ name, description, icon: Icon }) => (
            <article
              key={name}
              className="group rounded-[2rem] border border-[rgba(157,34,53,0.10)] bg-white p-7 shadow-[0_18px_45px_rgba(157,34,53,0.08)] transition hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(157,34,53,0.14)]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(157,34,53,0.10)] text-[var(--temple-cherry)] transition group-hover:bg-[var(--temple-cherry)] group-hover:text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-[var(--foreground)]">{name}</h3>
              <p className="mt-3 text-base leading-7 text-[var(--muted)]">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--temple-cherry)] px-6 py-20 text-white lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-3">
          {highlights.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-[1.85rem] border border-white/15 bg-white/8 p-7 backdrop-blur"
            >
              <Icon className="h-6 w-6 text-white" />
              <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
              <p className="mt-3 text-base leading-7 text-white/78">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="post" className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="rounded-[2.5rem] border border-[rgba(157,34,53,0.12)] bg-white p-8 shadow-[0_22px_70px_rgba(157,34,53,0.08)] lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-kicker">Start Listing</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                Post your next Temple-side offer in minutes.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                Whether you&apos;re moving sneakers, opening a spare room, launching a pop-up, or
                running a fundraiser, The Owl Economy helps students put ideas in front of campus
                quickly.
              </p>
            </div>

            <div className="rounded-[2rem] bg-[linear-gradient(180deg,_#fff5f7,_#ffffff)] p-6">
              <div className="space-y-4">
                {[
                  "Upload a listing for resale, housing, events, art, or fundraising.",
                  "Reach Temple students through a single branded campus marketplace.",
                  "Turn side projects into momentum with discoverable categories.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[1.25rem] border border-[rgba(157,34,53,0.10)] bg-white px-4 py-4"
                  >
                    <Store className="mt-1 h-5 w-5 shrink-0 text-[var(--temple-cherry)]" />
                    <p className="text-base leading-7 text-[var(--muted)]">{item}</p>
                  </div>
                ))}
              </div>

              <Link
                href="#top"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--temple-cherry)] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#821b2b]"
              >
                Post a Listing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
