import Link from "next/link";
import { ArrowLeft, MapPin, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { DormStashLogo } from "@/components/logo";
import { goodsListings } from "@/lib/sell-goods-data";
import { buildSellerContactHref, isVerifiedTempleEmail } from "@/lib/security";

export default async function SellGoodsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = goodsListings.find((listing) => listing.id === id);

  if (!item) notFound();

  const contactSellerHref = buildSellerContactHref(item.title, item.sellerEmail);

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-5xl">
        <header className="page-header flex-wrap py-4">
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
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/46">
              <span>Sold by {item.seller}</span>
              {isVerifiedTempleEmail(item.sellerEmail) ? (
                <span className="rounded-full bg-[rgba(148,163,184,0.14)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#d7e5f6]">
                  Temple Verified
                </span>
              ) : null}
            </div>

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

            {contactSellerHref ? (
              <a
                href={contactSellerHref}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-[rgba(148,163,184,0.26)] bg-[rgba(148,163,184,0.10)] px-5 py-3 text-sm font-semibold text-[#d7e5f6] transition hover:bg-[rgba(148,163,184,0.16)]"
              >
                Contact Seller
              </a>
            ) : (
              <span className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/40">
                Contact unavailable
              </span>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
