import { useEffect, useState, type FormEvent } from "react";
import Trading from "../../Services/StockTradingService";
import Button from "../UI/Button";
import FormError from "../UI/FormError";
import { money, parseAmount, shares as fmtShares } from "../../lib/format";
import { errorMessage } from "../../lib/http";
import { useToast } from "../../lib/useToast";
import "./trade.css";

interface Props {
  symbol: string;
  price: number;
  cash?: number;
  sharesOwned?: number;
  onDone?: () => void;
}

type Side = "buy" | "sell";

/** Inline order ticket, the way brokerage apps place it beside the chart. */
export default function OrderTicket({ symbol, price, cash, sharesOwned = 0, onDone }: Props) {
  const toast = useToast();
  const [side, setSide] = useState<Side>("buy");
  const [raw, setRaw] = useState("");
  const [step, setStep] = useState<"edit" | "review">("edit");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRaw("");
    setStep("edit");
    setError(null);
  }, [symbol, side]);

  const amount = parseAmount(raw);
  const qty = price > 0 ? amount / price : 0;
  const marketValue = sharesOwned * price;
  const max = side === "buy" ? (cash ?? Infinity) : marketValue;
  const tooMuch = amount > max + 1e-9;
  const canSell = sharesOwned > 1e-6;

  const chips =
    side === "buy"
      ? [100, 500, 1000].map((v) => ({ label: money(v).replace(".00", ""), value: v })).concat(cash && cash > 0 ? [{ label: "Max", value: Math.floor(cash * 100) / 100 }] : [])
      : [0.25, 0.5, 1].map((f) => ({ label: f === 1 ? "All" : `${f * 100}%`, value: Math.floor(marketValue * f * 100) / 100 }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError(`Enter an amount to ${side}.`);
    if (tooMuch) return setError(side === "buy" ? `You have ${money(cash)} available to invest.` : `You can sell up to ${money(marketValue)} of ${symbol}.`);
    if (step === "edit") return setStep("review");
    setLoading(true);
    try {
      if (side === "buy") await Trading.buy({ symbol, currentPrice: price, amountToInvest: amount });
      else await Trading.sell({ symbol, currentPrice: price, withdrawAmount: amount });
      toast.success(`${side === "buy" ? "Bought" : "Sold"} ${fmtShares(qty)} ${symbol}`, `${money(amount)} at ${money(price)} per share`);
      setRaw("");
      setStep("edit");
      onDone?.();
    } catch (err) {
      setError(errorMessage(err));
      setStep("edit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="ticket card" onSubmit={submit} noValidate aria-label={`${side === "buy" ? "Buy" : "Sell"} ${symbol}`}>
      <div className="ticket-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={side === "buy"} className={side === "buy" ? "is-on up" : ""} onClick={() => setSide("buy")}>
          Buy {symbol}
        </button>
        <button type="button" role="tab" aria-selected={side === "sell"} className={side === "sell" ? "is-on down" : ""} onClick={() => setSide("sell")} disabled={!canSell} title={canSell ? undefined : `You do not own ${symbol}`}>
          Sell {symbol}
        </button>
      </div>

      <div className="ticket-body">
        <div className="ticket-row">
          <span>Order type</span>
          <strong>Market order</strong>
        </div>
        <div className="ticket-row">
          <span>{side === "buy" ? "Invest in" : "Sell in"}</span>
          <strong>Dollars</strong>
        </div>
        <label className="ticket-row ticket-amount">
          <span>Amount</span>
          <span className={`ticket-input${tooMuch ? " is-invalid" : ""}`}>
            <span aria-hidden="true">$</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={raw}
              disabled={step === "review" || loading}
              onChange={(e) => {
                setRaw(e.target.value);
                setError(null);
              }}
            />
          </span>
        </label>
        <div className="ticket-row">
          <span>Est. quantity</span>
          <strong className="num">{amount > 0 ? fmtShares(qty) : "0"}</strong>
        </div>
        <div className="ticket-row">
          <span>Market price</span>
          <strong className="num">{money(price)}</strong>
        </div>

        {step === "edit" && (
          <div className="ticket-chips" role="group" aria-label="Quick amounts">
            {chips.map((c) => (
              <button key={c.label} type="button" className="chip" aria-pressed={amount > 0 && Math.abs(amount - c.value) < 0.005} onClick={() => setRaw(c.value % 1 === 0 ? String(c.value) : c.value.toFixed(2))}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {step === "review" && (
          <div className="ticket-review" role="status">
            <div className="ticket-row">
              <span>{side === "buy" ? "Cash after order" : "Cash after sale"}</span>
              <strong className="num">{money((cash ?? 0) + (side === "buy" ? -amount : amount))}</strong>
            </div>
            <div className="ticket-row">
              <span>{symbol} shares after</span>
              <strong className="num">{fmtShares(Math.max(0, sharesOwned + (side === "buy" ? qty : -qty)))}</strong>
            </div>
          </div>
        )}

        <FormError message={error} />

        <Button type="submit" variant={side === "buy" ? "up" : "down"} size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
          {step === "edit" ? "Review order" : `${side === "buy" ? "Buy" : "Sell"} ${money(amount)} of ${symbol}`}
        </Button>
        {step === "review" && (
          <button type="button" className="link ticket-edit" onClick={() => setStep("edit")}>
            Edit order
          </button>
        )}
      </div>

      <div className="ticket-foot num">
        {side === "buy" ? (cash === undefined ? "Loading buying power" : `${money(cash)} buying power available`) : `${fmtShares(sharesOwned)} shares available (${money(marketValue)})`}
      </div>
    </form>
  );
}
