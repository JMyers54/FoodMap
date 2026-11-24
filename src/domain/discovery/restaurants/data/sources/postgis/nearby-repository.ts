import "server-only";

import { getPool } from "./client";

export type NearbyRestaurantRow = {
    id: string;
    nombre: string;
    tipo: string;
    cocinas: string[];
    distancia_m: number;
};

type FindNearbyParams = {
    lat: number;
    lng: number;
    radiusM: number;
    limit: number;
};

export async function findNearbyRestaurants({
    lat,
    lng,
    radiusM,
    limit,
}: FindNearbyParams): Promise<NearbyRestaurantRow[]> {
    const point = "ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography";
    const sql = `
        select r.id::text as id,
               r.nombre,
               r.tipo,
               r.cocinas,
               round(st_distance(r.ubicacion, ${point})::numeric)::int as distancia_m
        from public.restaurante r
        where st_dwithin(r.ubicacion, ${point}, $3)
        order by distancia_m asc, r.nombre asc
        limit $4
    `;
    const { rows } = await getPool().query<NearbyRestaurantRow>(sql, [
        lng,
        lat,
        radiusM,
        limit,
    ]);
    return rows;
}
