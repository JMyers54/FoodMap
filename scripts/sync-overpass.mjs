// F1-05 · Sincronización programable de Overpass → PostGIS.
// Envuelve la semilla con un lock advisory para que nunca se solapen dos pasadas
// (cron + arranque, o varios workers). Uso: node scripts/sync-overpass.mjs
import { Pool } from "pg";

import { runSeed } from "./seed-caicedonia.mjs";

const lockKey = 4_100_505;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
    const { rows } = await pool.query("select pg_try_advisory_lock($1) as acquired", [lockKey]);
    if (!rows[0]?.acquired) {
        console.log("Sincronización ya en curso; se omite esta pasada.");
    } else {
        try {
            await runSeed();
        } finally {
            await pool.query("select pg_advisory_unlock($1)", [lockKey]);
        }
    }
} finally {
    await pool.end();
}
