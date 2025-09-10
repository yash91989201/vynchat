import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Loader2,
  Rss,
} from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateBlogFormSchema } from "@/lib/schemas";
import type { CreateBlogFormType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { queryUtils } from "@/utils/orpc";
import { TipTap } from "./tip-tap";

export const CreateBlogForm = () => {
  const navigate = useNavigate();
  const { session } = useRouteContext({
    from: "/(authenticated)",
  });

  const { data: tags } = useSuspenseQuery(
    queryUtils.admin.listTags.queryOptions({})
  );

  const { data: categories } = useSuspenseQuery(
    queryUtils.admin.listCategories.queryOptions({})
  );

  const { mutateAsync: createBlog } = useMutation(
    queryUtils.admin.createBlog.mutationOptions({
      onSuccess: () => {
        toast.success("Blog created successfully");

        navigate({
          to: "/admin/dashboard/blogs",
        });
      },
      onError: () => {
        toast.error("Failed to create blog. Please try again.");
      },
    })
  );

  const form = useForm<CreateBlogFormType>({
    resolver: standardSchemaResolver(CreateBlogFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      body: "",
      authorId: session.user.id,
      categoryId: "",
      tldr: "",
      excerpt: "",
      imageUrl: "",
      tags: [],
    },
  });

  const onSubmit: SubmitHandler<CreateBlogFormType> = async (values) => {
    await createBlog(values);
  };

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Blog title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="blog-slug" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select defaultValue={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <Link
                      className={buttonVariants({
                        variant: "link",
                        className: "w-full",
                      })}
                      to="/admin/dashboard/categories"
                    >
                      <ExternalLink className="size-4" />
                      Create Category
                    </Link>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tags</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      role="combobox"
                      variant="outline"
                    >
                      Select tags
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search tags..." />
                    <CommandEmpty>No tags available</CommandEmpty>
                    <CommandEmpty asChild>
                      <Link
                        className={buttonVariants({
                          variant: "link",
                          className: "w-full",
                        })}
                        to="/admin/dashboard/tags"
                      >
                        <ExternalLink className="size-4" />
                        Create Tag
                      </Link>
                    </CommandEmpty>
                    <CommandGroup>
                      {tags?.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            form.setValue(
                              "tags",
                              field.value.some((t) => t.id === tag.id)
                                ? field.value.filter((t) => t.id !== tag.id)
                                : [...field.value, { id: tag.id }]
                            );
                          }}
                          value={tag.name}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value.some((t) => t.id === tag.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Body</FormLabel>
              <FormControl>
                <TipTap onChange={field.onChange} text={field.value} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tldr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>TLDR</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  {...field}
                  placeholder="Too long; didn't read"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt</FormLabel>
              <FormControl>
                <Textarea placeholder="Short description" {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 size-4.5 animate-spin" />
          ) : (
            <Rss className="mr-2 size-4.5" />
          )}
          <span>Create Blog</span>
        </Button>
      </form>
    </Form>
  );
};
