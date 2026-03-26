import Link from "next/link";
import { ArrowLeft, Plus, Search } from "lucide-react";

const categories = ["Textbooks", "Mini-Fridges", "Electronics", "Sublets"] as const;

const feedItems = [
  { title: "Organic Chemistry textbook", price: "$28", image: "Textbook set" },
  { title: "Compact mini-fridge", price: "$40", image: "Mini-fridge" },
  { title: "TI-84 calculator", price: "$55", image: "Calculator" },
  { title: "Studio sublet for spring", price: "$760", image: "Sublet room" },
  { title: "Desk lamp and organizer", price: "$18", image: "Desk setup" },
  { title: "Bluetooth speaker", price: "$22", image: "Speaker" },
  { title: 'Twin XL bedding bundle', price: "$30", image: "Bedding bundle" },
  { title: "Monitor for dorm desk", price: "$65", image: "Computer monitor" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 pb-24 pt-3 sm:px-6">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(0,0,0,0.92)] py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>

            <p className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
              <span className="text-cyan-400">my</span>dormstash<span className="text-white/88">.com</span>
            </p>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-white/35" />
            <input
              type="search"
              placeholder="Search Temple Campus..."
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-white/28"
            />
          </label>
        </header>

        <section className="pt-5">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/74 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-300"
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {feedItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-3.5 shadow-[0_16px_36px_rgba(0,0,0,0.2)] backdrop-blur-xl"
            >
              <div className="relative">
                <div className="flex h-36 items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,_rgba(35,42,54,0.88),_rgba(18,214,255,0.08))] text-[13px] font-semibold text-white/70">
                  {item.image}
                </div>
                <span className="absolute right-2.5 top-2.5 rounded-full bg-cyan-400 px-2.5 py-1 text-[11px] font-bold text-black">
                  {item.price}
                </span>
              </div>

              <h2 className="mt-3 text-[15px] font-semibold leading-5 text-white">{item.title}</h2>

              <div className="mt-3">
                <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/58">
                  Temple Main Campus
                </span>
              </div>
            </article>
          ))}
        </section>
      </section>

      <Link
        href="/create-listing"
        className="fixed bottom-6 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400 text-black shadow-[0_18px_36px_rgba(34,211,238,0.28)] transition hover:scale-[1.03]"
        aria-label="Post New Item"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}
