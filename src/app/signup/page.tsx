"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getStudentProfile, saveStudentProfile, setVerifiedStudentEmail } from "@/lib/app-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Step = 1 | 2 | 3;
type FieldErrors = Partial<Record<"name" | "email" | "password" | "confirm" | "general", string>>;

const OTP_LENGTH = 6;

function AuthLogo() {
  return (
    <div className="pt-[calc(env(safe-area-inset-top)+16px)] text-center">
      <p className="font-display text-[22px] font-semibold tracking-[-0.03em] text-[#F0EEFF]">
        my<span className="text-[#9B8FFF]">dorm</span>stash
      </p>
      <p className="mt-2 text-[12px] text-[rgba(240,238,255,0.45)]">Temple&apos;s campus marketplace</p>
    </div>
  );
}

function StepBackButton({
  onClick,
  hidden = false,
}: {
  onClick: () => void;
  hidden?: boolean;
}) {
  if (hidden) {
    return <div className="h-[44px]" />;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-[20px] text-[rgba(240,238,255,0.5)]"
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
}

export default function SignupPage() {
  const supabase = getSupabaseBrowserClient();
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const otpCode = otpDigits.join("");

  useEffect(() => {
    if (step !== 3) return;

    const redirectTimer = window.setTimeout(() => {
      window.location.href = "/";
    }, 1500);

    return () => window.clearTimeout(redirectTimer);
  }, [step]);

  useEffect(() => {
    if (!resendMessage) return;

    const timer = window.setTimeout(() => setResendMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [resendMessage]);

  const canSubmitStepOne = useMemo(() => {
    return fullName.trim() && normalizedEmail && password && confirmPassword;
  }, [confirmPassword, fullName, normalizedEmail, password]);

  const validateStepOne = () => {
    const nextErrors: FieldErrors = {};

    if (!fullName.trim()) {
      nextErrors.name = "Enter your full name.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "Enter your Temple email.";
    } else if (!normalizedEmail.endsWith("@temple.edu")) {
      nextErrors.email = "Use your @temple.edu email.";
    }

    if (!password) {
      nextErrors.password = "Enter a password.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirm = "Confirm your password.";
    } else if (confirmPassword !== password) {
      nextErrors.confirm = "Passwords do not match.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateStepOne()) return;
    if (!supabase) {
      setFieldErrors({ general: "Supabase is not configured." });
      return;
    }

    try {
      setSubmitting(true);
      setFieldErrors({});

      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        throw error;
      }

      saveStudentProfile({
        ...getStudentProfile(),
        name: fullName.trim(),
        email: normalizedEmail,
      });

      setStep(2);
      otpRefs.current[0]?.focus();
    } catch (error) {
      setFieldErrors({
        general: error instanceof Error ? error.message : "Could not create account.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const finalizeVerifiedStudent = async () => {
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const resolvedName =
      typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : fullName.trim();

    setVerifiedStudentEmail(normalizedEmail);
    saveStudentProfile({
      ...getStudentProfile(),
      name: resolvedName,
      email: normalizedEmail,
    });
  };

  const resetOtpInputs = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(""));
    window.requestAnimationFrame(() => {
      otpRefs.current[0]?.focus();
    });
  };

  const handleVerifyOtp = async (nextCode?: string) => {
    const codeToVerify = nextCode ?? otpCode;
    if (codeToVerify.length !== OTP_LENGTH || !supabase) return;

    try {
      setVerifying(true);
      setOtpError("");

      const { error } = await supabase.auth.verifyOtp({
        type: "email",
        email: normalizedEmail,
        token: codeToVerify,
      });

      if (error) {
        throw error;
      }

      await finalizeVerifiedStudent();
      setStep(3);
    } catch {
      setOtpError("Invalid code. Try again.");
      resetOtpInputs();
    } finally {
      setVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, "");
    if (!digitsOnly) {
      setOtpDigits((current) => {
        const next = [...current];
        next[index] = "";
        return next;
      });
      return;
    }

    const nextDigits = [...otpDigits];

    if (digitsOnly.length > 1) {
      const pasted = digitsOnly.slice(0, OTP_LENGTH).split("");
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        nextDigits[i] = pasted[i] ?? "";
      }
      setOtpDigits(nextDigits);
      const finalIndex = Math.min(pasted.length, OTP_LENGTH) - 1;
      otpRefs.current[Math.max(finalIndex, 0)]?.focus();
      if (pasted.length === OTP_LENGTH) {
        void handleVerifyOtp(pasted.join(""));
      }
      return;
    }

    nextDigits[index] = digitsOnly;
    setOtpDigits(nextDigits);
    setOtpError("");

    if (index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    const joined = nextDigits.join("");
    if (joined.length === OTP_LENGTH && !nextDigits.includes("")) {
      void handleVerifyOtp(joined);
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!supabase) return;

    try {
      setOtpError("");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
      });

      if (error) {
        throw error;
      }

      setResendMessage("Code resent");
    } catch {
      setOtpError("Could not resend code right now.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0916] px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-0 text-[#F0EEFF]">
      <div className="mx-auto w-full max-w-[100vw]">
        {step === 1 ? (
          <section className="min-h-screen overflow-y-auto pb-[320px]">
            <AuthLogo />

            <div className="mt-8 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-6">
              <h1 className="text-[18px] font-medium text-[#F0EEFF]">Create account</h1>

              <form className="mt-5 space-y-4" onSubmit={handleCreateAccount}>
                <label className="block">
                  <span className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Full Name</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Jordan Lee"
                    autoComplete="name"
                    className="px-4"
                  />
                  {fieldErrors.name ? <p className="mt-2 text-[12px] text-[#F5A623]">{fieldErrors.name}</p> : null}
                </label>

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
                  {fieldErrors.email ? <p className="mt-2 text-[12px] text-[#F5A623]">{fieldErrors.email}</p> : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Password</span>
                  <div className="flex h-12 items-center gap-3 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Min 8 characters"
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
                  {fieldErrors.password ? (
                    <p className="mt-2 text-[12px] text-[#F5A623]">{fieldErrors.password}</p>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] text-[rgba(240,238,255,0.45)]">Confirm Password</span>
                  <div className="flex h-12 items-center gap-3 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] px-4">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Re-enter password"
                      className="h-full min-w-0 flex-1 border-0 bg-transparent px-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((value) => !value)}
                      className="inline-flex h-[44px] w-[44px] items-center justify-center text-[rgba(240,238,255,0.45)]"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirm ? (
                    <p className="mt-2 text-[12px] text-[#F5A623]">{fieldErrors.confirm}</p>
                  ) : null}
                </label>

                {fieldErrors.general ? (
                  <p className="text-[12px] text-[#F5A623]">{fieldErrors.general}</p>
                ) : null}

                <button
                  type="submit"
                  disabled={!canSubmitStepOne || submitting}
                  className="inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] px-4 text-[15px] font-medium text-white disabled:opacity-45"
                >
                  {submitting ? "Creating..." : "Create account"}
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-[rgba(240,238,255,0.45)]">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#9B8FFF]">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="min-h-screen overflow-y-auto pb-[320px]">
            <div className="flex items-center justify-between pt-[calc(env(safe-area-inset-top)+8px)]">
              <StepBackButton onClick={() => setStep(1)} />
              <div className="w-[44px]" />
            </div>

            <div className="mt-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] border border-[rgba(107,92,231,0.24)] bg-[rgba(107,92,231,0.08)] text-[#9B8FFF]">
                <Mail className="h-6 w-6" />
              </div>
              <h1 className="mt-5 text-[18px] font-medium text-[#F0EEFF]">Check your inbox</h1>
              <p className="mt-2 text-[15px] text-[#9B8FFF]">{normalizedEmail}</p>
            </div>

            <div className="mt-8 rounded-[20px] border border-white/10 bg-[rgba(255,255,255,0.03)] px-5 py-6">
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    onPaste={(event) => {
                      const pasted = event.clipboardData.getData("text");
                      if (!pasted) return;
                      event.preventDefault();
                      handleOtpChange(index, pasted);
                    }}
                    className="h-14 w-12 rounded-[12px] border border-white/10 bg-[rgba(255,255,255,0.05)] text-center text-[24px] text-[#F0EEFF]"
                    aria-label={`OTP digit ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-4 min-h-[20px] text-center">
                {otpError ? <p className="text-[12px] text-[#F5A623]">{otpError}</p> : null}
                {!otpError && resendMessage ? <p className="text-[12px] text-[#F5A623]">{resendMessage}</p> : null}
              </div>

              <button
                type="button"
                onClick={() => void handleVerifyOtp()}
                disabled={otpCode.length !== OTP_LENGTH || verifying}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[20px] bg-[#6B5CE7] px-4 text-[15px] font-medium text-white disabled:opacity-45"
              >
                {verifying ? "Verifying..." : "Verify"}
              </button>

              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  className="inline-flex min-h-[44px] items-center justify-center text-[13px] text-[#9B8FFF]"
                >
                  Didn&apos;t get it? Resend
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="min-h-screen overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+24px)]">
            <div className="flex items-center justify-between pt-[calc(env(safe-area-inset-top)+8px)]">
              <StepBackButton onClick={() => setStep(2)} />
              <div className="w-[44px]" />
            </div>

            <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(107,92,231,0.12)] text-[#6B5CE7]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-6 text-[22px] font-medium text-[#F0EEFF]">You&apos;re in.</h1>
              <p className="mt-2 text-[15px] text-[rgba(240,238,255,0.45)]">
                Welcome to Temple&apos;s campus marketplace
              </p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
