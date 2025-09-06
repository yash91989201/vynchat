import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
  blog,
  comment,
  like,
  message,
  room,
  roomBanned,
  roomMembers,
  roomModerators,
  userFollowers,
  userFollowing,
} from "@/db/schema";
import { account, session, user, verification } from "@/db/schema/auth";

export const UserSchema = createSelectSchema(user);
export const SessionSchema = createSelectSchema(session);
export const AccountSchema = createSelectSchema(account);
export const VerificationSchema = createSelectSchema(verification);
export const CommentSchema = createSelectSchema(comment);
export const LikeSchema = createSelectSchema(like);
export const MessageSchema = createSelectSchema(message);
export const BlogSchema = createSelectSchema(blog);
export const RoomSchema = createSelectSchema(room);
export const RoomBannedSchema = createSelectSchema(roomBanned);
export const RoomMembersSchema = createSelectSchema(roomMembers);
export const RoomModeratorsSchema = createSelectSchema(roomModerators);
export const UserFollowersSchema = createSelectSchema(userFollowers);
export const UserFollowingSchema = createSelectSchema(userFollowing);

export const UserInsertSchema = createInsertSchema(user);
export const SessionInsertSchema = createInsertSchema(session);
export const AccountInsertSchema = createInsertSchema(account);
export const VerificationInsertSchema = createInsertSchema(verification);
export const CommentInsertSchema = createInsertSchema(comment);
export const LikeInsertSchema = createInsertSchema(like);
export const MessageInsertSchema = createInsertSchema(message);
export const BlogInsertSchema = createInsertSchema(blog);
export const RoomInsertSchema = createInsertSchema(room);
export const RoomBannedInsertSchema = createInsertSchema(roomBanned);
export const RoomMembersInsertSchema = createInsertSchema(roomMembers);
export const RoomModeratorsInsertSchema = createInsertSchema(roomModerators);
export const UserFollowersInsertSchema = createInsertSchema(userFollowers);
export const UserFollowingInsertSchema = createInsertSchema(userFollowing);

export const UserUpdateSchema = createUpdateSchema(user);
export const SessionUpdateSchema = createUpdateSchema(session);
export const AccountUpdateSchema = createUpdateSchema(account);
export const VerificationUpdateSchema = createUpdateSchema(verification);
export const CommentUpdateSchema = createUpdateSchema(comment);
export const LikeUpdateSchema = createUpdateSchema(like);
export const MessageUpdateSchema = createUpdateSchema(message);
export const BlogUpdateSchema = createUpdateSchema(blog);
export const RoomUpdateSchema = createUpdateSchema(room);
export const RoomBannedUpdateSchema = createUpdateSchema(roomBanned);
export const RoomMembersUpdateSchema = createUpdateSchema(roomMembers);
export const RoomModeratorsUpdateSchema = createUpdateSchema(roomModerators);
export const UserFollowersUpdateSchema = createUpdateSchema(userFollowers);
export const UserFollowingUpdateSchema = createUpdateSchema(userFollowing);

export const CreateBlogInput = BlogInsertSchema;

export const CreateBlogOutput = BlogSchema.optional();

export const GetBlogInput = z.object({
  id: z.cuid2(),
});

export const GetBlogOutput = BlogSchema.optional();

export const ListBlogsInput = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  search: z
    .object({
      title: z.string().optional(),
      slug: z.string().optional(),
    })
    .optional(),
  filter: z
    .object({
      category: z.string().optional(),
    })
    .optional(),
  sort: z.object({
    field: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const ListBlogsOutput = z.object({
  posts: z.array(BlogSchema),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  currentPage: z.number().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const UpdateBlogInput = BlogUpdateSchema.omit({
  createdAt: true,
  updatedAt: true,
  authorId: true,
}).extend({
  id: z.cuid2(),
});

export const UpdateBlogOutput = BlogSchema.optional();

export const DeleteBlogInput = z.object({
  id: z.cuid2(),
});

export const DeleteBlogOutput = z.object({});

export const ListBlogCommentsInput = z.object({
  blogId: z.cuid2(),
  limit: z.number().min(1).max(50).default(5),
  offset: z.number().min(0).default(0),
  sort: z
    .object({
      field: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
      order: z.enum(["asc", "desc"]).default("desc"),
    })
    .default({ field: "createdAt", order: "desc" }),
});

export const ListBlogCommentsOutput = z.object({
  comments: z.array(CommentSchema),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  currentPage: z.number().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
