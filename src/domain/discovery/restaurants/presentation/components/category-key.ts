import type { Messages } from "@/shared/i18n/messages/es";

export const CATEGORY_KEYS: Record<string, keyof Messages["categories"]> = {
    restaurant: "restaurant",
    cafe: "cafe",
    fast_food: "fastFood",
    bar: "bar",
};
