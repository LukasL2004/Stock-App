import type { CSSProperties } from "react";

export default function Skeleton({ w = "100%", h = 14, r, style }: { w?: number | string; h?: number | string; r?: number | string; style?: CSSProperties }) {
  return <span className="skeleton" aria-hidden="true" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}
