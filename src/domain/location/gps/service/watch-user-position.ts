export type TrackedPosition = { lat: number; lng: number };

type WatchUserPositionOptions = {
    minDistanceM: number;
    minIntervalMs: number;
    onPosition: (position: TrackedPosition) => void;
    onError: (code: number) => void;
};

export function distanceMeters(a: TrackedPosition, b: TrackedPosition): number {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

export function watchUserPosition({
    minDistanceM,
    minIntervalMs,
    onPosition,
    onError,
}: WatchUserPositionOptions): () => void {
    let lastAccepted: TrackedPosition | null = null;
    let lastAcceptedAt = 0;

    const watchId = navigator.geolocation.watchPosition(
        (coords) => {
            const next = { lat: coords.coords.latitude, lng: coords.coords.longitude };
            const now = Date.now();

            if (lastAccepted && now - lastAcceptedAt < minIntervalMs) return;
            if (lastAccepted && distanceMeters(lastAccepted, next) < minDistanceM) return;

            lastAccepted = next;
            lastAcceptedAt = now;
            onPosition(next);
        },
        (error) => onError(error.code),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 20_000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
}