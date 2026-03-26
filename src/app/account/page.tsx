import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  LockKeyhole,
  Phone,
  ScrollText,
  ShieldCheck,
  User,
} from "lucide-react";

const settingsCards = [
  {
    title: "Personal Info",
    description: "Edit your name, Temple email, and phone number.",
    icon: User,
    content: [
      { label: "Name", value: "Jordan Lee" },
      { label: "Email", value: "jordan@temple.edu" },
      { label: "Phone", value: "(267) 555-0193" },
    ],
  },
  {
    title: "My Listings",
    description: "Manage your active Resell and Room posts.",
    icon: ScrollText,
    content: [
      { label: "Active Resell", value: "3 items" },
      { label: "Room Posts", value: "1 live" },
      { label: "Next step", value: "Review listings" },
    ],
    href: "/sell-goods",
  },
  {
    title: "Security",
    description: "Change password and manage login methods.",
    icon: ShieldCheck,
    content: [
      { label: "Password", value: "Last updated 2 weeks ago" },
      { label: "Login method", value: "Email + password" },
      { label: "Campus status", value: "Verified student" },
    ],
  },
  {
    title: "Notifications",
    description: "Choose alerts for lost-item matches and events.",
    icon: Bell,
    content: [
      { label: "Lost and Found", value: "On" },
      { label: "New Events", value: "On" },
      { label: "Room Alerts", value: "Off" },
    ],
  },
];

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-3 sm:px-6">
        <header className="sticky top-0 z-20 border-b border-white/8 bg-[rgba(0,0,0,0.92)] py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-white/45 transition hover:text-white/70"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Feed
            </Link>

            <p className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em]">
              <span className="text-cyan-400">my</span>dormstash<span className="text-white/88">.com</span>
            </p>
          </div>
        </header>

        <section className="px-1 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            User Account Settings
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] font-bold tracking-[-0.05em] text-white sm:text-[2.7rem]">
            Account
          </h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-white/48">
            Manage your profile, listings, security, and alerts in one place.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {settingsCards.map(({ title, description, icon: Icon, content, href }) => {
            const cardContent = (
              <article className="group rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(191,90,242,0.22)] hover:shadow-[0_0_0_1px_rgba(191,90,242,0.12),0_16px_36px_rgba(191,90,242,0.08)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 text-white/28 transition group-hover:text-white/55" />
                </div>

                <h2 className="mt-5 text-[18px] font-semibold text-white">{title}</h2>
                <p className="mt-2 text-[13px] leading-6 text-white/46">{description}</p>

                <div className="mt-5 space-y-3">
                  {content.map((item) => (
                    <div
                      key={`${title}-${item.label}`}
                      className="rounded-[16px] border border-white/8 bg-white/[0.03] px-3.5 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.08em] text-white/36">{item.label}</p>
                      <p className="mt-1 text-[13px] font-medium text-white/78">{item.value}</p>
                    </div>
                  ))}
                </div>
              </article>
            );

            return href ? (
              <Link key={title} href={href}>
                {cardContent}
              </Link>
            ) : (
              <div key={title}>{cardContent}</div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-cyan-400" />
              <h2 className="text-[16px] font-semibold text-white">Quick Security</h2>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-white/48">
              Keep your login details current and your campus account protected.
            </p>
          </article>

          <article className="rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.03)] p-5">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-cyan-400" />
              <h2 className="text-[16px] font-semibold text-white">Contact Preferences</h2>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-white/48">
              Control how other students reach you when responding to your listings.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
