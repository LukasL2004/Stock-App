import { useState, type FormEvent } from "react";
import Trading from "../../../Services/StockTradingService";
import Modal from "../../UI/Modal";
import AmountInput from "../../UI/AmountInput";
import Button from "../../UI/Button";
import FormError from "../../UI/FormError";
import { companyName, money, shares as fmtShares, parseAmount } from "../../../lib/format";
import { errorMessage } from "../../../lib/http";
import { useToast } from "../../../lib/useToast";

interface Props {
  Symbol: string;
  currentPrice: number;
  cash?: number;
  closed: () => void;
  onDone?: () => void;
}

export default function BuyPopUp({ Symbol, currentPrice, cash, closed, onDone }: Props) {
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const amount = parseAmount(raw);
  const estShares = currentPrice > 0 ? amount / currentPrice : 0;
  const tooMuch = cash !== undefined && amount > cash + 1e-9;

  const chips = [
    { label: "$100", value: 100 },
    { label: "$500", value: 500 },
    { label: "$1,000", value: 1000 },
    ...(cash && cash > 0 ? [{ label: "Max", value: Math.floor(cash * 100) / 100 }] : []),
  ];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError("Enter an amount to invest.");
    if (tooMuch) return setError(`You have ${money(cash)} available. Add funds or lower the amount.`);
    setLoading(true);
    try {
      await Trading.buy({ symbol: Symbol, currentPrice, amountToInvest: amount });
      toast.success(`Bought ${fmtShares(estShares)} shares of ${Symbol}`, `${money(amount)} at ${money(currentPrice)} per share`);
      onDone?.();
      closed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Buy ${Symbol}`} description={`${companyName(Symbol)} at ${money(currentPrice)} per share`} onClose={closed}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput label="Amount to invest in dollars" value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
        <div className="summary">
          <div className="summary-row">
            <span>Estimated shares</span>
            <strong className="num">{amount > 0 ? fmtShares(estShares) : "–"}</strong>
          </div>
          <div className="summary-row">
            <span>Price per share</span>
            <strong className="num">{money(currentPrice)}</strong>
          </div>
          {cash !== undefined && (
            <div className="summary-row">
              <span>Cash after purchase</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{money(cash - amount)}</strong>
            </div>
          )}
        </div>
        <FormError message={error} />
        <Button type="submit" variant="up" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
          {amount > 0 ? `Buy ${money(amount)} of ${Symbol}` : `Buy ${Symbol}`}
        </Button>
        <p className="field-hint">
          Orders fill at the latest 15-minute price. This is a practice account.
        </p>
      </form>
    </Modal>
  );
}
