import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "up" | "down" | "danger" | "default";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
}

export default function Button({
  variant = "default",
  size = "md",
  loading = false,
  block = false,
  icon,
  iconOnly = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: Props) {
  const cls = [
    "btn",
    variant !== "default" && `btn-${variant}`,
    size !== "md" && `btn-${size}`,
    block && "btn-block",
    iconOnly && "btn-icon",
    loading && "btn-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {icon}
      {children !== undefined && <span className="btn-label">{children}</span>}
      {loading && <span className="btn-spinner" aria-hidden="true" />}
    </button>
  );
}
