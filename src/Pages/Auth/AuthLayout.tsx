import type { ReactNode } from "react";
import { Link } from "react-router";
import "./auth.css";
import Logo from "../../Components/UI/Logo";
import { useTheme } from "../../lib/useTheme";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

/** Plain, centred auth page: wordmark, one column, nothing else competing. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { resolved, toggle } = useTheme();
  const ThemeIcon = resolved === "dark" ? IoSunnyOutline : IoMoonOutline;
  return (
    <div className="auth">
      <header className="auth-top">
        <Link to="/" aria-label="WealthGrow" className="auth-brand">
          <Logo size={26} />
        </Link>
        <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}>
          <ThemeIcon />
        </button>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
          {footer && <p className="auth-foot">{footer}</p>}
        </div>
      </main>
      <footer className="auth-bottom">Paper-trading project. No real money is invested.</footer>
    </div>
  );
}
