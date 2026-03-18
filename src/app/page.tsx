import Link from "next/link";
import {
  BedDouble,
  ChevronRight,
  Clock3,
  DoorOpen,
  GraduationCap,
  HandCoins,
  LampDesk,
  MapPin,
  Package,
  Palette,
  PartyPopper,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";

const flashDrops = [
  { title: "Move-out bundle drop", location: "1300 residence hall", time: "Tonight" },
  { title: "Study jam signups open", location: "Tech Center lounge", time: "7 PM" },
  { title: "Custom sticker preorder", location: "Tyler art collab", time: "Live" },
];

const quickActions = [
  {
    title: "Sell Goods",
    description: "Clothes, sneakers, books, and dorm extras students want right now.",
    icon: Shirt,
    badge: "Resell",
    tone: "bg-[var(--panel-soft)] border-[rgba(255,62,165,0.24)]",
    accent: "text-[var(--accent)]",
  },
  {
    title: "Rent a Room",
    description: "Open a bed, couch, or spare room for quick 1 to 2 night stays.",
    icon: BedDouble,
    badge: "Stay",
    tone: "bg-[rgba(51,65,92,0.32)] border-[rgba(101,124,166,0.34)]",
    accent: "text-[#b8c6e6]",
  },
  {
    title: "Launch Events",
    description: "Push parties, study jams, pop-ups, and student-run drops.",
    icon: PartyPopper,
    badge: "Events",
    tone: "bg-[rgba(255,62,165,0.10)] border-[rgba(255,62,165,0.30)]",
    accent: "text-[var(--accent)]",
  },
  {
    title: "Sticker + Art",
    description: "Show custom designs, merch, and Temple-made creative work.",
    icon: Palette,
    badge: "Create",
    tone: "bg-[rgba(51,65,92,0.45)] border-[rgba(255,255,255,0.12)]",
    accent: "text-[#d7def0]",
  },
];

const recentListings = [
  { title: "Mini fridge + mirror combo", meta: "Morgan Hall South", price: "$40" },
  { title: "One-night crash space", meta: "Near Cecil B. Moore", price: "$28" },
  { title: "Cookie drop fundraiser box", meta: "Pickup after 4 PM", price: "$12" },
  { title: "Custom owl sticker set", meta: "Designed by Tyler student", price: "$9" },
];

const supportCards = [
  {
    title: "Move-Out Mode",
    text: "Quickly list storage bins, rugs, mirrors, and mini fridges.",
    icon: DoorOpen,
  },
  {
    title: "Study Night",
    text: "Push a study jam or browse last-minute desk gear and textbooks.",
    icon: LampDesk,
  },
  {
    title: "Campus Verified",
    text: "Built for students who want faster, cleaner, dorm-first discovery.",
    icon: GraduationCap,
  },
];

export default function Home() {
  return (
    <main id="top" className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-4xl px-4 pb-16 pt-1 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/7 bg-[rgba(20,22,27,0.96)] px-1 py-5 backdrop-blur">
          <Link href="#top" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            Dorm<span className="text-[var(--accent)]">Stash</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-3.5 py-1.5 text-[12px] font-medium text-white/60 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Temple campus live
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-white/5 px-4 py-2 text-[12px] font-semibold transition hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="px-1 pt-7">
          <p className="text-[13px] uppercase tracking-[0.06em] text-white/45">Temple University</p>
          <h1 className="mt-2 max-w-3xl font-display text-[2rem] font-bold leading-[1.08] tracking-[-0.04em] sm:text-[2.5rem]">
            Dorm life moves fast.
            <span className="text-[var(--accent)]"> DormStash keeps up.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-6 text-white/42 sm:text-[15px]">
            Sell what you no longer need, find quick room options, launch student events, fundraise
            for your org, and move campus-made items faster.
          </p>
        </section>

        <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-white/35" />
            <input
              type="search"
              placeholder="Search dorm items, short stays, sticker drops, late-night finds..."
              className="w-full bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        <p className="section-kicker mt-7 px-1">Live Right Now</p>

        <section className="mt-3 overflow-hidden rounded-[18px] border border-[rgba(255,62,165,0.25)] bg-[linear-gradient(135deg,_rgba(51,65,92,0.65)_0%,_rgba(255,62,165,0.12)_100%)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(255,62,165,0.85)]" />
              Flash Drops
            </div>
            <span className="text-[12px] text-[rgba(255,255,255,0.6)]">3 active</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {flashDrops.map((drop) => (
              <article
                key={drop.title}
                className="flex items-center justify-between rounded-[10px] border border-white/6 bg-white/5 px-3.5 py-3 transition hover:bg-white/8"
              >
                <div className="min-w-0">
                  <h2 className="truncate text-[13px] font-medium text-[var(--foreground)]">
                    {drop.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/38">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{drop.location}</span>
                  </div>
                </div>
                <span className="ml-4 rounded-md bg-[rgba(255,62,165,0.12)] px-2 py-1 text-[11px] font-semibold text-[var(--accent)]">
                  {drop.time}
                </span>
              </article>
            ))}
          </div>
        </section>

        <p className="section-kicker mt-7 px-1">Everything Else</p>

        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map(({ title, description, icon: Icon, badge, tone, accent }) => (
            <article
              key={title}
              className={`flex min-h-[150px] flex-col justify-between rounded-[18px] border px-4 py-4 transition hover:scale-[0.99] ${tone}`}
            >
              <div className={accent}>
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                  {title}
                </h2>
                <p className="mt-1.5 text-[11px] leading-5 text-white/40">{description}</p>
              </div>

              <span className="inline-flex w-fit rounded-md bg-white/10 px-2 py-1 text-[10px] font-semibold text-white/72">
                {badge}
              </span>
            </article>
          ))}
        </section>

        <section className="mt-3 rounded-[18px] border border-[rgba(255,62,165,0.22)] bg-[linear-gradient(180deg,_rgba(255,62,165,0.10)_0%,_rgba(26,29,36,1)_100%)] px-5 py-5 transition hover:scale-[0.995]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-[16px] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                Fundraise Fast
              </h2>
              <p className="mt-1.5 text-[12px] leading-5 text-white/40">
                Cookie drops, bake sales, and club pushes all in one visible lane.
              </p>
            </div>
            <HandCoins className="h-10 w-10 text-[var(--accent)]" />
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Recent Listings</p>
            <Link href="#top" className="text-[12px] text-white/35 transition hover:text-white/55">
              See all
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentListings.map((listing) => (
              <article
                key={listing.title}
                className="min-w-[190px] rounded-[16px] border border-[var(--border)] bg-[var(--panel)] p-4"
              >
                <div className="flex items-center justify-between">
                  <Package className="h-4 w-4 text-[var(--accent)]" />
                  <span className="text-[12px] font-semibold text-[var(--accent)]">
                    {listing.price}
                  </span>
                </div>
                <h3 className="mt-4 text-[13px] font-medium text-[var(--foreground)]">
                  {listing.title}
                </h3>
                <p className="mt-1.5 text-[11px] text-white/38">{listing.meta}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-3">
          {supportCards.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className="rounded-[18px] border border-[var(--border)] bg-[var(--panel)] px-5 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-[16px] font-bold tracking-[-0.02em] text-[var(--foreground)]">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-white/40">{text}</p>
                </div>
                <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#top"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-white transition hover:opacity-90"
          >
            Browse DormStash
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            href="/create-listing"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white/5 px-5 py-3 text-[14px] text-white/48 transition hover:bg-white/8"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Create a listing
          </Link>

          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[rgba(51,65,92,0.35)] px-5 py-3 text-[14px] text-white/55">
            <Clock3 className="h-4 w-4 text-[var(--accent)]" />
            Fresh listings every day
          </div>
        </section>
      </section>
    </main>
  );
}
