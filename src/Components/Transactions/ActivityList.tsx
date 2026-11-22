import { useState } from "react";
import type { AuditLogInterface } from "../../Services/Interfaces/AuditLogInterface";
import { companyName, money, shares as fmtShares } from "../../lib/format";
import Skeleton from "../UI/Skeleton";
import TickerLogo from "../UI/TickerLogo";
import Button from "../UI/Button";

interface Props {
  items?: AuditLogInterface[];
  loading?: boolean;
  pageSize?: number;
}

function dayKey(raw: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, today)) return "Today";
  if (same(d, yest)) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: d.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

function timeOf(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

/** Activity grouped by day, newest first: "Bought AAPL", "Sold TSLA". */
export default function ActivityList({ items, loading = false, pageSize = 10 }: Props) {
  const [shown, setShown] = useState(pageSize);

  if (loading && !items) {
    return (
      <div className="rows">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="row">
            <Skeleton w={36} h={36} r={10} />
            <span>
              <Skeleton w={120} h={14} />
              <Skeleton w={160} h={11} style={{ marginTop: 6 }} />
            </span>
            <Skeleton w={80} h={16} />
          </div>
        ))}
      </div>
    );
  }
  if (!items?.length) {
    return (
      <div className="empty">
        <h3>No activity yet</h3>
        <p>Your buys and sells will show up here, grouped by day.</p>
      </div>
    );
  }

  const slice = items.slice(0, shown);
  const groups: { day: string; rows: AuditLogInterface[] }[] = [];
  for (const t of slice) {
    const k = dayKey(t.date);
    const g = groups[groups.length - 1];
    if (g && g.day === k) g.rows.push(t);
    else groups.push({ day: k, rows: [t] });
  }

  return (
    <div className="activity">
      {groups.map((g) => (
        <section key={g.day} className="activity-day">
          <h3 className="activity-h">{g.day}</h3>
          <ul className="rows">
            {g.rows.map((t, i) => {
              const sell = (t.action ?? "BUY").toUpperCase() === "SELL";
              return (
                <li key={t.id ?? `${t.date}-${i}`} className="row">
                  <TickerLogo symbol={t.symbol} />
                  <span className="row-id">
                    <strong>
                      {sell ? "Sold" : "Bought"} {companyName(t.symbol)}
                    </strong>
                    <span className="num">
                      {fmtShares(t.shares)} shares at {money(t.price)}
                      {timeOf(t.date) ? ` · ${timeOf(t.date)}` : ""}
                    </span>
                  </span>
                  <span className="row-end">
                    <strong className={`num${sell ? " up" : ""}`}>{sell ? `+${money(t.total)}` : `-${money(t.total)}`}</strong>
                    <span>{sell ? "To cash" : "From cash"}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {shown < items.length && (
        <div className="pager">
          <Button variant="secondary" onClick={() => setShown((s) => s + pageSize)}>
            Show more ({items.length - shown} left)
          </Button>
        </div>
      )}
    </div>
  );
}
