import { findNearbyRestaurants } from "../data/sources/postgis/nearby-repository";

export type NearbyRestaurant = {
    id: string;
    name: string;
    type: string;
    cuisines: string[];
    distanceM: number;
};

type ListNearbyInput = {
    lat: number;
    lng: number;
    radiusM: number;
    limit: number;
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
        distanceM: row.distancia_m,
    }));
}
