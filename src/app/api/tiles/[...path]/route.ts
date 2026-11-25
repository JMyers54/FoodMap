import { NextRequest } from "next/server";

/**
 * Proxy del estilo, sprites, glyphs y tiles de OpenFreeMap.
 * El navegador solo ve nuestro dominio, así un bloqueador o un firewall
 * del dispositivo no puede cortar las peticiones a tiles.openfreemap.org.
 */
const UPSTREAM_ORIGIN = "https://tiles.openfreemap.org";
const TIMEOUT_MS = 10_000;
const FORWARDED_HEADERS = ["accept", "accept-language"];

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
) {
    const { path } = await context.params;

    if (path.length === 0) {
        return new Response("Missing tile path", { status: 400 });
    }

    const segments = path.map((segment) => encodeURIComponent(segment)).join("/");
    const target = `${UPSTREAM_ORIGIN}/${segments}${request.nextUrl.search}`;

    const headers = new Headers();
    for (const name of FORWARDED_HEADERS) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            headers,
            cache: "no-store",
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch {
        return new Response("Tile upstream unavailable", { status: 502 });
    }

    const responseHeaders = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) responseHeaders.set("content-type", contentType);

    const cacheControl = upstream.headers.get("cache-control");
    responseHeaders.set("cache-control", cacheControl ?? "public, max-age=3600");

    for (const name of ["etag", "last-modified"]) {
        const value = upstream.headers.get(name);
        if (value) responseHeaders.set(name, value);
    }

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
    });
}
