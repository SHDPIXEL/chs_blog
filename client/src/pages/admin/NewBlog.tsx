import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layouts/AdminLayout";
import { AssetPickerButton } from "@/components/assets";
import { Asset } from "@shared/schema";
import { z } from "zod";
import {
  ArticleStatus,
  extendedArticleSchema,
  Category,
  Tag,
  User,
} from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageHeader from "@/components/ui/PageHeader";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import BlogPreviewDialog from "@/components/blog/BlogPreviewDialog";
import {
  ArrowLeft,
  ImagePlus,
  Layout,
  Search,
  Tags,
  Users,
  Save,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";

// Custom article schema for admin (simplified options)
// Custom article schema with strict validation
const adminArticleSchema = extendedArticleSchema.extend({
  // Admin can only set to draft or published, not review
  status: z
    .enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED])
    .default(ArticleStatus.DRAFT),
  // Custom tags field for dynamic tag entry
  customTags: z.array(z.string()).default([]),
  // Add authorId field to the schema that's required
  authorId: z.number().optional(), // Make it optional in schema, but we'll add it before submission
  // Add more specific validations
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters"),
  content: z
    .string()
    .min(50, "Content must be at least 50 characters"),
  excerpt: z
    .string()
    .max(200, "Excerpt cannot exceed 200 characters")
    .optional(),
});

