import type { RouterClient } from "@orpc/server";
import { adminRouter } from "@/routers/admin";
import { blogRouter } from "./blog";
import { healthCheckRouter } from "./health-check";
import { tagRouter } from "./tag";

export type AppRouter = typeof healthCheckRouter &
  typeof adminRouter &
  typeof blogRouter &
  typeof tagRouter;

export const appRouter: AppRouter = {
  ...healthCheckRouter,
  ...adminRouter,
  ...blogRouter,
  ...tagRouter,
};
export type AppRouterClient = RouterClient<typeof appRouter>;
