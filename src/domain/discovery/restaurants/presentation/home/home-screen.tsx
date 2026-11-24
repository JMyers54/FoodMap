"use client";

import { LanguageSwitcher } from "@/shared/i18n/presentation/language-switcher";
import { useI18n } from "@/shared/i18n/provider/locale-provider";
import { trpc } from "@/app/trpc";

import { useGeolocation } from "@domain/location/gps/provider/geolocation-context";
import { MapView } from "@domain/location/map/render/map-view";

import { RestaurantCard } from "../components/restaurant-card";

function SearchIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5 shrink-0 text-neutral-400"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.6-3.6" />
        </svg>
    );
}

function LocationIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-4 w-4"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="8" />
            <path strokeLinecap="round" d="M12 2v2m0 16v2M2 12h2m16 0h2" />
        </svg>
    );
}

export function HomeScreen() {
    const { status, position, messageKey, requestLocation } = useGeolocation();
    const { m } = useI18n();

    const nearby = trpc.restaurants.nearby.useQuery(
        {
            lat: position?.lat ?? 0,
            lng: position?.lng ?? 0,
            radiusM: 3000,
            limit: 10,
        },
        { enabled: position !== null },
    );

    return (
        <main className="relative min-h-dvh bg-[#1b1f22] pb-24 text-white">
            <section className="px-4 pt-4">
                <div className="flex items-center gap-3 rounded-2xl bg-[#2a3033] px-4 py-3">
                    <SearchIcon />
                    <input
                        type="search"
                        readOnly
                        aria-label={m.search.placeholder}
                        placeholder={m.search.placeholder}
                        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-400"
                    />
                    <button
                        type="button"
                        onClick={requestLocation}
                        disabled={status === "prompt" || status === "granted"}
                        aria-label={m.prompt.button}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#93af96] text-[#1b1f22] disabled:opacity-70 ${
                            status === "prompt" ? "animate-pulse" : ""
                        }`}
                    >
                        <LocationIcon />
                    </button>
                </div>
                {messageKey && (
                    <p role="alert" className="mt-2 text-xs text-red-400">
                        {m.errors[messageKey]}
                    </p>
                )}
            </section>

            <section className="mx-4 mt-4 rounded-2xl border border-[#93af96]/40 bg-[#93af96]/15 px-4 py-3">
                <p className="text-xs leading-relaxed text-[#d8e6da]">
                    {m.event.text}{" "}
                    <button type="button" className="font-semibold text-[#b8d4bb] underline">
                        {m.event.link}
                    </button>
                </p>
            </section>

            <section className="mx-4 mt-4 h-[320px] overflow-hidden rounded-2xl">
                <MapView />
            </section>

            <section className="mt-6 px-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold">{m.results.title}</h2>
                    <button type="button" className="text-xs font-medium text-[#b8d4bb]">
                        {m.results.viewAll}
                    </button>
                </div>

                {!position && (
                    <p className="mt-3 text-xs text-neutral-400">{m.results.hint}</p>
                )}

                {position && nearby.isPending && (
                    <p className="mt-3 text-xs text-neutral-400">{m.results.loading}</p>
                )}

                {position && nearby.isError && (
                    <p role="alert" className="mt-3 text-xs text-red-400">
                        {m.results.error}
                    </p>
                )}

                {position && nearby.isSuccess && nearby.data.length === 0 && (
                    <p className="mt-3 text-xs text-neutral-400">{m.results.empty}</p>
                )}

                {position && nearby.isSuccess && nearby.data.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {nearby.data.map((restaurant) => (
                            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                        ))}
                    </div>
                )}
            </section>

            <LanguageSwitcher />
        </main>
    );
}
