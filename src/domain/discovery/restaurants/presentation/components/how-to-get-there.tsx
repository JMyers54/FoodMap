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
        <div className="mt-4 rounded-2xl bg-[#24292c] p-4">
            <p className="text-sm font-semibold text-white">{m.filters.howToGetThere}</p>
            <div className="mt-2 flex flex-wrap gap-2">
                <a
                    href={geoUri}
                    className="rounded-full bg-[#93af96] px-4 py-2 text-xs font-semibold text-[#1b1f22]"
                >
                    {m.filters.openInMaps}
                </a>
                <a
                    href={webUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[#93af96]/40 px-4 py-2 text-xs font-medium text-[#b8d4bb]"
                >
                    OpenStreetMap
                </a>
            </div>
        </div>
    );
}
