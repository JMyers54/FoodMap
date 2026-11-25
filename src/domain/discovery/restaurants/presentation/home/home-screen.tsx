"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
            className="h-5 w-5 shrink-0 text-[#3b2a1c]/65"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.6-3.6" />
        </svg>
    );
}

function OptionsIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5 shrink-0 text-[#3b2a1c]/80"
            aria-hidden="true"
        >
            <path strokeLinecap="round" d="M4 7h10m4 0h2M4 17h2m4 0h10" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="h-5 w-5 shrink-0"
            aria-hidden="true"
        >
            <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
        </svg>
    );
}

function chipClass(active: boolean) {
    return `shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
            ? "border-[#b45309] bg-[#b45309] text-[#fff7e8]"
            : "border-[#b45309]/35 bg-transparent text-[#3b2a1c]/80"
    }`;
}

export function HomeScreen() {
    const { status, position, queryPosition, messageKey, requestLocation } = useGeolocation();
    const { locale, m } = useI18n();

    const [types, setTypes] = useState<RestaurantType[]>([]);
    const [cuisines, setCuisines] = useState<string[]>([]);
    const [mode, setMode] = useState<RouteMode>("walk");
    const [routeTarget, setRouteTarget] = useState<NearbyRestaurant | null>(null);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [optionsOpen, setOptionsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<"account" | "ranking" | null>(null);
    const topRef = useRef<HTMLDivElement>(null);
    const optionsRef = useRef<HTMLElement>(null);
    const optionsTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!filtersOpen && !optionsOpen) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                !topRef.current?.contains(target) &&
                !optionsRef.current?.contains(target)
            ) {
                setFiltersOpen(false);
                if (optionsOpen) {
                    setOptionsOpen(false);
                    optionsTriggerRef.current?.focus();
                }
            }
        };

        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [filtersOpen, optionsOpen]);

    // El panel de opciones se comporta como un diálogo: el foco nunca sale de él.
    useEffect(() => {
        if (!optionsOpen) return;

        const panel = optionsRef.current;
        if (!panel) return;

        const focusables = () =>
            Array.from(
                panel.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            );

        focusables()[0]?.focus();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOptionsOpen(false);
                optionsTriggerRef.current?.focus();
                return;
            }
            if (event.key !== "Tab") return;

            const items = focusables();
            if (items.length === 0) return;

            const firstItem = items[0];
            const lastItem = items[items.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === firstItem) {
                event.preventDefault();
                lastItem.focus();
            } else if (!event.shiftKey && active === lastItem) {
                event.preventDefault();
                firstItem.focus();
            } else if (!active || !panel.contains(active)) {
                event.preventDefault();
                firstItem.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [optionsOpen]);

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

    const waitingForPermission = status === "idle" || status === "prompt";

    return (
        <main className="relative h-dvh overflow-hidden bg-[#f6e7cc] text-[#2b1a10]">
            <div className="absolute inset-0">
                <MapView restaurants={nearby.data ?? []} route={route.data ?? null} />
            </div>

            <div ref={topRef} className="absolute inset-x-4 top-4 z-20">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setFiltersOpen((open) => !open);
                            setOptionsOpen(false);
                            setSelectedOption(null);
                        }}
                        aria-expanded={filtersOpen}
                        aria-label={m.search.placeholder}
                        className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[#fbf1df]/95 px-4 text-left shadow-lg backdrop-blur"
                    >
                        <SearchIcon />
                        <span className="min-w-0 flex-1 truncate text-sm text-[#3b2a1c]/65">
                            {m.search.placeholder}
                        </span>
                    </button>
                    <button
                        ref={optionsTriggerRef}
                        type="button"
                        onClick={() => {
                            setOptionsOpen((open) => !open);
                            setFiltersOpen(false);
                            setSelectedOption(null);
                        }}
                        aria-expanded={optionsOpen}
                        aria-label={m.options.open}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b45309]/30 bg-[#b45309]/10 text-[#2b1a10] shadow-lg backdrop-blur-xl transition-colors hover:bg-[#b45309]/20 focus:outline-none focus:ring-2 focus:ring-[#b45309]/50"
                    >
                        <OptionsIcon />
                    </button>
                </div>

                {!filtersOpen && !optionsOpen && (
                    <section className="mt-3 rounded-2xl border border-[#b45309]/35 bg-[#b45309]/15 px-4 py-3 backdrop-blur">
                        <p className="text-xs leading-relaxed text-[#3b2a1c]/80">
                            {m.event.text}{" "}
                            <button type="button" className="font-semibold text-[#b45309] underline">
                                {m.event.link}
                            </button>
                        </p>
                    </section>
                )}

                {filtersOpen && (
                    <section
                        className="mt-2 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-[#b45309]/30 bg-[#f6e7cc]/95 px-4 py-3 shadow-xl backdrop-blur"
                        aria-label={m.filters.title}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#3b2a1c]/65">
                                {m.filters.title}
                            </h2>
                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-xs font-medium text-[#b45309]"
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
                                className="shrink-0 cursor-not-allowed rounded-full border border-[#b45309]/20 px-3 py-1.5 text-xs font-medium text-[#3b2a1c]/45 opacity-50"
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
                            <span className="shrink-0 text-[11px] text-[#3b2a1c]/65">
                                {m.filters.modeLabel}
                            </span>
                            <div className="flex gap-1 rounded-full bg-[#fbf1df] p-1">
                                {ROUTE_MODES.map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setMode(value)}
                                        aria-pressed={mode === value}
                                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                                            mode === value
                                                ? "bg-[#b45309] text-[#fff7e8]"
                                                : "text-[#3b2a1c]/80"
                                        }`}
                                    >
                                        {m.filters.modes[value]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

            </div>

            <section
                className="results-scroll absolute inset-x-0 bottom-0 z-20 max-h-[30dvh] overflow-y-auto overscroll-contain rounded-t-2xl bg-[#f6e7cc]/95 px-4 pb-6 pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur"
                aria-label={m.results.title}
            >
                {routeTarget && (
                    <div className="mb-3 rounded-2xl bg-[#f2dfbe] px-3 py-2 text-xs">
                        {route.isFetching && (
                            <p className="text-[#3b2a1c]/65">{m.filters.routeCalculating}</p>
                        )}
                        {route.isError && <p className="text-[#b91c1c]">{m.filters.routeError}</p>}
                        {route.data && (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[#3b2a1c]/80">
                                    {new Intl.NumberFormat(locale).format(route.data.distanceM)} m ·{" "}
                                    {Math.max(1, Math.round(route.data.durationS / 60))} min
                                </span>
                                <a href={geoUri} className="font-semibold text-[#b45309] underline">
                                    {m.filters.openInMaps}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setRouteTarget(null)}
                                    className="font-medium text-[#3b2a1c]/65 underline"
                                >
                                    {m.filters.hideRoute}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-[#f6e7cc]/95 py-1 backdrop-blur">
                    <h2 className="text-base font-semibold">{m.results.title}</h2>
                    <div className="flex items-center gap-3">
                        <button type="button" className="text-xs font-medium text-[#b45309]">
                            {m.results.viewAll}
                        </button>
                        <LanguageSwitcher />
                    </div>
                </div>

                {!position && (
                    <p className="mt-3 text-xs text-[#3b2a1c]/65">{m.results.hint}</p>
                )}

                {position && nearby.isPending && (
                    <p className="mt-3 text-xs text-[#3b2a1c]/65">{m.results.loading}</p>
                )}

                {position && nearby.isError && (
                    <p role="alert" className="mt-3 text-xs text-[#b91c1c]">
                        {m.results.error}
                    </p>
                )}

                {position && nearby.isSuccess && nearby.data.length === 0 && (
                    <p className="mt-3 text-xs text-[#3b2a1c]/65">{m.results.empty}</p>
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

            {optionsOpen && (
                <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="fixed inset-0 z-30 cursor-default bg-black/40 backdrop-blur-sm"
                    onClick={() => {
                        setOptionsOpen(false);
                        optionsTriggerRef.current?.focus();
                    }}
                />
            )}

            <section
                ref={optionsRef}
                role="dialog"
                aria-modal={optionsOpen}
                aria-label={m.options.title}
                aria-hidden={!optionsOpen}
                inert={!optionsOpen}
                className={`fixed inset-y-0 right-0 z-40 flex w-[70vw] flex-col border-l border-amber-900/20 bg-gradient-to-b from-[#f8ead0]/95 via-[#efd0a6]/95 to-[#e0ae78]/95 shadow-[-14px_0_36px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-transform duration-300 ease-out ${
                    optionsOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
                }`}
            >
                <div className="h-1 w-full shrink-0 bg-gradient-to-r from-amber-700 to-orange-500" />
                <div className="flex items-start justify-between gap-3 px-5 pb-4 pt-6">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/50">
                            FoodMap
                        </p>
                        <h2 className="mt-1 text-xl font-semibold text-black/85">
                            {m.options.title}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setOptionsOpen(false);
                            optionsTriggerRef.current?.focus();
                        }}
                        aria-label={m.options.close}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 bg-[#fbf1df]/40 text-black/70 transition-colors hover:bg-[#fbf1df] focus:outline-none focus:ring-2 focus:ring-black/30"
                    >
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 space-y-2 px-5">
                    <button
                        type="button"
                        onClick={() => setSelectedOption("account")}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#fbf1df]/35 px-4 py-4 text-left text-sm font-medium text-black/75 shadow-sm transition-colors hover:bg-[#f6e7cc] focus:outline-none focus:ring-2 focus:ring-black/30"
                    >
                        <span>{m.options.account}</span>
                        <span className="rounded-full border border-black/20 px-2 py-0.5 text-[10px] text-black/55">
                            {m.options.comingSoon}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedOption("ranking")}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#fbf1df]/35 px-4 py-4 text-left text-sm font-medium text-black/75 shadow-sm transition-colors hover:bg-[#f6e7cc] focus:outline-none focus:ring-2 focus:ring-black/30"
                    >
                        <span>{m.options.ranking}</span>
                        <span className="rounded-full border border-black/20 px-2 py-0.5 text-[10px] text-black/55">
                            {m.options.comingSoon}
                        </span>
                    </button>
                    {selectedOption && (
                        <p className="px-1 pt-2 text-xs text-black/60">{m.options.comingSoon}</p>
                    )}
                </div>
            </section>

            {status !== "granted" && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center bg-[#f6e7cc]/95 p-6"
                    role="alertdialog"
                    aria-modal="true"
                    aria-labelledby="location-title"
                >
                    <div className="w-full max-w-sm rounded-2xl bg-[#fbf1df] p-6 text-center shadow-2xl">
                        <p id="location-title" className="text-lg font-semibold">
                            {m.prompt.title}
                        </p>
                        <p className="mt-2 text-sm text-[#3b2a1c]/80">{m.prompt.description}</p>
                        {messageKey && (
                            <p role="alert" className="mt-3 text-xs text-[#b91c1c]">
                                {m.errors[messageKey]}
                            </p>
                        )}
                        {waitingForPermission ? (
                            <p className="mt-4 text-sm text-[#b45309]">{m.prompt.searching}</p>
                        ) : (
                            <button
                                type="button"
                                onClick={requestLocation}
                                className="mt-4 rounded-full bg-[#b45309] px-5 py-2 text-sm font-semibold text-[#fff7e8]"
                            >
                                {m.prompt.retry}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
