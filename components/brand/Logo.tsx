/**
 * Interflect symbol: two rounded bars on a 24px grid.
 * The ink bar is the "I", the interface. The teal bar is its reflection, offset half a bar down:
 * design thinking and implementation, side by side.
 */
export function LogoMark({
  className = "h-6 w-6",
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="5" y="3" width="6" height="12" rx="3" fill="currentColor" />
      <rect
        x="13"
        y="9"
        width="6"
        height="12"
        rx="3"
        fill={mono ? "currentColor" : "var(--accent)"}
        opacity={mono ? 0.45 : 1}
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
    <span className={`inline-flex items-center gap-1.5 text-ink ${className}`}>
      <LogoMark mono={mono} />
      <span className="text-[1.1875rem] font-semibold tracking-[-0.03em]">interflect</span>
    </span>
  );
}
