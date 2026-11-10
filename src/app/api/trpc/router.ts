import { restaurantsRouter } from "@/domain/discovery/restaurants/presentation/http/router";
import { router } from "@/shared/trpc/init";

export const appRouter = router({
  restaurants: restaurantsRouter,
});

export type AppRouter = typeof appRouter;