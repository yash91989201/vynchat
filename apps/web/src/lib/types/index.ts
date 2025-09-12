import type z from "zod";
import type {
  ChangePasswordFormSchema,
  CreateBlogFormSchema,
  CreateCategoryFormSchema,
  CreateCommentFormSchema,
  CreateRoomFormSchema,
  CreateTagFormSchema,
  LogInFormSchema,
  SendMessageFormSchema,
  SignUpFormSchema,
  UpdateProfileFormSchema,
} from "@/lib/schemas";

export type SignUpFormType = z.infer<typeof SignUpFormSchema>;
export type LogInFormType = z.infer<typeof LogInFormSchema>;

export type CreateBlogFormType = z.infer<typeof CreateBlogFormSchema>;

export type CreateCategoryFormType = z.infer<typeof CreateCategoryFormSchema>;
export type CreateTagFormType = z.infer<typeof CreateTagFormSchema>;
export type CreateRoomFormType = z.infer<typeof CreateRoomFormSchema>;

export type CreateCommentFormType = z.infer<typeof CreateCommentFormSchema>;

export type UpdateProfileFormType = z.infer<typeof UpdateProfileFormSchema>;
export type ChangePasswordFormType = z.infer<typeof ChangePasswordFormSchema>;

export type SendMessageFormType = z.infer<typeof SendMessageFormSchema>;

export interface ChatMessageSender {
  id: string;
  name: string | null;
  image: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  content: string;
  createdAt: Date;
  senderId: string;
  sender: ChatMessageSender;
}

export interface ChatRoom {
  id: string;
  name: string;
  isDM: boolean;
  ownerId: string;
  createdAt: Date;
  memberCount: number;
}
