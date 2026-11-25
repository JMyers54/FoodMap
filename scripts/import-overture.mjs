import { readFile } from "node:fs/promises";

import { Pool } from "pg";

const file = process.argv[2];
if (!file) {
    throw new Error("Uso: node scripts/import-overture.mjs <archivo.geojsonseq>");
}

function typeOfCategory(category) {
    if (!category) return null;
    if (["fast_food", "fast_food_restaurant", "food_truck_stand", "sandwich_shop"].includes(category)) {
        return "fast_food";
    }
    if (
        ["cafe", "coffee_shop", "hong_kong_style_cafe", "bakery", "ice_cream_shop", "dessert_shop", "smoothie_juice_bar"].includes(
            category,
        )
    ) {
        return "cafe";
    }
    if (["bar", "pub", "tapas_bar", "cocktail_bar"].includes(category)) return "bar";
    if (category === "restaurant" || category.endsWith("_restaurant") || category === "food_court") {
        return "restaurant";
    }
    return null;
}

const nameOf = (properties) => {
    const names = properties.names ?? properties.name ?? {};
    return (names.primary ?? names.common ?? "").trim() || null;
};
const valueOf = (items) => {
    const first = items?.[0];
    return typeof first === "string" ? first : (first?.value ?? null);
};

const lines = (await readFile(file, "utf8")).split("\n").filter(Boolean);
const features = lines.map((line) => JSON.parse(line));

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

let candidates = 0;
let duplicates = 0;
let inserted = 0;

try {
    await client.query("begin");

    for (const feature of features) {
        const properties = feature.properties ?? {};
        const type = typeOfCategory(
            properties.taxonomy?.primary ?? properties.basic_category ?? properties.categories?.primary,
        );
        const name = nameOf(properties);
        const [lng, lat] = feature.geometry?.coordinates ?? [];

        if (!type || !name || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        candidates += 1;

        const point = "st_setsrid(st_makepoint($1, $2), 4326)::geography";
        const duplicate = await client.query(
            `select 1 from public.restaurante where st_dwithin(ubicacion, ${point}, 25) limit 1`,
            [lng, lat],
        );
        if (duplicate.rowCount > 0) {
            duplicates += 1;
            continue;
        }

        const confidence = Math.min(1, Math.max(0, Number(properties.confidence ?? 1)));
        const address = properties.addresses?.[0] ?? {};

        const result = await client.query(
            `insert into public.restaurante
                (nombre, tipo, cocinas, ubicacion, direccion, telefono, web, fuente, estado)
             values ($1, $2, '{}', st_setsrid(st_makepoint($3, $4), 4326)::geography,
                     $5, $6, $7, 'overture', 'aprobado')
             returning id`,
            [
                name,
                type,
                lng,
                lat,
                address.street ?? address.freeform ?? null,
                valueOf(properties.phones),
                valueOf(properties.websites),
            ],
        );

        await client.query(
            `insert into public.restaurante_fuente
                (restaurante_id, fuente, id_externo, confianza, datos_crudos)
             values ($1, 'overture', $2, $3, $4::jsonb)
             on conflict (fuente, id_externo) do nothing`,
            [result.rows[0].id, feature.id, confidence, JSON.stringify(properties)],
        );
        inserted += 1;
    }

    await client.query("commit");
} catch (error) {
    await client.query("rollback");
    throw error;
} finally {
    client.release();
    await pool.end();
}

console.log(
    `Overture: ${features.length} features · ${candidates} candidatos · ` +
        `${duplicates} duplicados · ${inserted} insertados`,
);
