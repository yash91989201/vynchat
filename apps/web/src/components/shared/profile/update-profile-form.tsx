import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FacebookSignInButton } from "@/components/shared/auth/facebook-sign-in-button";
import { GoogleSignInButton } from "@/components/shared/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UpdateProfileFormSchema } from "@/lib/schemas";
import type { UpdateProfileFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const UpdateProfileForm = () => {
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const isAnonymous = session.user?.isAnonymous ?? false;

  const { data: bio } = useSuspenseQuery(
    queryUtils.user.getBio.queryOptions({})
  );

  const { mutateAsync: updateProfile } = useMutation(
    queryUtils.user.updateProfile.mutationOptions({
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<UpdateProfileFormType>({
    resolver: standardSchemaResolver(UpdateProfileFormSchema),
    defaultValues: {
      name: session.user.name,
      bio,
    },
  });

  const onSubmit: SubmitHandler<UpdateProfileFormType> = async (values) => {
    await updateProfile(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us about yourself" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>Update Profile</Button>
        {isAnonymous && (
          <div className="flex max-w-md flex-col gap-3">
            <h3>Link your account</h3>
            <GoogleSignInButton />
            <FacebookSignInButton />
          </div>
        )}
      </form>
    </Form>
  );
};
