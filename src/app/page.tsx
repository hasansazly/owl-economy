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
  Scissors,
  Search,
  Shirt,
  Sparkles,
} from "lucide-react";

const flashDrops = [
  { title: "Valentines party ", location: "1456 N 15th Broad St", time: "10 PM" },
  { title: "Ignite Temple Club fundraiser", location: "Student Center Temple", time: "Live" },
  { title: "Skylar lost her airpod", location: "Charles Library", time: "yesterday" },
];

const quickActions = [
  {
    title: "Sell Goods",
    description: "Clothes, sneakers, books, and dorm extras students want right now.",
    icon: Shirt,
    badge: "Resell",
    href: "/sell-goods",
  },
  {
    title: "Rent a Room",
    description: "Open a bed, couch, or spare room for quick 1 to 2 night stays.",
    icon: BedDouble,
    badge: "Stay",
    href: "/rent-room",
  },
  {
    title: "Launch Events",
    description: "Push parties, study jams, pop-ups, signups, and event-side campus drops.",
    icon: PartyPopper,
    badge: "Events",
    href: "/launch-event",
  },
  {
    title: "Fundraise Fast",
    description: "Run science club drives, cookie drops, bake sales, and student fundraiser pushes.",
    icon: HandCoins,
    badge: "Fundraise",
    href: "/fundraise-fast",
  },
  {
    title: "Campus Creatives",
    description: "Show custom designs, merch, and Temple-made creative work.",
    icon: Palette,
    badge: "Create",
    href: "#top",
  },
  {
    title: "Lost and Found",
    description: "A digital bulletin board for lost IDs, keys, or Airpods. No fees, just campus karma.",
    icon: MapPin,
    badge: "Report",
    href: "/lost-and-found",
  },
  {
    title: "Campus Services",
    description: "Book student-led pros for hair cutting, braids, nails, tech support, or moving help.",
    icon: Scissors,
    badge: "Book",
    href: "/campus-services",
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
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--divider)] bg-[rgba(0,0,0,0.82)] px-1 py-5 backdrop-blur-xl">
          <Link href="#top" className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            Dorm<span className="text-[var(--accent)]">Stash</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="capsule-secondary hidden items-center gap-2 px-3.5 py-1.5 text-[12px] font-medium text-white/70 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Temple campus live
            </div>
            <Link
              href="/login"
              className="capsule-primary inline-flex items-center justify-center px-4 py-2 text-[12px] font-semibold transition hover:opacity-95"
            >
              Log in
            </Link>
          </div>
        </header>

        <section className="px-1 pt-7">
          <p className="text-[13px] uppercase tracking-[0.28em] text-white">Temple University</p>
          <h1 className="mt-3 max-w-3xl font-display text-[3.35rem] font-extrabold leading-[0.96] tracking-[-0.06em] sm:text-[4.9rem]">
            <span className="hero-gradient-title">Dorm life moves fast.</span>
            <span className="mt-2 block text-[var(--accent)]">DormStash keeps up.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-[14px] leading-6 text-white/52 sm:text-[15px]">
            Sell what you no longer need, find quick room options, launch student events, fundraise
            for your org, and move campus-made items faster.
          </p>
        </section>

        <div className="agora-panel mt-8 px-4 py-3">
          <div className="flex items-center gap-3">
            <Search className="h-4 w-4 text-white/45" />
            <input
              type="search"
              placeholder="Search dorm items, short stays, sticker drops, late-night finds..."
              className="w-full bg-transparent text-[14px] text-[var(--foreground)] outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        <p className="section-kicker mt-7 px-1">Live Right Now</p>

        <section className="agora-panel mt-3 overflow-hidden p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(18,214,255,0.85)]" />
              Flash Drops
            </div>
            <span className="text-[12px] text-[rgba(255,255,255,0.6)]">3 active</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {flashDrops.map((drop) => (
              <article
                key={drop.title}
                className="agora-panel flex items-center justify-between px-3.5 py-3 transition hover:bg-white/[0.05]"
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
                <span className="ml-4 rounded-full bg-[rgba(18,214,255,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                  {drop.time}
                </span>
              </article>
            ))}
          </div>
        </section>

        <p className="section-kicker mt-7 px-1">Everything Else</p>

        <section className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {quickActions.map(({ title, description, icon: Icon, badge, href }) => (
            <Link
              key={title}
              href={href}
              className="agora-panel flex min-h-[160px] flex-col justify-between px-4 py-4 transition hover:scale-[0.99] hover:bg-white/[0.05]"
            >
              <div className="text-[var(--accent)]">
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-white">
                  {title}
                </h2>
                <p className="mt-1.5 text-[11px] leading-5 text-white/46">{description}</p>
              </div>

              <span className="inline-flex w-fit rounded-full border border-white/10 bg-[rgba(18,214,255,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[var(--accent)]">
                {badge}
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="section-kicker !mt-0 !px-0">Recent Listings</p>
            <Link href="#top" className="text-[12px] text-white/42 transition hover:text-white/68">
              See all
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentListings.map((listing) => (
              <article
                key={listing.title}
                className="agora-panel min-w-[190px] p-4"
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
              className="agora-panel px-5 py-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-[16px] font-bold tracking-[-0.02em] text-white">
                    {title}
                  </h2>
                  <p className="mt-1.5 text-[12px] leading-5 text-white/46">{text}</p>
                </div>
                <Icon className="h-5 w-5 shrink-0 text-[var(--accent)]" />
              </div>
            </article>
          ))}
        </section>

        <div className="agora-divider mt-8" />

        <section className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#top"
            className="capsule-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] font-semibold transition hover:opacity-95"
          >
            Browse DormStash
            <ChevronRight className="h-4 w-4" />
          </Link>

          <Link
            href="/create-listing"
            className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] transition"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Create a listing
          </Link>

          <div className="capsule-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-[14px] text-white/68">
            <Clock3 className="h-4 w-4 text-[var(--accent)]" />
            Fresh listings every day
          </div>
        </section>
      </section>
    </main>
  );
}
