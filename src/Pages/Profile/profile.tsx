import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { IoAdd, IoArrowDown, IoChevronForward, IoTimeOutline } from "react-icons/io5";
import "./Profile.css";
import WalletService from "../../Services/WalletService";
import authService from "../../Services/UserService";
import Portofolio from "../../Services/PortofolioService";
import type { User } from "../../Services/Interfaces/UserInterface";
import AddFoundsPopUp from "../../Components/PopUp/FinancePops/AddFoundsPopUp";
import WithdrawPopUp from "../../Components/PopUp/FinancePops/WithdrawPopUp";
import AuditLogPop from "../../Components/PopUp/AuditLogPop/AuditLogPop";
import Avatar from "../../Components/UI/Avatar";
import Button from "../../Components/UI/Button";
import Skeleton from "../../Components/UI/Skeleton";
import { money } from "../../lib/format";
import { clearSession } from "../../lib/auth";
import { useTheme, type ThemePref } from "../../lib/useTheme";
import { useRealtime } from "../../lib/useRealtime";
import { useLoad } from "../../lib/useLoad";
import { useToast } from "../../lib/useToast";
import { errorMessage, MOCK_MODE } from "../../lib/http";
import { useI18n } from "../../i18n/useI18n";
import { LANGS, LANG_NAMES, type Lang } from "../../i18n/core";

export default function Profile() {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const toast = useToast();
  const { pref, setPref } = useTheme();
  const [user, setUser] = useState<User>();
  const [balance, setBalance] = useState<number>();
  const [deposited, setDeposited] = useState<number>();
  const [holdings, setHoldings] = useState<number>();
  const [modal, setModal] = useState<"deposit" | "withdraw" | "activity" | null>(null);

  const load = useCallback(async () => {
    const [u, w, tot] = await Promise.allSettled([authService.getUser(), WalletService.Balance(), Portofolio.getTotal()]);
    if (u.status === "fulfilled") setUser(u.value);
    else toast.error(t("profile.errLoad"), errorMessage(u.reason));
    if (w.status === "fulfilled") {
      setBalance(w.value.balance);
      setDeposited(w.value.investment);
    }
    if (tot.status === "fulfilled") setHoldings(tot.value.marketValue ?? tot.value.total);
  }, [toast, t]);
  useLoad(load);
  useRealtime(load);

  const logout = () => {
    clearSession();
    navigate("/Login", { replace: true });
  };

  const themes: { value: ThemePref; label: string }[] = [
    { value: "light", label: t("profile.light") },
    { value: "dark", label: t("profile.dark") },
    { value: "system", label: t("profile.auto") },
  ];

  return (
    <div className="page profile">
      {modal === "deposit" && <AddFoundsPopUp balance={balance} onClose={() => setModal(null)} onDone={load} />}
      {modal === "withdraw" && <WithdrawPopUp balance={balance} onClose={() => setModal(null)} onDone={load} />}
      {modal === "activity" && <AuditLogPop closed={() => setModal(null)} />}

      <header className="profile-head">
        <Avatar first={user?.firstName} last={user?.lastName} size="lg" />
        <div>
          {user ? (
            <>
              <h1>
                {user.firstName} {user.lastName}
              </h1>
              <p className="muted">{user.email}</p>
            </>
          ) : (
            <>
              <Skeleton w={180} h={24} />
              <Skeleton w={220} h={14} style={{ marginTop: 8 }} />
            </>
          )}
        </div>
      </header>

      <dl className="kv profile-kv">
        <div>
          <dt>{t("common.cash")}</dt>
          <dd className="num">{balance === undefined ? <Skeleton w={90} h={16} /> : money(balance)}</dd>
        </div>
        <div>
          <dt>{t("profile.holdings")}</dt>
          <dd className="num">{holdings === undefined ? <Skeleton w={90} h={16} /> : money(holdings)}</dd>
        </div>
        <div>
          <dt>{t("wallet.deposited")}</dt>
          <dd className="num">{deposited === undefined ? <Skeleton w={90} h={16} /> : money(deposited)}</dd>
        </div>
      </dl>

      <section className="section">
        <div className="section-title">
          <h2>{t("profile.money")}</h2>
        </div>
        <ul className="rows settings">
          <li>
            <button className="row" onClick={() => setModal("deposit")}>
              <span className="settings-icon"><IoAdd /></span>
              <span className="row-id"><strong>{t("wallet.addFunds")}</strong><span>{t("profile.addFundsSub")}</span></span>
              <IoChevronForward className="settings-chev" aria-hidden="true" />
            </button>
          </li>
          <li>
            <button className="row" onClick={() => setModal("withdraw")} disabled={!balance}>
              <span className="settings-icon"><IoArrowDown /></span>
              <span className="row-id"><strong>{t("wallet.withdraw")}</strong><span>{t("profile.withdrawSub")}</span></span>
              <IoChevronForward className="settings-chev" aria-hidden="true" />
            </button>
          </li>
          <li>
            <button className="row" onClick={() => setModal("activity")}>
              <span className="settings-icon"><IoTimeOutline /></span>
              <span className="row-id"><strong>{t("wallet.activity")}</strong><span>{t("profile.activitySub")}</span></span>
              <IoChevronForward className="settings-chev" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </section>

      <section className="section">
        <div className="section-title">
          <h2>{t("profile.appearance")}</h2>
        </div>
        <div className="settings-line">
          <span className="row-id"><strong>{t("profile.theme")}</strong><span>{t("profile.themeSub")}</span></span>
          <div className="segmented" role="group" aria-label={t("profile.theme")}>
            {themes.map((o) => (
              <button key={o.value} aria-pressed={pref === o.value} onClick={() => setPref(o.value)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-line" style={{ marginTop: 18 }}>
          <span className="row-id"><strong>{t("common.language")}</strong><span>{t("profile.languageSub")}</span></span>
          <select className="select" aria-label={t("common.language")} value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            {LANGS.map((l) => (
              <option key={l} value={l} lang={l}>
                {LANG_NAMES[l]}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="section">
        <div className="settings-line">
          <span className="row-id">
            <strong>{t("nav.logout")}</strong>
            <span>{MOCK_MODE ? t("profile.logoutDemo") : t("profile.logoutReal")}</span>
          </span>
          <Button variant="danger" onClick={logout}>
            {t("nav.logout")}
          </Button>
        </div>
      </section>
    </div>
  );
}
