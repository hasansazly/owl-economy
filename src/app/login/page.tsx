import Link from "next/link";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="page-shell px-4 py-10 text-[var(--foreground)] sm:px-6">
      <div className="relative z-10 mx-auto max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white/75"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to MyDormStash
        </Link>

        <div className="page-card mt-8 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <p className="font-display text-3xl font-bold tracking-[-0.03em]">
            <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
          </p>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-[-0.03em]">Log in</h1>
          <p className="mt-2 text-sm leading-6 text-white/42">
            Access your listings, post new items, and manage your campus marketplace activity.
          </p>

          <form className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 inline-block text-sm text-white/60">Email</span>
              <div className="flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-white/35" />
                <input
                  type="email"
                  placeholder="you@temple.edu"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 inline-block text-sm text-white/60">Password</span>
              <div className="flex items-center gap-3 rounded-[14px] border border-[var(--border)] bg-white/5 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-white/35" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
                />
              </div>
            </label>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-white/35">
            Need an account?{" "}
            <Link href="/signup" className="font-medium text-[var(--accent)]">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
