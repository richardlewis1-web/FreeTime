type LogoVariant = "primary" | "compact" | "iconOnly" | "mono";

type LogoProps = {
  variant?: LogoVariant;
  tagline?: string;
  className?: string;
};

type AppIconProps = {
  className?: string;
};

function LogoMark({ mono = false, className = "" }: { mono?: boolean; className?: string }) {
  const primary = mono ? "currentColor" : "#B9FF4D";
  const secondary = mono ? "currentColor" : "#F4F0DA";
  const accent = mono ? "currentColor" : "#F7C948";

  return (
    <svg
      viewBox="0 0 72 72"
      role="img"
      aria-label="Free Time stopwatch pitch checklist mark"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M30 10h12" stroke={primary} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M36 10v6" stroke={primary} strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="36" cy="39" r="24" stroke={primary} strokeWidth="4.5" />
      <path d="M20 39h32" stroke={secondary} strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
      <circle cx="36" cy="39" r="7" stroke={secondary} strokeWidth="2.6" opacity="0.85" />
      <rect x="23" y="26" width="9" height="9" rx="2" stroke={accent} strokeWidth="2.6" />
      <path d="M25.5 30.5l2.2 2.2 5.4-6.2" stroke={primary} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M38 30.5h10" stroke={secondary} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark({ mono = false }: { mono?: boolean }) {
  return (
    <div className={["-skew-x-3 leading-[0.9]", mono ? "text-current" : "text-brand-cream"].join(" ")}>
      <span className="block text-[1.55rem] font-black uppercase tracking-normal sm:text-[1.85rem]">Free</span>
      <span className="block pl-1.5 text-[1.55rem] font-black uppercase tracking-normal sm:text-[1.85rem]">Time</span>
    </div>
  );
}

export function Logo({ variant = "primary", tagline, className = "" }: LogoProps) {
  const mono = variant === "mono";

  if (variant === "iconOnly") {
    return <LogoMark mono={mono} className={["h-14 w-14", mono ? "text-brand-cream" : "", className].join(" ")} />;
  }

  return (
    <div className={["inline-flex items-center gap-3", mono ? "text-brand-cream" : "", className].join(" ")}>
      <LogoMark mono={mono} className="h-14 w-14 shrink-0" />
      <div>
        <Wordmark mono={mono} />
        {variant === "primary" ? (
          <p className={["mt-2 max-w-52 text-xs font-bold uppercase leading-4 tracking-[0.1em]", mono ? "text-current/65" : "text-brand-cream/65"].join(" ")}>
            {tagline ?? "Guess the list before your mates do."}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AppIcon({ className = "" }: AppIconProps) {
  return (
    <div
      className={[
        "grid aspect-square place-items-center rounded-[1.65rem] border-2 border-brand-lime bg-brand-bg p-3 shadow-[0_18px_44px_rgba(185,255,77,0.18)]",
        "relative overflow-hidden before:absolute before:inset-3 before:rounded-[1.15rem] before:border before:border-brand-cream/10 after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-brand-cream/10",
        className
      ].join(" ")}
    >
      <LogoMark className="relative z-10 h-full w-full" />
    </div>
  );
}
