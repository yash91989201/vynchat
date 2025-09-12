import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import {
  blog,
  category,
  comment,
  message,
  reaction,
  room,
  roomMember,
  tag,
  userFollowers,
  userFollowing,
} from "@/db/schema";
import { account, session, user, verification } from "@/db/schema/auth";

export const UserSchema = createSelectSchema(user);
export const SessionSchema = createSelectSchema(session);
export const AccountSchema = createSelectSchema(account);
export const VerificationSchema = createSelectSchema(verification);
export const CommentSchema = createSelectSchema(comment);
export const MessageSchema = createSelectSchema(message);
export const BlogSchema = createSelectSchema(blog);
export const RoomSchema = createSelectSchema(room);
export const UserFollowersSchema = createSelectSchema(userFollowers);
export const UserFollowingSchema = createSelectSchema(userFollowing);
export const TagSchema = createSelectSchema(tag);
export const CategorySchema = createSelectSchema(category);
export const ReactionSchema = createSelectSchema(reaction);

export const UserInsertSchema = createInsertSchema(user);
export const SessionInsertSchema = createInsertSchema(session);
export const AccountInsertSchema = createInsertSchema(account);
export const VerificationInsertSchema = createInsertSchema(verification);
export const CommentInsertSchema = createInsertSchema(comment);
export const MessageInsertSchema = createInsertSchema(message);
export const BlogInsertSchema = createInsertSchema(blog);
export const RoomInsertSchema = createInsertSchema(room);
export const RoomMembersInsertSchema = createInsertSchema(roomMember);
export const UserFollowersInsertSchema = createInsertSchema(userFollowers);
export const UserFollowingInsertSchema = createInsertSchema(userFollowing);
export const TagInsertSchema = createInsertSchema(tag);
export const CategoryInsertSchema = createInsertSchema(category);

export const UserUpdateSchema = createUpdateSchema(user);
export const SessionUpdateSchema = createUpdateSchema(session);
export const AccountUpdateSchema = createUpdateSchema(account);
export const VerificationUpdateSchema = createUpdateSchema(verification);
export const CommentUpdateSchema = createUpdateSchema(comment);
export const MessageUpdateSchema = createUpdateSchema(message);
export const BlogUpdateSchema = createUpdateSchema(blog);
export const RoomUpdateSchema = createUpdateSchema(room);
export const RoomMembersUpdateSchema = createUpdateSchema(roomMember);
export const UserFollowersUpdateSchema = createUpdateSchema(userFollowers);
export const UserFollowingUpdateSchema = createUpdateSchema(userFollowing);
export const TagUpdateSchema = createUpdateSchema(tag);
export const CategoryUpdateSchema = createUpdateSchema(category);

export const BlogDataSchema = BlogSchema.extend({
  category: CategorySchema,
  tags: z.array(TagSchema),
});

export const CreateBlogInput = BlogInsertSchema.extend({
  tags: z.array(TagSchema.pick({ id: true })),
});

export const CreateBlogOutput = BlogSchema.optional();

export const GetBlogInput = z.object({
  slug: z.string(),
});

