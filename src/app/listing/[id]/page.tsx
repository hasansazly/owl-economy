"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ListingDetail = {
  id: string | number;
  title?: string | null;
  price?: number | string | null;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
  poster_name?: string | null;
  profiles?:
    | {
        full_name?: string | null;
        avatar_url?: string | null;
      }
    | Array<{
        full_name?: string | null;
        avatar_url?: string | null;
      }>
    | null;
};

function getProfileData(profile: ListingDetail["profiles"]) {
  if (Array.isArray(profile)) return profile[0] || null;
  return profile || null;
}

function getInitials(name?: string | null) {
  const parts = (name || "Temple Student")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("listings")
      .select("*, profiles(full_name, avatar_url)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setListing((data as ListingDetail | null) || null);
        setLoading(false);
      });
  }, [id]);

  const profile = useMemo(() => getProfileData(listing?.profiles), [listing?.profiles]);
  const sellerName = profile?.full_name || listing?.poster_name || "Temple Student";
  const photos = listing?.image_url ? [listing.image_url] : [];

  return (
    <main className="page-shell">
      <section className="page-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-[13px] text-[rgba(240,238,255,0.35)]">Loading listing...</p>
        ) : !listing ? (
          <p className="mt-6 text-[13px] text-[rgba(240,238,255,0.35)]">Listing not found.</p>
        ) : (
          <section className="mt-4 space-y-4 pb-[calc(env(safe-area-inset-bottom)+92px)]">
            <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {photos.length > 0 ? (
                photos.map((photo, index) => (
                  <img
                    key={`${photo}-${index}`}
                    src={photo}
                    alt={listing.title || "Listing"}
                    className="aspect-[4/3] w-full min-w-full rounded-[14px] object-cover"
                  />
                ))
              ) : (
                <div className="flex aspect-[4/3] w-full min-w-full items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.05)] text-[28px]">
                  📦
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-[18px] font-medium text-[#F0EEFF]">{listing.title || "Campus listing"}</h1>
              <p className="text-[16px] font-medium text-[#9B8FFF]">
                {listing.price !== null && listing.price !== undefined ? `$${listing.price}` : "Free"}
              </p>
              <p className="text-[14px] leading-[1.6] text-[#F0EEFF]">{listing.description || "No description yet."}</p>
              <p className="text-[13px] text-[rgba(240,238,255,0.45)]">{listing.location || "Temple campus"}</p>
            </div>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={sellerName} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                    {getInitials(sellerName)}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-[#F0EEFF]">{sellerName}</p>
                  <p className="text-[11px] text-[rgba(240,238,255,0.4)]">Temple campus seller</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </section>

      {!loading && listing ? (
        <div className="mobile-bottom-nav border-t border-white/10 bg-[#0A0916] px-4 py-3">
          <Link
            href="/campus-services"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] text-[16px] font-medium text-white"
          >
            Message seller
          </Link>
        </div>
      ) : null}
    </main>
  );
}
