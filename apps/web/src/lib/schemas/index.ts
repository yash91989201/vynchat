import z from "zod";

const KEBAB_CASE_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const SignUpFormSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const LogInFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const CreateBlogFormSchema = z.object({
  title: z.string(),
  slug: z.string().refine(
    (slug) => {
      return KEBAB_CASE_REGEX.test(slug);
    },
    {
      message:
        "Slug must be in kebab-case format (lowercase letters, numbers, and hyphens only)",
    }
  ),
  body: z.string(),
  authorId: z.string(),
  categoryId: z.cuid2(),
  tldr: z.string(),
  excerpt: z.string(),
  imageUrl: z.string(),
  tags: z
    .array(z.object({ id: z.cuid2() }))
    .min(1, "At least 1 tag is required"),
});

export const CreateCategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const CreateTagFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const CreateCommentFormSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty."),
});

export const CreateFeedbackFormSchema = z.object({
  message: z.string().min(1, "Feedback cannot be empty."),
});

export const UpdateProfileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().optional(),
});

export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const SendMessageFormSchema = z.object({
  roomId: z.string(),
  message: z.string().min(1),
});

export const CreateRoomFormSchema = z.object({
  name: z.string().min(3).max(90),
});
