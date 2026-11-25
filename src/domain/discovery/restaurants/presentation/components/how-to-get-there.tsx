"use client";

import { useI18n } from "@/shared/i18n/provider/locale-provider";

type HowToGetThereProps = {
    name: string;
    lat: number;
    lng: number;
};

export function HowToGetThere({ name, lat, lng }: HowToGetThereProps) {
    const { m } = useI18n();
    const geoUri = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(name)})`;
    const webUri = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`;

    return (
        <div className="mt-4 rounded-2xl bg-[#f2dfbe] p-4">
            <p className="text-sm font-semibold text-[#2b1a10]">{m.filters.howToGetThere}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                <a
                    href={geoUri}
                    className="rounded-full bg-[#b45309] px-4 py-2 text-xs font-semibold text-[#fff7e8]"
                >
                    {m.filters.openInMaps}
                </a>
                <a
                    href={webUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[#b45309]/35 px-4 py-2 text-xs font-medium text-[#b45309]"
                >
                    OpenStreetMap
                </a>
            </div>
        </div>
    );
}
