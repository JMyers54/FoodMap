import "server-only";

import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

import type { RouteInput, RouteMode } from "../../../schema";

type OsrmResponse = {
    code: string;
    routes?: Array<{
        distance: number;
        duration: number;
        geometry: { type: string; coordinates: [number, number][] };
    }>;
};

const PROFILE: Record<RouteMode, string> = {
    walk: "walking",
    bike: "cycling",
    car: "driving",
};

const BASE_URL = process.env.OSRM_BASE_URL ?? "https://router.project-osrm.org";

/** `fetch` de Next sale por IPv6 y OSRM demo no responde ahí; forzamos IPv4. */
function requestJson(url: URL): Promise<OsrmResponse> {
    const requester = url.protocol === "https:" ? httpsRequest : httpRequest;

    return new Promise((resolve, reject) => {
        const req = requester(
            url,
            {
                method: "GET",
                family: 4,
                timeout: 8000,
                headers: { "User-Agent": "FoodMap-dev/0.1" },
            },
            (res) => {
                if (res.statusCode !== 200) {
                    res.resume();
                    reject(new Error(`OSRM respondió ${res.statusCode}`));
                    return;
                }

                let body = "";
                res.setEncoding("utf8");
                res.on("data", (chunk: string) => {
                    body += chunk;
                });
                res.on("end", () => {
                    try {
                        resolve(JSON.parse(body) as OsrmResponse);
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        );

        req.on("timeout", () => req.destroy(new Error("OSRM tardó demasiado en responder")));
        req.on("error", reject);
        req.end();
    });
}

export async function requestRoute({ from, to, mode }: RouteInput) {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = new URL(
        `${BASE_URL}/route/v1/${PROFILE[mode]}/${coords}?overview=full&geometries=geojson&steps=false`,
    );

    const payload = await requestJson(url);
    if (payload.code !== "Ok" || !payload.routes?.length) {
        throw new Error(`OSRM no encontró ruta (${payload.code})`);
    }

    return payload.routes[0];
}
