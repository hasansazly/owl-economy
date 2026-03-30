"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type ServiceProfile =
  | {
      full_name?: string | null;
      avatar_url?: string | null;
    }
  | Array<{
      full_name?: string | null;
      avatar_url?: string | null;
    }>
  | null;

type ServiceDetail = {
  id: string | number;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  rating?: number | string | null;
  review_count?: number | null;
  provider_name?: string | null;
  price?: number | string | null;
  rate?: number | string | null;
  profiles?: ServiceProfile;
};

type ServiceReview = {
  id: string | number;
  text?: string | null;
  created_at?: string | null;
  profiles?: ServiceProfile;
};

function getProfileData(profile: ServiceProfile) {
  if (Array.isArray(profile)) return profile[0] || null;
  return profile || null;
}

function getInitials(name?: string | null) {
  const parts = (name || "Temple Student").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [reviews, setReviews] = useState<ServiceReview[]>([]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("services")
      .select("*, profiles(full_name, avatar_url)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setService((data as ServiceDetail | null) || null));

    supabase
      .from("service_reviews")
      .select("*, profiles(full_name, avatar_url)")
      .eq("service_id", id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setReviews((data as ServiceReview[]) || []));
  }, [id]);

  const profile = useMemo(() => getProfileData(service?.profiles || null), [service?.profiles]);
  const name = profile?.full_name || service?.provider_name || "Temple Student";
  const rating = Number(service?.rating || 0);
  const stars = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <main className="page-shell">
      <section className="page-wrap pb-[calc(env(safe-area-inset-bottom)+92px)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {service ? (
          <section className="mt-4 space-y-4">
            {service.image_url ? (
              <img src={service.image_url} alt={service.title || "Service"} className="aspect-[4/3] w-full rounded-[14px] object-cover" />
            ) : null}
            <h1 className="text-[18px] font-medium text-[#F0EEFF]">{service.title || "Campus service"}</h1>
            <p className="text-[13px] text-[#9B8FFF]">{service.rate || service.price ? `$${service.rate || service.price}` : "Contact for rate"}</p>
            <p className="text-[14px] leading-[1.6] text-[#F0EEFF]">{service.description || "No service details yet."}</p>

            <div className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                    {getInitials(name)}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-[#F0EEFF]">{name}</p>
                  <p className="text-[12px] text-[#F5A623]">{"★".repeat(stars)}{"☆".repeat(Math.max(0, 5 - stars))}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((review) => {
                const reviewProfile = getProfileData(review.profiles || null);
                const reviewName = reviewProfile?.full_name || "Temple Student";
                return (
                  <article key={String(review.id)} className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
                    <div className="flex items-center gap-3">
                      {reviewProfile?.avatar_url ? (
                        <img src={reviewProfile.avatar_url} alt={reviewName} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                          {getInitials(reviewName)}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-[#F0EEFF]">{reviewName}</p>
                        <p className="text-[11px] text-[rgba(240,238,255,0.4)]">{review.created_at || "just now"}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.6] text-[#F0EEFF]">{review.text || ""}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="mt-6 text-[13px] text-[rgba(240,238,255,0.35)]">Service not found.</p>
        )}
      </section>

      {service ? (
        <div className="mobile-bottom-nav border-t border-white/10 bg-[#0A0916] px-4 py-3">
          <Link
            href="/campus-services"
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] text-[16px] font-medium text-white"
          >
            Message {name}
          </Link>
        </div>
      ) : null}
    </main>
  );
}