const NewBlog: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  // Get categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });

  // Get tags
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tags");
      return res.json();
    },
  });

  // Get authors for co-author selection
  const { data: authors } = useQuery({
    queryKey: ["/api/users/authors"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/authors");
      return res.json();
    },
  });

  // Set up form with admin's ID as the authorId
  const form = useForm<z.infer<typeof adminArticleSchema>>({
    resolver: zodResolver(adminArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      slug: "", // Add default slug
      status: ArticleStatus.DRAFT,
      categoryIds: [],
      tagIds: [],
      coAuthorIds: [],
      keywords: [],
      metaTitle: "",
      metaDescription: "",
      customTags: [],
      authorId: user?.id ? Number(user.id) : undefined, // Set admin's ID as the authorId default value and ensure it's a number
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof adminArticleSchema>) => {
      // Admin automatically becomes the author - ensure we convert to number
      const articleData = {
        ...values,
        authorId: user?.id ? Number(user.id) : undefined,
        featuredImage,
        // For admin, published is set based on status
        published:  (values.status === ArticleStatus.PUBLISHED).toString(),
        // Convert customTags to the expected tags format for the API
        tags: values.customTags,
      };

      // Remove customTags as it's not in the API schema
      delete (articleData as any).customTags;

      const res = await apiRequest("POST", "/api/articles", articleData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      navigate("/admin/blogs");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create blog post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Preview functionality
  const handlePreview = () => {
    const formValues = form.getValues();
    if (editorRef.current) {
      // Get latest content from editor
      formValues.content = editorRef.current.getHTML();
    }
    setPreviewOpen(true);
  };

  // Modified submit to handle scheduling
  const onSubmit = (values: z.infer<typeof adminArticleSchema>) => {
    console.log("Form submitted with values:", values);
    
    // Get the content from Tiptap editor
    if (editorRef.current) {
      values.content = editorRef.current.getHTML();
    }

    // Make sure we have a user ID for the author
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to get user ID. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a slug from the title if not provided
    if (!values.slug && values.title) {
      values.slug = values.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Always set the authorId value before validation - ensure it's a number
    form.setValue("authorId", Number(user.id));
    
    // Add scheduling data if needed
    const articleData = {
      ...values,
      authorId: Number(user.id), // Now guaranteed to be defined - set it explicitly as a number
      featuredImage,
      // For admin, published is set based on status
      published: values.status === ArticleStatus.PUBLISHED && !useScheduling,
      // Convert customTags to the expected tags format for the API
      tags: values.customTags,
    };

    // Add scheduling information if enabled
    if (
      useScheduling &&
      scheduledPublishAt &&
      values.status === ArticleStatus.PUBLISHED
    ) {
      articleData.scheduledPublishAt = scheduledPublishAt;
      // When scheduling, status is published but published flag is false
      articleData.published = false;
    }

    // Remove customTags as it's not in the API schema
    delete (articleData as any).customTags;

    createArticleMutation.mutate(articleData);
  };

  const [keywordInput, setKeywordInput] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [useScheduling, setUseScheduling] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<
    string | undefined
  >(undefined);

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

  // Handle adding a custom tag
  const addCustomTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("customTags") || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("customTags", [...currentTags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  // Handle removing a custom tag
  const removeCustomTag = (tag: string) => {
    const currentTags = form.getValues("customTags") || [];
    form.setValue(
      "customTags",
      currentTags.filter((t) => t !== tag),
    );
  };

  // Add this to debug form validation errors
  console.log("Form errors:", form.formState.errors);
  console.log("Form is valid:", form.formState.isValid);
  console.log("Form is submitting:", form.formState.isSubmitting);
  console.log("Form is dirty:", form.formState.isDirty);

  return (
    <AdminLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Create New Blog"
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate("/admin/blogs")}
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>New Blog Post</CardTitle>
              <CardDescription>
                Create a new blog post to share with your audience
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
                    <TabsTrigger value="seo">
                      <Search className="w-4 h-4 mr-2" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger value="categories">
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
                    {/* Hidden authorId field - will be set by the admin's user ID */}
                    <FormField
                      control={form.control}
                      name="authorId"
                      render={({ field }) => (
                        <input 
                          type="hidden" 
                          {...field} 
                          value={user?.id ? Number(user.id) : 0} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    
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
                      render={() => (
                        <FormItem>
                          <FormLabel>Featured Image</FormLabel>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 h-40 relative">
                              {featuredImage ? (
                                <>
                                  <img
                                    src={featuredImage}
                                    alt="Featured image preview"
                                    className="w-full h-full object-contain"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                                    onClick={() => {
                                      setFeaturedImage(null);
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
                                onSelect={(asset) => {
                                  // Handle both single asset and array of assets
                                  const selectedAsset = Array.isArray(asset) ? asset[0] : asset;
                                  if (selectedAsset?.url) {
                                    setFeaturedImage(selectedAsset.url);
                                  }
                                }}
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
                              className="min-h-[400px] max-h-[600px]" 
                              ref={editorRef}
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
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Reset scheduling when changing to draft
                              if (value === ArticleStatus.DRAFT) {
                                setUseScheduling(false);
                              }
                            }}
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
                              <SelectItem value={ArticleStatus.PUBLISHED}>
                                Publish
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Scheduling option - only show when status is published */}
                    {form.watch("status") === ArticleStatus.PUBLISHED && (
                      <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-primary" />
                              <h3 className="text-sm font-medium">
                                Schedule Publication
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Choose when this blog post should be published
                            </p>
                          </div>
                          <Checkbox
                            checked={useScheduling}
                            onCheckedChange={(checked) => {
                              setUseScheduling(checked === true);
                              if (checked && !scheduledPublishAt) {
                                // Set default scheduled time to tomorrow
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
                                setScheduledPublishAt(tomorrow.toISOString());
                              }
                            }}
                          />
                        </div>

                        {useScheduling && (
                          <div className="pt-2 space-y-3">
                            <div className="grid gap-2">
                              <label className="text-xs font-medium">
                                Publication Date & Time
                              </label>

                              <div className="flex items-center space-x-2">
                                {/* Date picker */}
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant={"outline"}
                                      className="justify-start text-left font-normal flex-1"
                                      type="button"
                                    >
                                      <Calendar className="mr-2 h-4 w-4" />
                                      {scheduledPublishAt ? (
                                        format(
                                          new Date(scheduledPublishAt),
                                          "PPP",
                                        )
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                  >
                                    <CalendarComponent
                                      mode="single"
                                      initialFocus
                                      selected={
                                        scheduledPublishAt
                                          ? new Date(scheduledPublishAt)
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        if (date) {
                                          // Keep the time from the existing date if we have one
                                          const currentDate = scheduledPublishAt
                                            ? new Date(scheduledPublishAt)
                                            : new Date();
                                          date.setHours(
                                            currentDate.getHours(),
                                            currentDate.getMinutes(),
                                            0,
                                            0,
                                          );
                                          setScheduledPublishAt(
                                            date.toISOString(),
                                          );
                                        }
                                      }}
                                    />
                                  </PopoverContent>
                                </Popover>

                                {/* Time picker */}
                                <div className="relative">
                                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    type="time"
                                    className="pl-10"
                                    value={
                                      scheduledPublishAt
                                        ? format(
                                            new Date(scheduledPublishAt),
                                            "HH:mm",
                                          )
                                        : "09:00"
                                    }
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        const [hours, minutes] = e.target.value
                                          .split(":")
                                          .map(Number);
                                        const newDate = scheduledPublishAt
                                          ? new Date(scheduledPublishAt)
                                          : new Date();
                                        newDate.setHours(hours, minutes, 0, 0);
                                        setScheduledPublishAt(
                                          newDate.toISOString(),
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground mt-1">
                                The blog will be automatically published at the
                                specified date and time (IST).
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">
                        Search Engine Optimization
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Optimize your blog post for search engines to improve
                        visibility
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Title that appears in search engines"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optimal length: 50-60 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description that appears in search results"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optimal length: 150-160 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2">
                      <FormLabel>Keywords</FormLabel>
                      <div className="flex">
                        <Input
                          placeholder="Add keyword..."
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addKeyword();
                            }
                          }}
                          className="rounded-r-none"
                        />
                        <Button
                          type="button"
                          onClick={addKeyword}
                          variant="secondary"
                          className="rounded-l-none"
                        >
                          Add
                        </Button>
                      </div>
                      <FormDescription>
                        Press Enter to add a keyword. These help categorize your
                        content.
                      </FormDescription>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.getValues("keywords")?.map((keyword, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {keyword}
                            <button
                              type="button"
                              onClick={() => removeKeyword(keyword)}
                              className="text-xs rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 h-4 w-4 inline-flex items-center justify-center"
                            >
                              &times;
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Categories & Tags Tab */}
                  <TabsContent value="categories" className="space-y-6 px-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-medium mb-3">
                          Categories
                        </h3>
                        <ScrollArea className="h-[300px] border rounded-md p-4">
                          <div className="space-y-2">
                            {categories ? (
                              categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-start space-x-2"
                                >
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    onCheckedChange={(checked) => {
                                      const currentCategoryIds =
                                        form.getValues("categoryIds") || [];
                                      if (checked) {
                                        form.setValue("categoryIds", [
                                          ...currentCategoryIds,
                                          category.id,
                                        ]);
                                      } else {
                                        form.setValue(
                                          "categoryIds",
                                          currentCategoryIds.filter(
                                            (id) => id !== category.id,
                                          ),
                                        );
                                      }
                                    }}
                                    checked={form
                                      .getValues("categoryIds")
                                      ?.includes(category.id)}
                                  />
                                  <label
                                    htmlFor={`category-${category.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {category.name}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                Loading categories...
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      <div>
                        <h3 className="text-base font-medium mb-3">Tags</h3>

                        {/* Custom Tags Input */}
                        <FormField
                          control={form.control}
                          name="customTags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Add Custom Tags</FormLabel>
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
                                          onClick={() => removeCustomTag(tag)}
                                        >
                                          ×
                                        </button>
                                      </Badge>
                                    ))}
                                  {(!field.value ||
                                    field.value.length === 0) && (
                                    <span className="text-sm text-muted-foreground">
                                      No tags added yet
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Enter a tag"
                                    value={tagInput}
                                    onChange={(e) =>
                                      setTagInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addCustomTag();
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={addCustomTag}
                                  >
                                    Add Tag
                                  </Button>
                                </div>
                                <FormDescription>
                                  Enter custom tags for your blog post. Press
                                  Enter or click Add Tag to add each tag.
                                </FormDescription>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Existing Tags Selection */}
                        <div className="mt-6">
                          <FormLabel className="text-base font-medium mb-3">
                            Or Select from Existing Tags
                          </FormLabel>
                          <FormField
                            control={form.control}
                            name="tagIds"
                            render={() => (
                              <FormItem>
                                <ScrollArea className="h-[200px] border rounded-md p-4">
                                  <div className="space-y-2">
                                    {tags ? (
                                      tags.map((tag) => (
                                        <div
                                          key={tag.id}
                                          className="flex items-start space-x-2"
                                        >
                                          <Checkbox
                                            id={`tag-${tag.id}`}
                                            onCheckedChange={(checked) => {
                                              const currentTagIds =
                                                form.getValues("tagIds") || [];
                                              if (checked) {
                                                form.setValue("tagIds", [
                                                  ...currentTagIds,
                                                  tag.id,
                                                ]);
                                              } else {
                                                form.setValue(
                                                  "tagIds",
                                                  currentTagIds.filter(
                                                    (id) => id !== tag.id,
                                                  ),
                                                );
                                              }
                                            }}
                                            checked={form
                                              .getValues("tagIds")
                                              ?.includes(tag.id)}
                                          />
                                          <label
                                            htmlFor={`tag-${tag.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                          >
                                            {tag.name}
                                          </label>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-muted-foreground">
                                        Loading tags...
                                      </p>
                                    )}
                                  </div>
                                </ScrollArea>
                                <FormDescription>
                                  Select tags that are relevant to your blog
                                  post
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Co-Authors Tab */}
                  <TabsContent value="coauthors" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">Co-Authors</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add other authors who contributed to this blog post
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="coAuthorIds"
                      render={() => (
                        <FormItem>
                          <ScrollArea className="h-[300px] border rounded-md p-4">
                            <div className="space-y-3">
                              {authors ? (
                                authors
                                  .filter((author: { id: number }) => author.id !== user?.id) // Exclude current user
                                  .map((author: { id: number, name: string, email: string }) => (
                                    <div
                                      key={author.id}
                                      className="flex items-start space-x-2"
                                    >
                                      <Checkbox
                                        id={`author-${author.id}`}
                                        onCheckedChange={(checked) => {
                                          const currentCoAuthors =
                                            form.getValues("coAuthorIds") || [];
                                          if (checked) {
                                            form.setValue("coAuthorIds", [
                                              ...currentCoAuthors,
                                              author.id,
                                            ]);
                                          } else {
                                            form.setValue(
                                              "coAuthorIds",
                                              currentCoAuthors.filter(
                                                (id) => id !== author.id,
                                              ),
                                            );
                                          }
                                        }}
                                        checked={form
                                          .getValues("coAuthorIds")
                                          ?.includes(author.id)}
                                      />
                                      <div>
                                        <label
                                          htmlFor={`author-${author.id}`}
                                          className="text-sm font-medium leading-none"
                                        >
                                          {author.name}
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                          {author.email}
                                        </p>
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <p className="text-muted-foreground">
                                  Loading authors...
                                </p>
                              )}
                            </div>
                          </ScrollArea>
                          <FormDescription>
                            Co-authors will be able to edit this post and will
                            be credited in the byline
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                {/* Form validation error messages */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="mx-6 mb-4 p-3 border border-destructive text-destructive bg-destructive/10 rounded-md">
                    <p className="font-semibold mb-1">Please fix the following issues:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(form.formState.errors).map(([field, error]) => (
                        <li key={field}>
                          {field.charAt(0).toUpperCase() + field.slice(1)}: {error?.message as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <CardFooter className="flex justify-between border-t px-6 py-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/blogs")}
                  >
                    Cancel
                  </Button>

                  <div className="flex gap-2">
                    {/* Preview button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>

                    {/* Save button */}
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => {
                        console.log("Save button clicked");
                        // Get the content from Tiptap editor
                        if (editorRef.current) {
                          form.setValue("content", editorRef.current.getHTML());
                        }
                        // Force form submission
                        form.handleSubmit(onSubmit)();
                      }}
                      disabled={createArticleMutation.isPending}
                      className="gap-2"
                    >
                      {createArticleMutation.isPending ? (
                        "Creating..."
                      ) : form.watch("status") === ArticleStatus.PUBLISHED &&
                        useScheduling ? (
                        <>
                          <Calendar className="h-4 w-4" />
                          Schedule Post
                        </>
                      ) : form.watch("status") === ArticleStatus.PUBLISHED ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Publish Now
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Draft
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>

                {/* Preview Dialog */}
                {previewOpen && (
                  <BlogPreviewDialog
                    open={previewOpen}
                    onOpenChange={setPreviewOpen}
                    title={form.getValues("title")}
                    content={
                      editorRef.current
                        ? editorRef.current.getHTML()
                        : form.getValues("content")
                    }
                    excerpt={form.getValues("excerpt") || ""}
                    image={featuredImage || undefined}
                    author={user?.name || "Admin"} // BlogPreviewDialog accepts string for author
                    createdAt={new Date().toISOString()}
                  />
                )}
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewBlog;
