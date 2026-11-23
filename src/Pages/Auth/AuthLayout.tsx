import type { ReactNode } from "react";
import { Link } from "react-router";
import "./auth.css";
import Logo from "../../Components/UI/Logo";
import { useTheme } from "../../lib/useTheme";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { useI18n } from "../../i18n/useI18n";
import LanguageMenu from "../../Components/UI/LanguageMenu";

/** Plain, centred auth page: wordmark, one column, nothing else competing. */
export default function AuthLayout({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  const { t } = useI18n();
  const { resolved, toggle } = useTheme();
  const ThemeIcon = resolved === "dark" ? IoSunnyOutline : IoMoonOutline;
  return (
    <div className="auth">
      <header className="auth-top">
        <Link to="/" aria-label={t("common.appName")} className="auth-brand">
          <Logo size={26} />
        </Link>
        <div className="auth-tools">
          <LanguageMenu />
          <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label={resolved === "dark" ? t("nav.toLight") : t("nav.toDark")}>
            <ThemeIcon />
          </button>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          {subtitle && <p className="auth-sub">{subtitle}</p>}
          {children}
          {footer && <p className="auth-foot">{footer}</p>}
        </div>
      </main>
      <footer className="auth-bottom">{t("common.demoNote")}</footer>
    </div>
  );
}
