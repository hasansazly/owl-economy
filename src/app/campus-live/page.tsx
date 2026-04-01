"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type CampusLiveItem = {
  id: string | number;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  tag?: string | null;
  emoji?: string | null;
  location?: string | null;
  created_at?: string | null;
  goal_amount?: number | null;
  amount_raised?: number | null;
  raised_amount?: number | null;
  attendance_count?: number | null;
  going_count?: number | null;
  cover_charge?: string | number | null;
  status?: string | null;
  subject?: string | null;
};

function isWeekendMode(now: Date) {
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  return (day === 5 && (hour > 12 || (hour === 12 && minute >= 1))) || day === 6 || day === 0;
}

function getText(item: CampusLiveItem) {
  return `${item.title || ""} ${item.subtitle || ""} ${item.description || ""} ${item.category || ""} ${item.type || ""} ${item.tag || ""}`.toLowerCase();
}

function isParty(item: CampusLiveItem) {
  return /frat|party/.test(getText(item));
}

function isLost(item: CampusLiveItem) {
  return /lost|found|urgent/.test(getText(item)) || (item.category || "").toLowerCase() === "lost_found";
}

function isFundraiser(item: CampusLiveItem) {
  return /fundraise|donate|charity/.test(getText(item));
}

function isStudyJam(item: CampusLiveItem) {
  return /study jam|study|finals/.test(getText(item));
}

