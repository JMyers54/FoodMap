# FoodMap

## Sincronización de restaurantes (F1-05)

Overpass se consulta **solo desde el servidor**. La sincronización de Caicedonia se ejecuta:

- **Manual:** `npm run sync:overpass` (usa `DATABASE_URL` de `.env.local`).
- **Programada:** Vercel Cron, diario a las 03:00 UTC (`vercel.json` → `/api/cron/sync-overpass`).
  El endpoint exige `Authorization: Bearer $CRON_SECRET`; Vercel envía ese header automáticamente
  cuando la variable `CRON_SECRET` está definida en el proyecto.

Ambas rutas comparten un *lock advisory* para no solapar pasadas. El `upsert` es por `osm_id`,
así que repetir no duplica restaurantes; los que desaparecen de OSM se ignoran, no se borran.

