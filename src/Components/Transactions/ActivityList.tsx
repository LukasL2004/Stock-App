import { useState } from "react";
import type { AuditLogInterface } from "../../Services/Interfaces/AuditLogInterface";
import { companyName, money, shares as fmtShares, time } from "../../lib/format";
import Skeleton from "../UI/Skeleton";
import TickerLogo from "../UI/TickerLogo";
import Button from "../UI/Button";
import { useI18n } from "../../i18n/useI18n";
import { getLocale } from "../../i18n/core";

interface Props {
  items?: AuditLogInterface[];
  loading?: boolean;
  pageSize?: number;
}

function dayKey(raw: string, today: string, yesterday: string): string {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  const now = new Date();
  const yest = new Date();
  yest.setDate(now.getDate() - 1);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(d, now)) return today;
  if (same(d, yest)) return yesterday;
  return d.toLocaleDateString(getLocale(), { month: "long", day: "numeric", year: d.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

/** Activity grouped by day, newest first: "Bought Apple", "Sold Tesla". */
export default function ActivityList({ items, loading = false, pageSize = 10 }: Props) {
  const { t } = useI18n();
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
        <h3>{t("activity.emptyTitle")}</h3>
        <p>{t("activity.emptyBody")}</p>
      </div>
    );
  }

  const slice = items.slice(0, shown);
  const groups: { day: string; rows: AuditLogInterface[] }[] = [];
  for (const row of slice) {
    const k = dayKey(row.date, t("common.today"), t("common.yesterday"));
    const g = groups[groups.length - 1];
    if (g && g.day === k) g.rows.push(row);
    else groups.push({ day: k, rows: [row] });
  }

  return (
    <div className="activity">
      {groups.map((g) => (
        <section key={g.day} className="activity-day">
          <h3 className="activity-h">{g.day}</h3>
          <ul className="rows">
            {g.rows.map((row, i) => {
              const sell = (row.action ?? "BUY").toUpperCase() === "SELL";
              const at = time(row.date);
              return (
                <li key={row.id ?? `${row.date}-${i}`} className="row">
                  <TickerLogo symbol={row.symbol} />
                  <span className="row-id">
                    <strong>{t(sell ? "activity.sold" : "activity.bought", { name: companyName(row.symbol) })}</strong>
                    <span className="num">
                      {t("activity.line", { shares: fmtShares(row.shares), price: money(row.price) })}
                      {at ? ` · ${at}` : ""}
                    </span>
                  </span>
                  <span className="row-end">
                    <strong className={`num${sell ? " up" : ""}`}>{sell ? `+${money(row.total)}` : `-${money(row.total)}`}</strong>
                    <span>{sell ? t("activity.toCash") : t("activity.fromCash")}</span>
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
            {t("common.showMore", { n: items.length - shown })}
          </Button>
        </div>
      )}
    </div>
  );
}
