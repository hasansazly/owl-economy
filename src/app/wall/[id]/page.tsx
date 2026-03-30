"use client";

import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle } from "lucide-react";
import { use, useEffect, useMemo, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type WallProfile =
  | {
      full_name?: string | null;
      avatar_url?: string | null;
    }
  | Array<{
      full_name?: string | null;
      avatar_url?: string | null;
    }>
  | null;

type WallPost = {
  id: string | number;
  text?: string | null;
  body?: string | null;
  content?: string | null;
  image_url?: string | null;
  created_at?: string | null;
  like_count?: number | null;
  comment_count?: number | null;
  profiles?: WallProfile;
};

type WallComment = {
  id: string | number;
  post_id?: string | number | null;
  text?: string | null;
  created_at?: string | null;
  profiles?: WallProfile;
};

function getProfileData(profile: WallProfile) {
  if (Array.isArray(profile)) return profile[0] || null;
  return profile || null;
}

function getInitials(name?: string | null) {
  const parts = (name || "Temple Student").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TS";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function getWallText(post?: WallPost | null) {
  if (!post) return "";
  return post.text || post.body || post.content || "";
}

export default function WallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<WallPost | null>(null);
  const [comments, setComments] = useState<WallComment[]>([]);
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    supabase
      .from("wall_posts")
      .select("*, profiles(full_name, avatar_url)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setPost((data as WallPost | null) || null));

    supabase
      .from("wall_comments")
      .select("*, profiles(full_name, avatar_url)")
      .eq("post_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setComments((data as WallComment[]) || []));
  }, [id]);

  const profile = useMemo(() => getProfileData(post?.profiles || null), [post?.profiles]);
  const name = profile?.full_name || "Temple Student";

  const submitComment = async () => {
    if (!draft.trim()) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) return;

    const { data } = await supabase
      .from("wall_comments")
      .insert({
        post_id: id,
        user_id: user.id,
        text: draft.trim(),
        created_at: new Date().toISOString(),
      } as never)
      .select("*, profiles(full_name, avatar_url)")
      .single();

    if (data) {
      setComments((current) => [...current, data as WallComment]);
      setDraft("");
    }
  };

  return (
    <main className="page-shell">
      <section className="page-wrap pb-[calc(env(safe-area-inset-bottom)+140px)]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {post ? (
          <section className="mt-4 space-y-4">
            <div className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                    {getInitials(name)}
                  </div>
                )}
                <div>
                  <p className="text-[13px] font-medium text-[#F0EEFF]">{name}</p>
                  <p className="text-[11px] text-[rgba(240,238,255,0.4)]">{post.created_at || "just now"}</p>
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-[1.6] text-[#F0EEFF]">{getWallText(post)}</p>
              {post.image_url ? (
                <img src={post.image_url} alt="Wall post" className="mt-3 aspect-[16/9] w-full rounded-[10px] object-cover" />
              ) : null}
              <button
                type="button"
                onClick={async () => {
                  const supabase = getSupabaseBrowserClient();
                  if (!supabase || !post) return;
                  const nextLiked = !liked;
                  const nextCount = Math.max(0, Number(post.like_count || 0) + (nextLiked ? 1 : -1));
                  setLiked(nextLiked);
                  setPost({ ...post, like_count: nextCount });
                  await supabase.from("wall_posts").update({ like_count: nextCount } as never).eq("id", post.id);
                }}
                className="mt-3 inline-flex items-center gap-2 text-[12px] text-[rgba(240,238,255,0.4)]"
              >
                <Heart className={`h-4 w-4 ${liked ? "fill-[#9B8FFF] text-[#9B8FFF]" : ""}`} />
                {post.like_count || 0}
              </button>
            </div>

            <div className="space-y-3">
              {comments.map((comment) => {
                const commentProfile = getProfileData(comment.profiles || null);
                const commentName = commentProfile?.full_name || "Temple Student";
                return (
                  <article key={String(comment.id)} className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-[14px]">
                    <div className="flex items-center gap-3">
                      {commentProfile?.avatar_url ? (
                        <img src={commentProfile.avatar_url} alt={commentName} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(107,92,231,0.2)] text-[12px] text-[#9B8FFF]">
                          {getInitials(commentName)}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-[#F0EEFF]">{commentName}</p>
                        <p className="text-[11px] text-[rgba(240,238,255,0.4)]">{comment.created_at || "just now"}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-[14px] leading-[1.6] text-[#F0EEFF]">{comment.text || ""}</p>
                  </article>
                );
              })}
            </div>
          </section>
        ) : (
          <p className="mt-6 text-[13px] text-[rgba(240,238,255,0.35)]">Post not found.</p>
        )}
      </section>

      <div className="mobile-bottom-nav border-t border-white/10 bg-[#0A0916] px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Write a comment..."
            className="h-[48px] flex-1 rounded-[12px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 text-[16px] text-[#F0EEFF] outline-none"
          />
          <button
            type="button"
            onClick={submitComment}
            className="inline-flex h-[48px] items-center justify-center rounded-[20px] bg-[#6B5CE7] px-5 text-[14px] font-medium text-white"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
