import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/(auth)/reset-password" });

  const form = useForm<ResetPasswordType>({
    resolver: standardSchemaResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordType> = async (values) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    await authClient.resetPassword(
      {
        token,
        newPassword: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Password reset successfully! You can now log in.");
          navigate({ to: "/log-in" });
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to reset password");
        },
      }
    );
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-bold text-2xl">Invalid Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-bold text-2xl">Reset Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

