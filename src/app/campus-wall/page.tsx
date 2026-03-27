"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentProfile, isVerifiedStudentLoggedIn } from "@/lib/app-auth";
import { computeCampusKarma, getCampusKarmaLabel } from "@/lib/campus-identity";
import { getRelativePostLabel } from "@/lib/listing-urgency";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type WallPost = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  poster_name?: string | null;
  major?: string | null;
  class_year?: string | null;
  contact_email?: string | null;
  email?: string | null;
  created_at?: string | null;
};

const wallTemplates = [
  {
    label: "Dorm tip",
    title: "Dorm tip",
    description: "If your room gets hot, clip a fan near the window and keep the desk clear for airflow.",
  },
  {
    label: "Campus meme",
    title: "Campus meme",
    description: "Charles Library at finals week feels like a 24-hour airport terminal.",
  },
  {
    label: "Campus moment",
    title: "Campus moment",
    description: "Best sunset on campus tonight was by the Bell Tower.",
  },
] as const;

export default function CampusWallPage() {
  const profile = useMemo(() => getStudentProfile(), []);
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    supabase
      .from("listings")
      .select("id, title, description, poster_name, major, class_year, contact_email, email, created_at")
      .eq("category", "Campus Wall")
      .order("created_at", { ascending: false })
      .then(({ data, error: wallError }) => {
        if (wallError) {
          setError("Could not load Campus Wall.");
          setPosts([]);
        } else {
          setPosts((data as WallPost[]) || []);
        }

        setLoading(false);
      });
  }, []);

  const applyTemplate = (template: (typeof wallTemplates)[number]) => {
    setTitle(template.title);
    setDescription(template.description);
    setPostError("");
    setSuccess("");
  };

  const handlePost = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setPostError("Supabase is not configured.");
      return;
    }

    if (!isVerifiedStudentLoggedIn()) {
      setPostError("Log in with your Temple account to post on the Campus Wall.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setPostError("Add a title and post text first.");
      return;
    }

    try {
      setPosting(true);
      setPostError("");
      setSuccess("");

      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: title.trim(),
          price: 0,
          category: "Campus Wall",
          description: description.trim(),
          poster_name: profile.name.trim() || "Temple Student",
          major: profile.major.trim() || null,
          class_year: profile.classYear.trim() || null,
          contact_email: profile.email.trim() || null,
          email: profile.email.trim() || null,
        } as never)
        .select("id, title, description, poster_name, major, class_year, contact_email, email, created_at")
        .single();

      if (insertError || !data) {
        throw new Error("Could not post to Campus Wall.");
      }

      setPosts((current) => [data as WallPost, ...current]);
      setTitle("");
      setDescription("");
      setSuccess("Campus Wall post is live.");
    } catch (wallPostError) {
      setPostError(wallPostError instanceof Error ? wallPostError.message : "Could not post to Campus Wall.");
    } finally {
      setPosting(false);
    }
  };

  const getPostKarma = (post: WallPost) => {
    const email = post.contact_email || post.email || "";
    const score = computeCampusKarma(posts, email);
    return { score, label: getCampusKarmaLabel(score) };
  };

  return (
    <main className="page-shell">
      <section className="page-wrap max-w-5xl">
        <header className="page-header">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <p className="font-display text-[1.35rem] font-extrabold tracking-[-0.03em]">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </p>

          <div className="page-chip hidden items-center gap-2 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            Campus Wall
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Campus Wall</p>
          <h1 className="page-title">Campus moments worth scrolling.</h1>
          <p className="page-copy">Post dorm tips, campus memes, and quick moments even when you are not selling anything.</p>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="page-card px-4 py-4">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <MessageSquareText className="h-4 w-4" />
              Post to the Wall
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="text-[13px] font-semibold text-white">Quick Starts</span>
                <div className="mt-3 flex flex-wrap gap-2">
                  {wallTemplates.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => applyTemplate(template)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-semibold text-white/72 transition hover:border-white/25 hover:bg-white/[0.08]"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Title</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="Quick campus thought"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] text-white/48">Post</span>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] leading-6 outline-none"
                  placeholder="Share a dorm tip, meme, or campus moment."
                />
              </label>

              {postError ? <p className="text-[12px] text-[#F09595]">{postError}</p> : null}
              {success ? <p className="text-[12px] font-semibold text-cyan-300">{success}</p> : null}

              <button
                type="button"
                onClick={handlePost}
                disabled={posting}
                className="capsule-primary inline-flex w-full items-center justify-center px-5 py-3 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {posting ? "Posting..." : "Post to Campus Wall"}
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="page-card px-4 py-4">
              <p className="section-kicker !mt-0 !px-0">Live Wall</p>

              {loading ? (
                <p className="mt-4 text-[13px] text-white/42">Loading Campus Wall...</p>
              ) : error ? (
                <p className="mt-4 text-[13px] text-[#F09595]">{error}</p>
              ) : posts.length === 0 ? (
                <p className="mt-4 text-[13px] text-white/42">No wall posts yet. The feed will appear as soon as students start posting.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {posts.map((post) => {
                    const karma = getPostKarma(post);

                    return (
                      <article
                        key={String(post.id)}
                        className="rounded-[16px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-[15px] font-semibold text-white">{post.title || "Campus Wall"}</h2>
                            <p className="mt-1 text-[11px] text-white/52">
                              {post.poster_name || "Temple Student"}
                              {post.major ? ` · ${post.major}` : ""}
                              {post.class_year ? ` · ${post.class_year}` : ""}
                            </p>
                          </div>
                          <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-fuchsia-300">
                            Wall
                          </span>
                        </div>
                        <p className="mt-3 text-[13px] leading-6 text-white/58">{post.description || "Campus post"}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/46">
                          <span>{getRelativePostLabel(post.created_at)}</span>
                          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
                            Karma {karma.score} · {karma.label}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
