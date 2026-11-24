"use client";

import { useI18n } from "@/shared/i18n/provider/locale-provider";

import { useGeolocation } from "../provider/geolocation-context";

export function LocationPrompt() {
    const { status, messageKey, requestLocation } = useGeolocation();
    const { m } = useI18n();

    if (status === "granted") return null;

    return (
        <div className="absolute inset-x-4 top-4 z-10 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur">
            <p className="text-sm font-semibold text-neutral-900">{m.prompt.title}</p>
            <p className="mt-1 text-xs text-neutral-600">{m.prompt.description}</p>
            {messageKey && (
                <p className="mt-2 text-xs text-red-600">{m.errors[messageKey]}</p>
            )}
            <button
                type="button"
                onClick={requestLocation}
                disabled={status === "prompt"}
                className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
                {status === "prompt" ? m.prompt.searching : m.prompt.button}
            </button>
        </div>
    );
}
