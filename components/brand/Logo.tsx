/**
 * Vukora mark: a V (from "vuka", to rise) cradling a rising sun.
 * The V takes `--primary` (or currentColor when mono), the sun takes `--sun`.
 */
export function LogoMark({
  className = "h-7 w-7",
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="16" cy="11" r="4.5" fill={mono ? "currentColor" : "var(--sun)"} />
      <path
        d="M5 6 16 26 27 6"
        fill="none"
        stroke={mono ? "currentColor" : "var(--primary)"}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark mono={mono} />
      <span className="text-xl font-extrabold tracking-[-0.04em] text-current">
        vukora
      </span>
    </span>
  );
}
