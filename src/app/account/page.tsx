"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, Building2, LogOut, ScrollText, ShieldCheck, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

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

type ProfileAvatarRow = {
  avatar_url?: string | null;
};

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

async function compressImageFile(file: File) {
  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not available.");
  }

  const maxSize = 800;
  const scale = Math.min(maxSize / imageBitmap.width, maxSize / imageBitmap.height, 1);
  canvas.width = Math.round(imageBitmap.width * scale);
  canvas.height = Math.round(imageBitmap.height * scale);
  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  console.log(`[account-avatar] original image size: ${file.size} bytes`);

  let blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", 0.8);
  });

  if (!blob) {
    throw new Error("Could not compress image.");
  }

  if (blob.size > 300 * 1024) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.6);
    });

    if (!blob) {
      throw new Error("Could not compress image.");
    }
  }

  console.log(`[account-avatar] compressed image size: ${blob.size} bytes`);
  imageBitmap.close();

  return blob;
}

export default function AccountPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
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
      router.push("/signin");
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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id;
      if (!userId) return;

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", userId)
        .maybeSingle();

      if (!active) return;
      const typedProfileRow = profileRow as ProfileAvatarRow | null;
      const nextAvatar = typeof typedProfileRow?.avatar_url === "string" ? typedProfileRow.avatar_url : "";
      setAvatarUrl(nextAvatar);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!avatarError) return;

    const timer = window.setTimeout(() => setAvatarError(""), 4000);
    return () => window.clearTimeout(timer);
  }, [avatarError]);

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
    router.push("/signin");
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setAvatarError("Upload failed. Try again.");
      return;
    }

    try {
      setAvatarUploading(true);
      setAvatarError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) {
        throw new Error("Missing user");
      }

      await supabase.storage.createBucket("avatars", {
        public: true,
      });

      const compressedFile = await compressImageFile(file);
      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, compressedFile, {
        upsert: true,
        contentType: "image/jpeg",
      });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          } as never,
          {
            onConflict: "id",
          },
        );

      if (profileError) {
        throw profileError;
      }

      setAvatarUrl(publicUrl);
    } catch {
      setAvatarError("Upload failed. Try again.");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
          <div className="mb-6 flex flex-col items-center">
            <div
              className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[rgba(107,92,231,0.4)] bg-[rgba(107,92,231,0.2)] transition ${
                avatarUploading ? "animate-pulse opacity-50" : ""
              }`}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Profile avatar" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="text-[24px] font-medium text-[#9B8FFF]">{getInitials(profile.name)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleChangePhoto}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center text-[13px] text-[#9B8FFF]"
            >
              Change photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarSelected}
            />
            {avatarError ? <p className="mt-1 text-[12px] text-[rgba(245,166,35,0.8)]">{avatarError}</p> : null}
          </div>

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
