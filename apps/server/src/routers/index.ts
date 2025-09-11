import type { RouterClient } from "@orpc/server";
import { adminRouter } from "@/routers/admin";
import { blogRouter } from "./blog";
import { healthCheckRouter } from "./health-check";
import { messageRouter } from "./message";
import { roomRouter } from "./room";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export type AppRouter = {
  healthCheck: typeof healthCheckRouter;
  admin: typeof adminRouter;
  blog: typeof blogRouter;
  tag: typeof tagRouter;
  user: typeof userRouter;
  room: typeof roomRouter;
  message: typeof messageRouter;
};

export const appRouter: AppRouter = {
  healthCheck: healthCheckRouter,
  admin: adminRouter,
  blog: blogRouter,
  tag: tagRouter,
  user: userRouter,
  room: roomRouter,
  message: messageRouter,
};

export type AppRouterClient = RouterClient<typeof appRouter>;
