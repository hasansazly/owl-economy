"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Building2, LogOut, ScrollText, ShieldCheck, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  clearStudentProfile,
  clearVerifiedStudentEmail,
  getStudentProfile,
  getVerifiedStudentEmail,
  saveStudentProfile,
  type StudentProfile,
} from "@/lib/app-auth";
import { buildWeeklyLeaderboard, computeCampusKarma, getCampusBadges, normalizeTagList } from "@/lib/campus-identity";
import { isVerifiedTempleEmail } from "@/lib/security";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const classYears = ["2028", "2027", "2026", "2025", "Graduate"] as const;

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile>({
    name: "",
    email: "",
    phone: "",
    major: "",
    classYear: "2028",
    homeBuilding: "",
    followedBuildings: [],
    followedMajors: [],
    privacyMode: true,
    eventAlerts: true,
    lostFoundAlerts: true,
  });
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [listings, setListings] = useState<
    Array<{
      contact_email?: string | null;
      email?: string | null;
      category?: string | null;
      poster_name?: string | null;
      major?: string | null;
      class_year?: string | null;
      created_at?: string | null;
      id: string | number;
    }>
  >([]);

  useEffect(() => {
    const email = getVerifiedStudentEmail();

    if (!email) {
      router.push("/login");
      return;
    }

    setProfile(getStudentProfile());
  }, [router]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("listings")
      .select("id, contact_email, email, category, poster_name, major, class_year, created_at")
      .then(({ data }) => {
        setListings((data as typeof listings) || []);
      });
  }, []);

  const myKarma = useMemo(() => computeCampusKarma(listings, profile.email), [listings, profile.email]);
  const myBadges = useMemo(() => getCampusBadges(listings, profile.email), [listings, profile.email]);
  const leaderboardRank = useMemo(() => {
    const leaderboard = buildWeeklyLeaderboard(listings);
    return leaderboard.findIndex((entry) => entry.email === profile.email) + 1;
  }, [listings, profile.email]);

  const updateField = <K extends keyof StudentProfile>(field: K, value: StudentProfile[K]) => {
    setProfile((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    if (!isVerifiedTempleEmail(profile.email)) {
      setSaveError("Only your @temple.edu email can be saved here.");
      setSaved(false);
      return;
    }

    setSaveError("");
    saveStudentProfile(profile);
    setSaved(true);
  };

  const handleLogout = () => {
    clearVerifiedStudentEmail();
    clearStudentProfile();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-3 sm:px-6">
        <header className="mobile-top-bar border-b border-white/8 bg-[rgba(0,0,0,0.92)] py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Link>

            <p className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
              <span className="text-cyan-400">my</span>dormstash<span className="text-white/88">.com</span>
            </p>
          </div>
        </header>

        <section className="px-1 py-6">
          <p className="whisper-label">Temple student account</p>
          <h1 className="mt-3 font-display text-[2.1rem] font-bold tracking-[-0.05em] text-white sm:text-[2.7rem]">
            Account Settings
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/48">
            Edit your student info, class year, privacy settings, and feed preferences.
          </p>
        </section>

        <section className="mb-4 grid gap-3 px-1 sm:grid-cols-3">
          <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="whisper-label">Campus Karma</p>
            <p className="mt-2 text-[22px] font-bold text-white">{myKarma}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="whisper-label">Temple Rank</p>
            <p className="mt-2 text-[22px] font-bold text-white">{leaderboardRank > 0 ? `#${leaderboardRank}` : "Unranked"}</p>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4">
            <p className="whisper-label">Badges</p>
            <p className="mt-2 text-[22px] font-bold text-white">{myBadges.length}</p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="page-card p-5">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-cyan-400" />
              <h2 className="text-[16px] font-semibold text-white">Edit Information</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Full Name</span>
                <input
                  value={profile.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="Ronnie H. Sarkar"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Temple Email</span>
                <input
                  value={profile.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="you@temple.edu"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Phone</span>
                <input
                  value={profile.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="(267) 555-0193"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Major</span>
                <input
                  value={profile.major}
                  onChange={(event) => updateField("major", event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="Computer Science"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Class</span>
                <select
                  value={profile.classYear}
                  onChange={(event) => updateField("classYear", event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                >
                  {classYears.map((year) => (
                    <option key={year} value={year} className="bg-[#0b0e14] text-white">
                      Class of {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <article className="page-card p-5">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-cyan-400" />
                <h2 className="text-[16px] font-semibold text-white">Feed Preferences</h2>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-[12px] text-white/48">Home Building</span>
                  <input
                    value={profile.homeBuilding}
                    onChange={(event) => updateField("homeBuilding", event.target.value)}
                    className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                    placeholder="Morgan Hall"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] text-white/48">Follow Buildings</span>
                  <input
                    value={profile.followedBuildings.join(", ")}
                    onChange={(event) => updateField("followedBuildings", normalizeTagList(event.target.value))}
                    className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                    placeholder="Morgan Hall, 1300, Johnson"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] text-white/48">Follow Majors</span>
                  <input
                    value={profile.followedMajors.join(", ")}
                    onChange={(event) => updateField("followedMajors", normalizeTagList(event.target.value))}
                    className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                    placeholder="Computer Science, Biology"
                  />
                </label>
              </div>
            </article>

            <article className="page-card p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                <h2 className="text-[16px] font-semibold text-white">Privacy & Settings</h2>
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-[13px] text-white/78">Private profile mode</span>
                  <input
                    type="checkbox"
                    checked={profile.privacyMode}
                    onChange={(event) => updateField("privacyMode", event.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-[13px] text-white/78">Event alerts</span>
                  <input
                    type="checkbox"
                    checked={profile.eventAlerts}
                    onChange={(event) => updateField("eventAlerts", event.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
                <label className="flex items-center justify-between rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3">
                  <span className="text-[13px] text-white/78">Lost & Found alerts</span>
                  <input
                    type="checkbox"
                    checked={profile.lostFoundAlerts}
                    onChange={(event) => updateField("lostFoundAlerts", event.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                </label>
              </div>
            </article>

            <article className="page-card p-5">
              <div className="flex items-center gap-3">
                <ScrollText className="h-5 w-5 text-cyan-400" />
                <h2 className="text-[16px] font-semibold text-white">Quick Links</h2>
              </div>

              {myBadges.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {myBadges.map((badge) => (
                    <span
                      key={badge.id}
                      className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-300"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-[12px] text-white/42">Badges unlock from real selling, events, and helping students on campus.</p>
              )}

              <div className="mt-5 grid gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/78 transition hover:bg-white/[0.06]"
                >
                  Go to Campus Feed
                </Link>
                <Link
                  href="/sell-goods"
                  className="rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/78 transition hover:bg-white/[0.06]"
                >
                  Manage Listings
                </Link>
                <Link
                  href="/"
                  className="rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-3 text-[13px] text-white/78 transition hover:bg-white/[0.06]"
                >
                  Back to Home
                </Link>
              </div>
            </article>

            <article className="page-card p-5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-cyan-400" />
                <h2 className="text-[16px] font-semibold text-white">Save & Log Out</h2>
              </div>

              {saved ? <p className="mt-4 text-[12px] text-[var(--brand-blue)]">Changes saved.</p> : null}
              {saveError ? <p className="mt-4 text-[12px] text-[rgba(240,238,255,0.35)]">{saveError}</p> : null}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-[13px] font-semibold text-white transition hover:opacity-90"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[13px] font-semibold text-white/78 transition hover:bg-white/[0.08]"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
