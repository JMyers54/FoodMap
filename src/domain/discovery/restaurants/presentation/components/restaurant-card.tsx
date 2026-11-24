"use client";

import type { NearbyRestaurant } from "@domain/discovery/restaurants/business/nearby-restaurants";
import type { Messages } from "@/shared/i18n/messages/es";
import { useI18n } from "@/shared/i18n/provider/locale-provider";

type RestaurantCardProps = {
    restaurant: NearbyRestaurant;
};

const TONES: Record<string, { from: string; to: string }> = {
    restaurant: { from: "#d9b382", to: "#8c5a2b" },
    cafe: { from: "#c9a98b", to: "#6b4a32" },
    fast_food: { from: "#e0c27c", to: "#a7682e" },
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
    const { locale, m } = useI18n();
    const distance = new Intl.NumberFormat(locale).format(restaurant.distanceM);
    const category =
        m.categories[restaurant.type as keyof Messages["categories"]] ?? restaurant.type;
    const tone = TONES[restaurant.type] ?? TONES.restaurant;

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
            <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">
                    {restaurant.name}
                </h3>
                <p className="mt-1 truncate text-xs text-neutral-400">
                    {category} · {distance} m
                </p>
            </div>
        </article>
    );
}
