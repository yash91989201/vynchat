import { eq, getTableColumns, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { blog, blogTag, category, tag } from "@/db/schema";
import type { TagType } from "@/lib/types";

export const blogWithCategoryAndTagsView = pgView(
  "blog_with_category_and_tags"
).as((qb) =>
  qb
    .select({
      ...getTableColumns(blog),
      category: getTableColumns(category),
      tags: sql<TagType[]>`
        COALESCE(
          json_agg(DISTINCT ${tag})
          FILTER (WHERE ${tag}.id IS NOT NULL),
          '[]'
        )
      `.as("tags"),
    })
    .from(blog)
    .innerJoin(category, eq(blog.categoryId, category.id)) // changed leftJoin to join
    .leftJoin(blogTag, eq(blog.id, blogTag.blogId))
    .leftJoin(tag, eq(blogTag.tagId, tag.id))
    .groupBy(blog.id, category.id)
);
