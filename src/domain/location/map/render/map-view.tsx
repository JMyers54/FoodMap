"use client";

import type {
    GeoJSONSource,
    Map as MapLibreMap,
    Marker as MapLibreMarker,
} from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { useGeolocation, type GeoPosition } from "@domain/location/gps/provider/geolocation-context";
import { useI18n } from "@/shared/i18n/provider/locale-provider";

import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CONFIG } from "../config/map";

export type MapRestaurant = {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    distanceM: number;
};

/** Pares [lat, lng], tal como vienen de `routes.route`. */
export type MapRoute = {
    geometry: [number, number][];
};

type MapLibreModule = typeof import("maplibre-gl");

const ROUTE_SOURCE_ID = "foodmap-route";
const ROUTE_LAYER_ID = "foodmap-route-line";
const TILE_ORIGIN = "https://tiles.openfreemap.org";
const TILE_PROXY_PATH = "/api/tiles";

const MARKER_COLORS: Record<string, string> = {
    restaurant: "#f59e0b",
    cafe: "#34d399",
    fast_food: "#fb7185",
    bar: "#a78bfa",
};

function popupText(restaurant: MapRestaurant) {
    return `${restaurant.name} · ${restaurant.distanceM} m`;
}

function markerElement(restaurant: MapRestaurant) {
    const element = document.createElement("button");
    element.type = "button";
    element.className =
        "h-4 w-4 rounded-full border-2 border-white shadow-md focus:outline-none focus:ring-2 focus:ring-white";
    element.style.backgroundColor = MARKER_COLORS[restaurant.type] ?? "#38bdf8";
    element.setAttribute("aria-label", popupText(restaurant));
    return element;
}

function syncRestaurantMarkers(
    map: MapLibreMap,
    maplibregl: MapLibreModule,
    restaurants: MapRestaurant[],
    markers: Map<string, MapLibreMarker>,
) {
    const ids = new Set(restaurants.map((restaurant) => restaurant.id));

    for (const [id, marker] of markers) {
        if (!ids.has(id)) {
            marker.remove();
            markers.delete(id);
        }
    }

    for (const restaurant of restaurants) {
        const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setText(
            popupText(restaurant),
        );
        const existing = markers.get(restaurant.id);

        if (existing) {
            existing.setLngLat([restaurant.lng, restaurant.lat]).setPopup(popup);
            continue;
        }

        const marker = new maplibregl.Marker({ element: markerElement(restaurant) })
            .setLngLat([restaurant.lng, restaurant.lat])
            .setPopup(popup)
            .addTo(map);
        markers.set(restaurant.id, marker);
    }
}

function syncRoute(map: MapLibreMap, route: MapRoute | null) {
    const data = {
        type: "FeatureCollection" as const,
        features: route
            ? [
                  {
                      type: "Feature" as const,
                      properties: {},
                      geometry: {
                          type: "LineString" as const,
                          // OSRM devuelve [lng, lat]; en la app guardamos [lat, lng].
                          coordinates: route.geometry.map(
                              ([lat, lng]): [number, number] => [lng, lat],
                          ),
                      },
                  },
              ]
            : [],
    };

    const source = map.getSource(ROUTE_SOURCE_ID);
    if (!source) {
        map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data });
        map.addLayer({
            id: ROUTE_LAYER_ID,
            type: "line",
            source: ROUTE_SOURCE_ID,
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#b45309", "line-width": 4, "line-opacity": 0.9 },
        });
    } else {
        (source as GeoJSONSource).setData(data);
    }

    if (!route || route.geometry.length === 0) return;

    const lngs = route.geometry.map(([, lng]) => lng);
    const lats = route.geometry.map(([lat]) => lat);
    map.fitBounds(
        [
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 70, duration: 900, maxZoom: 16 },
    );
}

