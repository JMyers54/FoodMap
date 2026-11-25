import { calculateRoute } from "../../business/calculate-route";
import { routeInputSchema } from "../../schema";

import { publicProcedure, router } from "@/shared/trpc/init";

export const routesRouter = router({
    route: publicProcedure.input(routeInputSchema).query(({ input }) => calculateRoute(input)),
});
