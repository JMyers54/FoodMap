import { z } from "zod";

import { getRestaurantDetail } from "../../business/restaurant-detail";
import { listNearbyRestaurants } from "../../business/nearby-restaurants";

import { publicProcedure, router } from "@/shared/trpc/init";

const RESTAURANT_TYPES = ["restaurant", "cafe", "fast_food", "bar"] as const;

export const restaurantsRouter = router({
    nearby: publicProcedure
        .input(
            z.object({
                lat: z.number().min(-90).max(90),
                lng: z.number().min(-180).max(180),
                radiusM: z.number().int().min(100).max(5000).default(1500),
                limit: z.number().int().min(1).max(50).default(10),
                types: z.array(z.enum(RESTAURANT_TYPES)).optional(),
                cuisines: z.array(z.string().min(1).max(40)).max(10).optional(),
                openNow: z.boolean().optional(),
            }),
        )
        .query(({ input }) => listNearbyRestaurants(input)),

    byId: publicProcedure
        .input(z.object({ id: z.uuid() }))
        .query(({ input }) => getRestaurantDetail(input.id)),

    ping: publicProcedure
        .input(
            z.object({
                message: z.string().min(1),
            }),
        )
        .query(({ input }) => ({
            message: input.message,
            at: new Date().toISOString(),
        })),
});
