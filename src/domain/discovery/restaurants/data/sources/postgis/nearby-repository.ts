import "server-only";

import { getPool } from "./client";

export type NearbyRestaurantRow = {
    id: string;
    nombre: string;
    tipo: string;
    cocinas: string[];
    lat: number;
    lng: number;
    distancia_m: number;
};

export type FindNearbyParams = {
    lat: number;
    lng: number;
    radiusM: number;
    limit: number;
    types?: string[];
    cuisines?: string[];
    openNow?: boolean;
};

export async function findNearbyRestaurants({
    lat,
    lng,
    radiusM,
    limit,
    types,
    cuisines,
    openNow,
}: FindNearbyParams): Promise<NearbyRestaurantRow[]> {
    const point = "ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography";
    const sql = `
        select r.id::text as id,
               r.nombre,
               r.tipo,
               r.cocinas,
               st_y(r.ubicacion::geometry) as lat,
               st_x(r.ubicacion::geometry) as lng,
               round(st_distance(r.ubicacion, ${point})::numeric)::int as distancia_m
        from public.restaurante r
        where r.estado = 'aprobado'
          and r.nombre not like 'Local sin nombre (%'
          and st_dwithin(r.ubicacion, ${point}, $3)
          and ($5::text[] is null or r.tipo = any($5::text[]))
          and ($6::text[] is null or r.cocinas && $6::text[])
          -- F2-05: mientras no haya horarios importados, 'abierto ahora' solo puede
          -- quedarse con locales que tengan horarios conocidos. La UI lo muestra desactivado.
          and (not $7 or coalesce(r.horarios <> '{}'::jsonb, false))
        order by distancia_m asc, r.nombre asc
        limit $4
    `;
    const { rows } = await getPool().query<NearbyRestaurantRow>(sql, [
        lng,
        lat,
        radiusM,
        limit,
        types ?? null,
        cuisines ?? null,
        openNow ?? false,
    ]);
    return rows;
}