export const GetBlogOutput = BlogSchema.extend({
  category: CategorySchema,
}).optional();

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
      categoryId: z.cuid2().optional(),
    })
    .optional(),
  sort: z.object({
    field: z.enum(["createdAt", "updatedAt", "title"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const ListBlogsOutput = z.object({
  blogs: z.array(
    BlogSchema.omit({ categoryId: true }).extend({
      category: CategorySchema.nullable(),
    })
  ),
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
  blogId: z.string(),
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
  comments: z.array(
    CommentSchema.extend({
      author: UserSchema,
    })
  ),
  total: z.number().min(0),
  totalPages: z.number().min(0),
  currentPage: z.number().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const ApproveCommentInput = z.object({
  id: z.cuid2(),
});

export const ApproveCommentOutput = CommentSchema.optional();

export const CreateTagInput = TagInsertSchema;
export const CreateTagOutput = TagSchema.optional();

export const GetTagInput = z.object({
  id: z.cuid2(),
});
export const GetTagOutput = TagSchema.optional();

export const ListTagsInput = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
});
export const ListTagsOutput = z.object({
  tags: z.array(TagSchema),
  total: z.number().min(0),
});

export const UpdateTagInput = TagUpdateSchema.extend({
  id: z.cuid2(),
});
export const UpdateTagOutput = TagSchema.optional();

export const DeleteTagInput = z.object({
  id: z.cuid2(),
});
export const DeleteTagOutput = z.object({});

export const CreateMessageInput = MessageInsertSchema;
export const CreateMessageOutput = MessageSchema.optional();

export const GetMessageInput = z.object({
  id: z.cuid2(),
});
export const GetMessageOutput = MessageSchema.optional();

export const ListMessagesInput = z.object({
  roomId: z.cuid2(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});
export const ListMessagesOutput = z.array(
  MessageSchema.pick({
    id: true,
    content: true,
    createdAt: true,
    roomId: true,
    senderId: true,
  }).extend({
    sender: z.string(),
    reactions: z.array(z.string()),
  })
);

export const UpdateMessageInput = MessageUpdateSchema.omit({
  createdAt: true,
  updatedAt: true,
  senderId: true,
}).extend({
  id: z.cuid2(),
});
export const UpdateMessageOutput = MessageSchema.optional();
export const DeleteMessageInput = z.object({
  id: z.cuid2(),
});
export const DeleteMessageOutput = z.object({});

export const CreateDMRoomInput = z.object({
  user1Id: z.string(),
  user2Id: z.string(),
});
export const CreateDMRoomOutput = RoomSchema.optional();

export const CreateRoomInput = RoomInsertSchema.pick({
  name: true,
});

export const CreateRoomOutput = RoomSchema;

export const GetRoomInput = z.object({
  id: z.cuid2(),
});
export const GetRoomOutput = RoomSchema.optional();

export const ListRoomsInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  filter: z
    .object({
      isPrivate: z.boolean().optional(),
      isDM: z.boolean().optional(),
    })
    .optional(),
});
export const ListRoomsOutput = z.object({
  rooms: z.array(RoomSchema),
  total: z.number().min(0),
});

export const UpdateRoomInput = RoomUpdateSchema.omit({
  createdAt: true,
  updatedAt: true,
  ownerId: true,
}).extend({
  id: z.cuid2(),
});
export const UpdateRoomOutput = RoomSchema.optional();

export const DeleteRoomInput = z.object({
  id: z.cuid2(),
});

export const DeleteRoomOutput = z.object({});

export const AdminSignUpInput = z.object({
  email: z.email(),
  password: z.string(),
});

export const UpdateProfileInput = z.object({
  name: z.string().optional(),
  bio: z.string().optional(),
});

export const ChangePasswordInput = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
});

export const CreateCategoryInput = CategoryInsertSchema.omit({ id: true });

export const ListBlogTagsInput = z.object({
  blogId: z.cuid2(),
});

export const CreateCommentInput = z.object({
  blogId: z.cuid2(),
  text: z.string().min(1),
});

export const CreateCommentOutput = CommentSchema.optional();

export const CreateReactionInput = z.object({
  messageId: z.cuid2(),
  emoji: z.string(),
});

export const CreateReactionOutput = ReactionSchema.optional();

export const JoinRoomInput = z.object({
  roomId: z.cuid2(),
});

export const JoinRoomOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const LeaveRoomInput = z.object({
  roomId: z.cuid2(),
});

export const LeaveRoomOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const SendMessageInput = z.object({
  roomId: z.cuid2(),
  content: z.string(),
});

export const SendMessageOutput = MessageSchema;

export const OnNewMessageInput = z.object({
  roomId: z.cuid2(),
});

export const OnNewMessageOutput = MessageSchema.pick({
  id: true,
  content: true,
  createdAt: true,
  roomId: true,
  senderId: true,
}).extend({
  sender: z.string(),
  reactions: z.array(z.string()),
});

export const OnRoomJoinInput = JoinRoomInput;

export const OnRoomJoinOutput = z.object({
  roomId: z.cuid2(),
  userId: z.string(),
  name: z.string(),
  memberCount: z.number().int().nonnegative(),
});

export const OnRoomLeaveInput = LeaveRoomInput;

export const OnRoomLeaveOutput = z.object({
  roomId: z.cuid2(),
  userId: z.string(),
  name: z.string(),
  memberCount: z.number().int().nonnegative(),
});

export const FindStrangerOutput = z.object({
  status: z.enum(["waiting", "matched", "idle"]),
});

export const SkipStrangerInput = z.object({
  roomId: z.string(),
});

export const SkipStrangerOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});
