import { findNearbyRestaurants } from "../data/sources/postgis/nearby-repository";

export type NearbyRestaurant = {
    id: string;
    name: string;
    type: string;
    cuisines: string[];
    lat: number;
    lng: number;
    distanceM: number;
};

export type ListNearbyInput = {
    lat: number;
    lng: number;
    radiusM: number;
    limit: number;
    types?: string[];
    cuisines?: string[];
    openNow?: boolean;
};

export async function listNearbyRestaurants(
    input: ListNearbyInput,
): Promise<NearbyRestaurant[]> {
    const rows = await findNearbyRestaurants(input);
    return rows.map((row) => ({
        id: row.id,
        name: row.nombre,
        type: row.tipo,
        cuisines: row.cocinas,
        lat: row.lat,
        lng: row.lng,
        distanceM: row.distancia_m,
    }));
}
