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
import { CreateCategoryFormSchema } from "@/lib/schemas";
import type { CreateCategoryFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const CreateCategoryForm = () => {
  const { refetch } = useSuspenseQuery(
    queryUtils.admin.listCategories.queryOptions({})
  );

  const { mutateAsync: createCategory } = useMutation(
    queryUtils.admin.createCategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Category created successfully");
        await refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<CreateCategoryFormType>({
    resolver: standardSchemaResolver(CreateCategoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<CreateCategoryFormType> = async (values) => {
    await createCategory(values);
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
                <Input placeholder="New Category" {...field} />
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
