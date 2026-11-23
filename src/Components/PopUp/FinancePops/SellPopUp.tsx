import { useState, type FormEvent } from "react";
import Trading from "../../../Services/StockTradingService";
import Modal from "../../UI/Modal";
import AmountInput from "../../UI/AmountInput";
import Button from "../../UI/Button";
import FormError from "../../UI/FormError";
import { companyName, money, parseAmount, shares as fmtShares } from "../../../lib/format";
import { errorMessage } from "../../../lib/http";
import { useToast } from "../../../lib/useToast";
import { useI18n } from "../../../i18n/useI18n";

interface Props {
  symbol: string;
  currentPrice: number;
  sharesOwned?: number;
  closed: () => void;
  onDone?: () => void;
}

export default function SellPopUp({ symbol, currentPrice, sharesOwned = 0, closed, onDone }: Props) {
  const { t } = useI18n();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const marketValue = sharesOwned * currentPrice;
  const amount = parseAmount(raw);
  const sellShares = currentPrice > 0 ? amount / currentPrice : 0;
  const tooMuch = sellShares > sharesOwned + 1e-9;

  const chips =
    marketValue > 0
      ? [
          { label: "25%", value: Math.floor(marketValue * 25) / 100 },
          { label: "50%", value: Math.floor(marketValue * 50) / 100 },
          { label: t("ticket.all"), value: Math.floor(marketValue * 100) / 100 },
        ]
      : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError(t("ticket.errSellAmount"));
    if (tooMuch) return setError(t("modal.sell.errOwn", { shares: fmtShares(sharesOwned), value: money(marketValue) }));
    setLoading(true);
    try {
      await Trading.sell({ symbol, currentPrice, withdrawAmount: amount });
      toast.success(t("toast.sold", { shares: fmtShares(sellShares), symbol }), t("toast.detail", { amount: money(amount), price: money(currentPrice) }));
      onDone?.();
      closed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t("ticket.sell", { symbol })} description={t("modal.buy.desc", { name: companyName(symbol), price: money(currentPrice) })} onClose={closed}>
      {sharesOwned <= 0 ? (
        <>
          <FormError message={t("modal.sell.none", { symbol })} />
          <Button variant="secondary" block onClick={closed}>
            {t("common.close")}
          </Button>
        </>
      ) : (
        <form onSubmit={submit} className="modal-foot" noValidate>
          <AmountInput label={t("modal.sell.label")} value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
          <div className="summary">
            <div className="summary-row">
              <span>{t("modal.sell.toSell")}</span>
              <strong className="num">{amount > 0 ? fmtShares(sellShares) : "–"}</strong>
            </div>
            <div className="summary-row">
              <span>{t("modal.sell.own")}</span>
              <strong className="num">
                {fmtShares(sharesOwned)} ({money(marketValue)})
              </strong>
            </div>
            <div className="summary-row">
              <span>{t("modal.sell.after")}</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{amount > 0 ? fmtShares(Math.max(0, sharesOwned - sellShares)) : "–"}</strong>
            </div>
          </div>
          <FormError message={error} />
          <Button type="submit" variant="down" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
            {amount > 0 ? t("ticket.submitSell", { amount: money(amount), symbol }) : t("ticket.sell", { symbol })}
          </Button>
          <p className="field-hint">{t("modal.sell.note")}</p>
        </form>
      )}
    </Modal>
  );
}
