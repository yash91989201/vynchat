import { analyticsRouter } from "./analytics";
import { adminAuthRouter } from "./auth";
import { adminBlogRouter } from "./blog";
import { adminCommentRouter } from "./comment";
import { adminDashboardRouter } from "./dashboard";
import { adminTagRouter } from "./tag";
import { adminUserRouter } from "./user";

export type AdminRouter = typeof adminBlogRouter &
  typeof adminCommentRouter &
  typeof adminTagRouter &
  typeof adminAuthRouter &
  typeof adminDashboardRouter &
  typeof analyticsRouter &
  typeof adminUserRouter;

export const adminRouter: AdminRouter = {
  ...adminAuthRouter,
  ...adminBlogRouter,
  ...adminCommentRouter,
  ...adminTagRouter,
  ...adminDashboardRouter,
  ...analyticsRouter,
  ...adminUserRouter,
};
