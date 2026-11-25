"use client";

import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "../model/locale";
import { useI18n } from "../provider/locale-provider";

export function LanguageSwitcher() {
    const { locale, setLocale, m } = useI18n();

    return (
        <div className="rounded-lg bg-[#fbf1df]/95 px-3 py-2 shadow-sm backdrop-blur">
            <select
                aria-label={m.language.label}
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                className="bg-transparent text-xs text-[#2b1a10]/85 outline-none"
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
