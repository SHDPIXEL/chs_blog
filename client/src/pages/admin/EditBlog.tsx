import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  ArticleStatus, 
  Category, 
  Tag, 
  User, 
  extendedArticleSchema, 
  Asset 
} from '@shared/schema';

// Icons
import { 
  Loader2, ArrowLeft, Save, Trash2, Eye, Search,
  Layout, Tags, Users, Image, Calendar, Clock,
  CheckCircle, ImagePlus
} from 'lucide-react';

// UI Components
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MultiSelect } from '@/components/ui/multi-select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import PageHeader from '@/components/ui/PageHeader';
import { RichTextEditor, RichTextEditorRef } from '@/components/ui/rich-text-editor';
import BlogPreviewDialog from '@/components/blog/BlogPreviewDialog';
import { AssetPickerButton } from '@/components/assets';

// Custom article schema for admin with strict validation
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
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  categoryIds: z.array(z.number()).default([]),
  tagIds: z.array(z.number()).default([]),
  coAuthorIds: z.array(z.number()).default([]),
  featured: z.boolean().default(false),
  reviewRemarks: z.string().optional(),
});

type AdminArticleFormValues = z.infer<typeof adminArticleSchema>;

const AdminEditBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id);
  const { toast } = useToast();
  const { user } = useAuth();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [useScheduling, setUseScheduling] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState<string | undefined>(undefined);
  const editorRef = useRef<RichTextEditorRef>(null);
  
  // Fetch the article data
  const { data: article, isLoading: isArticleLoading, error: articleError } = useQuery<any>({
    queryKey: [`/api/articles/${articleId}/full`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/articles/${articleId}/full`);
      return res.json();
    }
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });
  
  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/tags');
      return res.json();
    }
  });
  
  // Fetch other authors (for co-author selection)
  const { data: authors = [] } = useQuery<User[]>({
    queryKey: ['/api/users/authors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/authors');
      return res.json();
    }
  });
  
  // Setup form
  const form = useForm<AdminArticleFormValues>({
    resolver: zodResolver(adminArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: ArticleStatus.DRAFT,
      featured: false,
      categoryIds: [],
      tagIds: [],
      coAuthorIds: [],
      customTags: [],
      authorId: user?.id ? Number(user.id) : undefined,
      keywords: [],
      slug: '',
      metaTitle: '',
      metaDescription: '',
    },
  });
  
  // Update form values when article data is loaded
  useEffect(() => {
    if (article && article.article) {
      const formValues = {
        title: article.article.title,
        content: article.article.content,
        excerpt: article.article.excerpt || '',
        status: article.article.status,
        featured: article.article.featured || false,
        categoryIds: article.categories?.map((c: Category) => c.id) || [],
        tagIds: article.tags?.map((t: Tag) => t.id) || [],
        coAuthorIds: article.coAuthors?.map((a: User) => a.id) || [],
        authorId: user?.id ? Number(user.id) : undefined,
        keywords: article.article.keywords || [],
        slug: article.article.slug || '',
        metaTitle: article.article.metaTitle || '',
        metaDescription: article.article.metaDescription || '',
        reviewRemarks: article.article.reviewRemarks || '',
        customTags: article.tags?.map((t: Tag) => t.name) || [],
      };
      
      form.reset(formValues);
      
      if (article.article.featuredImage) {
        setFeaturedImage(article.article.featuredImage);
      }
      
      // Check for scheduled publish date
      if (article.article.scheduledPublishAt) {
        setUseScheduling(true);
        setScheduledPublishAt(article.article.scheduledPublishAt);
      }
    }
  }, [article, form, user]);
  
  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: async (data: AdminArticleFormValues) => {
      // Get the content from Tiptap editor
      if (editorRef.current) {
        data.content = editorRef.current.getHTML();
      }

      // Create a slug from the title if not provided
      if (!data.slug && data.title) {
        data.slug = data.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      // Add scheduling data if needed
      const articleData = {
        ...data,
        authorId: user?.id ? Number(user.id) : undefined,
        featuredImage,
        published: data.status === ArticleStatus.PUBLISHED && !useScheduling,
        tags: data.customTags,
      };

      // Add scheduling information if enabled
      if (
        useScheduling &&
        scheduledPublishAt &&
        data.status === ArticleStatus.PUBLISHED
      ) {
        articleData.scheduledPublishAt = scheduledPublishAt;
        // When scheduling, status is published but published flag is false
        articleData.published = false;
      }

      // Remove customTags as it's not in the API schema
      delete (articleData as any).customTags;

      const res = await apiRequest('PATCH', `/api/articles/${articleId}`, articleData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/full`] });
      toast({
        title: 'Success',
        description: `The blog "${data.title}" has been updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to update blog: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/articles/${articleId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      toast({
        title: 'Success',
        description: 'The blog has been deleted successfully',
      });
      navigate('/admin/blogs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to delete blog: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (values: AdminArticleFormValues) => {
    console.log("Form submitted with values:", values);

    // Make sure we have a user ID for the author
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to get user ID. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }
    
    // Always set the authorId value before validation - ensure it's a number
    form.setValue("authorId", Number(user.id));
    
    updateBlogMutation.mutate(values);
  };
  
  // Handle opening the preview dialog
  const handlePreview = () => {
    const formValues = form.getValues();
    if (editorRef.current) {
      // Get latest content from editor
      formValues.content = editorRef.current.getHTML();
    }
    setIsPreviewOpen(true);
  };
  
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
  
  const handleViewArticle = () => {
    window.open(`/blogs/${articleId}`, '_blank');
  };
  
  // Debug form errors
  console.log("Form errors:", form.formState.errors);
  console.log("Form is valid:", form.formState.isValid);
  console.log("Form is submitting:", form.formState.isSubmitting);
  
  // If still loading, show loading state
  if (isArticleLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  // If error loading article, show error state
  if (articleError || !article) {
    return (
      <AdminLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Error Loading Blog
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>{articleError instanceof Error ? articleError.message : 'Failed to load blog data'}</p>
                </div>
                <div className="mt-4">
                  <Button size="sm" onClick={() => navigate('/admin/blogs')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blogs
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Edit Blog" 
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate('/admin/blogs')}
        />
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Blog Post</CardTitle>
              <CardDescription>
                Update the blog post and save changes
              </CardDescription>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs defaultValue="content" className="space-y-4">
                  <TabsList className="mt-2 px-4">
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
                              ref={editorRef}
                              value={field.value} 
                              onChange={field.onChange}
                              placeholder="Write your blog content here..." 
                              className="min-h-[300px]"
                            />
                          </FormControl>
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
                              placeholder="A brief summary of your blog post..." 
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A short excerpt for display in blog listings (max 200 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Slug field */}
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter URL slug (or leave blank to generate from title)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The URL-friendly version of the title that will be used in the blog post URL
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Publishing status field */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publishing Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select whether to save as draft or publish immediately
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Schedule publishing */}
                    {form.watch("status") === "published" && (
                      <div className="border rounded-md p-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useScheduling"
                            checked={useScheduling}
                            onCheckedChange={(checked) => {
                              setUseScheduling(!!checked);
                              if (!checked) {
                                setScheduledPublishAt(undefined);
                              } else if (!scheduledPublishAt) {
                                // Set default date to tomorrow at 9am
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(9, 0, 0, 0);
                                setScheduledPublishAt(tomorrow.toISOString());
                              }
                            }}
                          />
                          <label
                            htmlFor="useScheduling"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Schedule for later
                          </label>
                        </div>

                        {useScheduling && (
                          <div className="grid gap-4 py-2">
                            <div className="flex flex-col space-y-1.5">
                              <label className="text-sm font-medium leading-none">
                                Publication Date
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="justify-start text-left font-normal w-full sm:w-[240px]"
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
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                      mode="single"
                                      selected={
                                        scheduledPublishAt
                                          ? new Date(scheduledPublishAt)
                                          : undefined
                                      }
                                      onSelect={(date) => {
                                        if (date) {
                                          const current = scheduledPublishAt
                                            ? new Date(scheduledPublishAt)
                                            : new Date();
                                          date.setHours(
                                            current.getHours(),
                                            current.getMinutes(),
                                          );
                                          setScheduledPublishAt(
                                            date.toISOString(),
                                          );
                                        }
                                      }}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>

                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="justify-start text-left font-normal w-full sm:w-[180px]"
                                    >
                                      <Clock className="mr-2 h-4 w-4" />
                                      {scheduledPublishAt ? (
                                        format(
                                          new Date(scheduledPublishAt),
                                          "h:mm a",
                                        )
                                      ) : (
                                        <span>Set time</span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-4">
                                    <div className="grid gap-2">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div className="grid gap-1">
                                          <label className="text-xs">
                                            Hours
                                          </label>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={23}
                                            value={
                                              scheduledPublishAt
                                                ? new Date(
                                                    scheduledPublishAt,
                                                  ).getHours()
                                                : 9
                                            }
                                            onChange={(e) => {
                                              const hours = parseInt(
                                                e.target.value,
                                              );
                                              if (
                                                isNaN(hours) ||
                                                hours < 0 ||
                                                hours > 23
                                              )
                                                return;

                                              const date = scheduledPublishAt
                                                ? new Date(scheduledPublishAt)
                                                : new Date();
                                              date.setHours(hours);
                                              setScheduledPublishAt(
                                                date.toISOString(),
                                              );
                                            }}
                                          />
                                        </div>
                                        <div className="grid gap-1">
                                          <label className="text-xs">
                                            Minutes
                                          </label>
                                          <Input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={
                                              scheduledPublishAt
                                                ? new Date(
                                                    scheduledPublishAt,
                                                  ).getMinutes()
                                                : 0
                                            }
                                            onChange={(e) => {
                                              const minutes = parseInt(
                                                e.target.value,
                                              );
                                              if (
                                                isNaN(minutes) ||
                                                minutes < 0 ||
                                                minutes > 59
                                              )
                                                return;

                                              const date = scheduledPublishAt
                                                ? new Date(scheduledPublishAt)
                                                : new Date();
                                              date.setMinutes(minutes);
                                              setScheduledPublishAt(
                                                date.toISOString(),
                                              );
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {scheduledPublishAt && (
                                  <span className="flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                    Article will be published automatically on{" "}
                                    {format(
                                      new Date(scheduledPublishAt),
                                      "MMMM d, yyyy 'at' h:mm a",
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Featured checkbox */}
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Feature this blog post?</FormLabel>
                            <FormDescription>
                              Featured blog posts will be displayed prominently on the homepage
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6 px-4">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter SEO meta title (defaults to post title if empty)"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The title that appears in search engine results (max 60 characters for best results)
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
                              placeholder="Enter SEO meta description"
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            The description that appears in search engine results (max 160 characters for best results)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords</FormLabel>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="Enter keyword and press Enter or Add"
                                  value={keywordInput}
                                  onChange={(e) => setKeywordInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addKeyword();
                                    }
                                  }}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                onClick={addKeyword}
                              >
                                Add
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value.map((keyword, index) => (
                                <div
                                  key={index}
                                  className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  {keyword}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-2 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-transparent"
                                    onClick={() => removeKeyword(keyword)}
                                  >
                                    &times;
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormDescription>
                            Keywords help search engines understand your content
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="customTags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Tags</FormLabel>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <FormControl>
                                <Input
                                  placeholder="Enter tag and press Enter or Add"
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addCustomTag();
                                    }
                                  }}
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                onClick={addCustomTag}
                              >
                                Add
                              </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value.map((tag, index) => (
                                <div
                                  key={index}
                                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm flex items-center"
                                >
                                  #{tag}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 ml-2 text-primary-foreground/70 hover:text-primary-foreground hover:bg-transparent"
                                    onClick={() => removeCustomTag(tag)}
                                  >
                                    &times;
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <FormDescription>
                            Custom tags are displayed on the blog post and can be created on the fly
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Categories Tab */}
                  <TabsContent value="categories" className="space-y-6 px-4">
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <FormControl>
                            <MultiSelect
                              value={field.value.map(id => id.toString())}
                              onValueChange={(values) => {
                                field.onChange(values.map(val => parseInt(val)));
                              }}
                              options={categories.map((category) => ({
                                label: category.name,
                                value: category.id.toString(),
                              }))}
                              placeholder="Select categories..."
                            />
                          </FormControl>
                          <FormDescription>
                            Select one or more categories for your blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tagIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Existing Tags</FormLabel>
                          <FormControl>
                            <MultiSelect
                              value={field.value.map(id => id.toString())}
                              onValueChange={(values) => {
                                field.onChange(values.map(val => parseInt(val)));
                              }}
                              options={tags.map((tag) => ({
                                label: tag.name,
                                value: tag.id.toString(),
                              }))}
                              placeholder="Select existing tags..."
                            />
                          </FormControl>
                          <FormDescription>
                            Select from existing tags to categorize your post (or create custom tags in the SEO tab)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* Co-Authors Tab */}
                  <TabsContent value="coauthors" className="space-y-6 px-4">
                    <FormField
                      control={form.control}
                      name="coAuthorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Authors</FormLabel>
                          <FormControl>
                            <MultiSelect
                              value={field.value.map(id => id.toString())}
                              onValueChange={(values) => {
                                field.onChange(values.map(val => parseInt(val)));
                              }}
                              options={authors
                                .filter((author) => author.id !== article?.article?.authorId)
                                .map((author) => ({
                                  label: author.name,
                                  value: author.id.toString(),
                                }))}
                              placeholder="Select co-authors..."
                            />
                          </FormControl>
                          <FormDescription>
                            Add other authors who contributed to this article
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Main Author</h3>
                      <p className="text-sm text-blue-600 mb-1">
                        You are set as the main author of this blog post.
                      </p>
                      <p className="text-xs text-blue-500">
                        Select co-authors above to acknowledge contributors.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="flex justify-between border-t px-6 py-4 mt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/blogs')}>
                      Cancel
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Blog
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            blog post from the server.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBlogMutation.mutate()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex gap-2">
                    {article.article.status === 'published' && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleViewArticle}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Article
                      </Button>
                    )}
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handlePreview}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button type="submit" disabled={updateBlogMutation.isPending}>
                      {updateBlogMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
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
      
      {/* Preview Dialog */}
      <BlogPreviewDialog 
        open={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen}
        title={form.getValues('title')}
        content={editorRef.current ? editorRef.current.getHTML() : form.getValues('content')}
        excerpt={form.getValues('excerpt')}
        author={article?.article?.author || user?.name || 'Anonymous'}
        createdAt={article?.article?.createdAt || new Date().toISOString()}
        image={featuredImage}
        categories={categories?.filter(c => form.getValues('categoryIds').includes(c.id)).map(c => c.name) || []}
        tags={form.getValues('customTags') || []}
      />
    </AdminLayout>
  );
};

export default AdminEditBlogPage;