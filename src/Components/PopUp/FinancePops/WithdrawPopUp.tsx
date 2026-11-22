import { useState, type FormEvent } from "react";
import WalletService from "../../../Services/WalletService";
import Modal from "../../UI/Modal";
import AmountInput from "../../UI/AmountInput";
import Button from "../../UI/Button";
import FormError from "../../UI/FormError";
import { money, parseAmount } from "../../../lib/format";
import { errorMessage } from "../../../lib/http";
import { useToast } from "../../../lib/useToast";

interface Props {
  onClose: () => void;
  onDone?: () => void;
  balance?: number;
}

export default function WithdrawPopUp({ onClose, onDone, balance }: Props) {
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const amount = parseAmount(raw);
  const tooMuch = balance !== undefined && amount > balance + 1e-9;

  const chips =
    balance && balance > 0
      ? [
          { label: "25%", value: Math.floor(balance * 25) / 100 },
          { label: "50%", value: Math.floor(balance * 50) / 100 },
          { label: "All", value: Math.floor(balance * 100) / 100 },
        ]
      : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError("Enter an amount to withdraw.");
    if (tooMuch) return setError(`You can withdraw at most ${money(balance)}.`);
    setLoading(true);
    try {
      await WalletService.Withdraw(amount);
      toast.success(`${money(amount)} withdrawn`);
      onDone?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Withdraw" description="Move virtual cash out of your account." onClose={onClose}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput label="Amount to withdraw in dollars" value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
        {balance !== undefined && (
          <div className="summary">
            <div className="summary-row">
              <span>Available cash</span>
              <strong className="num">{money(balance)}</strong>
            </div>
            <div className="summary-row">
              <span>Cash after withdrawal</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{money(balance - amount)}</strong>
            </div>
          </div>
        )}
        <FormError message={error} />
        <Button type="submit" variant="primary" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
          {amount > 0 ? `Withdraw ${money(amount)}` : "Withdraw"}
        </Button>
      </form>
    </Modal>
  );
}
