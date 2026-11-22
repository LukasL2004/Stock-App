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
  symbol: string;
  currentPrice: number;
  sharesOwned?: number;
  closed: () => void;
  onDone?: () => void;
}

export default function SellPopUp({ symbol, currentPrice, sharesOwned = 0, closed, onDone }: Props) {
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
          { label: "All", value: Math.floor(marketValue * 100) / 100 },
        ]
      : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError("Enter an amount to sell.");
    if (tooMuch) return setError(`You own ${fmtShares(sharesOwned)} shares, worth ${money(marketValue)}.`);
    setLoading(true);
    try {
      await Trading.sell({ symbol, currentPrice, withdrawAmount: amount });
      toast.success(`Sold ${fmtShares(sellShares)} shares of ${symbol}`, `${money(amount)} added to your cash balance`);
      onDone?.();
      closed();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Sell ${symbol}`} description={`${companyName(symbol)} at ${money(currentPrice)} per share`} onClose={closed}>
      {sharesOwned <= 0 ? (
        <>
          <FormError message={`You do not own any ${symbol} shares yet.`} />
          <Button variant="secondary" block onClick={closed}>
            Close
          </Button>
        </>
      ) : (
        <form onSubmit={submit} className="modal-foot" noValidate>
          <AmountInput label="Amount to sell in dollars" value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
          <div className="summary">
            <div className="summary-row">
              <span>Shares to sell</span>
              <strong className="num">{amount > 0 ? fmtShares(sellShares) : "–"}</strong>
            </div>
            <div className="summary-row">
              <span>You own</span>
              <strong className="num">
                {fmtShares(sharesOwned)} shares ({money(marketValue)})
              </strong>
            </div>
            <div className="summary-row">
              <span>Shares after sale</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{amount > 0 ? fmtShares(Math.max(0, sharesOwned - sellShares)) : "–"}</strong>
            </div>
          </div>
          <FormError message={error} />
          <Button type="submit" variant="down" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
            {amount > 0 ? `Sell ${money(amount)} of ${symbol}` : `Sell ${symbol}`}
          </Button>
          <p className="field-hint">
            Proceeds go straight to your cash balance.
          </p>
        </form>
      )}
    </Modal>
  );
}
