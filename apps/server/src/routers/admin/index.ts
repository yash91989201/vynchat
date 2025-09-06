import { adminBlogRouter } from "./blog";
import { adminCommentRouter } from "./comment";
import { adminTagRouter } from "./tag";

export type AdminRouter = typeof adminBlogRouter &
  typeof adminCommentRouter &
  typeof adminTagRouter;

export const adminRouter: AdminRouter = {
  ...adminBlogRouter,
  ...adminCommentRouter,
  ...adminTagRouter,
};
