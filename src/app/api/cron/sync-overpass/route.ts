import { timingSafeEqual } from "node:crypto";

import { Pool } from "pg";

import { runSeed } from "../../../../../scripts/seed-caicedonia.mjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const lockKey = 4_100_505;

/** F1-05 · Job diario de Overpass → PostGIS (Vercel Cron, 03:00 UTC). */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return Response.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
    }

    const auth = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${secret}`;
    const valid =
        auth.length === expected.length &&
        timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
    if (!valid) {
        return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const { rows } = await pool.query("select pg_try_advisory_lock($1) as acquired", [
            lockKey,
        ]);
        if (!rows[0]?.acquired) {
            return Response.json({ skipped: true, reason: "Sincronización ya en curso" });
        }

        try {
            await runSeed();
            return Response.json({ ok: true });
        } finally {
            await pool.query("select pg_advisory_unlock($1)", [lockKey]);
        }
    } finally {
        await pool.end();
    }
}
