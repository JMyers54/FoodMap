"use client";

import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "../model/locale";
import { useI18n } from "../provider/locale-provider";

export function LanguageSwitcher() {
    const { locale, setLocale, m } = useI18n();

    return (
        <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
            <select
                aria-label={m.language.label}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                className="bg-transparent text-xs text-neutral-800 outline-none"
            >
                {SUPPORTED_LOCALES.map((code) => (
                    <option key={code} value={code}>
                        {LOCALE_LABELS[code]}
                    </option>
                ))}
            </select>
        </div>
    );
}
