import type { RouterClient } from "@orpc/server";
import { publicProcedure } from "@/lib/orpc";
import { adminRouter } from "@/routers/admin";
import { blogRouter } from "./blog";
import { tagRouter } from "./tag";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  ...adminRouter,
  ...blogRouter,
  ...tagRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
