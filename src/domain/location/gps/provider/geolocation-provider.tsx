"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { distanceMeters, watchUserPosition } from "../service/watch-user-position";
import {
    GeolocationContext,
    type GeoMessageKey,
    type GeoPosition,
    type GeoStatus,
} from "./geolocation-context";

export function GeolocationProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<GeoStatus>("idle");
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [queryPosition, setQueryPosition] = useState<GeoPosition | null>(null);
    const [messageKey, setMessageKey] = useState<GeoMessageKey | null>(null);
    const stopWatchingRef = useRef<(() => void) | null>(null);
    const queryPositionRef = useRef<GeoPosition | null>(null);

    const requestLocation = useCallback(() => {
        if (status === "prompt") return;

        if (!("geolocation" in navigator)) {
            setStatus("unavailable");
            setMessageKey("unsupported");
            return;
        }

        stopWatchingRef.current?.();

        setStatus("prompt");
        setMessageKey(null);

        stopWatchingRef.current = watchUserPosition({
            minDistanceM: 0,
            minIntervalMs: 0,
            onPosition: (next) => {
                setPosition(next);
                setStatus("granted");
                setMessageKey(null);

                const last = queryPositionRef.current;
                if (!last || distanceMeters(last, next) >= 50) {
                    queryPositionRef.current = next;
                    setQueryPosition(next);
                }
            },
            onError: (code) => {
                const denied = code === 1;
                setStatus(denied ? "denied" : "unavailable");
                setMessageKey(denied ? "denied" : "unavailable");
                if (denied) {
                    stopWatchingRef.current?.();
                    stopWatchingRef.current = null;
                }
            },
        });
    }, [status]);

    useEffect(
        () => () => {
            stopWatchingRef.current?.();
            stopWatchingRef.current = null;
        },
        [],
    );

    const value = useMemo(
        () => ({ status, position, queryPosition, messageKey, requestLocation }),
        [status, position, queryPosition, messageKey, requestLocation],
    );

    return <GeolocationContext.Provider value={value}>{children}</GeolocationContext.Provider>;
}
