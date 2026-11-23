import { useEffect, useRef, useState } from "react";
import { IoCheckmark, IoChevronDown, IoLanguageOutline } from "react-icons/io5";
import { LANGS, LANG_NAMES, type Lang } from "../../i18n/core";
import { useI18n } from "../../i18n/useI18n";

/** Dropdown language picker: globe + current code, menu with each language named in itself. */
export default function LanguageMenu() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (l: Lang) => {
    setLang(l);
    setOpen(false);
  };

  return (
    <div className="lang-menu" ref={ref}>
      <button className="lang-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} aria-label={`${t("nav.switchLang")}: ${LANG_NAMES[lang]}`}>
        <IoLanguageOutline aria-hidden="true" />
        <span>{lang.toUpperCase()}</span>
        <IoChevronDown aria-hidden="true" className="lang-chev" />
      </button>
      {open && (
        <ul className="menu lang-list" role="menu" aria-label={t("common.language")}>
          {LANGS.map((l) => (
            <li key={l}>
              <button role="menuitemradio" aria-checked={lang === l} className={`menu-item${lang === l ? " is-on" : ""}`} onClick={() => pick(l)} lang={l}>
                <span className="lang-code">{l.toUpperCase()}</span>
                {LANG_NAMES[l]}
                {lang === l && <IoCheckmark aria-hidden="true" className="lang-check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
