import "server-only";

import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("Falta DATABASE_URL");
        }
        pool = new Pool({ connectionString, max: 5 });
    }
    return pool;
}
