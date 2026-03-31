"use client";

import Link from "next/link";
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
  status?: string | null;
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

function getCardRank(item: CampusLiveItem, weekend: boolean) {
  if (weekend) {
    if (isParty(item)) return 0;
    if (isLost(item)) return 1;
    if (isFundraiser(item)) return 2;
    return 3;
  }

  if (isLost(item)) return 0;
  if (isFundraiser(item)) return 1;
  if (!isParty(item)) return 2;
  return 3;
}

function getCardTone(item: CampusLiveItem, weekend: boolean) {
  if (isParty(item)) {
    return {
      card: "bg-[rgba(107,92,231,0.10)] border-[rgba(107,92,231,0.25)]",
      pill: "bg-[rgba(107,92,231,0.15)] text-[#9B8FFF]",
      label: "🎉 Tonight",
      action: "I’m going →",
      emoji: item.emoji || "🎉",
    };
  }

  if (isLost(item)) {
    return {
      card: "bg-[rgba(224,75,74,0.07)] border-[rgba(224,75,74,0.2)]",
      pill: "bg-[rgba(224,75,74,0.15)] text-[#F09595]",
      label: "🔴 Urgent",
      action: "I found it →",
      emoji: item.emoji || "🔎",
    };
  }

  if (isFundraiser(item)) {
    return {
      card: "bg-[rgba(245,166,35,0.06)] border-[rgba(245,166,35,0.2)]",
      pill: "bg-[rgba(245,166,35,0.12)] text-[#F5A623]",
      label: "💸 Fundraiser",
      action: "Donate →",
      emoji: item.emoji || "💸",
    };
  }

  return {
    card: "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.07)]",
    pill: "bg-[rgba(54,196,111,0.12)] text-[#8FDEAE]",
    label: "● Event",
    action: weekend ? "Details →" : "Details →",
    emoji: item.emoji || "📍",
  };
}

export default function CampusLivePreviewStrip() {
  const [items, setItems] = useState<CampusLiveItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase
      .from("campus_live_items")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!mounted) return;
        setItems((data as CampusLiveItem[]) || []);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const weekend = useMemo(() => isWeekendMode(new Date()), []);
  const visibleItems = useMemo(() => {
    return [...items]
      .sort((a, b) => {
        const rankA = getCardRank(a, weekend);
        const rankB = getCardRank(b, weekend);
        if (rankA !== rankB) return rankA - rankB;
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4);
  }, [items, weekend]);

  if (loading || visibleItems.length === 0) return null;

  return (
    <section className="border-t border-white/8 px-1 py-5">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-[12px] tracking-[0.04em] text-[rgba(240,238,255,0.45)]">campus live</p>
        <Link href="/campus-live" className="text-[12px] text-[#9B8FFF]">
          See all →
        </Link>
      </div>

      {weekend ? (
        <div className="mb-3 px-1">
          <div className="inline-flex items-center gap-2 rounded-[20px] border border-[rgba(107,92,231,0.3)] bg-[rgba(107,92,231,0.15)] px-[10px] py-[3px] text-[11px] text-[#9B8FFF]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#9B8FFF]" />
            Weekend mode · Fri–Sun
          </div>
        </div>
      ) : null}

      <div className="flex gap-[10px] overflow-x-auto px-1 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
        {visibleItems.map((item) => {
          const tone = getCardTone(item, weekend);
          const raised = Number(item.amount_raised ?? item.raised_amount ?? 0);
          const goal = Math.max(1, Number(item.goal_amount ?? 1));
          const progress = Math.min(100, Math.round((raised / goal) * 100));

          return (
            <Link
              key={String(item.id)}
              href="/campus-live"
              className={`w-[200px] shrink-0 rounded-[14px] border p-3 ${tone.card}`}
            >
              <span className={`inline-flex rounded-[20px] px-2 py-[2px] text-[10px] ${tone.pill}`}>{tone.label}</span>
              <div className="mb-2 mt-2 text-[22px]">{tone.emoji}</div>
              <p className="text-[13px] font-medium text-[#F0EEFF]">{item.title || "Campus live item"}</p>
              <p className="mt-1 text-[11px] text-[rgba(240,238,255,0.4)]">{item.subtitle || item.location || "Temple campus"}</p>
              {isFundraiser(item) ? (
                <div className="mt-3">
                  <div className="h-[3px] rounded-[2px] bg-[#F5A623]" style={{ width: `${Math.max(8, progress)}%` }} />
                  <p className="mt-2 text-[11px] text-[#F5A623]">${raised} raised</p>
                </div>
              ) : null}
              <p className="mt-3 text-[11px] font-medium text-[#9B8FFF]">{tone.action}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
