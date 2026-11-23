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
  Symbol: string;
  currentPrice: number;
  cash?: number;
  closed: () => void;
  onDone?: () => void;
}

export default function BuyPopUp({ Symbol, currentPrice, cash, closed, onDone }: Props) {
  const { t } = useI18n();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = parseAmount(raw);
  const estShares = currentPrice > 0 ? amount / currentPrice : 0;
  const tooMuch = cash !== undefined && amount > cash + 1e-9;

  const chips = [
    { label: money(100).replace(/[.,]00/, ""), value: 100 },
    { label: money(500).replace(/[.,]00/, ""), value: 500 },
    { label: money(1000).replace(/[.,]00/, ""), value: 1000 },
    ...(cash && cash > 0 ? [{ label: t("ticket.max"), value: Math.floor(cash * 100) / 100 }] : []),
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError(t("ticket.errBuyAmount"));
    if (tooMuch) return setError(t("ticket.errCash", { amount: money(cash) }));
    setLoading(true);
    try {
      await Trading.buy({ symbol: Symbol, currentPrice, amountToInvest: amount });
      toast.success(t("toast.bought", { shares: fmtShares(estShares), symbol: Symbol }), t("toast.detail", { amount: money(amount), price: money(currentPrice) }));
      onDone?.();
      closed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t("ticket.buy", { symbol: Symbol })} description={t("modal.buy.desc", { name: companyName(Symbol), price: money(currentPrice) })} onClose={closed}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput label={t("modal.buy.label")} value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
        <div className="summary">
          <div className="summary-row">
            <span>{t("modal.buy.estShares")}</span>
            <strong className="num">{amount > 0 ? fmtShares(estShares) : "–"}</strong>
          </div>
          <div className="summary-row">
            <span>{t("modal.buy.pricePer")}</span>
            <strong className="num">{money(currentPrice)}</strong>
          </div>
          {cash !== undefined && (
            <div className="summary-row">
              <span>{t("modal.buy.cashAfter")}</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{money(cash - amount)}</strong>
            </div>
          )}
        </div>
        <FormError message={error} />
        <Button type="submit" variant="up" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
          {amount > 0 ? t("ticket.submitBuy", { amount: money(amount), symbol: Symbol }) : t("ticket.buy", { symbol: Symbol })}
        </Button>
        <p className="field-hint">{t("modal.buy.note")}</p>
      </form>
    </Modal>
  );
}
