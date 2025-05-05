import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
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
  Loader2,
} from "lucide-react";
import {
  ArticleStatus,
  Asset,
  Category,
  Tag,
  User,
  Article,
} from "@shared/schema";
import { AssetPickerButton } from "@/components/assets";
import BlogPreviewDialog from "@/components/blog/BlogPreviewDialog";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  // SEO Fields
  slug: z.string().optional(),
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

  // Publishing schedule
  useScheduling: z.boolean().default(false),
  scheduledPublishAt: z.string().optional(),

  // Relationships
  categoryIds: z.array(z.number()).default([]),
  customTags: z.array(z.string()).default([]),
  coAuthorIds: z.array(z.number()).default([]),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const EditBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id);
  const { toast } = useToast();
  const { user } = useAuth();
  const [featuredImagePreview, setFeaturedImagePreview] = useState<
    string | null
  >(null);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Use the permissions hook to get real-time permission data
  const { canPublish, refreshPermissions } = usePermissions();

  // Refresh permissions when component mounts
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Fetch the article data
  const {
    data: article,
    isLoading: isArticleLoading,
    error: articleError,
  } = useQuery<any>({
    queryKey: [`/api/articles/${articleId}/full`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/articles/${articleId}/full`);
      return res.json();
    },
  });

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
      slug: "",
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      keywords: [],
      useScheduling: false,
      scheduledPublishAt: "",
      categoryIds: [],
      customTags: [],
      coAuthorIds: [],
    },
  });

  // Update form values when article data is loaded
  useEffect(() => {
    if (article) {
      // Extract the article data
      const {
        article: articleData,
        categories: articleCategories,
        tags: articleTags,
        coAuthors,
      } = article;

      // Map category IDs
      const categoryIds = articleCategories.map(
        (category: Category) => category.id
      );

      // Map tag names for custom tags
      const customTags = articleTags.map((tag: Tag) => tag.name);

      // Map co-author IDs
      const coAuthorIds = coAuthors.map((author: User) => author.id);

      // Extract keywords from JSON field if available
      const keywords = articleData.keywords || [];

      // Set featured image preview
      if (articleData.featuredImage) {
        setFeaturedImagePreview(articleData.featuredImage);
      }

      // Determine if article has scheduled publishing
      const hasScheduledPublishing = !!articleData.scheduledPublishAt;

      // Format scheduledPublishAt for the datetime-local input if it exists
      let scheduledPublishAt = "";
      if (articleData.scheduledPublishAt) {
        const date = new Date(articleData.scheduledPublishAt);
        scheduledPublishAt = date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
      }

      // Reset form with article data
      form.reset({
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt || "",
        status: articleData.status,
        featuredImage: articleData.featuredImage || "",
        slug: articleData.slug || "",
        metaTitle: articleData.metaTitle || "",
        metaDescription: articleData.metaDescription || "",
        canonicalUrl: articleData.canonicalUrl || "",
        keywords,
        useScheduling: hasScheduledPublishing,
        scheduledPublishAt,
        categoryIds,
        customTags,
        coAuthorIds,
      });
    }
  }, [article, form]);

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
      currentKeywords.filter((k) => k !== keyword)
    );
  };

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      // Transfer custom tags to the tags field for the API
      const formattedData = {
        ...data,
        tags: data.customTags, // Send as plain string array for the server to process
        published: data.status === ArticleStatus.PUBLISHED,
      };

      // Remove customTags as it's not in the API schema
      delete (formattedData as any).customTags;

      // Handle scheduling - only include scheduledPublishAt if useScheduling is true
      if (!formattedData.useScheduling) {
        formattedData.scheduledPublishAt = undefined; // Use undefined instead of null to avoid type errors
      } else if (formattedData.status !== ArticleStatus.PUBLISHED) {
        // If not publishing, don't schedule
        formattedData.useScheduling = false;
        formattedData.scheduledPublishAt = undefined; // Use undefined instead of null
      }

      // Remove useScheduling flag as it's not in the API schema
      delete (formattedData as any).useScheduling;

      // Auto-generate slug from title if not provided
      if (!formattedData.slug && formattedData.title) {
        formattedData.slug = formattedData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
          .trim();
      }

      const res = await apiRequest(
        "PATCH",
        `/api/articles/${articleId}`,
        formattedData
      );
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/articles"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/articles/${articleId}/full`],
      });
      toast({
        title: "Blog updated",
        description: `Your blog "${data.title}" has been updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update blog",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/articles/${articleId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/articles"] });
      toast({
        title: "Blog deleted",
        description: "Your blog has been deleted successfully",
      });
      navigate("/author/blogs");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete blog",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: BlogFormValues) => {
    // Check if trying to publish without permissions
    if (data.status === ArticleStatus.PUBLISHED && !canPublish) {
      // If trying to publish without permissions, set to review instead
      data.status = ArticleStatus.REVIEW;
      toast({
        title: "Blog submitted for review",
        description:
          "You do not have publishing rights. Your blog has been submitted for admin review.",
      });
    }

    updateBlogMutation.mutate(data);
  };

  // Handle asset selection for featured image
  const handleAssetSelect = (asset: Asset | Asset[]) => {
    const selectedAsset = Array.isArray(asset) ? asset[0] : asset;
    if (selectedAsset && selectedAsset.url) {
      form.setValue("featuredImage", selectedAsset.url);
      setFeaturedImagePreview(selectedAsset.url);
    }
  };

  // Function to view the article
  const handleViewArticle = () => {
    window.open(`/blog/${articleId}`, "_blank");
  };

  // Loading state
  if (isArticleLoading) {
    return (
      <AuthorLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-gray-500">Loading blog article...</p>
          </div>
        </div>
      </AuthorLayout>
    );
  }

  // Error state
  if (articleError) {
    return (
      <AuthorLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading blog
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {articleError instanceof Error
                      ? articleError.message
                      : "Failed to load blog data"}
                  </p>
                </div>
                <div className="mt-4">
                  <Button size="sm" onClick={() => navigate("/author/blogs")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blogs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthorLayout>
    );
  }

  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Edit Blog"
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate("/author/blogs")}
        />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Blog Post</CardTitle>
              <CardDescription>
                Update your blog post and save changes
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
                            value={field.value}
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
                          <FormDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              <li>
                                <span className="font-medium">Draft:</span> Save
                                as work in progress
                              </li>
                              <li>
                                <span className="font-medium">Review:</span>{" "}
                                Submit for editorial review
                              </li>
                              {canPublish ? (
                                <li>
                                  <span className="font-medium">Publish:</span>{" "}
                                  Make this blog post public
                                </li>
                              ) : (
                                <li>
                                  <span className="font-medium text-muted-foreground">
                                    Publish:
                                  </span>{" "}
                                  <span className="text-muted-foreground">
                                    Requires admin approval
                                  </span>
                                </li>
                              )}
                            </ul>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Scheduling section (only visible if user can publish and status is PUBLISHED) */}
                    {canPublish &&
                      form.watch("status") === ArticleStatus.PUBLISHED && (
                        <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                          <h3 className="font-medium">Publishing Schedule</h3>

                          <FormField
                            control={form.control}
                            name="useScheduling"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Schedule for later publication
                                  </FormLabel>
                                  <FormDescription>
                                    Set a future date and time when this post
                                    should be published
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          {form.watch("useScheduling") && (
                            <FormField
                              control={form.control}
                              name="scheduledPublishAt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Publication Date and Time
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="datetime-local"
                                      {...field}
                                      min={new Date()
                                        .toISOString()
                                        .slice(0, 16)}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    The blog will automatically publish at this
                                    date and time
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
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

                    {/* Slug field */}
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="custom-url-path"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Custom URL path for this article (leave empty for
                            auto-generation from title)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Meta Title field */}
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="SEO-optimized title (optional)"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Alternative title for search engines (max 70
                            characters)
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
                              placeholder="Brief description for search engine results (optional)"
                              className="resize-none"
                              rows={3}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Summary that appears in search results (max 160
                            characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Canonical URL field */}
                    <FormField
                      control={form.control}
                      name="canonicalUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Canonical URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://original-source.com/page"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription>
                            URL of the original source if this content is
                            syndicated from another site
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
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="Add a keyword"
                                value={keywordInput}
                                onChange={(e) =>
                                  setKeywordInput(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addKeyword();
                                  }
                                }}
                              />
                            </FormControl>
                            <Button
                              type="button"
                              onClick={addKeyword}
                              variant="secondary"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                          {Array.isArray(field?.value) &&
  field.value.map((keyword, index) => (
    <Badge key={index} variant="secondary" className="gap-1 text-sm">
      {keyword}
      <button
        type="button"
        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
        onClick={() => removeKeyword(keyword)}
      >
        ×
      </button>
    </Badge>
  ))}

                          </div>
                          <FormDescription>
                            Keywords help search engines understand your content
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
                        Organize your blog post with categories and tags for
                        better discoverability
                      </p>
                    </div>

                    {/* Categories field */}
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <div className="border rounded-md p-4 space-y-3">
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    checked={
                                      field?.value?.includes(category.id) ||
                                      false
                                    }
                                    onCheckedChange={(checked) => {
                                      const currentCategories =
                                        field.value || [];
                                      if (checked) {
                                        // Add category if not already included
                                        if (
                                          !currentCategories.includes(
                                            category.id
                                          )
                                        ) {
                                          field.onChange([
                                            ...currentCategories,
                                            category.id,
                                          ]);
                                        }
                                      } else {
                                        // Remove category
                                        field.onChange(
                                          currentCategories.filter(
                                            (id) => id !== category.id
                                          )
                                        );
                                      }
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
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No categories available
                              </p>
                            )}
                          </div>
                          <FormDescription>
                            Select one or more categories for your blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Custom Tags field */}
                    <FormField
                      control={form.control}
                      name="customTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags</FormLabel>
                          <div className="space-y-4">
                            <div className="border rounded-md p-4">
                              <div className="flex flex-wrap gap-2 mb-2">
                                {field?.value?.map((tag, index) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="gap-1 text-sm"
                                  >
                                    {tag}
                                    <button
                                      type="button"
                                      className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                                      onClick={() => {
                                        const currentTags = field.value || [];
                                        field.onChange(
                                          currentTags.filter((t) => t !== tag)
                                        );
                                      }}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))}
                                {field.value?.length === 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    No tags added yet
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Input
                                  placeholder="Add a new tag"
                                  className="flex-1"
                                  onChange={(e) =>
                                    setKeywordInput(e.target.value)
                                  }
                                  value={keywordInput}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (keywordInput.trim()) {
                                        const currentTags = field.value || [];
                                        if (
                                          !currentTags.includes(
                                            keywordInput.trim()
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
                                        !currentTags.includes(
                                          keywordInput.trim()
                                        )
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
                                  Add Tag
                                </Button>
                              </div>
                            </div>

                            {tags.length > 0 && (
                              <div>
                                <FormLabel>Suggested Tags</FormLabel>
                                <ScrollArea className="h-24 rounded-md border p-4">
                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                      <Badge
                                        key={tag.id}
                                        variant="outline"
                                        className="cursor-pointer hover:bg-secondary"
                                        onClick={() => {
                                          const currentTags = field.value || [];
                                          if (!currentTags.includes(tag.name)) {
                                            field.onChange([
                                              ...currentTags,
                                              tag.name,
                                            ]);
                                          }
                                        }}
                                      >
                                        {tag.name}
                                      </Badge>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                          <FormDescription>
                            Add relevant tags to help readers find related
                            content
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
                        Add other authors who contributed to this blog post
                      </p>
                    </div>

                    {/* Co-Authors field */}
                    <FormField
                      control={form.control}
                      name="coAuthorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Authors</FormLabel>
                          <div className="border rounded-md p-4 space-y-3">
                            {authors.length > 0 ? (
                              authors.map((author) => (
                                <div
                                  key={author.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`author-${author.id}`}
                                    checked={field.value?.includes(author.id)}
                                    onCheckedChange={(checked) => {
                                      const currentAuthors = field.value || [];
                                      if (checked) {
                                        // Add author if not already included
                                        if (
                                          !currentAuthors.includes(author.id)
                                        ) {
                                          field.onChange([
                                            ...currentAuthors,
                                            author.id,
                                          ]);
                                        }
                                      } else {
                                        // Remove author
                                        field.onChange(
                                          currentAuthors.filter(
                                            (id) => id !== author.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                  <div className="flex items-center gap-2">
                                    {author.avatarUrl ? (
                                      <img
                                        src={author.avatarUrl}
                                        alt={author.name}
                                        className="h-6 w-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                        {author.name.charAt(0)}
                                      </div>
                                    )}
                                    <label
                                      htmlFor={`author-${author.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {author.name}
                                    </label>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No other authors available
                              </p>
                            )}
                          </div>
                          <FormDescription>
                            Select other authors who contributed to this blog
                            post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <CardFooter className="flex justify-between mt-4 space-x-2">
                  <div className="flex space-x-2">
                    {/* View Blog button removed */}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => navigate("/author/blogs")}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={updateBlogMutation.isPending}
                    >
                      {updateBlogMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>

      {/* Blog Preview Dialog */}
      <BlogPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={form.watch("title")}
        content={form.watch("content")}
        excerpt={form.watch("excerpt")}
        author={{ name: user?.name || "Anonymous" }}
        date={new Date().toLocaleDateString()}
        categories={categories
          .filter((c) => form.watch("categoryIds").includes(c.id))
          .map((c) => c.name)}
        tags={form.watch("customTags")}
        featuredImage={featuredImagePreview || undefined}
      />
    </AuthorLayout>
  );
};

export default EditBlogPage;
