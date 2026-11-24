"use client";

import { createContext, useContext } from "react";

export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "unavailable";

export type GeoPosition = {
    lat: number;
    lng: number;
};

export type GeoMessageKey = "denied" | "unavailable" | "unsupported";

export type GeolocationContextValue = {
    status: GeoStatus;
    position: GeoPosition | null;
    messageKey: GeoMessageKey | null;
    requestLocation: () => void;
};

export const GeolocationContext = createContext<GeolocationContextValue | null>(null);

export function useGeolocation() {
    const value = useContext(GeolocationContext);
    if (!value) {
        throw new Error("useGeolocation debe usarse dentro de <GeolocationProvider>");
    }
    return value;
}
