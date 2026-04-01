"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { getStudentProfile, saveStudentProfile, setVerifiedStudentEmail } from "@/lib/app-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function SigninPage() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail.endsWith("@temple.edu")) {
      setError("Use your Temple email.");
      return;
    }

    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        throw error;
      }

      const fullName =
        typeof data.user?.user_metadata?.full_name === "string" && data.user.user_metadata.full_name.trim()
          ? data.user.user_metadata.full_name.trim()
          : getStudentProfile().name;

      setVerifiedStudentEmail(normalizedEmail);
      saveStudentProfile({
        ...getStudentProfile(),
        name: fullName,
        email: normalizedEmail,
      });

      window.location.href = "/";
    } catch (signinError) {
      setError(signinError instanceof Error ? signinError.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0916] px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-0 text-[#F0EEFF]">
      <div className="mx-auto w-full max-w-[100vw]">
        <div className="pt-[calc(env(safe-area-inset-top)+24px)] text-center">
          <p className="font-display text-[22px] font-semibold tracking-[-0.03em] text-[#F0EEFF]">
            my<span className="text-[#9B8FFF]">dorm</span>stash
          </p>
          <p className="mt-2 text-[12px] text-[rgba(240,238,255,0.45)]">Temple&apos;s campus marketplace</p>
        </div>

        <section className="mt-10 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-6">
          <form className="space-y-4" onSubmit={handleSignin}>
            <label className="block">
              <span className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@temple.edu"
                autoComplete="email"
                className="px-4"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Password</span>
              <div className="flex h-12 items-center gap-3 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="inline-flex h-[44px] w-[44px] items-center justify-center text-[rgba(240,238,255,0.45)]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error ? <p className="text-[12px] text-[#F5A623]">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] px-4 text-[15px] font-medium text-white disabled:opacity-45"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-[rgba(240,238,255,0.45)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#9B8FFF]">
              Sign up
            </Link>
          </p>

          <div className="mt-4 text-center">
            <button type="button" className="inline-flex min-h-[44px] items-center justify-center text-[13px] text-[#9B8FFF]">
              Forgot password
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
