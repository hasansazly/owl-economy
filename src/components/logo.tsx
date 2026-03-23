import Link from "next/link";

type DormStashLogoProps = {
  href?: string;
  showTagline?: boolean;
  compact?: boolean;
  className?: string;
};

export function DormStashLogo({
  href,
  showTagline = false,
  compact = false,
  className = "",
}: DormStashLogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={compact ? 38 : 54}
        height={compact ? 38 : 54}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dormstash-logo-gradient" x1="20" y1="20" x2="108" y2="108">
            <stop offset="0%" stopColor="#8BE7FF" />
            <stop offset="100%" stopColor="#12D6FF" />
          </linearGradient>
        </defs>
        <rect x="10" y="10" width="108" height="108" rx="24" stroke="url(#dormstash-logo-gradient)" strokeWidth="4" opacity="0.95" />
        <path d="M34 34V94" stroke="url(#dormstash-logo-gradient)" strokeWidth="8" strokeLinecap="round" />
        <path d="M34 34L66 20L96 34" stroke="url(#dormstash-logo-gradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 42H84C90 42 94 46 94 52V92" stroke="url(#dormstash-logo-gradient)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 58H80" stroke="#79DFFF" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
        <path d="M52 74H80" stroke="#79DFFF" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
        <path d="M52 90H74" stroke="#79DFFF" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
      </svg>

      <div className="leading-none">
        <div
          className={`font-display font-extrabold tracking-[-0.05em] ${compact ? "text-[1.6rem]" : "text-[2.15rem]"}`}
          style={{ textShadow: "0 0 28px rgba(18,214,255,0.28)" }}
        >
          <span className="text-[var(--brand-blue)]">my</span>
          <span className="text-white">dormstash</span>
          <span className="text-white/88">.com</span>
        </div>
        {showTagline ? (
          <div className="mt-2 space-y-1.5">
            <p className="text-[10px] uppercase tracking-[0.34em] text-white/42">Campus Marketplace</p>
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(70,191,255,0.35)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-blue)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-blue)]" />
              AI-Powered Platform
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
