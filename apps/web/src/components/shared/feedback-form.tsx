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
import { CreateFeedbackFormSchema } from "@/lib/schemas";
import type { CreateFeedbackFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export function FeedbackForm() {
  const queryClient = useQueryClient();

  const { mutateAsync: createFeedback, isPending } = useMutation(
    queryUtils.feedback.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Feedback submitted successfully.");

        await queryClient.refetchQueries(
          queryUtils.feedback.listUser.queryOptions({
            input: { limit: 20, offset: 0 },
          })
        );
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to submit feedback"
        );
      },
    })
  );

  const form = useForm<CreateFeedbackFormType>({
    resolver: standardSchemaResolver(CreateFeedbackFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const onSubmit: SubmitHandler<CreateFeedbackFormType> = async (values) => {
    await createFeedback({ message: values.message });
    form.reset();
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Write your feedback here..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isPending} type="submit">
          {isPending ? "Submitting..." : "Send Feedback"}
        </Button>
      </form>
    </Form>
  );
}
