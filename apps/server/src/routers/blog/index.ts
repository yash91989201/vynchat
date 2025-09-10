import { baseBlogRouter } from "./base";
import { blogCommentRouter } from "./comment";
import { blogTagRouter } from "./tag";

export const blogRouter = {
  ...baseBlogRouter,
  ...blogCommentRouter,
  ...blogTagRouter,
};
