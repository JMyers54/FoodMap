import { findRestaurantById } from "../data/sources/postgis/restaurant-repository";

export type RestaurantDetail = {
    id: string;
    name: string;
    type: string;
    cuisines: string[];
    address: string | null;
    phone: string | null;
    website: string | null;
    hasHours: boolean;
    lat: number;
    lng: number;
};

export async function getRestaurantDetail(
    id: string,
): Promise<RestaurantDetail | null> {
    const row = await findRestaurantById(id);
    if (!row) return null;

    return {
        id: row.id,
        name: row.nombre,
        type: row.tipo,
        cuisines: row.cocinas,
        address: row.direccion,
        phone: row.telefono,
        website: row.web,
        hasHours:
            row.horarios != null &&
            (Array.isArray(row.horarios)
                ? row.horarios.length > 0
                : Object.keys(row.horarios as object).length > 0),
        lat: row.lat,
        lng: row.lng,
    };
}
