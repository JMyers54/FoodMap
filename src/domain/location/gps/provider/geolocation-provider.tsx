"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import {
    GeolocationContext,
    type GeoMessageKey,
    type GeoStatus,
} from "./geolocation-context";

export function GeolocationProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<GeoStatus>("idle");
    const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [messageKey, setMessageKey] = useState<GeoMessageKey | null>(null);

    const requestLocation = useCallback(() => {
        if (status === "prompt" || status === "granted") return;

        if (!("geolocation" in navigator)) {
            setStatus("unavailable");
            setMessageKey("unsupported");
            return;
        }

        setStatus("prompt");
        setMessageKey(null);

        navigator.geolocation.getCurrentPosition(
            (coords) => {
                setPosition({ lat: coords.coords.latitude, lng: coords.coords.longitude });
                setStatus("granted");
            },
            (error) => {
                const denied = error.code === 1;
                setStatus(denied ? "denied" : "unavailable");
                setMessageKey(denied ? "denied" : "unavailable");
            },
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
        );
    }, [status]);

    const value = useMemo(
        () => ({ status, position, messageKey, requestLocation }),
        [status, position, messageKey, requestLocation],
    );

    return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>;
}
