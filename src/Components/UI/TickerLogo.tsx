import { useState } from "react";

const BRAND: Record<string, { domain: string; color: string }> = {
  AAPL: { domain: "apple.com", color: "#1d1d1f" },
  TSLA: { domain: "tesla.com", color: "#e82127" },
  GOOGL: { domain: "google.com", color: "#4285f4" },
  MSFT: { domain: "microsoft.com", color: "#0078d4" },
  AMZN: { domain: "amazon.com", color: "#ff9900" },
  NVDA: { domain: "nvidia.com", color: "#76b900" },
  META: { domain: "meta.com", color: "#0866ff" },
  NFLX: { domain: "netflix.com", color: "#e50914" },
};

/** Company logo tile; falls back to a coloured monogram when the icon cannot load. */
export default function TickerLogo({ symbol, size = "md" }: { symbol: string; size?: "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const brand = BRAND[symbol];
  const showImg = brand && !failed;
  return (
    <span className={`tlogo${size === "lg" ? " tlogo-lg" : ""}`} style={showImg ? undefined : { background: brand?.color ?? "var(--text-3)" }} aria-hidden="true">
      {showImg ? (
        <img src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=64`} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        symbol.slice(0, 2)
      )}
    </span>
  );
}
