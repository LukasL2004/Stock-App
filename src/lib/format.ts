import { getLang, getLocale } from "../i18n/core";

/** Formatters are cached per language so switching the UI language also switches number/date styles. */
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat>();
function nf(name: string, opts: Intl.NumberFormatOptions): Intl.NumberFormat {
  const k = `${getLang()}:${name}`;
  let f = cache.get(k) as Intl.NumberFormat | undefined;
  if (!f) {
    f = new Intl.NumberFormat(getLocale(), opts);
    cache.set(k, f);
  }
  return f;
}

const USD = { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol", minimumFractionDigits: 2, maximumFractionDigits: 2 } as const;

export function money(v: number | null | undefined, opts: { sign?: boolean; compact?: boolean } = {}): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  const f = opts.compact && Math.abs(v) >= 100_000 ? nf("usdc", { ...USD, notation: "compact", maximumFractionDigits: 1, minimumFractionDigits: 0 }) : nf("usd", USD);
  const s = f.format(Math.abs(v));
  if (opts.sign) return v > 0 ? `+${s}` : v < 0 ? `-${s}` : s;
  return v < 0 ? `-${s}` : s;
}

export function pct(v: number | null | undefined, opts: { sign?: boolean } = { sign: true }): string {
  if (v === null || v === undefined || Number.isNaN(v) || !Number.isFinite(v)) return "–";
  const s = `${nf("n2", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(v))}%`;
  if (opts.sign) return v > 0 ? `+${s}` : v < 0 ? `-${s}` : s;
  return s;
}

export function shares(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  return nf("n4", { minimumFractionDigits: 0, maximumFractionDigits: 4 }).format(v);
}

export function number2(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  return nf("n2", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

export function integer(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "–";
  return nf("int", { maximumFractionDigits: 0 }).format(v);
}

/** Backend dates arrive as java `Date.toString()` ("Sat Nov 22 03:08:11 EET 2026"). */
export function date(raw: string | Date | null | undefined, withTime = false): string {
  if (!raw) return "–";
  const d = raw instanceof Date ? raw : new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleString(getLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function time(raw: string | Date): string {
  const d = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString(getLocale(), { hour: "numeric", minute: "2-digit" });
}

export function direction(v: number | null | undefined): "up" | "down" | "flat" {
  if (!v) return "flat";
  return v > 0 ? "up" : "down";
}

export function initials(first?: string, last?: string, fallback = "?"): string {
  const s = `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
  return s || fallback;
}

export const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple",
  TSLA: "Tesla",
  GOOGL: "Alphabet",
  MSFT: "Microsoft",
  AMZN: "Amazon",
  NVDA: "NVIDIA",
  META: "Meta Platforms",
  NFLX: "Netflix",
};

export function companyName(symbol: string): string {
  return COMPANY_NAMES[symbol] ?? symbol;
}

export function parseAmount(v: string): number {
  const n = Number(v.replace(/,/g, "."));
  return Number.isFinite(n) ? n : 0;
}

export function matchStock(s: { symbol: string }, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  return s.symbol.toLowerCase().includes(n) || companyName(s.symbol).toLowerCase().includes(n);
}
