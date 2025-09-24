import { adminAuthRouter } from "./auth";
import { adminBlogRouter } from "./blog";
import { adminCommentRouter } from "./comment";
import { adminDashboardRouter } from "./dashboard";
import { adminTagRouter } from "./tag";
import { analyticsRouter } from "./analytics";

export type AdminRouter = typeof adminBlogRouter &
  typeof adminCommentRouter &
  typeof adminTagRouter &
  typeof adminAuthRouter &
  typeof adminDashboardRouter &
  typeof analyticsRouter;

export const adminRouter: AdminRouter = {
  ...adminAuthRouter,
  ...adminBlogRouter,
  ...adminCommentRouter,
  ...adminTagRouter,
  ...adminDashboardRouter,
  ...analyticsRouter,
};
