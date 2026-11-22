/** WealthGrow mark: a "W" drawn as a price line whose last leg turns into an up arrow. */
export function Mark({ size = 24, color = "var(--up-vivid)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 10.5 L9.6 22.5 L15.5 12.5 L21.4 22.5 L27.2 10.2" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.4 10 H27.6 V16.2" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Logo({ compact = false, size = 24 }: { compact?: boolean; size?: number }) {
  return (
    <span className="logo" aria-hidden="true">
      <Mark size={size} />
      {!compact && <span className="logo-word">WealthGrow</span>}
    </span>
  );
}
