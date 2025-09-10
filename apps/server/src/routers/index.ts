import type { RouterClient } from "@orpc/server";
import { adminRouter } from "@/routers/admin";
import { blogRouter } from "./blog";
import { healthCheckRouter } from "./health-check";
import { messageRouter } from "./message";
import { profileRouter } from "./profile";
import { roomRouter } from "./room";
import { sseRouter } from "./sse";
import { tagRouter } from "./tag";
import { userRouter } from "./user";

export type AppRouter = {
  healthCheck: typeof healthCheckRouter;
  admin: typeof adminRouter;
  blog: typeof blogRouter;
  tag: typeof tagRouter;
  profile: typeof profileRouter;
  user: typeof userRouter;
  room: typeof roomRouter;
  message: typeof messageRouter;
  sse: typeof sseRouter;
};

export const appRouter: AppRouter = {
  healthCheck: healthCheckRouter,
  admin: adminRouter,
  blog: blogRouter,
  tag: tagRouter,
  profile: profileRouter,
  user: userRouter,
  room: roomRouter,
  message: messageRouter,
  sse: sseRouter,
};
export type AppRouterClient = RouterClient<typeof appRouter>;
