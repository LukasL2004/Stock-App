import { Link } from "react-router";
import { companyName, money, pct, shares as fmtShares } from "../../lib/format";
import Change from "../UI/Change";
import TickerLogo from "../UI/TickerLogo";
import "./Allocation.css";

export interface Holding {
  symbol: string;
  shares?: number;
  invested: number;
  marketValue: number;
  profit: number;
}

const COLORS = ["#00c805", "#1d4ed8", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b"];

/** Stacked allocation bar plus holdings rows, the way banking apps show "where your money is". */
export default function Allocation({ holdings, cash }: { holdings: Holding[]; cash: number }) {
  const total = holdings.reduce((a, h) => a + h.marketValue, 0) + Math.max(0, cash);
  const segs = holdings.map((h, i) => ({ key: h.symbol, label: h.symbol, value: h.marketValue, color: COLORS[i % COLORS.length], weight: total ? (h.marketValue / total) * 100 : 0 }));
  if (cash > 0) segs.push({ key: "cash", label: "Cash", value: cash, color: "var(--border-strong)", weight: total ? (cash / total) * 100 : 0 });

  if (!total) {
    return (
      <div className="empty">
        <h3>Nothing here yet</h3>
        <p>Add funds and buy your first stock to see how your money is split.</p>
        <Link to="/dashboard" className="btn btn-primary">
          Find a stock
        </Link>
      </div>
    );
  }

  return (
    <div className="alloc">
      <div className="alloc-bar" role="img" aria-label={`Allocation: ${segs.map((s) => `${s.label} ${pct(s.weight, { sign: false })}`).join(", ")}`}>
        {segs.map((s) => (
          <span key={s.key} style={{ width: `${s.weight}%`, background: s.color }} title={`${s.label} ${pct(s.weight, { sign: false })}`} />
        ))}
      </div>
      <ul className="alloc-legend">
        {segs.map((s) => (
          <li key={s.key}>
            <span className="alloc-dot" style={{ background: s.color }} aria-hidden="true" />
            {s.label} <span className="num muted">{pct(s.weight, { sign: false })}</span>
          </li>
        ))}
      </ul>

      <ul className="rows alloc-rows">
        {holdings.map((h) => (
          <li key={h.symbol}>
            <Link to="/dashboard" className="row" onClick={() => localStorage.setItem("wg-last-symbol", h.symbol)}>
              <TickerLogo symbol={h.symbol} />
              <span className="row-id">
                <strong>{companyName(h.symbol)}</strong>
                <span>
                  {h.shares !== undefined ? `${fmtShares(h.shares)} shares` : h.symbol} · {money(h.invested)} invested
                </span>
              </span>
              <span className="row-end">
                <strong className="num">{money(h.marketValue)}</strong>
                <Change kind="both" value={h.profit} pctValue={h.invested ? (h.profit / h.invested) * 100 : 0} />
              </span>
            </Link>
          </li>
        ))}
        <li className="row">
          <span className="tlogo alloc-cash" aria-hidden="true">
            $
          </span>
          <span className="row-id">
            <strong>Cash</strong>
            <span>Available to invest</span>
          </span>
          <span className="row-end">
            <strong className="num">{money(cash)}</strong>
          </span>
        </li>
      </ul>
    </div>
  );
}
