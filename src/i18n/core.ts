import { en, type Key } from "./en";
import { ro } from "./ro";
import { de } from "./de";
import { fr } from "./fr";
import { es } from "./es";
import { it } from "./it";

export type Lang = "en" | "ro" | "de" | "fr" | "es" | "it";
export const LANGS: Lang[] = ["en", "ro", "de", "fr", "es", "it"];
export const LOCALES: Record<Lang, string> = { en: "en-US", ro: "ro-RO", de: "de-DE", fr: "fr-FR", es: "es-ES", it: "it-IT" };
/** Each language named in itself, the convention language pickers follow. */
export const LANG_NAMES: Record<Lang, string> = { en: "English", ro: "Română", de: "Deutsch", fr: "Français", es: "Español", it: "Italiano" };
const STORAGE_KEY = "wg-lang";

const dictionaries: Record<Lang, Record<Key, string>> = { en, ro, de, fr, es, it };

function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as string[]).includes(v);
}

let current: Lang = detect();

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  const browser = typeof navigator !== "undefined" ? navigator.language.slice(0, 2).toLowerCase() : "en";
  return isLang(browser) ? browser : "en";
}

export function getLang(): Lang {
  return current;
}

export function getLocale(): string {
  return LOCALES[current];
}

/** Sets the language for non-React code (formatters, HTTP errors). The provider calls this. */
export function setLangGlobal(lang: Lang) {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = lang;
}

export type Vars = Record<string, string | number>;

/** Looks up `key` in the active language and fills `{placeholders}`. Falls back to English. */
export function translate(key: Key, vars?: Vars, lang: Lang = current): string {
  const text = dictionaries[lang][key] ?? en[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name: string) => (name in vars ? String(vars[name]) : `{${name}}`));
}

export type { Key };
