import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import { direction, money, pct } from "../../lib/format";
import { useI18n } from "../../i18n/useI18n";

interface Props {
  value?: number | null;
  /** "pct" (default) | "money" | "both" */
  kind?: "pct" | "money" | "both";
  pctValue?: number | null;
  /** solid coloured pill (Apple Stocks style) */
  pill?: boolean;
  /** trailing label like "Today" or "Past month" */
  label?: string;
  className?: string;
}

/** Signed change with an arrow, so direction never relies on colour alone. */
export default function Change({ value, kind = "pct", pctValue, pill = false, label, className = "" }: Props) {
  const { t } = useI18n();
  const dir = direction(kind === "pct" ? value : (value ?? pctValue));
  const arrow = dir === "up" ? <IoCaretUp aria-hidden="true" /> : dir === "down" ? <IoCaretDown aria-hidden="true" /> : null;
  const main = kind === "pct" ? pct(value) : money(value, { sign: true });
  const tail = kind === "both" ? `(${pct(pctValue, { sign: false })})` : null;
  const said = dir === "up" ? t("common.up") : dir === "down" ? t("common.down") : t("common.unchanged");
  const cls = pill ? `pill pill-${dir}` : `change ${dir}`;
  return (
    <span className={`${cls} num ${className}`}>
      <span className="change-main">
        {arrow}
        <span className="sr-only">{said} </span>
        {main}
      </span>
      {tail && <span className="change-tail">{tail}</span>}
      {label && <span className="change-label muted">{label}</span>}
    </span>
  );
}
