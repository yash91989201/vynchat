import { adminBlogRouter } from "./blog";
import { adminCommentRouter } from "./comment";
import { adminTagRouter } from "./tag";

export const adminRouter = {
  ...adminBlogRouter,
  ...adminCommentRouter,
  ...adminTagRouter,
};