export function MapView({
    restaurants,
    route = null,
}: {
    restaurants: MapRestaurant[];
    route?: MapRoute | null;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const maplibreRef = useRef<MapLibreModule | null>(null);
    const positionRef = useRef<GeoPosition | null>(null);
    const markerRef = useRef<MapLibreMarker | null>(null);
    const restaurantMarkersRef = useRef<Map<string, MapLibreMarker>>(new Map());
    const restaurantsRef = useRef<MapRestaurant[]>(restaurants);
    const routeRef = useRef<MapRoute | null>(route);
    const [mapError, setMapError] = useState(false);
    const [retryKey, setRetryKey] = useState(0);
    const { position } = useGeolocation();
    const { m } = useI18n();

    useEffect(() => {
        let cancelled = false;
        const restaurantMarkers = restaurantMarkersRef.current;
        setMapError(false);

        void (async () => {
            const maplibregl = await import("maplibre-gl");

            if (cancelled || !containerRef.current) return;

            maplibreRef.current = maplibregl;
            maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

            const instance = new maplibregl.Map({
                container: containerRef.current,
                style: MAP_CONFIG.styleUrl,
                center: MAP_CONFIG.center,
                zoom: MAP_CONFIG.zoom,
                attributionControl: { compact: true },
                // Todo el tráfico de mapa pasa por nuestro dominio: ni estilo, ni tiles,
                // ni sprites ni glyphs exponen tiles.openfreemap.org al navegador.
                transformRequest: (url) => ({
                    url: url.startsWith(`${TILE_ORIGIN}/`)
                        ? `${TILE_PROXY_PATH}${url.slice(TILE_ORIGIN.length)}`
                        : url,
                }),
            });

            instance.addControl(new maplibregl.NavigationControl(), "top-right");
            instance.on("error", (event) => {
                const message = event.error?.message ?? "";
                // Un fallo de red al traer el estilo o los tiles deja el mapa en blanco.
                if (/Failed to fetch|AJAXError|NetworkError/i.test(message)) {
                    setMapError(true);
                }
            });
            instance.once("load", () => {
                // El estilo de OpenFreeMap dibuja sus propios POI (tiendas, colegios, etc.).
                // Los ocultamos para que el mapa solo muestre nuestros marcadores de restaurantes.
                for (const layer of instance.getStyle().layers ?? []) {
                    if ("source-layer" in layer && layer["source-layer"] === "poi") {
                        instance.setLayoutProperty(layer.id, "visibility", "none");
                    }
                }

                syncRestaurantMarkers(
                    instance,
                    maplibregl,
                    restaurantsRef.current,
                    restaurantMarkers,
                );
                syncRoute(instance, routeRef.current);
            });

            mapRef.current = instance;

            const initial = positionRef.current;
            if (initial) {
                instance.easeTo({
                    center: [initial.lng, initial.lat],
                    zoom: 15,
                    duration: 0,
                });
                markerRef.current = new maplibregl.Marker()
                    .setLngLat([initial.lng, initial.lat])
                    .addTo(instance);
            }
        })();

        return () => {
            cancelled = true;
            markerRef.current?.remove();
            markerRef.current = null;
            for (const marker of restaurantMarkers.values()) {
                marker.remove();
            }
            restaurantMarkers.clear();
            mapRef.current?.remove();
            mapRef.current = null;
            maplibreRef.current = null;
        };
    }, [retryKey]);

    useEffect(() => {
        restaurantsRef.current = restaurants;
        const map = mapRef.current;
        const maplibregl = maplibreRef.current;
        // Los marcadores son elementos DOM: no hace falta esperar a que el estilo termine de cargar.
        if (!map || !maplibregl) return;

        syncRestaurantMarkers(map, maplibregl, restaurants, restaurantMarkersRef.current);
    }, [restaurants]);

    useEffect(() => {
        routeRef.current = route;
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        syncRoute(map, route);
    }, [route]);

    useEffect(() => {
        positionRef.current = position;
        const map = mapRef.current;
        if (!position || !map) return;

        if (markerRef.current) {
            markerRef.current.setLngLat([position.lng, position.lat]);
        } else {
            void (async () => {
                const maplibregl = await import("maplibre-gl");
                if (mapRef.current !== map || markerRef.current) return;
                markerRef.current = new maplibregl.Marker()
                    .setLngLat([position.lng, position.lat])
                    .addTo(map);
            })();
        }

        // Con la ruta visible queremos encuadrar los dos extremos, no seguir al usuario.
        if (!routeRef.current) {
            map.panTo([position.lng, position.lat], { duration: 900 });
        }
    }, [position]);

    return (
        <div className="relative h-full w-full">
            <div ref={containerRef} className="h-full w-full" />
            {mapError ? (
                <div
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#fbf1df]/95 p-6 text-center"
                    role="alert"
                >
                    <p className="max-w-xs text-sm text-[#3b2a1c]/80">{m.map.loadError}</p>
                    <button
                        type="button"
                        className="rounded-full bg-[#b45309] px-5 py-2 text-sm font-semibold text-[#fff7e8] shadow-sm hover:bg-[#92400e] focus:outline-none focus:ring-2 focus:ring-[#d97706]"
                        onClick={() => setRetryKey((key) => key + 1)}
                    >
                        {m.map.retry}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
