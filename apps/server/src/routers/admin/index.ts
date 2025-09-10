import { adminAuthRouter } from "./auth";
import { adminBlogRouter } from "./blog";
import { adminCommentRouter } from "./comment";
import { adminDashboardRouter } from "./dashboard";
import { adminRoomRouter } from "./room";
import { adminTagRouter } from "./tag";

export type AdminRouter = typeof adminBlogRouter &
  typeof adminCommentRouter &
  typeof adminTagRouter &
  typeof adminRoomRouter &
  typeof adminAuthRouter &
  typeof adminDashboardRouter;

export const adminRouter: AdminRouter = {
  ...adminAuthRouter,
  ...adminBlogRouter,
  ...adminCommentRouter,
  ...adminTagRouter,
  ...adminRoomRouter,
  ...adminDashboardRouter,
};
