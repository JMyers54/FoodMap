import "server-only";

import { getPool } from "./client";

export type RestaurantDetailRow = {
    id: string;
    nombre: string;
    tipo: string;
    cocinas: string[];
    direccion: string | null;
    telefono: string | null;
    web: string | null;
    horarios: unknown;
    lat: number;
    lng: number;
};

export async function findRestaurantById(
    id: string,
): Promise<RestaurantDetailRow | null> {
    const sql = `
        select id::text as id,
               nombre,
               tipo,
               cocinas,
               direccion,
               telefono,
               web,
               horarios,
               st_y(ubicacion::geometry) as lat,
               st_x(ubicacion::geometry) as lng
        from public.restaurante
        where id = $1::uuid
          and estado = 'aprobado'
          and nombre not like 'Local sin nombre (%'
        limit 1
    `;
    const { rows } = await getPool().query<RestaurantDetailRow>(sql, [id]);
    return rows[0] ?? null;
}
