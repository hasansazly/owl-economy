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
            <stop offset="0%" stopColor="#76D5FF" />
            <stop offset="100%" stopColor="#46BFFF" />
          </linearGradient>
        </defs>
        <path
          d="M28 36V98"
          stroke="url(#dormstash-logo-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M28 36H54C84 36 104 58 104 84C104 101 92 108 74 108H28"
          stroke="url(#dormstash-logo-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28 36L60 18L97 38"
          stroke="url(#dormstash-logo-gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="36" r="6.5" fill="url(#dormstash-logo-gradient)" />
        <circle cx="60" cy="18" r="6.5" fill="url(#dormstash-logo-gradient)" />
        <circle cx="28" cy="98" r="6.5" fill="url(#dormstash-logo-gradient)" />
        <circle cx="60" cy="98" r="5.5" fill="#5E7EA3" opacity="0.55" />
        <circle cx="60" cy="36" r="5.5" fill="#5E7EA3" opacity="0.45" />
        <circle cx="60" cy="66" r="5.5" fill="#5E7EA3" opacity="0.55" />
        <path d="M38 66H86" stroke="#4E7196" strokeWidth="2" strokeDasharray="6 6" opacity="0.55" />
        <path d="M38 66L60 36L60 18" stroke="#4E7196" strokeWidth="2" opacity="0.45" />
        <path d="M60 98L86 66" stroke="#4E7196" strokeWidth="2" opacity="0.45" />
        <path
          d="M74 8C79 12 82 18 82 24"
          stroke="#355378"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M82 4C88 10 92 18 92 28"
          stroke="#355378"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M46 8C41 12 38 18 38 24"
          stroke="#355378"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>

      <div className="leading-none">
        <div className={`font-display font-extrabold tracking-[-0.04em] ${compact ? "text-2xl" : "text-3xl"}`}>
          <span className="text-white">Dorm</span>
          <span className="text-[var(--brand-blue)]">Stash</span>
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

