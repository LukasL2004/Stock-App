import { useState, type FormEvent } from "react";
import WalletService from "../../../Services/WalletService";
import Modal from "../../UI/Modal";
import AmountInput from "../../UI/AmountInput";
import Button from "../../UI/Button";
import FormError from "../../UI/FormError";
import { money, parseAmount } from "../../../lib/format";
import { errorMessage } from "../../../lib/http";
import { useToast } from "../../../lib/useToast";
import { useI18n } from "../../../i18n/useI18n";

interface Props {
  onClose: () => void;
  onDone?: () => void;
  balance?: number;
}

export default function WithdrawPopUp({ onClose, onDone, balance }: Props) {
  const { t } = useI18n();
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
          { label: t("ticket.all"), value: Math.floor(balance * 100) / 100 },
        ]
      : undefined;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError(t("modal.withdraw.err"));
    if (tooMuch) return setError(t("modal.withdraw.max", { amount: money(balance) }));
    setLoading(true);
    try {
      await WalletService.Withdraw(amount);
      toast.success(t("toast.withdrawn", { amount: money(amount) }));
      onDone?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t("modal.withdraw.title")} description={t("modal.withdraw.desc")} onClose={onClose}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput label={t("modal.withdraw.label")} value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={chips} autoFocus />
        {balance !== undefined && (
          <div className="summary">
            <div className="summary-row">
              <span>{t("modal.withdraw.available")}</span>
              <strong className="num">{money(balance)}</strong>
            </div>
            <div className="summary-row">
              <span>{t("modal.withdraw.cashAfter")}</span>
              <strong className={`num ${tooMuch ? "down" : ""}`}>{money(balance - amount)}</strong>
            </div>
          </div>
        )}
        <FormError message={error} />
        <Button type="submit" variant="primary" size="lg" block loading={loading} disabled={!(amount > 0) || tooMuch}>
          {amount > 0 ? t("modal.withdraw.submit", { amount: money(amount) }) : t("modal.withdraw.title")}
        </Button>
      </form>
    </Modal>
  );
}
