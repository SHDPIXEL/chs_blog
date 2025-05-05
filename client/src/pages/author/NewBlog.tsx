import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthorLayout from "@/components/layout/AuthorLayout";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import PageHeader from "@/components/ui/PageHeader";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Eye,
  ImagePlus,
  Layout,
  Search,
  Tags,
  Users,
  Calendar,
} from "lucide-react";
import { ArticleStatus, Asset, Category, Tag, User } from "@shared/schema";
import { AssetPickerButton } from "@/components/assets";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

// Define form schema using zod
const blogFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z
    .string()
    .max(200, "Excerpt cannot exceed 200 characters")
    .optional(),
  status: z.enum([
    ArticleStatus.DRAFT,
    ArticleStatus.REVIEW,
    ArticleStatus.PUBLISHED,
  ]),
  featuredImage: z.string().optional().or(z.literal("")),
  slug: z.string().optional(),

  // Publishing options
  useScheduling: z.boolean().default(false),
  scheduledPublishAt: z.string().optional(),

  // SEO Fields
  metaTitle: z
    .string()
    .max(70, "Meta title should be at most 70 characters")
    .optional(),
  metaDescription: z
    .string()
    .max(160, "Meta description should be at most 160 characters")
    .optional(),
  canonicalUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  keywords: z.array(z.string()).default([]),

  // Relationships
  categoryIds: z.array(z.number()).default([]),
  customTags: z.array(z.string()).default([]),
  coAuthorIds: z.array(z.number()).default([]),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const NewBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Use the permissions hook to get real-time permission data
  const { canPublish, refreshPermissions } = usePermissions();

  // Also keep the permissions consistency with data refreshing
  useEffect(() => {
    // Refresh permissions data whenever component is mounted
    refreshPermissions();
  }, [refreshPermissions]);

  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [keywordInput, setKeywordInput] = useState<string>("");

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });

  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tags");
      return res.json();
    },
  });

  // Fetch other authors (for co-author selection)
  const { data: authors = [] } = useQuery<User[]>({
    queryKey: ["/api/users/authors"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/authors");
      return res.json();
    },
  });

  // Set up form with default values
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      status: ArticleStatus.DRAFT,
      featuredImage: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      keywords: [],
      categoryIds: [],
      customTags: [],
      coAuthorIds: [],
      useScheduling: false,
      scheduledPublishAt: undefined,
      slug: "",
    },
  });

  // Handle adding a keyword
  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = form.getValues("keywords") || [];
      if (!currentKeywords.includes(keywordInput.trim())) {
        form.setValue("keywords", [...currentKeywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues("keywords") || [];
    form.setValue(
      "keywords",
      currentKeywords.filter((k) => k !== keyword),
    );
  };

  // Submit mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      // Transfer custom tags to the tags field for the API
      const formattedData = {
        ...data,
        tags: data.customTags, // Send as plain string array for the server to process
        published: (data.status === ArticleStatus.PUBLISHED).toString(),
      };

      // Remove customTags as it's not in the API schema
      delete (formattedData as any).customTags;

      // Handle scheduling - only include scheduledPublishAt if useScheduling is true
      if (!formattedData.useScheduling) {
        formattedData.scheduledPublishAt = undefined;
      }

      // Always delete the useScheduling field as it's only for UI control
      delete (formattedData as any).useScheduling;

      const res = await apiRequest("POST", "/api/articles", formattedData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/articles"] });
      toast({
        title: "Blog created",
        description: `Your blog "${data.title}" has been created successfully`,
      });
      navigate("/author/blogs");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create blog",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .trim(); // Trim leading/trailing spaces
  };

  // Form submission handler
  const onSubmit = (data: BlogFormValues) => {
    // Generate slug if not provided
    const formattedData = {
      ...data,
      slug: data.slug || generateSlug(data.title),
    };

    createBlogMutation.mutate(formattedData);
  };

  // Handle asset selection for featured image
  const handleAssetSelect = (asset: Asset | Asset[]) => {
    const selectedAsset = Array.isArray(asset) ? asset[0] : asset;
    if (selectedAsset && selectedAsset.url) {
      form.setValue("featuredImage", selectedAsset.url);
      setFeaturedImagePreview(selectedAsset.url);
    }
  };

  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Create New Blog"
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate("/author/blogs")}
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>New Blog Post</CardTitle>
              <CardDescription>
                Create a new blog post to share your knowledge and insights
              </CardDescription>
            </CardHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList className="mt-2 mx-4">
                    <TabsTrigger value="content">
                      <Layout className="w-4 h-4 mr-2" />
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="scheduling">
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduling
                    </TabsTrigger>
                    <TabsTrigger value="seo">
                      <Search className="w-4 h-4 mr-2" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger
                      value="categories"
                      onClick={() => {
                        // Refresh categories list when switching to this tab
                        queryClient.invalidateQueries({
                          queryKey: ["/api/categories"],
                        });
                      }}
                    >
                      <Tags className="w-4 h-4 mr-2" />
                      Categories & Tags
                    </TabsTrigger>
                    <TabsTrigger value="coauthors">
                      <Users className="w-4 h-4 mr-2" />
                      Co-Authors
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6 px-4">
                    {/* Title field */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a compelling title"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A clear and engaging title that summarizes your blog
                            post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Featured image field */}
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image</FormLabel>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 h-40 relative">
                              {featuredImagePreview || field.value ? (
                                <>
                                  <img
                                    src={featuredImagePreview || field.value}
                                    alt="Featured image preview"
                                    className="w-full h-full object-contain"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                                    onClick={() => {
                                      field.onChange("");
                                      setFeaturedImagePreview(null);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                                  <ImagePlus className="h-12 w-12 mb-2 opacity-50" />
                                  <p className="text-sm text-center">
                                    No image selected
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center">
                              <AssetPickerButton
                                onSelect={handleAssetSelect}
                                accept="image"
                                variant="outline"
                                className="w-full"
                              >
                                Choose Featured Image
                              </AssetPickerButton>
                              <FormDescription className="mt-2">
                                Select a high-quality image that represents the
                                content of your blog post
                              </FormDescription>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Content field with Rich Text Editor */}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Write your blog content here..."
                              className="min-h-[400px]"
                            />
                          </FormControl>
                          <FormDescription>
                            Use the toolbar to format your content, add links
                            and images
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Excerpt field */}
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="A brief summary of your blog post"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A short description that appears in blog listings
                            (max 200 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status field */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ArticleStatus.DRAFT}>
                                Draft
                              </SelectItem>
                              <SelectItem value={ArticleStatus.REVIEW}>
                                Submit for Review
                              </SelectItem>
                              {canPublish && (
                                <SelectItem value={ArticleStatus.PUBLISHED}>
                                  Publish
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {!canPublish && (
                            <FormDescription className="mt-2 text-amber-500">
                              Note: You don't have direct publishing rights.
                              Submit for review to have an admin publish your
                              post.
                            </FormDescription>
                          )}

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Scheduling Tab */}
                  <TabsContent value="scheduling" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">
                        {canPublish
                          ? "Publication Scheduling"
                          : "Review Submission Scheduling"}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {canPublish
                          ? "Schedule your blog post to be published automatically at a future date and time"
                          : "Schedule your blog post for review at a future date and time"}
                      </p>
                    </div>

                    {/* Enable scheduling field */}
                    <FormField
                      control={form.control}
                      name="useScheduling"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              {canPublish
                                ? "Schedule Publication"
                                : "Schedule Review Submission"}
                            </FormLabel>
                            <FormDescription>
                              {canPublish
                                ? "Automatically publish your blog post at a scheduled date and time"
                                : "Submit your blog post for review at a scheduled date and time"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Scheduled date field */}
                    {form.watch("useScheduling") && (
                      <FormField
                        control={form.control}
                        name="scheduledPublishAt"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>
                              {canPublish
                                ? "Scheduled Publication Date"
                                : "Scheduled Review Date"}
                            </FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${!field.value ? "text-muted-foreground" : ""}`}
                                  >
                                    {field.value ? (
                                      format(new Date(field.value), "PPP p")
                                    ) : (
                                      <span>Pick a date and time</span>
                                    )}
                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <CalendarComponent
                                  mode="single"
                                  selected={
                                    field.value
                                      ? new Date(field.value)
                                      : undefined
                                  }
                                  onSelect={(date) => {
                                    if (date) {
                                      // Set time to noon by default
                                      const scheduledDate = new Date(date);
                                      scheduledDate.setHours(12, 0, 0, 0);
                                      field.onChange(
                                        scheduledDate.toISOString(),
                                      );
                                    } else {
                                      field.onChange(undefined);
                                    }
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                                <div className="border-t p-3">
                                  <div className="flex justify-between items-center">
                                    <FormLabel className="text-xs text-muted-foreground">
                                      Time
                                    </FormLabel>
                                    {field.value && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-2"
                                        onClick={() =>
                                          field.onChange(undefined)
                                        }
                                      >
                                        Clear
                                      </Button>
                                    )}
                                  </div>
                                  <div className="mt-2 flex space-x-2">
                                    <Input
                                      type="time"
                                      className="w-full"
                                      value={
                                        field.value
                                          ? format(
                                              new Date(field.value),
                                              "HH:mm",
                                            )
                                          : "12:00"
                                      }
                                      onChange={(e) => {
                                        if (field.value && e.target.value) {
                                          const [hours, minutes] =
                                            e.target.value
                                              .split(":")
                                              .map(Number);
                                          const newDate = new Date(field.value);
                                          newDate.setHours(
                                            hours,
                                            minutes,
                                            0,
                                            0,
                                          );
                                          field.onChange(newDate.toISOString());
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <FormDescription>
                              Choose a future date and time when your blog post
                              {canPublish
                                ? " will be automatically published"
                                : " will be submitted for review"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">
                        Search Engine Optimization
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Optimize your blog post for search engines to increase
                        visibility
                      </p>
                    </div>

                    {/* Meta Title field */}
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO-optimized title (if different from post title)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended length: 50-60 characters. If left blank,
                            the post title will be used.
                            <div className="text-xs mt-1">
                              {field.value
                                ? `${field.value.length}/70 characters`
                                : "0/70 characters"}
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Meta Description field */}
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description for search results"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Recommended length: 120-160 characters. If left
                            blank, the excerpt will be used.
                            <div className="text-xs mt-1">
                              {field.value
                                ? `${field.value.length}/160 characters`
                                : "0/160 characters"}
                            </div>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Keywords field */}
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords</FormLabel>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {field.value &&
                              field.value.map((keyword, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="px-2 py-1"
                                >
                                  {keyword}
                                  <button
                                    type="button"
                                    className="ml-2 text-muted-foreground hover:text-foreground"
                                    onClick={() => removeKeyword(keyword)}
                                  >
                                    ×
                                  </button>
                                </Badge>
                              ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add keyword"
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addKeyword();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={addKeyword}
                            >
                              Add
                            </Button>
                          </div>
                          <FormDescription>
                            Add keywords that describe your blog post content.
                            Press Enter or click Add after each keyword.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Categories & Tags Tab */}
                  <TabsContent value="categories" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">Categories & Tags</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Organize your content and make it easier for readers to
                        find related articles
                      </p>
                    </div>

                    {/* Categories field */}
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                            {categories.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No categories available
                              </p>
                            ) : (
                              categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    checked={field.value.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedCategories = checked
                                        ? [...field.value, category.id]
                                        : field.value.filter(
                                            (id) => id !== category.id,
                                          );
                                      field.onChange(updatedCategories);
                                    }}
                                  />
                                  <label
                                    htmlFor={`category-${category.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {category.name}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                          <FormDescription>
                            Select one or more categories for your blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Tags field - Author can add their own tags */}
                    <FormField
                      control={form.control}
                      name="customTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 mb-2 min-h-8">
                              {field.value &&
                                field.value.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-2 py-1"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      className="ml-2 text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        const newTags = [...field.value];
                                        newTags.splice(index, 1);
                                        field.onChange(newTags);
                                      }}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                              {(!field.value || field.value.length === 0) && (
                                <span className="text-sm text-muted-foreground">
                                  No tags added yet
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter a tag"
                                value={keywordInput}
                                onChange={(e) =>
                                  setKeywordInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (keywordInput.trim()) {
                                      const currentTags = field.value || [];
                                      if (
                                        !currentTags.includes(
                                          keywordInput.trim(),
                                        )
                                      ) {
                                        field.onChange([
                                          ...currentTags,
                                          keywordInput.trim(),
                                        ]);
                                      }
                                      setKeywordInput("");
                                    }
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                  if (keywordInput.trim()) {
                                    const currentTags = field.value || [];
                                    if (
                                      !currentTags.includes(keywordInput.trim())
                                    ) {
                                      field.onChange([
                                        ...currentTags,
                                        keywordInput.trim(),
                                      ]);
                                    }
                                    setKeywordInput("");
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                          <FormDescription>
                            Add your own tags to categorize your blog post.
                            Press Enter or click Add after each tag.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* Co-Authors Tab */}
                  <TabsContent value="coauthors" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">Co-Authors</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Add other authors who contributed to this content
                      </p>
                    </div>

                    {/* Co-Authors field */}
                    <FormField
                      control={form.control}
                      name="coAuthorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Authors</FormLabel>
                          <div className="border rounded-md p-4 space-y-2 max-h-60 overflow-y-auto">
                            {authors.length === 0 ? (
                              <p className="text-sm text-muted-foreground">
                                No other authors available
                              </p>
                            ) : (
                              authors.map((author) => (
                                <div
                                  key={author.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`author-${author.id}`}
                                    checked={field.value.includes(author.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedAuthors = checked
                                        ? [...field.value, author.id]
                                        : field.value.filter(
                                            (id) => id !== author.id,
                                          );
                                      field.onChange(updatedAuthors);
                                    }}
                                  />
                                  <label
                                    htmlFor={`author-${author.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {author.name}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                          <FormDescription>
                            Select one or more co-authors who contributed to
                            this blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <CardFooter className="flex justify-between mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/author/blogs")}
                  >
                    Cancel
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      variant="default"
                      disabled={createBlogMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {createBlogMutation.isPending ? "Saving..." : "Save Blog"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Preview functionality would be implemented here
                        toast({
                          title: "Preview",
                          description: "Preview functionality coming soon",
                        });
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </AuthorLayout>
  );
};

export default NewBlogPage;
