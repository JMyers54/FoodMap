import { Pool } from "pg";

export const LAT = 4.3354479;
export const LNG = -75.8266520;
export const RADIUS = 5000;

export async function runSeed() {
    const overpassQuery = `[out:json][timeout:60];(
  nwr["amenity"~"^(restaurant|cafe|fast_food)$"](around:${RADIUS},${LAT},${LNG});
);out center tags;`;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
            "User-Agent": "FoodMap-dev/0.1",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ data: overpassQuery }),
    });

    if (!response.ok) {
        throw new Error(`Overpass respondió ${response.status}: ${await response.text()}`);
    }

    const payload = await response.json();
    const rows = [];

    for (const element of payload.elements ?? []) {
        const lat = element.lat ?? element.center?.lat;
        const lng = element.lon ?? element.center?.lon;
        const amenity = element.tags?.amenity;

        if (lat == null || lng == null) continue;
        if (!["restaurant", "cafe", "fast_food"].includes(amenity)) continue;

        const osmId = element.type === "node" ? element.id : -element.id;
        const name = element.tags.name?.trim() || `Local sin nombre (${element.id})`;
        const cuisines = (element.tags.cuisine ?? "")
            .split(/[;,]/)
            .map((item) => item.trim())
            .filter(Boolean);

        rows.push([
            osmId,
            name,
            amenity,
            cuisines,
            lng,
            lat,
            element.tags["addr:street"] ?? null,
            element.tags.phone ?? null,
            element.tags.website ?? null,
        ]);
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();

    try {
        const before = await client.query(
            `select count(*)::int as total from public.restaurante
             where st_dwithin(ubicacion, st_setsrid(st_makepoint($1, $2), 4326)::geography, $3)`,
            [LNG, LAT, RADIUS],
        );

        await client.query("begin");
        for (const row of rows) {
            await client.query(
                `insert into public.restaurante
                    (osm_id, nombre, tipo, cocinas, ubicacion, direccion, telefono, web, fuente)
                 values ($1, $2, $3, $4, st_setsrid(st_makepoint($5, $6), 4326)::geography,
                         $7, $8, $9, 'osm')
                 on conflict (osm_id) do update set
                     nombre = excluded.nombre,
                     tipo = excluded.tipo,
                     cocinas = excluded.cocinas,
                     ubicacion = excluded.ubicacion,
                     direccion = excluded.direccion,
                     telefono = excluded.telefono,
                     web = excluded.web,
                     actualizado = now()`,
                row,
            );
        }
        await client.query("commit");

        const after = await client.query(
            `select count(*)::int as total from public.restaurante
             where st_dwithin(ubicacion, st_setsrid(st_makepoint($1, $2), 4326)::geography, $3)`,
            [LNG, LAT, RADIUS],
        );

        console.log(`Overpass: ${rows.length} locales encontrados`);
        console.log(`En BD antes: ${before.rows[0].total} · después: ${after.rows[0].total}`);
        console.log(
            await client.query(
                `select nombre, tipo,
                        round(st_distance(ubicacion, st_setsrid(st_makepoint($1, $2), 4326)::geography)::numeric)::int as metros
                 from public.restaurante
                 where st_dwithin(ubicacion, st_setsrid(st_makepoint($1, $2), 4326)::geography, $3)
                 order by metros, nombre limit $4`,
                [LNG, LAT, RADIUS, 10],
            ).then((r) => r.rows),
        );
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecución directa: node scripts/seed-caicedonia.mjs
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
    await runSeed();
}
