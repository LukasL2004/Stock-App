import { useCallback, useMemo, useState, type ReactNode } from "react";
import { getLang, setLangGlobal, translate, type Key, type Lang, type Vars } from "./core";
import { I18nContext } from "./useI18n";

/** Holds the active language; every component that calls `t` re-renders when it changes. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const l = getLang();
    document.documentElement.lang = l;
    return l;
  });

  const setLang = useCallback((l: Lang) => {
    setLangGlobal(l);
    setLangState(l);
  }, []);

  const t = useCallback((key: Key, vars?: Vars) => translate(key, vars, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
