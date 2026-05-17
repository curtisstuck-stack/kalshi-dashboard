/** Formatting helpers — currency, prices, percentages, relative time. */
import { formatDistanceToNowStrict, parseISO, format as fmt } from "date-fns";

/** USD with cents, e.g. 1234.5 -> "$1,234.50". */
export function usd(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Signed USD, e.g. +$4.12 / -$1.20. */
export function usdSigned(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const s = usd(Math.abs(n));
  return n < 0 ? `-${s}` : `+${s}`;
}

/** A 0..1 market price as cents, e.g. 0.595 -> "59.5¢". */
export function priceCents(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const c = n * 100;
  return `${c % 1 === 0 ? c.toFixed(0) : c.toFixed(1)}¢`;
}

/** A 0..1 ratio as a percentage, e.g. 0.054 -> "5.4%". */
export function pct(n: number | null | undefined, decimals = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${(n * 100).toFixed(decimals)}%`;
}

/** Fixed-decimal number, dash on null. */
export function num(n: number | null | undefined, decimals = 2): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toFixed(decimals);
}

function toDate(v: string | number): Date {
  if (typeof v === "number") return new Date(v < 1e12 ? v * 1000 : v);
  return parseISO(v);
}

/** Relative time, e.g. "3 min ago". */
export function ago(v: string | number | null | undefined): string {
  if (v == null) return "—";
  try {
    return `${formatDistanceToNowStrict(toDate(v))} ago`;
  } catch {
    return "—";
  }
}

/** UTC clock time, e.g. "13:50 UTC". */
export function timeUTC(v: string | number | null | undefined): string {
  if (v == null) return "—";
  try {
    const d = toDate(v);
    return `${d.getUTCHours().toString().padStart(2, "0")}:${d
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")} UTC`;
  } catch {
    return "—";
  }
}

/** Calendar date, e.g. "May 16, 2026". */
export function dateLong(v: string | null | undefined): string {
  if (!v) return "—";
  try {
    return fmt(toDate(v), "MMM d, yyyy");
  } catch {
    return v;
  }
}

/** Hours-to-close as a compact countdown, e.g. 14.7 -> "14h 45m", 335 -> "13d 23h". */
export function countdown(hours: number | null | undefined): string {
  if (hours == null || Number.isNaN(hours) || hours < 0) return "—";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 48) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  const d = Math.floor(hours / 24);
  const h = Math.round(hours - d * 24);
  return `${d}d ${h}h`;
}

/** Age in whole minutes between now and a timestamp. */
export function ageMinutes(v: string | number | null | undefined): number | null {
  if (v == null) return null;
  try {
    return Math.floor((Date.now() - toDate(v).getTime()) / 60000);
  } catch {
    return null;
  }
}
