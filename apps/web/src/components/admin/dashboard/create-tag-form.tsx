import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import { CreateTagFormSchema } from "@/lib/schemas";
import type { CreateTagFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const CreateTagForm = () => {
  const { refetch } = useSuspenseQuery(
    queryUtils.admin.listTags.queryOptions({})
  );

  const { mutateAsync: createTag } = useMutation(
    queryUtils.admin.createTag.mutationOptions({
      onSuccess: async () => {
        toast.success("Tag created successfully");
        await refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<CreateTagFormType>({
    resolver: standardSchemaResolver(CreateTagFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<CreateTagFormType> = async (values) => {
    await createTag(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form
        className="flex items-end gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Tag name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};
