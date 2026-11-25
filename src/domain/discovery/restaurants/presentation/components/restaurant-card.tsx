"use client";

import Link from "next/link";

import type { NearbyRestaurant } from "@domain/discovery/restaurants/business/nearby-restaurants";
import { useI18n } from "@/shared/i18n/provider/locale-provider";

import { CATEGORY_KEYS } from "./category-key";

type RestaurantCardProps = {
    restaurant: NearbyRestaurant;
    onHowToGetThere?: (restaurant: NearbyRestaurant) => void;
    routeActive?: boolean;
};

const TONES: Record<string, { from: string; to: string }> = {
    restaurant: { from: "#d9b382", to: "#8c5a2b" },
    cafe: { from: "#c9a98b", to: "#6b4a32" },
    fast_food: { from: "#e0c27c", to: "#a7682e" },
    bar: { from: "#9d86c4", to: "#5f4a86" },
};

export function RestaurantCard({
    restaurant,
    onHowToGetThere,
    routeActive = false,
}: RestaurantCardProps) {
    const { locale, m } = useI18n();
    const distance = new Intl.NumberFormat(locale).format(restaurant.distanceM);
    const categoryKey = CATEGORY_KEYS[restaurant.type] ?? "restaurant";
    const category = m.categories[categoryKey];
    const tone = TONES[restaurant.type] ?? TONES.restaurant;
    const cuisines = restaurant.cuisines.filter(Boolean).join(", ");

    return (
        <article className="flex items-center gap-3 rounded-2xl bg-[#24292c] p-3">
            <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-xl font-bold text-white/80"
                style={{
                    backgroundImage: `linear-gradient(135deg, ${tone.from}, ${tone.to})`,
                }}
                aria-hidden="true"
            >
                {restaurant.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
                <Link
                    href={`/restaurant/${restaurant.id}`}
                    className="truncate text-sm font-semibold text-white underline decoration-transparent hover:decoration-current"
                >
                    {restaurant.name}
                </Link>
                <p className="mt-1 truncate text-xs text-neutral-400">
                    {category} · {distance} m
                </p>
                {cuisines && (
                    <p className="mt-0.5 truncate text-[11px] text-[#b8d4bb]">{cuisines}</p>
                )}
            </div>
            {onHowToGetThere && (
                <button
                    type="button"
                    onClick={() => onHowToGetThere(restaurant)}
                    aria-pressed={routeActive}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        routeActive
                            ? "bg-[#b8d4bb] text-[#1b1f22]"
                            : "bg-[#93af96]/20 text-[#b8d4bb] hover:bg-[#93af96]/30"
                    }`}
                >
                    {m.filters.howToGetThere}
                </button>
            )}
        </article>
    );
}
