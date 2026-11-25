import { z } from "zod";

export const ROUTE_MODES = ["walk", "bike", "car"] as const;

const coordinate = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});

export const routeInputSchema = z.object({
    from: coordinate,
    to: coordinate,
    mode: z.enum(ROUTE_MODES).default("walk"),
});

export type RouteInput = z.infer<typeof routeInputSchema>;
export type RouteMode = (typeof ROUTE_MODES)[number];

export type RouteResult = {
    distanceM: number;
    durationS: number;
    /** Pares [lat, lng], como en la documentación de /api/route. */
    geometry: [number, number][];
    from: { lat: number; lng: number };
    to: { lat: number; lng: number };
    mode: RouteMode;
};
