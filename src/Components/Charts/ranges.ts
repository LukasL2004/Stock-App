export interface Point {
  time: number; // unix seconds
  value: number;
}

export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
export const ALL_RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

export function rangeLabel(r: Range): string {
  return { "1D": "Today", "1W": "Past week", "1M": "Past month", "3M": "Past 3 months", "1Y": "Past year", ALL: "All time" }[r];
}

/** True when the newest trading day has more than a couple of points (15-minute bars). */
export function hasIntraday(points: Point[]): boolean {
  if (points.length < 3) return false;
  const last = new Date(points[points.length - 1].time * 1000);
  const dayStart = new Date(last.getFullYear(), last.getMonth(), last.getDate()).getTime() / 1000;
  return points.filter((p) => p.time >= dayStart).length >= 3;
}

export function sliceRange(points: Point[], range: Range): Point[] {
  if (!points.length) return [];
  const latest = points[points.length - 1].time;
  const d = new Date(latest * 1000);
  let from = 0;
  switch (range) {
    case "1D": from = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000; break;
    case "1W": d.setDate(d.getDate() - 7); from = d.getTime() / 1000; break;
    case "1M": d.setMonth(d.getMonth() - 1); from = d.getTime() / 1000; break;
    case "3M": d.setMonth(d.getMonth() - 3); from = d.getTime() / 1000; break;
    case "1Y": d.setFullYear(d.getFullYear() - 1); from = d.getTime() / 1000; break;
    case "ALL": from = 0;
  }
  const v = points.filter((p) => p.time >= from);
  return v.length >= 2 ? v : points.slice(-2);
}
