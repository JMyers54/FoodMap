import { z } from "zod";

import { publicProcedure, router } from "@/shared/trpc/init";

export const restaurantsRouter = router({
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