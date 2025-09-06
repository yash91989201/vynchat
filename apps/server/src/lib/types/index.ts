import type { z } from "zod";
import type {
  AccountInsertSchema,
  AccountSchema,
  BlogInsertSchema,
  BlogSchema,
  CommentInsertSchema,
  CommentSchema,
  CreateBlogInput,
  CreateBlogOutput,
  GetBlogInput,
  GetBlogOutput,
  LikeInsertSchema,
  LikeSchema,
  ListBlogsInput,
  ListBlogsOutput,
  MessageInsertSchema,
  MessageSchema,
  RoomBannedInsertSchema,
  RoomBannedSchema,
  RoomInsertSchema,
  RoomMembersInsertSchema,
  RoomMembersSchema,
  RoomModeratorsInsertSchema,
  RoomModeratorsSchema,
  RoomSchema,
  SessionInsertSchema,
  SessionSchema,
  UserFollowersInsertSchema,
  UserFollowersSchema,
  UserFollowingInsertSchema,
  UserFollowingSchema,
  UserInsertSchema,
  UserSchema,
  VerificationInsertSchema,
  VerificationSchema,
} from "../schemas";

export type UserType = z.infer<typeof UserSchema>;
export type SessionType = z.infer<typeof SessionSchema>;
export type AccountType = z.infer<typeof AccountSchema>;
export type VerificationType = z.infer<typeof VerificationSchema>;
export type CommentType = z.infer<typeof CommentSchema>;
export type LikeType = z.infer<typeof LikeSchema>;
export type MessageType = z.infer<typeof MessageSchema>;
export type PostType = z.infer<typeof BlogSchema>;
export type RoomType = z.infer<typeof RoomSchema>;
export type RoomBannedType = z.infer<typeof RoomBannedSchema>;
export type RoomMembersType = z.infer<typeof RoomMembersSchema>;
export type RoomModeratorsType = z.infer<typeof RoomModeratorsSchema>;
export type UserFollowersType = z.infer<typeof UserFollowersSchema>;
export type UserFollowingType = z.infer<typeof UserFollowingSchema>;

export type UserInsertType = z.infer<typeof UserInsertSchema>;
export type SessionInsertType = z.infer<typeof SessionInsertSchema>;
export type AccountInsertType = z.infer<typeof AccountInsertSchema>;
export type VerificationInsertType = z.infer<typeof VerificationInsertSchema>;
export type CommentInsertType = z.infer<typeof CommentInsertSchema>;
export type LikeInsertType = z.infer<typeof LikeInsertSchema>;
export type MessageInsertType = z.infer<typeof MessageInsertSchema>;
export type PostInsertType = z.infer<typeof BlogInsertSchema>;
export type RoomInsertType = z.infer<typeof RoomInsertSchema>;
export type RoomBannedInsertType = z.infer<typeof RoomBannedInsertSchema>;
export type RoomMembersInsertType = z.infer<typeof RoomMembersInsertSchema>;
export type RoomModeratorsInsertType = z.infer<
  typeof RoomModeratorsInsertSchema
>;
export type UserFollowersInsertType = z.infer<typeof UserFollowersInsertSchema>;
export type UserFollowingInsertType = z.infer<typeof UserFollowingInsertSchema>;

export type CreatePostType = z.infer<typeof CreateBlogInput>;
export type CreatePostOutputType = z.infer<typeof CreateBlogOutput>;
export type GetPostType = z.infer<typeof GetBlogInput>;
export type GetPostOutputType = z.infer<typeof GetBlogOutput>;
export type ListPostsType = z.infer<typeof ListBlogsInput>;
export type ListPostsOutputType = z.infer<typeof ListBlogsOutput>;
