import { en } from "../messages/en";
import { es, type Messages } from "../messages/es";
import { ptBR } from "../messages/pt-BR";

export type Locale = "es" | "en" | "pt-BR";

export const DEFAULT_LOCALE: Locale = "es";
export const SUPPORTED_LOCALES: readonly Locale[] = ["es", "en", "pt-BR"];

export const messages: Record<Locale, Messages> = {
    es,
    en,
    "pt-BR": ptBR,
};

export const LOCALE_LABELS: Record<Locale, string> = {
    es: "Español",
    en: "English",
    "pt-BR": "Português (Brasil)",
};

const STORAGE_KEY = "foodmap.locale";

export function isLocale(value: string | null | undefined): value is Locale {
    return value != null && SUPPORTED_LOCALES.includes(value as Locale);
}

export function readStoredLocale(): Locale | null {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
}

export function detectLocale(): Locale {
    if (typeof navigator === "undefined") return DEFAULT_LOCALE;
    const browser = navigator.language.toLowerCase();
    if (browser.startsWith("pt")) return "pt-BR";
    if (browser.startsWith("en")) return "en";
    return DEFAULT_LOCALE;
}

export function storeLocale(locale: Locale): void {
    window.localStorage.setItem(STORAGE_KEY, locale);
}
