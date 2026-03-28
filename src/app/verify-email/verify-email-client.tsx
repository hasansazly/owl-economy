"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentProfile, saveStudentProfile, setVerifiedStudentEmail } from "@/lib/app-auth";
import { isVerifiedTempleEmail } from "@/lib/security";

const RESEND_WAIT_SECONDS = 60;

type VerifyEmailClientProps = {
  email: string;
};

const INCORRECT_CODE_MESSAGE = "Incorrect code. Please check your Temple email again.";

export default function VerifyEmailClient({ email }: VerifyEmailClientProps) {
  const router = useRouter();
  const normalizedEmail = email.trim().toLowerCase();
  const [code, setCode] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendCountdown === 0) return;

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const isCodeReady = useMemo(() => /^\d{6}$/.test(code.trim()), [code]);

  const handleVerify = async () => {
    if (!isCodeReady || !normalizedEmail) return;

    try {
      setLoading(true);
      setError("");
      const normalizedCode = String(code).trim();

      if (!isVerifiedTempleEmail(normalizedEmail)) {
        throw new Error("Only Temple students using @temple.edu can access MyDormStash.");
      }

      const response = await fetch("/api/signup/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          code: normalizedCode,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || INCORRECT_CODE_MESSAGE);
      }

      setVerified(true);
      setVerifiedStudentEmail(normalizedEmail);
      const currentProfile = getStudentProfile();
      saveStudentProfile({
        ...currentProfile,
        email: normalizedEmail,
      });
      router.push(data.redirectTo || "/dashboard");
    } catch (verifyError) {
      setVerified(false);
      const nextError =
        verifyError instanceof Error && verifyError.message === INCORRECT_CODE_MESSAGE
          ? INCORRECT_CODE_MESSAGE
          : verifyError instanceof Error
            ? verifyError.message
            : "Verification failed.";
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || !normalizedEmail) return;

    try {
      setError("");

      const response = await fetch("/api/signup/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Could not resend code.");
      }

      setResendCountdown(RESEND_WAIT_SECONDS);
      setVerified(false);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Could not resend code.");
    }
  };

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="page-card p-6 sm:p-7">
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(18,214,255,0.2)] bg-[rgba(18,214,255,0.08)] text-[var(--accent)]">
            <Mail className="h-5 w-5" />
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            Verify Your Campus Email
          </p>
          <h1 className="mt-2 font-display text-[1.9rem] font-bold tracking-[-0.04em] text-white">
            Check your .edu inbox
          </h1>
          <p className="mt-3 text-[13px] leading-6 text-white/48">
            We sent a 6-digit code to your student email. Enter it below to join the Temple marketplace.
          </p>
          {normalizedEmail ? <p className="mt-2 text-[12px] text-[var(--accent)]">{normalizedEmail}</p> : null}

          <label className="mt-6 block">
            <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/45">
              Verification Code
            </span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="123456"
              className="w-full rounded-[18px] border border-white/10 bg-white/5 px-5 py-4 text-center font-display text-[2rem] font-semibold tracking-[0.38em] text-white outline-none placeholder:tracking-[0.2em] placeholder:text-white/18 focus:border-[rgba(18,214,255,0.4)]"
            />
          </label>

          {verified ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(18,214,255,0.24)] bg-[rgba(18,214,255,0.08)] px-4 py-2 text-[13px] text-[var(--accent)]">
              <CheckCircle2 className="h-4 w-4" />
              Code verified
            </div>
          ) : null}
          {error ? <p className="mt-4 text-[12px] text-[#F09595]">{error}</p> : null}

          <button
            type="button"
            onClick={handleVerify}
            disabled={!isCodeReady || !normalizedEmail || loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {loading ? "Verifying..." : "Verify Account"}
          </button>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-[12px] text-white/38">Didn&apos;t get the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCountdown > 0}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--accent)] transition hover:text-white disabled:cursor-not-allowed disabled:text-white/28"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
