import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateRoomFormSchema } from "@/lib/schemas";
import type { CreateRoomFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";

export const CreateRoomForm = () => {
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const { refetch } = useSuspenseQuery(
    queryUtils.admin.listRooms.queryOptions({})
  );

  const { mutateAsync: createRoom } = useMutation(
    queryUtils.admin.createRoom.mutationOptions({
      onSuccess: async () => {
        toast.success("Room created successfully");
        await refetch();
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const form = useForm<CreateRoomFormType>({
    resolver: standardSchemaResolver(CreateRoomFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  const onSubmit: SubmitHandler<CreateRoomFormType> = async (values) => {
    await createRoom({
      ...values,
      ownerId: session.user.id,
    });
    form.reset();
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
                <Input placeholder="Room name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Room description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  className="border-primary"
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Public</FormLabel>
                <FormDescription>
                  Make this room public so that guests can join it.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};
