import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { orpcClient } from "@/utils/orpc";

const ForgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

export const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const form = useForm<ForgotPasswordType>({
    resolver: standardSchemaResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordType> = async (values) => {
    try {
      // First check if email exists in the database
      const emailCheck = await orpcClient.user.checkEmailExists({
        email: values.email,
      });

      if (!emailCheck.exists) {
        form.setError("email", {
          message:
            "No account found with this email address. Please check your email or create a new account.",
        });
        return;
      }

      // If email exists, proceed with password reset
      await authClient.forgetPassword(
        {
          email: values.email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onSuccess: () => {
            toast.success("Password reset link sent! Check your email.");
            navigate({ to: "/log-in" });
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Failed to send reset email");
          },
        }
      );
    } catch (error) {
      console.error("Error in forgot password flow:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-bold text-2xl">Forgot Password?</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex flex-col">
        <p className="text-muted-foreground text-sm">
          Remember your password?{" "}
          <Link className={buttonVariants({ variant: "link" })} to="/log-in">
            Back to Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
