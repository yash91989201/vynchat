import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import {
  Check,
  ChevronsUpDown,
  ExternalLink,
  Loader2,
  Lock,
  Rss,
  Unlock,
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
  FormDescription,
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
import { supabase } from "@/lib/supabase";
import type { CreateBlogFormType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/utils";
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
      formState: {
        slugLocked: true,
        image: undefined,
      },
    },
  });

  const slugLocked = form.watch("formState.slugLocked");

  const onSubmit: SubmitHandler<CreateBlogFormType> = async (values) => {
    let imageUrl = values.imageUrl;

    if (values.formState.image) {
      const file = values.formState.image;
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-image")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Image upload failed: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("blog-image")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    await createBlog({
      ...values,
      imageUrl,
    });
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
                <Input
                  placeholder="Blog title"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);

                    if (slugLocked) {
                      const newSlug = generateSlug(e.target.value || "");
                      form.setValue("slug", newSlug, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }
                  }}
                />
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
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      placeholder="blog-slug"
                      {...field}
                      disabled={!!slugLocked}
                      onChange={(e) => {
                        if (!slugLocked) {
                          field.onChange(e);
                        }
                      }}
                    />
                  </div>
                  <Button
                    aria-label={slugLocked ? "Unlock slug" : "Lock slug"}
                    onClick={() => {
                      const nextLocked = !slugLocked;

                      if (nextLocked) {
                        const newSlug = generateSlug(
                          form.getValues("title") || ""
                        );
                        form.setValue("slug", newSlug, {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }

                      form.setValue("formState.slugLocked", nextLocked, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                    size="icon"
                    type="button"
                    variant="outline"
                  >
                    {slugLocked ? <Lock size={16} /> : <Unlock size={16} />}
                  </Button>
                </div>
              </FormControl>
              <FormDescription>
                This will be used in the URL of your blog post. Only a-z, 0-9
                and - are allowed.
              </FormDescription>
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
              <FormLabel>TLDR (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  {...field}
                  placeholder="Too long; didn't read (optional)"
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
              <FormLabel>Excerpt (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short description (optional)"
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="formState.image"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Upload Image</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                    type="file"
                    {...field}
                    className="h-12 file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:font-medium file:text-primary-foreground file:text-sm hover:file:bg-primary/80"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Upload an image file for your blog post.{" "}
              </FormDescription>
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
