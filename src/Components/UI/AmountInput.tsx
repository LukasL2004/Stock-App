import { useId } from "react";
import { parseAmount } from "../../lib/format";
import { useI18n } from "../../i18n/useI18n";

interface Props {
  value: string;
  onChange: (v: string) => void;
  label: string;
  chips?: { label: string; value: number }[];
  error?: string;
  autoFocus?: boolean;
}

export default function AmountInput({ value, onChange, label, chips, error, autoFocus }: Props) {
  const { t } = useI18n();
  const id = useId();
  const current = parseAmount(value);
  return (
    <div className="field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="amount">
        <span className="amount-sign" aria-hidden="true">
          $
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          style={{ width: `${Math.max(4, Math.min(12, (value || "0.00").length + 1))}ch` }}
        />
      </div>
      {chips && (
        <div className="chips" role="group" aria-label={t("ticket.quick")}>
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              className="chip"
              aria-pressed={current > 0 && Math.abs(current - c.value) < 0.005}
              onClick={() => onChange(c.value % 1 === 0 ? String(c.value) : c.value.toFixed(2))}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p id={`${id}-err`} className="field-error" role="alert" style={{ textAlign: "center" }}>
          {error}
        </p>
      )}
    </div>
  );
}
