import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function SafeSendersPage() {
  return (
    <main className="page-shell">
      <section className="page-wrap max-w-4xl">
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
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            Safe Senders
          </div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Safe Senders</p>
          <h1 className="page-title">Safe Senders</h1>
          <p className="page-copy">
            Add <strong className="text-white">info@mydormstash.com</strong> to your safe sender list so
            MyDormStash verification emails and account updates land in your inbox.
          </p>
        </section>

        <section className="mt-6 grid gap-4">
          <article className="page-card p-5">
            <h2 className="text-[16px] font-semibold text-white">Gmail</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Open a MyDormStash email, click the three-dot menu, and choose to filter or mark it as
              important. You can also add <span className="text-white">info@mydormstash.com</span> to your
              contacts.
            </p>
          </article>

          <article className="page-card p-5">
            <h2 className="text-[16px] font-semibold text-white">Outlook or School Email</h2>
            <p className="mt-3 text-sm leading-7 text-white/58">
              Add <span className="text-white">info@mydormstash.com</span> to your safe senders list or your
              contacts directory. If your school uses a custom filter, mark the email as trusted.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
