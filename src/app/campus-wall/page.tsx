"use client";

import Link from "next/link";
import { ArrowLeft, ImagePlus, MessageCircle, Plus, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentProfile, isVerifiedStudentLoggedIn } from "@/lib/app-auth";
import { parseCampusWallMeta, serializeCampusWallMeta } from "@/lib/campus-wall";
import { buildWeeklyLeaderboard, computeCampusKarma } from "@/lib/campus-identity";
import { getRelativePostLabel } from "@/lib/listing-urgency";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type WallListing = {
  id: string | number;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  poster_name?: string | null;
  major?: string | null;
  class_year?: string | null;
  contact_email?: string | null;
  email?: string | null;
  created_at?: string | null;
};

type ComposerType = "text" | "photo";

const POST_CATEGORY = "Campus Wall";
const COMMENT_CATEGORY = "Campus Wall Comment";
const REACTION_CATEGORY = "Campus Wall Reaction";
const WALL_REACTIONS = ["❤️", "😂", "🔥", "👏"] as const;

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export default function CampusWallPage() {
  const profile = useMemo(() => getStudentProfile(), []);
  const [posts, setPosts] = useState<WallListing[]>([]);
  const [comments, setComments] = useState<WallListing[]>([]);
  const [reactions, setReactions] = useState<WallListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<ComposerType>("text");
  const [textBody, setTextBody] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [photoData, setPhotoData] = useState("");
  const [posting, setPosting] = useState(false);
  const [selectedPost, setSelectedPost] = useState<WallListing | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commenting, setCommenting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured.");
      return;
    }

    let mounted = true;

    supabase
      .from("listings")
      .select("*")
      .in("category", [POST_CATEGORY, COMMENT_CATEGORY, REACTION_CATEGORY])
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!mounted) return;

        if (fetchError) {
          setError("Could not load Campus Wall.");
        } else {
          const rows = (data as WallListing[]) || [];
          setPosts(rows.filter((row) => row.category === POST_CATEGORY));
          setComments(rows.filter((row) => row.category === COMMENT_CATEGORY));
          setReactions(rows.filter((row) => row.category === REACTION_CATEGORY));
        }

        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const leaderboard = useMemo(
    () => buildWeeklyLeaderboard(posts).slice(0, 10),
    [posts],
  );

  const selectedComments = useMemo(
    () => comments.filter((comment) => String(comment.title || "") === String(selectedPost?.id || "")),
    [comments, selectedPost],
  );

  const postReactionCounts = (postId: string | number) =>
    WALL_REACTIONS.map((emoji) => ({
      emoji,
      count: reactions.filter(
        (reaction) => String(reaction.title || "") === String(postId) && reaction.description === emoji,
      ).length,
      reacted:
        reactions.find(
          (reaction) =>
            String(reaction.title || "") === String(postId) &&
            reaction.description === emoji &&
            (reaction.contact_email || reaction.email || "").trim().toLowerCase() === profile.email.trim().toLowerCase(),
        ) !== undefined,
    }));

  const submitPost = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (!isVerifiedStudentLoggedIn()) {
      setError("Log in first to post on Campus Wall.");
      return;
    }

    const body = composerType === "text" ? textBody.trim() : photoCaption.trim();
    if (composerType === "text" && !body) {
      setError("Write something first.");
      return;
    }
    if (composerType === "photo" && !photoData) {
      setError("Add a photo first.");
      return;
    }

    try {
      setPosting(true);
      setError("");

      const description = serializeCampusWallMeta({
        type: composerType,
        body: composerType === "text" ? textBody.trim() : photoCaption.trim(),
        caption: composerType === "photo" ? photoCaption.trim() : "",
        imageData: composerType === "photo" ? photoData : "",
      });

      const title =
        composerType === "text"
          ? textBody.trim().slice(0, 48) || "Campus Wall post"
          : photoCaption.trim().slice(0, 48) || "Campus Wall photo";

      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          title,
          price: 0,
          category: POST_CATEGORY,
          description,
          poster_name: profile.name.trim() || "Temple Student",
          major: profile.major.trim() || null,
          class_year: profile.classYear.trim() || null,
          contact_email: profile.email.trim() || null,
          email: profile.email.trim() || null,
          location: "Campus Wall",
        } as never)
        .select("*")
        .single();

      if (insertError || !data) {
        throw new Error("Could not publish your Wall post.");
      }

      setPosts((current) => [data as WallListing, ...current]);
      setComposerOpen(false);
      setTextBody("");
      setPhotoCaption("");
      setPhotoData("");
      setComposerType("text");
    } catch (postError) {
      setError(postError instanceof Error ? postError.message : "Could not publish your Wall post.");
    } finally {
      setPosting(false);
    }
  };

  const submitComment = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !selectedPost) return;
    if (!commentDraft.trim()) return;

    try {
      setCommenting(true);

      const { data, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: String(selectedPost.id),
          price: 0,
          category: COMMENT_CATEGORY,
          description: commentDraft.trim(),
          poster_name: profile.name.trim() || "Temple Student",
          major: profile.major.trim() || null,
          class_year: profile.classYear.trim() || null,
          contact_email: profile.email.trim() || null,
          email: profile.email.trim() || null,
          location: "Campus Wall",
        } as never)
        .select("*")
        .single();

      if (insertError || !data) {
        throw new Error("Could not post comment.");
      }

      setComments((current) => [data as WallListing, ...current]);
      setCommentDraft("");
    } finally {
      setCommenting(false);
    }
  };

  const toggleReaction = async (post: WallListing, emoji: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const existing = reactions.find(
      (reaction) =>
        String(reaction.title || "") === String(post.id) &&
        reaction.description === emoji &&
        (reaction.contact_email || reaction.email || "").trim().toLowerCase() === profile.email.trim().toLowerCase(),
    );

    if (existing) {
      await supabase.from("listings").delete().eq("id", existing.id);
      setReactions((current) => current.filter((reaction) => reaction.id !== existing.id));
      return;
    }

    const { data } = await supabase
      .from("listings")
      .insert({
        title: String(post.id),
        price: 0,
        category: REACTION_CATEGORY,
        description: emoji,
        poster_name: profile.name.trim() || "Temple Student",
        major: profile.major.trim() || null,
        class_year: profile.classYear.trim() || null,
        contact_email: profile.email.trim() || null,
        email: profile.email.trim() || null,
        location: "Campus Wall",
      } as never)
      .select("*")
      .single();

    if (data) {
      setReactions((current) => [data as WallListing, ...current]);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-4 pb-28 pt-4 sm:px-6">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/8 bg-[rgba(0,0,0,0.94)] py-4 backdrop-blur-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/52 hover:text-white/72">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <p className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
            <span className="text-cyan-400">my</span>dormstash<span className="text-white/88">.com</span>
          </p>
        </header>

        <section className="pt-5">
          <p className="whisper-label">Campus Wall</p>
          <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.04em] text-white">Campus moments, memes, and dorm tips.</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-white/52">
            Pure engagement. Post photo + caption or text only, react, comment, and keep students scrolling.
          </p>
        </section>

        <section className="mt-5">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <div key={entry.email} className="min-w-[74px] text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-fuchsia-400/40 bg-[linear-gradient(135deg,_rgba(34,211,238,0.08),_rgba(217,70,239,0.18))] text-sm font-semibold text-white">
                    {entry.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <p className="mt-2 truncate text-[11px] text-white/68">{entry.name}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-4 text-[13px] text-white/42">
                Top Wall creators will appear here for the full week once students start posting.
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <div className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.03] p-4 text-[13px] text-white/42">
            Loading Campus Wall...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-[18px] border border-[rgba(240,80,80,0.22)] bg-[rgba(240,80,80,0.08)] p-4 text-[13px] text-[#F09595]">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-6 rounded-[18px] border border-dashed border-white/12 bg-[rgba(255,255,255,0.02)] p-6 text-center text-[13px] text-white/42">
            No Campus Wall posts yet. The first dorm tip or meme will show up here.
          </div>
        ) : (
          <section className="mt-6 space-y-4">
            {posts.map((post) => {
              const meta = parseCampusWallMeta(post.description);
              const karma = computeCampusKarma(posts, (post.contact_email || post.email || "").trim().toLowerCase());
              const reactionCounts = postReactionCounts(post.id);

              return (
                <article
                  key={String(post.id)}
                  className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 shadow-[0_16px_36px_rgba(0,0,0,0.2)]"
                >
                  <button type="button" onClick={() => setSelectedPost(post)} className="block w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[15px] font-semibold text-white">{post.poster_name || "Temple Student"}</p>
                        <p className="mt-1 text-[12px] text-white/46">
                          {post.major ? `${post.major} · ` : ""}
                          {post.class_year || ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] text-white/42">{getRelativePostLabel(post.created_at)}</p>
                        <p className="mt-1 text-[11px] font-semibold text-fuchsia-300">Karma {karma}</p>
                      </div>
                    </div>

                    {meta.type === "photo" && meta.imageData ? (
                      <div className="mt-4 overflow-hidden rounded-[18px] border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={meta.imageData} alt={meta.caption || "Campus Wall photo"} className="h-auto w-full object-cover" />
                      </div>
                    ) : null}

                    <p className="mt-4 text-[14px] leading-7 text-white/82">
                      {meta.type === "photo" ? meta.caption || "Campus Wall photo" : meta.body}
                    </p>
                  </button>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {reactionCounts.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        type="button"
                        onClick={() => toggleReaction(post, reaction.emoji)}
                        className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                          reaction.reacted
                            ? "border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-300"
                            : "border-white/10 bg-white/[0.03] text-white/74 hover:border-white/20"
                        }`}
                      >
                        {reaction.emoji} {reaction.count}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedPost(post)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-white/74"
                    >
                      <MessageCircle className="mr-1 inline h-3.5 w-3.5" />
                      {comments.filter((comment) => String(comment.title || "") === String(post.id)).length}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>

      <button
        type="button"
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-6 right-5 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-400 text-black shadow-[0_18px_36px_rgba(217,70,239,0.28)]"
        aria-label="Post to Campus Wall"
      >
        <Plus className="h-6 w-6" />
      </button>

      {composerOpen ? (
        <div className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.72)]">
          <button type="button" className="absolute inset-0" aria-label="Close Wall composer" onClick={() => setComposerOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[24px] border border-white/10 bg-[#090909] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="whisper-label">Campus Wall</p>
                <h2 className="mt-1 text-[20px] font-semibold text-white">New post</h2>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} className="rounded-full border border-white/10 p-2 text-white/55">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setComposerType("text")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold ${composerType === "text" ? "bg-fuchsia-400 text-black" : "border border-white/10 bg-white/[0.03] text-white/74"}`}
              >
                Text only
              </button>
              <button
                type="button"
                onClick={() => setComposerType("photo")}
                className={`rounded-full px-4 py-2 text-[13px] font-semibold ${composerType === "photo" ? "bg-fuchsia-400 text-black" : "border border-white/10 bg-white/[0.03] text-white/74"}`}
              >
                Photo + caption
              </button>
            </div>

            {composerType === "text" ? (
              <textarea
                rows={5}
                value={textBody}
                onChange={(event) => setTextBody(event.target.value)}
                className="mt-4 w-full rounded-[14px] border border-white/10 bg-white/5 px-4 py-3 text-[14px] outline-none"
                placeholder="Drop a dorm tip, campus thought, meme, or whatever you want to say..."
              />
            ) : (
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-dashed border-white/14 bg-white/[0.03] px-4 py-8 text-[13px] text-white/68">
                  <ImagePlus className="h-4 w-4" />
                  Add photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await fileToDataUrl(file);
                      setPhotoData(dataUrl);
                    }}
                  />
                </label>
                {photoData ? (
                  <div className="overflow-hidden rounded-[14px] border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoData} alt="Selected upload" className="h-auto w-full object-cover" />
                  </div>
                ) : null}
                <input
                  value={photoCaption}
                  onChange={(event) => setPhotoCaption(event.target.value)}
                  className="w-full rounded-[12px] border border-white/10 bg-white/5 px-3 py-2.5 text-[13px] outline-none"
                  placeholder="Little caption"
                />
              </div>
            )}

            {error ? <p className="mt-3 text-[12px] text-[#F09595]">{error}</p> : null}

            <button
              type="button"
              onClick={submitPost}
              disabled={posting}
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-fuchsia-400 px-5 py-3 text-[14px] font-semibold text-black disabled:opacity-40"
            >
              {posting ? "Posting..." : "Post to Campus Wall"}
            </button>
          </div>
        </div>
      ) : null}

      {selectedPost ? (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.76)]">
          <button type="button" className="absolute inset-0" aria-label="Close post details" onClick={() => setSelectedPost(null)} />
          <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg rounded-t-[24px] border border-white/10 bg-[#090909] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[18px] font-semibold text-white">Reactions & comments</h2>
              <button type="button" onClick={() => setSelectedPost(null)} className="rounded-full border border-white/10 p-2 text-white/55">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {postReactionCounts(selectedPost.id).map((reaction) => (
                <button
                  key={reaction.emoji}
                  type="button"
                  onClick={() => toggleReaction(selectedPost, reaction.emoji)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] ${reaction.reacted ? "border-fuchsia-400/30 bg-fuchsia-400/12 text-fuchsia-300" : "border-white/10 bg-white/[0.03] text-white/74"}`}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {selectedComments.length > 0 ? (
                selectedComments.map((comment) => (
                  <div key={String(comment.id)} className="rounded-[14px] border border-white/10 bg-white/[0.03] px-3 py-3">
                    <p className="text-[12px] font-semibold text-white">
                      {comment.poster_name || "Temple Student"}
                      {comment.major ? ` · ${comment.major}` : ""}
                    </p>
                    <p className="mt-2 text-[13px] leading-6 text-white/72">{comment.description || ""}</p>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-white/42">No comments yet.</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={commentDraft}
                onChange={(event) => setCommentDraft(event.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-[13px] outline-none"
                placeholder="Write a comment..."
              />
              <button
                type="button"
                onClick={submitComment}
                disabled={commenting}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-fuchsia-400 text-black disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
