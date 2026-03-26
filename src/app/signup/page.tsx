"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, User } from "lucide-react";
import { useMemo, useState } from "react";

function getStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

const strengthColors = ["#E24B4A", "#6A7B99", "#A88DFF", "#FF3EA5"];
const strengthLabels = ["", "Weak", "Fair", "Strong", "Very strong"];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const emailState = useMemo(() => {
    const value = email.trim();
    if (!value) return { valid: false, status: "neutral", hint: "Must end in .edu" };
    if (!value.includes("@")) {
      return { valid: false, status: "error", hint: "Enter a valid email address" };
    }
    const domain = value.split("@").pop()?.toLowerCase() ?? "";
    if (!domain.endsWith(".edu")) {
      return { valid: false, status: "error", hint: "Only .edu addresses are accepted" };
    }
    return { valid: true, status: "valid", hint: "University email confirmed" };
  }, [email]);

  const strength = useMemo(() => getStrength(password), [password]);

  const passwordState = useMemo(() => {
    if (!password) return { valid: false, status: "neutral", hint: "" };
    if (password.length < 8) {
      return { valid: false, status: "error", hint: "At least 8 characters required" };
    }
    return { valid: true, status: "valid", hint: strengthLabels[strength] };
  }, [password, strength]);

  const confirmState = useMemo(() => {
    if (!confirm) return { valid: false, status: "neutral", hint: "" };
    if (confirm === password) {
      return { valid: true, status: "valid", hint: "Passwords match" };
    }
    return { valid: false, status: "error", hint: "Passwords do not match" };
  }, [confirm, password]);

  const isFormValid =
    name.trim().length > 0 && emailState.valid && passwordState.valid && confirmState.valid;

  const fieldClass = (status: string) => {
    if (status === "error") return "border-[rgba(240,80,80,0.6)]";
    if (status === "valid") return "border-[rgba(255,62,165,0.45)]";
    return "border-[var(--border)]";
  };

  const hintClass = (status: string) => {
    if (status === "error") return "text-[#F09595]";
    if (status === "valid") return "text-[var(--accent)]";
    return "text-white/30";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (!isFormValid) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Signup failed.");
      }

      router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Signup failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell flex items-center justify-center px-6 py-10 text-[var(--foreground)]">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--accent)]">
              <LockKeyhole className="h-[18px] w-[18px] text-white" />
            </div>
            <p className="font-display text-3xl font-extrabold tracking-[-0.03em]">
              <span className="text-[var(--brand-blue)]">my</span>dormstash<span className="text-white/88">.com</span>
            </p>
          </div>
        </div>

        <div className="page-card px-7 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
          <>
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-[rgba(255,62,165,0.24)] bg-[rgba(255,62,165,0.10)] px-3 py-1.5 text-[11px] font-semibold text-[rgba(255,122,193,0.92)]">
              <GraduationCap className="h-3.5 w-3.5" />
              University accounts only
            </div>

            <h1 className="font-display text-[22px] font-bold tracking-[-0.03em]">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-white/45">
              Join your campus community on MyDormStash.
            </p>

            <form
              className="mt-7 space-y-4"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  Full name
                </span>
                <div
                  className={`flex items-center gap-3 rounded-[12px] border bg-white/5 px-4 py-3 ${fieldClass(
                    name.trim() ? "valid" : "neutral",
                  )}`}
                >
                  <User className="h-4 w-4 text-white/35" />
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jordan Lee"
                    autoComplete="name"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  University email
                </span>
                <div
                  className={`flex items-center gap-3 rounded-[12px] border bg-white/5 px-4 py-3 ${fieldClass(
                    emailState.status,
                  )}`}
                >
                  <Mail className="h-4 w-4 text-white/35" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@university.edu"
                    autoComplete="email"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
                <p className={`mt-1.5 min-h-4 text-[11px] ${hintClass(emailState.status)}`}>
                  {emailState.hint}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  Password
                </span>
                <div
                  className={`flex items-center gap-3 rounded-[12px] border bg-white/5 px-4 py-3 ${fieldClass(
                    passwordState.status,
                  )}`}
                >
                  <LockKeyhole className="h-4 w-4 text-white/35" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-white/35 transition hover:text-white/55"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 flex gap-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className="h-[3px] flex-1 rounded-sm bg-white/8"
                      style={{
                        backgroundColor:
                          index < strength && password
                            ? strengthColors[Math.max(strength - 1, 0)]
                            : undefined,
                      }}
                    />
                  ))}
                </div>
                <p className={`mt-1.5 min-h-4 text-[11px] ${hintClass(passwordState.status)}`}>
                  {passwordState.hint}
                </p>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-medium uppercase tracking-[0.04em] text-white/50">
                  Confirm password
                </span>
                <div
                  className={`flex items-center gap-3 rounded-[12px] border bg-white/5 px-4 py-3 ${fieldClass(
                    confirmState.status,
                  )}`}
                >
                  <LockKeyhole className="h-4 w-4 text-white/35" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-white/25"
                  />
                </div>
                <p className={`mt-1.5 min-h-4 text-[11px] ${hintClass(confirmState.status)}`}>
                  {confirmState.hint}
                </p>
              </label>

              <button
                type="submit"
                disabled={!isFormValid || submitting}
                className="mt-1 inline-flex w-full items-center justify-center rounded-[12px] bg-[var(--accent)] px-5 py-3 text-[15px] font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100"
              >
                {submitting ? "Sending code..." : "Create account"}
              </button>
              {submitError ? <p className="text-[12px] text-[#F09595]">{submitError}</p> : null}
            </form>
          </>
        </div>

        <p className="mt-5 text-center text-[13px] text-white/35">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--accent)]">
            Sign in
          </Link>
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white/75"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to MyDormStash
        </Link>
      </div>
    </main>
  );
}
