import Link from "next/link";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { DormStashLogo } from "@/components/logo";
import { goodsListings } from "@/lib/sell-goods-data";

export default async function SellGoodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = goodsListings.find((listing) => listing.id === id);

  if (!item) notFound();

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-2 sm:px-6">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/7 bg-[rgba(20,22,27,0.96)] py-4 backdrop-blur">
          <div className="flex items-center gap-4">
            <Link
              href="/sell-goods"
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white/75"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <DormStashLogo href="/" compact />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(70,191,255,0.24)] bg-[rgba(70,191,255,0.08)] px-3 py-1.5 text-xs text-[var(--accent)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Student-only item
          </div>
        </header>

        <div className="grid gap-6 py-8 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6">
            <div className="flex h-[320px] items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,_rgba(51,65,92,0.42),_rgba(70,191,255,0.08))] text-3xl font-semibold text-white/72">
              {item.imageHint}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[rgba(70,191,255,0.10)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                {item.category}
              </span>
              <span className="rounded-full bg-white/6 px-3 py-1 text-xs text-white/62">
                {item.condition}
              </span>
            </div>

            <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em]">{item.title}</h1>
            <p className="mt-2 text-sm text-white/46">Sold by {item.seller}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/32">Price</p>
                <p className="mt-2 text-lg font-semibold text-[var(--accent)]">${item.price}</p>
              </div>
              <div className="rounded-[16px] border border-white/8 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/32">Meetup area</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                  <MapPin className="h-4 w-4 text-[var(--accent)]" />
                  {item.neighborhood}
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-white/52">{item.details}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {item.badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-[var(--border)] bg-white/5 px-3 py-1.5 text-xs text-white/68"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-6 rounded-[16px] border border-[rgba(70,191,255,0.2)] bg-[rgba(51,65,92,0.32)] p-4">
              <p className="text-sm leading-6 text-white/54">
                Student-only rule: only verified students should browse, buy, and coordinate pickup.
              </p>
            </div>

            <button
              type="button"
              className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Message seller
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

