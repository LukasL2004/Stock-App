import "./Navbar.css";
import { NavLink, useLocation, useNavigate, useSearchParams } from "react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { IoClose, IoMenu, IoMoonOutline, IoSunnyOutline, IoLogOutOutline, IoPersonOutline, IoSearch } from "react-icons/io5";
import { clearSession } from "../../lib/auth";
import { useTheme } from "../../lib/useTheme";
import Avatar from "../UI/Avatar";
import Logo from "../UI/Logo";
import authService from "../../Services/UserService";
import type { User } from "../../Services/Interfaces/UserInterface";
import { useI18n } from "../../i18n/useI18n";
import LanguageMenu from "../UI/LanguageMenu";

const LINKS = [
  { to: "/dashboard", key: "nav.dashboard" },
  { to: "/portfolio", key: "nav.portfolio" },
] as const;

export default function Navbar() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { resolved, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.getUser().then(setUser).catch(() => {});
  }, []);

  // "/" focuses search, like most desktop apps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(t?.tagName ?? "")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!userOpen) return;
    const onDoc = (e: MouseEvent) => !userRef.current?.contains(e.target as Node) && setUserOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setUserOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [userOpen]);

  const onDashboard = location.pathname.toLowerCase() === "/dashboard";

  const onQuery = (v: string) => {
    setQuery(v);
    if (onDashboard) {
      const next = new URLSearchParams(params);
      if (v) next.set("q", v);
      else next.delete("q");
      setParams(next, { replace: true });
    }
  };

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/dashboard?q=${encodeURIComponent(query)}&go=1`);
  };

  const logout = () => {
    clearSession();
    navigate("/Login", { replace: true });
  };

  const ThemeIcon = resolved === "dark" ? IoSunnyOutline : IoMoonOutline;

  return (
    <header className="nav">
      <a className="skip-link" href="#main">
        {t("nav.skip")}
      </a>
      <div className="nav-inner">
        <NavLink to="/dashboard" className="brand" aria-label={t("common.appName")}>
          <Logo />
        </NavLink>

        <form className="nav-search" role="search" onSubmit={submitSearch}>
          <IoSearch aria-hidden="true" />
          <input
            ref={searchRef}
            type="search"
            placeholder={t("nav.search")}
            aria-label={t("nav.search")}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            autoComplete="off"
          />
          <kbd aria-hidden="true">/</kbd>
        </form>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              {t(l.key)}
            </NavLink>
          ))}
        </nav>

        <div className="nav-right">
          <LanguageMenu />
          <button className="btn btn-ghost btn-icon" onClick={toggle} aria-label={resolved === "dark" ? t("nav.toLight") : t("nav.toDark")}>
            <ThemeIcon />
          </button>
          <div className="user-menu" ref={userRef}>
            <button className="user-btn" onClick={() => setUserOpen((o) => !o)} aria-haspopup="menu" aria-expanded={userOpen} aria-label={t("nav.account")}>
              <Avatar first={user?.firstName} last={user?.lastName} />
            </button>
            {userOpen && (
              <div className="menu" role="menu">
                <div className="menu-head">
                  <strong>
                    {user?.firstName} {user?.lastName}
                  </strong>
                  <span>{user?.email}</span>
                </div>
                <button role="menuitem" className="menu-item" onClick={() => { setUserOpen(false); navigate("/profile"); }}>
                  <IoPersonOutline /> {t("nav.profile")}
                </button>
                <button role="menuitem" className="menu-item menu-danger" onClick={logout}>
                  <IoLogOutOutline /> {t("nav.logout")}
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-ghost btn-icon nav-burger" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-nav" aria-label={t("nav.menu")}>
            {menuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" className="mobile-nav" aria-label="Primary mobile">
          {[...LINKS, { to: "/profile", key: "nav.profile" } as const].map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `mobile-link${isActive ? " active" : ""}`} onClick={() => setMenuOpen(false)}>
              {t(l.key)}
            </NavLink>
          ))}
          <button className="mobile-link menu-danger" onClick={logout}>
            {t("nav.logout")}
          </button>
        </nav>
      )}
    </header>
  );
}
