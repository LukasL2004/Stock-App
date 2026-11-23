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

export default function AddFoundsPopUp({ onClose, onDone, balance }: Props) {
  const { t } = useI18n();
  const toast = useToast();
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const amount = parseAmount(raw);
  const chip = (v: number) => ({ label: money(v).replace(/[.,]00/, ""), value: v });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!(amount > 0)) return setError(t("modal.deposit.err"));
    if (amount > 1_000_000) return setError(t("modal.deposit.max", { amount: money(1_000_000) }));
    setLoading(true);
    try {
      await WalletService.AddFounds(amount);
      toast.success(t("toast.deposited", { amount: money(amount) }));
      onDone?.();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={t("modal.deposit.title")} description={t("modal.deposit.desc")} onClose={onClose}>
      <form onSubmit={submit} className="modal-foot" noValidate>
        <AmountInput label={t("modal.deposit.label")} value={raw} onChange={(v) => { setRaw(v); setError(null); }} chips={[chip(500), chip(1000), chip(5000), chip(10000)]} autoFocus />
        {balance !== undefined && (
          <div className="summary">
            <div className="summary-row">
              <span>{t("modal.deposit.cashNow")}</span>
              <strong className="num">{money(balance)}</strong>
            </div>
            <div className="summary-row">
              <span>{t("modal.deposit.cashAfter")}</span>
              <strong className="num">{money(balance + amount)}</strong>
            </div>
          </div>
        )}
        <FormError message={error} />
        <Button type="submit" variant="primary" size="lg" block loading={loading} disabled={!(amount > 0)}>
          {amount > 0 ? t("modal.deposit.submit", { amount: money(amount) }) : t("modal.deposit.title")}
        </Button>
        <p className="field-hint">{t("modal.deposit.note")}</p>
      </form>
    </Modal>
  );
}
