import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OurTeamPage() {
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

          <div className="page-chip hidden sm:inline-flex">Our Team</div>
        </header>

        <section className="page-hero">
          <p className="section-kicker">Our Team</p>
          <h1 className="page-title">Our Team</h1>
        </section>
      </section>
    </main>
  );
}
