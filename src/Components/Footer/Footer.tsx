import "./Footer.css";
import { useI18n } from "../../i18n/useI18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>{t("common.footer", { year: new Date().getFullYear() })}</p>
        <ul>
          <li><a href="#main">{t("common.privacy")}</a></li>
          <li><a href="#main">{t("common.terms")}</a></li>
          <li><a href="#main">{t("common.support")}</a></li>
        </ul>
      </div>
    </footer>
  );
}
