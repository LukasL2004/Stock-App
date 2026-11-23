import { createContext, useContext } from "react";
import type { Key, Lang, Vars } from "./core";

export interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Vars) => string;
}

export const I18nContext = createContext<I18nCtx | null>(null);

export function useI18n(): I18nCtx {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}
