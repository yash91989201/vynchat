import type { z } from "zod";
import type {
  AccountInsertSchema,
  AccountSchema,
  ApproveCommentInput,
  ApproveCommentOutput,
  BlogInsertSchema,
  BlogSchema,
  CategoryInsertSchema,
  CategorySchema,
  CategoryUpdateSchema,
  CommentInsertSchema,
  CommentSchema,
  CreateBlogInput,
  CreateBlogOutput,
  CreateCategoryInput,
  CreateMessageInput,
  CreateMessageOutput,
  CreateRoomInput,
  CreateRoomOutput,
  CreateTagInput,
  CreateTagOutput,
  DeleteBlogInput,
  DeleteBlogOutput,
  DeleteMessageInput,
  DeleteMessageOutput,
  DeleteRoomInput,
  DeleteRoomOutput,
  DeleteTagInput,
  DeleteTagOutput,
  GetBlogInput,
  GetBlogOutput,
  GetMessageInput,
  GetMessageOutput,
  GetRoomInput,
  GetRoomOutput,
  GetTagInput,
  GetTagOutput,
  ListBlogCommentsInput,
  ListBlogCommentsOutput,
  ListBlogsInput,
  ListBlogsOutput,
  ListMessagesInput,
  ListMessagesOutput,
  ListRoomsInput,
  ListRoomsOutput,
  ListTagsInput,
  ListTagsOutput,
  MessageInsertSchema,
  MessageSchema,
  ReactionSchema,
  RoomInsertSchema,
  RoomMembersInsertSchema,
  RoomSchema,
  SessionInsertSchema,
  SessionSchema,
  TagInsertSchema,
  TagSchema,
  TagUpdateSchema,
  UpdateBlogInput,
  UpdateBlogOutput,
  UpdateMessageInput,
  UpdateMessageOutput,
  UpdateRoomInput,
  UpdateRoomOutput,
  UpdateTagInput,
  UpdateTagOutput,
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
export type MessageType = z.infer<typeof MessageSchema>;
export type BlogType = z.infer<typeof BlogSchema>;
export type RoomType = z.infer<typeof RoomSchema>;
export type UserFollowersType = z.infer<typeof UserFollowersSchema>;
export type UserFollowingType = z.infer<typeof UserFollowingSchema>;
export type TagType = z.infer<typeof TagSchema>;
export type CategoryType = z.infer<typeof CategorySchema>;
export type ReactionType = z.infer<typeof ReactionSchema>;

export type UserInsertType = z.infer<typeof UserInsertSchema>;
export type SessionInsertType = z.infer<typeof SessionInsertSchema>;
export type AccountInsertType = z.infer<typeof AccountInsertSchema>;
export type VerificationInsertType = z.infer<typeof VerificationInsertSchema>;
export type CommentInsertType = z.infer<typeof CommentInsertSchema>;
export type MessageInsertType = z.infer<typeof MessageInsertSchema>;
export type BlogInsertType = z.infer<typeof BlogInsertSchema>;
export type RoomInsertType = z.infer<typeof RoomInsertSchema>;
export type RoomMembersInsertType = z.infer<typeof RoomMembersInsertSchema>;
export type UserFollowersInsertType = z.infer<typeof UserFollowersInsertSchema>;
export type UserFollowingInsertType = z.infer<typeof UserFollowingInsertSchema>;
export type TagInsertType = z.infer<typeof TagInsertSchema>;
export type CategoryInsertType = z.infer<typeof CategoryInsertSchema>;
export type TagUpdateType = z.infer<typeof TagUpdateSchema>;
export type CategoryUpdateType = z.infer<typeof CategoryUpdateSchema>;

export type CreateBlogType = z.infer<typeof CreateBlogInput>;
export type CreateBlogOutputType = z.infer<typeof CreateBlogOutput>;
export type GetBlogType = z.infer<typeof GetBlogInput>;
export type GetBlogOutputType = z.infer<typeof GetBlogOutput>;
export type ListBlogsType = z.infer<typeof ListBlogsInput>;
export type ListBlogsOutputType = z.infer<typeof ListBlogsOutput>;
export type UpdateBlogType = z.infer<typeof UpdateBlogInput>;
export type UpdateBlogOutputType = z.infer<typeof UpdateBlogOutput>;
export type DeleteBlogType = z.infer<typeof DeleteBlogInput>;
export type DeleteBlogOutputType = z.infer<typeof DeleteBlogOutput>;

export type ListBlogCommentsType = z.infer<typeof ListBlogCommentsInput>;
export type ListBlogCommentsOutputType = z.infer<typeof ListBlogCommentsOutput>;
export type ApproveCommentType = z.infer<typeof ApproveCommentInput>;
export type ApproveCommentOutputType = z.infer<typeof ApproveCommentOutput>;

export type CreateTagType = z.infer<typeof CreateTagInput>;
export type CreateTagOutputType = z.infer<typeof CreateTagOutput>;
export type GetTagType = z.infer<typeof GetTagInput>;
export type GetTagOutputType = z.infer<typeof GetTagOutput>;
export type ListTagsType = z.infer<typeof ListTagsInput>;
export type ListTagsOutputType = z.infer<typeof ListTagsOutput>;
export type UpdateTagType = z.infer<typeof UpdateTagInput>;
export type UpdateTagOutputType = z.infer<typeof UpdateTagOutput>;
export type DeleteTagType = z.infer<typeof DeleteTagInput>;
export type DeleteTagOutputType = z.infer<typeof DeleteTagOutput>;

export type CreateCategoryType = z.infer<typeof CategoryInsertSchema>;

export type CreateMessageType = z.infer<typeof CreateMessageInput>;
export type CreateMessageOutputType = z.infer<typeof CreateMessageOutput>;
export type GetMessageType = z.infer<typeof GetMessageInput>;
export type GetMessageOutputType = z.infer<typeof GetMessageOutput>;
export type ListMessagesType = z.infer<typeof ListMessagesInput>;
export type ListMessagesOutputType = z.infer<typeof ListMessagesOutput>;
export type UpdateMessageType = z.infer<typeof UpdateMessageInput>;
export type UpdateMessageOutputType = z.infer<typeof UpdateMessageOutput>;
export type DeleteMessageType = z.infer<typeof DeleteMessageInput>;
export type DeleteMessageOutputType = z.infer<typeof DeleteMessageOutput>;

export type CreateRoomType = z.infer<typeof CreateRoomInput>;
export type CreateRoomOutputType = z.infer<typeof CreateRoomOutput>;
export type GetRoomType = z.infer<typeof GetRoomInput>;
export type GetRoomOutputType = z.infer<typeof GetRoomOutput>;
export type ListRoomsType = z.infer<typeof ListRoomsInput>;
export type ListRoomsOutputType = z.infer<typeof ListRoomsOutput>;
export type UpdateRoomType = z.infer<typeof UpdateRoomInput>;
export type UpdateRoomOutputType = z.infer<typeof UpdateRoomOutput>;
export type DeleteRoomType = z.infer<typeof DeleteRoomInput>;
export type DeleteRoomOutputType = z.infer<typeof DeleteRoomOutput>;

export type CreateCategoryInputType = z.infer<typeof CreateCategoryInput>;
