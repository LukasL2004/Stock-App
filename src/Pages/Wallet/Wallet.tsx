import { useCallback, useState } from "react";
import { IoAdd, IoArrowDown } from "react-icons/io5";
import "./Wallet.css";
import Portofolio from "../../Services/PortofolioService";
import WalletService from "../../Services/WalletService";
import StockData from "../../Services/StockInfoService";
import AuditLog from "../../Services/AuditLogService";
import type { total } from "../../Services/Interfaces/TotalInterface";
import type { DailyProfit } from "../../Services/Interfaces/ProfitInterface";
import type { AuditLogInterface } from "../../Services/Interfaces/AuditLogInterface";
import type { Stock } from "../../Services/Interfaces/StockInfoInterface";
import AddFoundsPopUp from "../../Components/PopUp/FinancePops/AddFoundsPopUp";
import WithdrawPopUp from "../../Components/PopUp/FinancePops/WithdrawPopUp";
import ActivityList from "../../Components/Transactions/ActivityList";
import Allocation, { type Holding } from "../../Components/Portfolio/Allocation";
import Button from "../../Components/UI/Button";
import Change from "../../Components/UI/Change";
import Skeleton from "../../Components/UI/Skeleton";
import { money } from "../../lib/format";
import { useRealtime } from "../../lib/useRealtime";
import { useLoad } from "../../lib/useLoad";
import { useToast } from "../../lib/useToast";
import { errorMessage } from "../../lib/http";
import { useI18n } from "../../i18n/useI18n";

export default function Wallet() {
  const { t } = useI18n();
  const toast = useToast();
  const [totals, setTotals] = useState<total>();
  const [cash, setCash] = useState<number>();
  const [deposited, setDeposited] = useState<number>();
  const [daily, setDaily] = useState<DailyProfit>();
  const [holdings, setHoldings] = useState<Holding[]>();
  const [audit, setAudit] = useState<AuditLogInterface[]>();
  const [modal, setModal] = useState<"deposit" | "withdraw" | null>(null);

  const load = useCallback(async () => {
    const [tot, w, s, a] = await Promise.allSettled([Portofolio.getTotal(), WalletService.Balance(), StockData.stocks(), AuditLog.GetAudit()]);
    if (tot.status === "rejected") toast.error(t("wallet.errLoad"), errorMessage(tot.reason));
    if (w.status === "fulfilled") {
      setCash(w.value.balance);
      setDeposited(w.value.investment);
    }
    if (a.status === "fulfilled") setAudit(a.value);
    if (tot.status === "fulfilled") {
      setTotals(tot.value);
      const prices: Record<string, Stock> = {};
      if (s.status === "fulfilled") for (const st of s.value) prices[st.symbol] = st;
      const rows = tot.value.portfolioChart.filter((p) => p.value > 0);
      const list: Holding[] = await Promise.all(
        rows.map(async (p) => {
          try {
            const pos = await Portofolio.getData(p.symbol);
            const px = prices[p.symbol]?.price;
            const mv = p.marketValue ?? (px ? pos.shares * px : p.value);
            return { symbol: p.symbol, shares: pos.shares, invested: p.value, marketValue: mv, profit: p.profit ?? mv - p.value };
          } catch {
            const mv = p.marketValue ?? p.value;
            return { symbol: p.symbol, invested: p.value, marketValue: mv, profit: p.profit ?? mv - p.value };
          }
        }),
      );
      list.sort((x, y) => y.marketValue - x.marketValue);
      setHoldings(list);
      if (list[0]) Portofolio.getProfit(list[0].symbol).then(setDaily).catch(() => setDaily(undefined));
    }
  }, [toast, t]);
  useLoad(load);
  useRealtime(load);

  const ready = totals !== undefined && cash !== undefined && holdings !== undefined;
  const holdingsValue = holdings?.reduce((a, h) => a + h.marketValue, 0) ?? 0;
  const invested = totals?.investedValue ?? totals?.total ?? 0;
  const totalReturn = holdings?.reduce((a, h) => a + h.profit, 0) ?? 0;
  const totalReturnPct = invested > 0 ? (totalReturn / invested) * 100 : 0;
  const accountValue = holdingsValue + (cash ?? 0);

  return (
    <div className="page wallet">
      {modal === "deposit" && <AddFoundsPopUp balance={cash} onClose={() => setModal(null)} onDone={load} />}
      {modal === "withdraw" && <WithdrawPopUp balance={cash} onClose={() => setModal(null)} onDone={load} />}

      <header className="wallet-hero">
        <div>
          <p className="muted">{t("wallet.title")}</p>
          {ready ? <div className="wallet-value display num">{money(accountValue)}</div> : <Skeleton w={260} h={52} style={{ marginTop: 6 }} />}
          <div className="wallet-changes">
            {ready && <Change kind="both" value={totalReturn} pctValue={totalReturnPct} label={t("wallet.allTime")} />}
            {daily && <Change kind="both" value={daily.totalPortfolioProfitDaily} pctValue={daily.totalPortfolioProfitDailyPercentage} label={t("common.today")} />}
          </div>
        </div>
        <div className="wallet-actions">
          <Button variant="primary" icon={<IoAdd />} onClick={() => setModal("deposit")}>
            {t("wallet.addFunds")}
          </Button>
          <Button variant="secondary" icon={<IoArrowDown />} onClick={() => setModal("withdraw")} disabled={!cash}>
            {t("wallet.withdraw")}
          </Button>
        </div>
      </header>

      <dl className="kv kv-4 wallet-kv">
        <div>
          <dt>{t("wallet.holdings")}</dt>
          <dd className="num">{ready ? money(holdingsValue) : <Skeleton w={90} h={16} />}</dd>
        </div>
        <div>
          <dt>{t("common.cash")}</dt>
          <dd className="num">{ready ? money(cash) : <Skeleton w={90} h={16} />}</dd>
        </div>
        <div>
          <dt>{t("wallet.invested")}</dt>
          <dd className="num">{ready ? money(invested) : <Skeleton w={90} h={16} />}</dd>
        </div>
        <div>
          <dt>{t("wallet.deposited")}</dt>
          <dd className="num">{deposited === undefined ? <Skeleton w={90} h={16} /> : money(deposited)}</dd>
        </div>
      </dl>

      <section className="section">
        <div className="section-title">
          <h2>{t("wallet.holdings")}</h2>
        </div>
        {!ready ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Skeleton h={10} r={6} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} h={48} />
            ))}
          </div>
        ) : (
          <Allocation holdings={holdings} cash={cash} />
        )}
      </section>

      <section className="section">
        <div className="section-title">
          <h2>{t("wallet.activity")}</h2>
        </div>
        <ActivityList items={audit} loading={!audit} pageSize={10} />
      </section>
    </div>
  );
}
