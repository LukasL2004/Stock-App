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

export default function AddFoundsPopUp({ onClose, onDone, balance }: Props) {
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const amount = parseAmount(raw);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError("Enter an amount to add.");
    if (amount > 1_000_000) return setError("The maximum single deposit is $1,000,000.");
    setLoading(true);
    try {
      await WalletService.AddFounds(amount);
      toast.success(`${money(amount)} added to your cash balance`);
      onDone?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add funds" description="Top up the virtual cash you can invest." onClose={onClose}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput
          label="Amount to add in dollars"
          value={raw}
          onChange={(v) => { setRaw(v); setError(null); }}
          chips={[{ label: "$500", value: 500 }, { label: "$1,000", value: 1000 }, { label: "$5,000", value: 5000 }, { label: "$10,000", value: 10000 }]}
          autoFocus
        />
        {balance !== undefined && (
          <div className="summary">
            <div className="summary-row">
              <span>Cash now</span>
              <strong className="num">{money(balance)}</strong>
            </div>
            <div className="summary-row">
              <span>Cash after deposit</span>
              <strong className="num">{money(balance + amount)}</strong>
            </div>
          </div>
        )}
        <FormError message={error} />
        <Button type="submit" variant="primary" size="lg" block loading={loading} disabled={!(amount > 0)}>
          {amount > 0 ? `Add ${money(amount)}` : "Add funds"}
        </Button>
        <p className="field-hint">
          Practice money: deposits are instant and nothing leaves your bank.
        </p>
      </form>
    </Modal>
  );
}
