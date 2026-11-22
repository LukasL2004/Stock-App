import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import "./LandingPage.css";
import StockData from "../../Services/StockInfoService";
import Portofolio from "../../Services/PortofolioService";
import WalletService from "../../Services/WalletService";
import type { Stock, Chart } from "../../Services/Interfaces/StockInfoInterface";
import type { portofolioData } from "../../Services/Interfaces/PortofolioInterface";
import type { total } from "../../Services/Interfaces/TotalInterface";
import Charts from "../../Components/Charts/Charts";
import { ALL_RANGES, hasIntraday, rangeLabel, sliceRange, type Point, type Range } from "../../Components/Charts/ranges";
import OrderTicket from "../../Components/Trade/OrderTicket";
import StockList from "../../Components/Trade/StockList";
import BuyPopUp from "../../Components/PopUp/FinancePops/BuyPopUp";
import SellPopUp from "../../Components/PopUp/FinancePops/SellPopUp";
import Button from "../../Components/UI/Button";
import Change from "../../Components/UI/Change";
import Skeleton from "../../Components/UI/Skeleton";
import TickerLogo from "../../Components/UI/TickerLogo";
import { companyName, date as fmtDate, matchStock, money, pct, shares as fmtShares } from "../../lib/format";
import { useRealtime } from "../../lib/useRealtime";
import { useLoad } from "../../lib/useLoad";
import { useToast } from "../../lib/useToast";
import { errorMessage } from "../../lib/http";

const LAST_SYMBOL_KEY = "wg-last-symbol";

function toPoints(rows: Chart[]): Record<string, Point[]> {
  const out: Record<string, Point[]> = {};
  for (const r of rows) {
    const t = Math.floor(new Date(`${r.date}T${r.time || "00:00:00"}`).getTime() / 1000);
    if (!Number.isFinite(t)) continue;
    (out[r.symbol] ??= []).push({ time: t, value: r.value });
  }
  for (const k in out) {
    out[k].sort((a, b) => a.time - b.time);
    out[k] = out[k].filter((p, i, a) => i === 0 || p.time !== a[i - 1].time);
  }
  return out;
}

