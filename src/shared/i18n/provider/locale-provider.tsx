"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { Messages } from "../messages/es";
import {
    DEFAULT_LOCALE,
    detectLocale,
    messages,
    readStoredLocale,
    storeLocale,
    type Locale,
} from "../model/locale";

type LocaleContextValue = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    m: Messages;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        const initial = readStoredLocale() ?? detectLocale();
        setLocaleState(initial);
    }, []);

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        storeLocale(next);
    }, []);

    const value = useMemo(
        () => ({ locale, setLocale, m: messages[locale] }),
        [locale, setLocale],
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
    const value = useContext(LocaleContext);
    if (!value) {
        throw new Error("useI18n debe usarse dentro de <LocaleProvider>");
    }
    return value;
}
