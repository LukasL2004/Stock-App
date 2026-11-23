/** WealthGrow brand: a heavy wordmark with a raised green square; the app icon is a W on a tile. */
export function Mark({ size = 28, tone = "auto" }: { size?: number; tone?: "auto" | "dark" | "light" }) {
  const tile = tone === "light" ? "#ffffff" : tone === "dark" ? "#121212" : "var(--cta)";
  const glyph = tone === "light" ? "#121212" : tone === "dark" ? "#ffffff" : "var(--cta-ink)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill={tile} />
      <path d="M11 20 L19.5 44 L28 26 L36.5 44 L45 20" fill="none" stroke={glyph} strokeWidth="7" strokeLinejoin="miter" strokeLinecap="butt" />
      <rect x="47" y="13" width="9" height="9" rx="2" fill="var(--up-vivid, #00c805)" />
    </svg>
  );
}

export default function Logo({ compact = false, size }: { compact?: boolean; size?: number }) {
  if (compact) return <Mark size={size ?? 28} />;
  return (
    <span className="logo" aria-hidden="true" style={size ? { fontSize: size } : undefined}>
      <span className="logo-word">WealthGrow</span>
      <span className="logo-dot" />
    </span>
  );
}
