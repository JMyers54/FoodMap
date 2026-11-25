import { requestRoute } from "../data/sources/osrm/client";
import type { RouteInput, RouteResult } from "../schema";

export async function calculateRoute(input: RouteInput): Promise<RouteResult> {
    const route = await requestRoute(input);

    return {
        distanceM: Math.round(route.distance),
        durationS: Math.round(route.duration),
        geometry: route.geometry.coordinates.map(([lng, lat]): [number, number] => [lat, lng]),
        from: input.from,
        to: input.to,
        mode: input.mode,
    };
}
