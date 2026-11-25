"use client";

import { useMemo, useState } from "react";

import { LanguageSwitcher } from "@/shared/i18n/presentation/language-switcher";
import type { Messages } from "@/shared/i18n/messages/es";
import { useI18n } from "@/shared/i18n/provider/locale-provider";
import { trpc } from "@/app/trpc";

import { useGeolocation } from "@domain/location/gps/provider/geolocation-context";
import { MapView } from "@domain/location/map/render/map-view";
import { ROUTE_MODES, type RouteMode } from "@domain/navigation/routes/schema";

import { RestaurantCard } from "../components/restaurant-card";

type NearbyRestaurant = {
    id: string;
    name: string;
    type: string;
    cuisines: string[];
    lat: number;
    lng: number;
    distanceM: number;
};

type RestaurantType = "restaurant" | "cafe" | "fast_food" | "bar";

const FILTER_TYPES: { value: RestaurantType; key: keyof Messages["categories"] }[] = [
    { value: "restaurant", key: "restaurant" },
    { value: "cafe", key: "cafe" },
    { value: "fast_food", key: "fastFood" },
    { value: "bar", key: "bar" },
];

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

function chipClass(active: boolean) {
    return `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
            ? "border-[#93af96] bg-[#93af96] text-[#1b1f22]"
            : "border-[#93af96]/40 bg-transparent text-[#d8e6da]"
    }`;
}

export function HomeScreen() {
    const { status, position, queryPosition, messageKey, requestLocation } = useGeolocation();
    const { locale, m } = useI18n();

    const [types, setTypes] = useState<RestaurantType[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [mode, setMode] = useState<RouteMode>("walk");
    const [routeTarget, setRouteTarget] = useState<NearbyRestaurant | null>(null);

    const base = trpc.restaurants.nearby.useQuery(
        {
            lat: queryPosition?.lat ?? 0,
            lng: queryPosition?.lng ?? 0,
            radiusM: 300,
            limit: 50,
        },
        { enabled: queryPosition !== null },
    );

    const nearby = trpc.restaurants.nearby.useQuery(
        {
            lat: queryPosition?.lat ?? 0,
            lng: queryPosition?.lng ?? 0,
            radiusM: 300,
            limit: 10,
            types: types.length > 0 ? types : undefined,
            cuisines: cuisines.length > 0 ? cuisines : undefined,
        },
        { enabled: queryPosition !== null },
    );

    const availableCuisines = useMemo(
        () =>
            Array.from(
                new Set(
                    (base.data ?? []).flatMap((restaurant) =>
                        restaurant.cuisines.filter(Boolean),
                    ),
                ),
            )
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 10),
        [base.data],
    );

    const route = trpc.routes.route.useQuery(
        {
            from: {
                lat: queryPosition?.lat ?? 0,
                lng: queryPosition?.lng ?? 0,
            },
            to: {
                lat: routeTarget?.lat ?? 0,
                lng: routeTarget?.lng ?? 0,
            },
            mode,
        },
        { enabled: queryPosition !== null && routeTarget !== null, retry: 1 },
    );

    const hasFilters = types.length > 0 || cuisines.length > 0;
    function toggle<T extends string>(value: T, list: T[], set: (next: T[]) => void) {
        set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    }
    const clearFilters = () => {
        setTypes([]);
        setCuisines([]);
    };
    const handleHowToGetThere = (restaurant: NearbyRestaurant) =>
        setRouteTarget((current) => (current?.id === restaurant.id ? null : restaurant));
    const geoUri = routeTarget
        ? `geo:${routeTarget.lat},${routeTarget.lng}?q=${routeTarget.lat},${routeTarget.lng}(${encodeURIComponent(routeTarget.name)})`
        : "";

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
                        disabled={status === "prompt"}
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

            <section className="mt-4 px-4" aria-label={m.filters.title}>
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {m.filters.title}
                    </h2>
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-medium text-[#b8d4bb]"
                        >
                            {m.filters.all}
                        </button>
                    )}
                </div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    <button
                        type="button"
                        onClick={clearFilters}
                        aria-pressed={!hasFilters}
                        className={chipClass(!hasFilters)}
                    >
                        {m.filters.all}
                    </button>
                    {FILTER_TYPES.map(({ value, key }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => toggle(value, types, setTypes)}
                            aria-pressed={types.includes(value)}
                            className={chipClass(types.includes(value))}
                        >
                            {m.categories[key]}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled
                        title={m.filters.hoursUnavailable}
                        aria-label={`${m.filters.openNow} · ${m.filters.hoursUnavailable}`}
                        className="shrink-0 cursor-not-allowed rounded-full border border-[#93af96]/20 px-3 py-1.5 text-xs font-medium text-neutral-500 opacity-50"
                    >
                        {m.filters.openNow}
                    </button>
                </div>

                {availableCuisines.length > 0 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {availableCuisines.map((cuisine) => (
                            <button
                                key={cuisine}
                                type="button"
                                onClick={() => toggle(cuisine, cuisines, setCuisines)}
                                aria-pressed={cuisines.includes(cuisine)}
                                className={chipClass(cuisines.includes(cuisine))}
                            >
                                {cuisine}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                    <span className="shrink-0 text-[11px] text-neutral-400">
                        {m.filters.modeLabel}
                    </span>
                    <div className="flex gap-1 rounded-full bg-[#2a3033] p-1">
                        {ROUTE_MODES.map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setMode(value)}
                                aria-pressed={mode === value}
                                className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                                    mode === value
                                        ? "bg-[#93af96] text-[#1b1f22]"
                                        : "text-[#d8e6da]"
                                }`}
                            >
                                {m.filters.modes[value]}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-4 mt-4 h-[320px] overflow-hidden rounded-2xl">
                <MapView restaurants={nearby.data ?? []} route={route.data ?? null} />
            </section>

            {routeTarget && (
                <section className="mx-4 mt-3 rounded-2xl bg-[#24292c] px-4 py-3 text-xs">
                    {route.isFetching && (
                        <p className="text-neutral-400">{m.filters.routeCalculating}</p>
                    )}
                    {route.isError && <p className="text-red-400">{m.filters.routeError}</p>}
                    {route.data && (
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-[#d8e6da]">
                                {new Intl.NumberFormat(locale).format(route.data.distanceM)} m ·{" "}
                                {Math.max(1, Math.round(route.data.durationS / 60))} min
                            </span>
                            <a
                                href={geoUri}
                                className="font-semibold text-[#b8d4bb] underline"
                            >
                                {m.filters.openInMaps}
                            </a>
                            <button
                                type="button"
                                onClick={() => setRouteTarget(null)}
                                className="font-medium text-neutral-400 underline"
                            >
                                {m.filters.hideRoute}
                            </button>
                        </div>
                    )}
                </section>
            )}

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
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onHowToGetThere={handleHowToGetThere}
                                routeActive={routeTarget?.id === restaurant.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            <LanguageSwitcher />
        </main>
    );
}