export default function LandingPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [stocks, setStocks] = useState<Stock[]>();
  const [series, setSeries] = useState<Record<string, Point[]>>({});
  const [chartsLoading, setChartsLoading] = useState(true);
  const [symbol, setSymbol] = useState<string>(() => localStorage.getItem(LAST_SYMBOL_KEY) || "AAPL");
  const [loadedPosition, setPosition] = useState<portofolioData>();
  const position = loadedPosition?.symbol === symbol ? loadedPosition : undefined;
  const [totals, setTotals] = useState<total>();
  const [cash, setCash] = useState<number>();
  const [range, setRange] = useState<Range>("1M");
  const [hover, setHover] = useState<Point | null>(null);
  const [modal, setModal] = useState<"buy" | "sell" | null>(null);

  const stock = stocks?.find((s) => s.symbol === symbol);
  const price = stock?.price ?? 0;

  const loadMarket = useCallback(async () => {
    try {
      setStocks(await StockData.stocks());
    } catch (e) {
      toast.error("Could not load prices", errorMessage(e));
    }
  }, [toast]);

  const loadAccount = useCallback(async () => {
    const [t, w] = await Promise.allSettled([Portofolio.getTotal(), WalletService.Balance()]);
    if (t.status === "fulfilled") setTotals(t.value);
    if (w.status === "fulfilled") setCash(w.value.balance);
    else if (t.status === "fulfilled" && t.value.balance !== undefined) setCash(t.value.balance);
  }, []);

  const loadSymbol = useCallback(async (sym: string) => {
    try {
      setPosition(await Portofolio.getData(sym));
    } catch {
      setPosition({ symbol: sym, averagePrice: 0, amountOwned: 0, shares: 0, profit: 0, userId: 0 });
    }
  }, []);

  const loadInitial = useCallback(async () => {
    loadMarket();
    loadAccount();
    try {
      setSeries(toPoints(await StockData.chartData()));
    } catch (e) {
      toast.error("Could not load chart history", errorMessage(e));
    } finally {
      setChartsLoading(false);
    }
  }, [loadMarket, loadAccount, toast]);
  useLoad(loadInitial);

  const loadCurrent = useCallback(() => loadSymbol(symbol), [loadSymbol, symbol]);
  useLoad(loadCurrent);

  const refreshAll = useCallback(() => {
    loadMarket();
    loadAccount();
    loadSymbol(symbol);
  }, [loadMarket, loadAccount, loadSymbol, symbol]);
  useRealtime(refreshAll);

  useEffect(() => {
    localStorage.setItem(LAST_SYMBOL_KEY, symbol);
  }, [symbol]);

  // Search submitted from the navbar: jump to the first match
  useEffect(() => {
    if (params.get("go") && stocks) {
      const hit = stocks.find((s) => matchStock(s, query));
      if (hit) setSymbol(hit.symbol);
      const next = new URLSearchParams(params);
      next.delete("go");
      next.delete("q");
      setParams(next, { replace: true });
    }
  }, [params, stocks, query, setParams]);

  const points = useMemo(() => series[symbol] ?? [], [series, symbol]);
  const ranges = useMemo(() => (hasIntraday(points) ? ALL_RANGES : ALL_RANGES.filter((r) => r !== "1D")), [points]);
  const effectiveRange: Range = ranges.includes(range) ? range : "1M";
  const data = useMemo(() => sliceRange(points, effectiveRange), [points, effectiveRange]);
  const first = data[0]?.value;
  const shownPrice = hover ? hover.value : price || data[data.length - 1]?.value;
  const rangeChange = first !== undefined && shownPrice !== undefined ? shownPrice - first : 0;
  const rangePct = first ? (rangeChange / first) * 100 : 0;
  const dir: "up" | "down" | "flat" = rangeChange > 0 ? "up" : rangeChange < 0 ? "down" : "flat";

  const sparks = useMemo(() => {
    const c: Record<string, number[]> = {};
    for (const k in series) c[k] = series[k].slice(-30).map((p) => p.value);
    return c;
  }, [series]);

  const owns = (position?.shares ?? 0) > 1e-6;
  const marketValue = (position?.shares ?? 0) * price;
  const invested = position?.amountOwned ?? 0;
  const ret = marketValue - invested;
  const retPct = invested > 0 ? (ret / invested) * 100 : 0;
  const holdingsValue = totals?.marketValue ?? totals?.total ?? 0;
  const weight = holdingsValue > 0 ? (marketValue / holdingsValue) * 100 : 0;
  const dayChange = stock ? stock.price - stock.open : 0;
  const dayPct = stock?.open ? (dayChange / stock.open) * 100 : 0;
  const yearPts = useMemo(() => sliceRange(points, "1Y"), [points]);
  const yearHigh = yearPts.length ? Math.max(...yearPts.map((p) => p.value)) : undefined;
  const yearLow = yearPts.length ? Math.min(...yearPts.map((p) => p.value)) : undefined;
  const accountValue = holdingsValue + (cash ?? 0);

  return (
    <div className="page stock">
      {modal === "buy" && stock && <BuyPopUp Symbol={symbol} currentPrice={price} cash={cash} closed={() => setModal(null)} onDone={refreshAll} />}
      {modal === "sell" && stock && <SellPopUp symbol={symbol} currentPrice={price} sharesOwned={position?.shares ?? 0} closed={() => setModal(null)} onDone={refreshAll} />}

      <div className="stock-grid">
        <main className="stock-main">
          <header className="stock-hero">
            {stock ? (
              <>
                <div className="stock-name">
                  <TickerLogo symbol={symbol} size="lg" />
                  <div>
                    <h1>{companyName(symbol)}</h1>
                    <span className="muted">{symbol}</span>
                  </div>
                </div>
                <div className="stock-price display num" aria-live="polite">
                  {money(shownPrice)}
                </div>
                <div className="stock-change">
                  <Change kind="both" value={rangeChange} pctValue={rangePct} label={hover ? fmtDate(new Date(hover.time * 1000).toISOString()) : rangeLabel(effectiveRange)} />
                </div>
              </>
            ) : (
              <>
                <Skeleton w={220} h={28} />
                <Skeleton w={260} h={56} style={{ marginTop: 10 }} />
                <Skeleton w={200} h={16} style={{ marginTop: 10 }} />
              </>
            )}
          </header>

          <Charts symbol={symbol} data={data} loading={chartsLoading} dir={dir} range={effectiveRange} ranges={ranges} onRangeChange={setRange} onHover={setHover} />

          <section className="section">
            <div className="section-title">
              <h2>Your position</h2>
              {owns && <span className="tag num">{pct(weight, { sign: false })} of holdings</span>}
            </div>
            {!position ? (
              <Skeleton h={60} />
            ) : owns ? (
              <dl className="kv">
                <div>
                  <dt>Shares</dt>
                  <dd className="num">{fmtShares(position.shares)}</dd>
                </div>
                <div>
                  <dt>Market value</dt>
                  <dd className="num">{money(marketValue)}</dd>
                </div>
                <div>
                  <dt>Average cost</dt>
                  <dd className="num">{money(position.averagePrice)}</dd>
                </div>
                <div>
                  <dt>Total return</dt>
                  <dd>
                    <Change kind="both" value={ret} pctValue={retPct} />
                  </dd>
                </div>
                <div>
                  <dt>Today&apos;s return</dt>
                  <dd>
                    <Change kind="both" value={dayChange * position.shares} pctValue={dayPct} />
                  </dd>
                </div>
                <div>
                  <dt>Invested</dt>
                  <dd className="num">{money(invested)}</dd>
                </div>
              </dl>
            ) : (
              <div className="empty">
                <h3>You don&apos;t own {symbol} yet</h3>
                <p>
                  {money(100)} buys about <span className="num">{price ? fmtShares(100 / price) : "–"}</span> shares at today&apos;s price. Use the order ticket to get started.
                </p>
              </div>
            )}
          </section>

          <section className="section">
            <div className="section-title">
              <h2>Key statistics</h2>
            </div>
            <dl className="kv kv-4">
              <div>
                <dt>Open</dt>
                <dd className="num">{money(stock?.open)}</dd>
              </div>
              <div>
                <dt>High</dt>
                <dd className="num">{money(stock?.high)}</dd>
              </div>
              <div>
                <dt>Low</dt>
                <dd className="num">{money(stock?.low)}</dd>
              </div>
              <div>
                <dt>Today</dt>
                <dd>
                  <Change kind="both" value={dayChange} pctValue={dayPct} />
                </dd>
              </div>
              <div>
                <dt>52-week high</dt>
                <dd className="num">{money(yearHigh)}</dd>
              </div>
              <div>
                <dt>52-week low</dt>
                <dd className="num">{money(yearLow)}</dd>
              </div>
              <div>
                <dt>Volume</dt>
                <dd className="num">{stock?.volume && stock.volume !== "0" ? Number(stock.volume).toLocaleString("en-US") : "–"}</dd>
              </div>
              <div>
                <dt>Last update</dt>
                <dd>{stock ? fmtDate(stock.date, true) : "–"}</dd>
              </div>
            </dl>
          </section>

          <section className="section stock-list-inline">
            <div className="section-title">
              <h2>Stocks</h2>
            </div>
            <StockList stocks={stocks} sparks={sparks} selected={symbol} onSelect={setSymbol} filter={query} />
          </section>
        </main>

        <aside className="stock-side">
          {stock && <OrderTicket symbol={symbol} price={price} cash={cash} sharesOwned={position?.shares ?? 0} onDone={refreshAll} />}
          <Link to="/portfolio" className="side-account">
            <span className="row-id">
              <span>Portfolio value</span>
              <strong className="num">{totals && cash !== undefined ? money(accountValue) : "–"}</strong>
            </span>
            <span className="row-end">
              <span>Cash</span>
              <strong className="num">{cash === undefined ? "–" : money(cash)}</strong>
            </span>
          </Link>
          <section className="side-list">
            <div className="section-title">
              <h2>Stocks</h2>
            </div>
            <StockList stocks={stocks} sparks={sparks} selected={symbol} onSelect={setSymbol} filter={query} />
          </section>
        </aside>
      </div>

      <div className="trade-bar">
        <Button variant="up" size="lg" onClick={() => setModal("buy")} disabled={!stock}>
          Buy
        </Button>
        <Button variant="secondary" size="lg" onClick={() => setModal("sell")} disabled={!stock || !owns}>
          Sell
        </Button>
      </div>
    </div>
  );
}
