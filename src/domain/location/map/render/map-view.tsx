"use client";

import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import { useEffect, useRef } from "react";

import { useGeolocation, type GeoPosition } from "@domain/location/gps/provider/geolocation-context";

import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CONFIG } from "../config/map";

export function MapView() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const positionRef = useRef<GeoPosition | null>(null);
    const { position } = useGeolocation();

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const maplibregl = await import("maplibre-gl");

            if (cancelled || !containerRef.current) return;

            maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

            const instance = new maplibregl.Map({
                container: containerRef.current,
                style: MAP_CONFIG.styleUrl,
                center: MAP_CONFIG.center,
                zoom: MAP_CONFIG.zoom,
                attributionControl: { compact: true },
            });

            instance.addControl(new maplibregl.NavigationControl(), "top-right");

            mapRef.current = instance;

            const initial = positionRef.current;
            if (initial) {
                instance.easeTo({
                    center: [initial.lng, initial.lat],
                    zoom: 15,
                    duration: 0,
                });
            }
        })();

        return () => {
            cancelled = true;
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    useEffect(() => {
        positionRef.current = position;
        const map = mapRef.current;
        if (!position || !map) return;

        map.easeTo({
            center: [position.lng, position.lat],
            zoom: 15,
            duration: 1200,
        });

        let cancelled = false;
        let marker: MapLibreMarker | undefined;

        void (async () => {
            const maplibregl = await import("maplibre-gl");
            if (cancelled) return;
            marker = new maplibregl.Marker()
                .setLngLat([position.lng, position.lat])
                .addTo(map);
        })();

        return () => {
            cancelled = true;
            marker?.remove();
        };
    }, [position]);

    return <div ref={containerRef} className="h-full w-full" />;
}
