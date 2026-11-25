import { RestaurantDetailScreen } from "@domain/discovery/restaurants/presentation/components/restaurant-detail-screen";

export default async function RestaurantPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <RestaurantDetailScreen id={id} />;
}