function getRelativeTime(createdAt?: string | null) {
  if (!createdAt) return "just now";
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CampusLivePage() {
  const [items, setItems] = useState<CampusLiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"weekday" | "weekend">("weekday");
  const [goingIds, setGoingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const weekend = isWeekendMode(new Date());
    setActiveTab(weekend ? "weekend" : "weekday");
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase
      .from("campus_live_items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems((data as CampusLiveItem[]) || []);
        setLoading(false);
      });
  }, []);

  const weekdayLost = useMemo(() => items.filter((item) => isLost(item)), [items]);
  const weekdayFundraisers = useMemo(() => items.filter((item) => isFundraiser(item)), [items]);
  const weekdayEvents = useMemo(() => items.filter((item) => !isFundraiser(item) && !isLost(item) && !isParty(item) && !isStudyJam(item)), [items]);
  const weekdayStudyJams = useMemo(() => items.filter((item) => isStudyJam(item) && !isParty(item)), [items]);
  const weekendParties = useMemo(() => items.filter((item) => isParty(item)), [items]);
  const weekendFundraisers = useMemo(() => items.filter((item) => isFundraiser(item)), [items]);
  const weekendEvents = useMemo(() => items.filter((item) => !isFundraiser(item) && !isLost(item) && !isParty(item)), [items]);

  return (
    <main className="page-shell">
      <section className="page-wrap">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <p className="text-[16px] font-medium text-[#F0EEFF]">campus live</p>
          <span className="h-[44px] w-[44px]" />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("weekday")}
            className={`h-[44px] flex-1 rounded-[20px] border text-[13px] ${
              activeTab === "weekday"
                ? "border-[rgba(107,92,231,0.5)] bg-[rgba(107,92,231,0.2)] text-[#9B8FFF]"
                : "border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(240,238,255,0.5)]"
            }`}
          >
            Mon – Thu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("weekend")}
            className={`h-[44px] flex-1 rounded-[20px] border text-[13px] ${
              activeTab === "weekend"
                ? "border-[rgba(107,92,231,0.5)] bg-[rgba(107,92,231,0.2)] text-[#9B8FFF]"
                : "border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(240,238,255,0.5)]"
            }`}
          >
            Fri – Sun
          </button>
        </div>

        {loading ? (
          <p className="mt-6 text-[13px] text-[rgba(240,238,255,0.35)]">Loading campus live...</p>
        ) : activeTab === "weekday" ? (
          <section className="mt-6 space-y-6">
            {weekdayLost.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">lost &amp; found</p>
                {weekdayLost.map((item) => (
                  <article key={String(item.id)} className="rounded-[14px] border border-[rgba(224,75,74,0.2)] bg-[rgba(224,75,74,0.07)] p-[14px]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[rgba(224,75,74,0.15)] text-[18px]">
                        {item.emoji || "🔎"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Lost item"}</p>
                        <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
                          {item.location || "Temple campus"} · {getRelativeTime(item.created_at)}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[11px] text-[rgba(240,238,255,0.4)]">{item.subtitle || "Temple student"}</span>
                          <Link href="/lost-and-found" className="rounded-[20px] border border-[rgba(224,75,74,0.3)] bg-[rgba(224,75,74,0.15)] px-3 py-1 text-[11px] text-[#F09595]">
                            I found it
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {(weekdayFundraisers.length > 0 || weekdayEvents.length > 0 || weekdayStudyJams.length > 0) ? (
              <div className="space-y-4">
                <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">campus happenings</p>

                {weekdayFundraisers.map((item) => {
                  const raised = Number(item.amount_raised ?? item.raised_amount ?? 0);
                  const goal = Math.max(1, Number(item.goal_amount ?? 1));
                  const progress = Math.min(100, Math.round((raised / goal) * 100));
                  return (
                    <article key={String(item.id)} className="rounded-[14px] border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.06)] p-[14px]">
                      <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Fundraiser"}</p>
                      <p className="mt-2 text-[12px] text-[rgba(240,238,255,0.4)]">${raised} of ${goal}</p>
                      <div className="mt-2 h-1 rounded-[2px] bg-[#F5A623]" style={{ width: `${Math.max(8, progress)}%` }} />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-[#F5A623]">{progress}%</span>
                        <Link href="/fundraise-fast" className="rounded-[20px] bg-[rgba(245,166,35,0.15)] px-3 py-1 text-[11px] text-[#F5A623]">
                          Donate →
                        </Link>
                      </div>
                    </article>
                  );
                })}

                {weekdayEvents.map((item) => (
                  <article key={String(item.id)} className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
                    <p className="inline-flex items-center gap-2 text-[11px] text-[#8FDEAE]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8FDEAE]" />
                      Event
                    </p>
                    <p className="mt-2 text-[14px] font-medium text-[#F0EEFF]">{item.title || "Campus event"}</p>
                    <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
                      {item.location || "Temple campus"} · {item.subtitle || getRelativeTime(item.created_at)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[rgba(240,238,255,0.4)]">{item.attendance_count || 0} going</span>
                      <Link href="/launch-event" className="rounded-[20px] bg-[rgba(107,92,231,0.15)] px-3 py-1 text-[11px] text-[#9B8FFF]">
                        Details →
                      </Link>
                    </div>
                  </article>
                ))}

                {weekdayStudyJams.map((item) => (
                  <article key={String(item.id)} className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
                    <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Study jam"}</p>
                    <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
                      {item.subject || item.subtitle || "Study session"} · {item.location || "Temple campus"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-[rgba(240,238,255,0.4)]">{getRelativeTime(item.created_at)}</span>
                      <Link href="/launch-event" className="rounded-[20px] bg-[rgba(107,92,231,0.15)] px-3 py-1 text-[11px] text-[#9B8FFF]">
                        Join →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : (
          <section className="mt-6 space-y-6">
            <div className="text-center">
              <p className="text-[16px] font-medium text-[#9B8FFF]">Weekend on Campus</p>
              <p className="mt-1 text-[12px] text-[rgba(240,238,255,0.4)]">Fri 12:01pm → Sun 11:59pm</p>
            </div>

            {weekendParties.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">happening tonight</p>
                {weekendParties.map((item) => {
                  const going = goingIds[String(item.id)] || false;
                  const count = Number(item.going_count || 0);
                  return (
                    <article key={String(item.id)} className="rounded-[14px] border border-[rgba(107,92,231,0.3)] bg-[rgba(107,92,231,0.10)] p-[14px]">
                      <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Party"}</p>
                      <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">
                        {item.location || "Temple area"} · {item.cover_charge ? `$${item.cover_charge}` : "Free"}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-[rgba(240,238,255,0.4)]">{count} going</span>
                        <button
                          type="button"
                          onClick={async () => {
                            const supabase = getSupabaseBrowserClient();
                            if (!supabase) return;
                            const nextGoing = !going;
                            const nextCount = Math.max(0, count + (nextGoing ? 1 : -1));
                            setGoingIds((current) => ({ ...current, [String(item.id)]: nextGoing }));
                            setItems((current) =>
                              current.map((entry) =>
                                String(entry.id) === String(item.id) ? { ...entry, going_count: nextCount } : entry,
                              ),
                            );
                            await supabase.from("campus_live_items").update({ going_count: nextCount } as never).eq("id", item.id);
                          }}
                          className={`rounded-[20px] px-3 py-1 text-[11px] ${
                            going ? "bg-[rgba(54,196,111,0.15)] text-[#8FDEAE]" : "bg-[rgba(107,92,231,0.15)] text-[#9B8FFF]"
                          }`}
                        >
                          {going ? "Going ✓" : "I’m going"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {(weekendFundraisers.length > 0 || weekendEvents.length > 0) ? (
              <div className="space-y-3">
                <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">also this weekend</p>
                {weekendFundraisers.map((item) => {
                  const raised = Number(item.amount_raised ?? item.raised_amount ?? 0);
                  const goal = Math.max(1, Number(item.goal_amount ?? 1));
                  const progress = Math.min(100, Math.round((raised / goal) * 100));
                  return (
                    <article key={String(item.id)} className="rounded-[14px] border border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.06)] p-[14px]">
                      <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Fundraiser"}</p>
                      <p className="mt-2 text-[12px] text-[rgba(240,238,255,0.4)]">${raised} of ${goal}</p>
                      <div className="mt-2 h-1 rounded-[2px] bg-[#F5A623]" style={{ width: `${Math.max(8, progress)}%` }} />
                    </article>
                  );
                })}
                {weekendEvents.map((item) => (
                  <article key={String(item.id)} className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
                    <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Campus event"}</p>
                    <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">{item.location || "Temple campus"}</p>
                  </article>
                ))}
              </div>
            ) : null}

            {weekdayLost.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">lost &amp; found</p>
                {weekdayLost.map((item) => (
                  <article key={String(item.id)} className="rounded-[14px] border border-[rgba(224,75,74,0.2)] bg-[rgba(224,75,74,0.07)] p-[14px]">
                    <p className="text-[14px] font-medium text-[#F0EEFF]">{item.title || "Lost item"}</p>
                    <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">{item.location || "Temple campus"} · {getRelativeTime(item.created_at)}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        )}
      </section>
    </main>
  );
}
