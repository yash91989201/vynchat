import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CreateCommentFormSchema } from "@/lib/schemas";
import type { CreateCommentFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export function CreateCommentForm({
  blogId,
}: {
  blogId: string;
  blogSlug: string;
}) {
  const queryClient = useQueryClient();

  const { mutateAsync: addComment, isPending } = useMutation(
    queryUtils.blog.createComment.mutationOptions({
      onSuccess: async () => {
        toast.success(
          "Comment added successfully. It will be visible after approval."
        );

        await queryClient.refetchQueries(
          queryUtils.blog.listComments.queryOptions({
            input: {
              blogId,
              limit: 10,
              offset: 0,
              sort: { field: "createdAt", order: "desc" },
            },
          })
        );
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<CreateCommentFormType>({
    resolver: standardSchemaResolver(CreateCommentFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit: SubmitHandler<CreateCommentFormType> = async (values) => {
    await addComment({ blogId, text: values.text });
    form.reset();
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea placeholder="Write your comment here..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          {isPending ? "Submitting..." : "Submit Comment"}
        </Button>
      </form>
    </Form>
  );
}
