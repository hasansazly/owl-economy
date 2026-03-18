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
  {
    title: "Move-out bundle drop",
    location: "1300 residence hall",
    time: "Tonight",
  },
  {
    title: "Study jam signups open",
    location: "Tech Center lounge",
    time: "7 PM",
  },
  {
    title: "Custom sticker preorder",
    location: "Tyler art collab",
    time: "Live",
  },
];

const quickActions = [
  {
    title: "Sell Goods",
    description: "Clothes, sneakers, books, and dorm extras students want right now.",
    icon: Shirt,
    badge: "Resell",
    tone:
      "bg-[#1A1A2E] border-[rgba(119,96,250,0.28)] text-[#A08FFF]",
  },
  {
    title: "Rent a Room",
    description: "Open a bed, couch, or spare room for quick 1 to 2 night stays.",
    icon: BedDouble,
    badge: "Stay",
    tone:
      "bg-[#121826] border-[rgba(60,130,220,0.28)] text-[#6BAEF0]",
  },
  {
    title: "Launch Events",
    description: "Push parties, study jams, pop-ups, and student-run drops.",
    icon: PartyPopper,
    badge: "Events",
    tone:
      "bg-[#1C1210] border-[rgba(220,100,60,0.28)] text-[#F0936B]",
  },
  {
    title: "Sticker + Art",
    description: "Show custom designs, merch, and Temple-made creative work.",
    icon: Palette,
    badge: "Create",
    tone:
      "bg-[#0F1A12] border-[rgba(60,180,100,0.28)] text-[#6FCF97]",
  },
];

const recentListings = [
  {
    title: "Mini fridge + mirror combo",
    meta: "Morgan Hall South",
    price: "$40",
  },
  {
    title: "One-night crash space",
    meta: "Near Cecil B. Moore",
    price: "$28",
  },
  {
    title: "Cookie drop fundraiser box",
    meta: "Pickup after 4 PM",
    price: "$12",
  },
  {
    title: "Custom owl sticker set",
    meta: "Designed by Tyler student",
    price: "$9",
  },
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
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/7 bg-[rgba(13,13,13,0.96)] px-1 py-5 backdrop-blur">
          <Link
            href="#top"
            className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]"
          >

            Dorm<span className="text-[var(--accent)]">Stash</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3.5 py-1.5 text-[12px] font-medium text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Temple campus live
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3.5 py-1.5 text-[12px] font-medium text-white/60 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
              Temple campus live
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-[var(--foreground)] transition hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </header>

          </Link>

          <Link
            href="#top"
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[14px] text-white/48 transition hover:bg-white/8"
          >
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            Post a listing
            Log in to post
          </Link>

          <div className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[14px] text-white/45"></div>