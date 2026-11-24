import { z } from "zod";

import { listNearbyRestaurants } from "../../business/nearby-restaurants";

import { publicProcedure, router } from "@/shared/trpc/init";

export const restaurantsRouter = router({
    nearby: publicProcedure
        .input(
            z.object({
                lat: z.number().min(-90).max(90),
                lng: z.number().min(-180).max(180),
                radiusM: z.number().int().min(100).max(5000).default(1500),
                limit: z.number().int().min(1).max(50).default(10),
            }),
        )
        .query(({ input }) => listNearbyRestaurants(input)),

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