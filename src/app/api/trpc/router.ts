import { restaurantsRouter } from "@/domain/discovery/restaurants/presentation/http/router";
import { routesRouter } from "@/domain/navigation/routes/presentation/http/router";
import { router } from "@/shared/trpc/init";

export const appRouter = router({
  restaurants: restaurantsRouter,
  routes: routesRouter,
});

export type AppRouter = typeof appRouter;
