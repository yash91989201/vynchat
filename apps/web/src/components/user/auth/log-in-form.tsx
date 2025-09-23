import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Link, useNavigate } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FacebookSignInButton } from "@/components/shared/auth/facebook-sign-in-button";
import { GoogleSignInButton } from "@/components/shared/auth/google-sign-in-button";
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
import { LogInFormSchema } from "@/lib/schemas";
import type { LogInFormType } from "@/lib/types";

export const LogInForm = () => {
  const navigate = useNavigate({ from: "/" });
  const form = useForm<LogInFormType>({
    resolver: standardSchemaResolver(LogInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LogInFormType> = async (values) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("Sign in successful");
          navigate({ to: "/chat" });
        },
        onError: (error) => {
          toast.error(error.error.message || error.error.statusText);
        },
      }
    );
  };

  return (
    <Card className="w-full max-w-md shadow-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-bold text-2xl">Welcome Back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-right">
              <Link
                className="text-muted-foreground text-sm underline underline-offset-2 hover:text-primary"
                to="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging In" : "Log In"}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">
              Or sign in with Google
            </span>
          </div>
        </div>

        <GoogleSignInButton />
        <FacebookSignInButton />
      </CardContent>

      <CardFooter className="flex flex-col">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link className={buttonVariants({ variant: "link" })} to="/sign-up">
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};
