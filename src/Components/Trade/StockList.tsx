import type { Stock } from "../../Services/Interfaces/StockInfoInterface";
import { companyName, matchStock, money } from "../../lib/format";
import Change from "../UI/Change";
import Sparkline from "../UI/Sparkline";
import Skeleton from "../UI/Skeleton";
import TickerLogo from "../UI/TickerLogo";
import { useI18n } from "../../i18n/useI18n";

interface Props {
  stocks?: Stock[];
  sparks: Record<string, number[]>;
  selected: string;
  onSelect: (symbol: string) => void;
  filter?: string;
}

export default function StockList({ stocks, sparks, selected, onSelect, filter = "" }: Props) {
  const { t } = useI18n();
  if (!stocks) {
    return (
      <div className="rows">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="row">
            <Skeleton w={36} h={36} r={10} />
            <span>
              <Skeleton w={60} h={14} />
              <Skeleton w={90} h={11} style={{ marginTop: 6 }} />
            </span>
            <Skeleton w={72} h={26} r={6} />
          </div>
        ))}
      </div>
    );
  }
  const list = stocks.filter((s) => matchStock(s, filter));
  if (!list.length) return <p className="muted" style={{ padding: "12px 0" }}>{t("stock.noMatch", { q: filter })}</p>;
  return (
    <ul className="rows">
      {list.map((s) => {
        const chPct = s.open ? ((s.price - s.open) / s.open) * 100 : 0;
        const spark = sparks[s.symbol] ?? [];
        const dir = spark.length > 1 ? (spark[spark.length - 1] >= spark[0] ? "up" : "down") : "flat";
        return (
          <li key={s.symbol}>
            <button className={`row${s.symbol === selected ? " is-active" : ""}`} aria-pressed={s.symbol === selected} onClick={() => onSelect(s.symbol)}>
              <TickerLogo symbol={s.symbol} />
              <span className="row-id">
                <strong>{s.symbol}</strong>
                <span>{companyName(s.symbol)}</span>
              </span>
              <span className="row-end row-end-h">
                <Sparkline points={spark} dir={dir} width={64} height={24} />
                <span className="row-price">
                  <strong className="num">{money(s.price)}</strong>
                  <Change value={chPct} pill />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
