import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { CreateRoomFormSchema } from "@/lib/schemas";
import type { CreateRoomFormType } from "@/lib/types";
import { queryUtils } from "@/utils/orpc";
import { Button } from "../ui/button";

export const CreateRoomForm = ({
  onCreateRoom,
}: {
  onCreateRoom: (roomId: string) => void;
}) => {
  const isMobile = useIsMobile(1024);

  const { mutateAsync: createRoom } = useMutation(
    queryUtils.user.createRoom.mutationOptions({})
  );
  const form = useForm({
    resolver: standardSchemaResolver(CreateRoomFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<CreateRoomFormType> = async (formData) => {
    const createRoomRes = await createRoom(formData);
    onCreateRoom(createRoomRes.id);
  };

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-full" variant="secondary">
            Create a room
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Create a new room</DrawerTitle>
          </DrawerHeader>
          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Discussion Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-1.5 size-4.5 animate-spin" />
                )}
                <span>Create Room</span>
              </Button>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="secondary">
          Create a room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new room</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="(e.g Movies Discussion)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-1.5 size-4.5 animate-spin" />
              )}
              <span>Create Room</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
