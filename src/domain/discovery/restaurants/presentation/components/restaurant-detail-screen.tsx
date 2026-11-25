"use client";

import Link from "next/link";

import { trpc } from "@/app/trpc";
import { useI18n } from "@/shared/i18n/provider/locale-provider";

import { CATEGORY_KEYS } from "./category-key";
import { HowToGetThere } from "./how-to-get-there";

export function RestaurantDetailScreen({ id }: { id: string }) {
    const { m } = useI18n();
    const detail = trpc.restaurants.byId.useQuery({ id });

    if (detail.isPending) {
        return <main className="min-h-dvh bg-[#f6e7cc] p-6 text-sm text-[#3b2a1c]/65">{m.detail.loading}</main>;
    }
    if (detail.isError) {
        return (
            <main className="min-h-dvh bg-[#f6e7cc] p-6 text-sm text-[#b91c1c]" role="alert">
                {m.detail.error}
            </main>
        );
    }
    if (!detail.data) {
        return <main className="min-h-dvh bg-[#f6e7cc] p-6 text-sm text-[#3b2a1c]/65">{m.detail.notFound}</main>;
    }

    const restaurant = detail.data;
    const category = m.categories[CATEGORY_KEYS[restaurant.type] ?? "restaurant"];
    const cuisines = restaurant.cuisines.filter(Boolean).join(", ");
    const websiteHref = restaurant.website?.startsWith("http")
        ? restaurant.website
        : `https://${restaurant.website}`;
    const hasContact = Boolean(restaurant.address || restaurant.phone || restaurant.website);

    return (
        <main className="min-h-dvh bg-[#f6e7cc] px-4 pb-12 pt-5 text-[#2b1a10]">
            <Link href="/" className="text-xs font-medium text-[#b45309]">
                ← {m.detail.back}
            </Link>

            <p className="mt-5 text-[11px] uppercase tracking-wide text-[#3b2a1c]/65">
                {m.detail.title}
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight">{restaurant.name}</h1>
            <p className="mt-1 text-sm text-[#b45309]">{category}</p>
            {cuisines && <p className="mt-1 text-xs text-[#3b2a1c]/65">{cuisines}</p>}

            <section className="mt-5 rounded-2xl bg-[#f2dfbe] p-4 text-sm">
                {hasContact ? (
                    <dl className="space-y-3">
                        {restaurant.address && (
                            <div>
                                <dt className="text-[11px] uppercase tracking-wide text-[#3b2a1c]/65">
                                    {m.detail.address}
                                </dt>
                                <dd className="mt-0.5 text-[#3b2a1c]/80">{restaurant.address}</dd>
                            </div>
                        )}
                        {restaurant.phone && (
                            <div>
                                <dt className="text-[11px] uppercase tracking-wide text-[#3b2a1c]/65">
                                    {m.detail.phone}
                                </dt>
                                <dd className="mt-0.5">
                                    <a href={`tel:${restaurant.phone}`} className="text-[#b45309]">
                                        {restaurant.phone}
                                    </a>
                                </dd>
                            </div>
                        )}
                        {restaurant.website && websiteHref && (
                            <div>
                                <dt className="text-[11px] uppercase tracking-wide text-[#3b2a1c]/65">
                                    {m.detail.website}
                                </dt>
                                <dd className="mt-0.5">
                                    <a
                                        href={websiteHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="break-all text-[#b45309] underline"
                                    >
                                        {restaurant.website}
                                    </a>
                                </dd>
                            </div>
                        )}
                    </dl>
                ) : (
                    <p className="text-xs text-[#3b2a1c]/65">{m.detail.noContact}</p>
                )}
            </section>

            <section className="mt-3 rounded-2xl bg-[#f2dfbe] p-4 text-sm">
                <p className="text-[11px] uppercase tracking-wide text-[#3b2a1c]/65">
                    {m.detail.hours}
                </p>
                <p className="mt-1 text-[#3b2a1c]/80">
                    {restaurant.hasHours ? m.detail.hoursAvailable : m.detail.hoursUnavailable}
                </p>
            </section>

            <HowToGetThere name={restaurant.name} lat={restaurant.lat} lng={restaurant.lng} />
        </main>
    );
}
