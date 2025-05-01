import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ArticleStatus, Category, Tag, User } from '@shared/schema';

// Icons
import { 
  Loader2, ArrowLeft, Save, Trash2, Eye, 
  Layout, FileText, Tags, Users, Image
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
import PageHeader from '@/components/ui/page-header';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

// Define the form values schema
const blogFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters long" }),
  content: z.string().min(20, { message: "Content must be at least 20 characters long" }),
  excerpt: z.string().min(10, { message: "Excerpt must be at least 10 characters long" }),
  status: z.enum(["draft", "review", "published"]),
  featured: z.boolean().default(false),
  categoryIds: z.array(z.number()).min(1, { message: "Select at least one category" }),
  tagIds: z.array(z.number()),
  coAuthorIds: z.array(z.number()),
  featuredImage: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  reviewRemarks: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const AdminEditBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id);
  const { toast } = useToast();
  const { user } = useAuth();
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
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
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: 'draft',
      featured: false,
      categoryIds: [],
      tagIds: [],
      coAuthorIds: [],
      featuredImage: '',
      keywords: [],
      reviewRemarks: '',
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
        featuredImage: article.article.featuredImage || '',
        keywords: article.article.keywords || [],
        reviewRemarks: article.article.reviewRemarks || '',
      };
      
      form.reset(formValues);
      
      if (article.article.featuredImage) {
        setFeaturedImagePreview(article.article.featuredImage);
      }
    }
  }, [article, form]);
  
  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const res = await apiRequest('PATCH', `/api/articles/${articleId}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}/full`] });
      toast({
        title: 'Blog updated',
        description: `The blog "${data.title}" has been updated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update blog',
        description: error.message,
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
        title: 'Blog deleted',
        description: 'The blog has been deleted successfully',
      });
      navigate('/admin/blogs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete blog',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: BlogFormValues) => {
    updateBlogMutation.mutate(data);
  };
  
  const handleViewArticle = () => {
    window.open(`/blogs/${articleId}`, '_blank');
  };
  
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
                      <FileText className="w-4 h-4 mr-2" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger value="categories">
                      <Tags className="w-4 h-4 mr-2" />
                      Categories & Tags
                    </TabsTrigger>
                    <TabsTrigger value="authors">
                      <Users className="w-4 h-4 mr-2" />
                      Authors
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter blog title" {...field} />
                          </FormControl>
                          <FormDescription>
                            A concise and descriptive title for your blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                            <Textarea 
                              placeholder="A brief summary of your blog post..." 
                              className="resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A short excerpt for display in blog listings (max 255 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
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
                              <SelectItem value="review">Under Review</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set the current publishing status of this blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                          <FormControl>
                            <input
                              type="checkbox"
                              className="h-4 w-4 mt-1"
                              checked={field.value}
                              onChange={field.onChange}
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
                    
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <div className="flex space-x-2">
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                // Open the asset manager
                                const event = new CustomEvent('openAssetManager', {
                                  detail: {
                                    onSelect: (url: string) => {
                                      field.onChange(url);
                                      setFeaturedImagePreview(url);
                                    }
                                  }
                                });
                                window.dispatchEvent(event);
                              }}
                            >
                              <Image className="h-4 w-4 mr-2" />
                              Browse
                            </Button>
                          </div>
                          {featuredImagePreview && (
                            <div className="mt-2">
                              <img 
                                src={featuredImagePreview} 
                                alt="Featured Preview" 
                                className="max-h-40 rounded-md object-cover" 
                              />
                            </div>
                          )}
                          <FormDescription>
                            Select or enter the URL for the featured image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {article.article.status === 'review' && (
                      <FormField
                        control={form.control}
                        name="reviewRemarks"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Review Remarks</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter any feedback for the author..." 
                                className="resize-none h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional feedback or instructions for the author when approving or rejecting
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="seo" className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keywords</FormLabel>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10">
                              {field.value.map((keyword, index) => (
                                <div 
                                  key={index} 
                                  className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1"
                                >
                                  <span>{keyword}</span>
                                  <button
                                    type="button"
                                    className="ml-2 text-primary hover:text-primary/80"
                                    onClick={() => {
                                      const newKeywords = [...field.value];
                                      newKeywords.splice(index, 1);
                                      field.onChange(newKeywords);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Add keyword and press Enter"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && keywordInput.trim()) {
                                    e.preventDefault();
                                    if (!field.value.includes(keywordInput.trim())) {
                                      field.onChange([...field.value, keywordInput.trim()]);
                                    }
                                    setKeywordInput('');
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  if (keywordInput.trim() && !field.value.includes(keywordInput.trim())) {
                                    field.onChange([...field.value, keywordInput.trim()]);
                                    setKeywordInput('');
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                          <FormDescription>
                            Add keywords to improve searchability (press Enter after each keyword)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="categories" className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categories</FormLabel>
                          <FormControl>
                            <MultiSelect
                              placeholder="Select categories"
                              options={categories.map((category) => ({
                                value: category.id.toString(),
                                label: category.name
                              }))}
                              value={field.value.map(id => id.toString())}
                              onChange={(values: string[]) => field.onChange(values.map(Number))}
                            />
                          </FormControl>
                          <FormDescription>
                            Select one or more categories for this blog post
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
                          <FormLabel>Tags</FormLabel>
                          <FormControl>
                            <MultiSelect
                              placeholder="Select tags"
                              options={tags.map((tag) => ({
                                value: tag.id.toString(),
                                label: tag.name
                              }))}
                              value={field.value.map(id => id.toString())}
                              onChange={(values: string[]) => field.onChange(values.map(Number))}
                            />
                          </FormControl>
                          <FormDescription>
                            Select relevant tags to make the blog post more discoverable
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="authors" className="space-y-4 px-4">
                    <FormField
                      control={form.control}
                      name="coAuthorIds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Co-Authors</FormLabel>
                          <FormControl>
                            <MultiSelect
                              placeholder="Select co-authors"
                              options={authors
                                .filter(author => author.id !== article.article.authorId) // Exclude the main author
                                .map((author) => ({
                                  value: author.id.toString(),
                                  label: author.name
                                }))}
                              value={field.value.map(id => id.toString())}
                              onChange={(values: string[]) => field.onChange(values.map(Number))}
                            />
                          </FormControl>
                          <FormDescription>
                            Select one or more co-authors who contributed to this blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="flex justify-between mt-4">
                  <div className="flex space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" type="button">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Blog
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the blog post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteBlogMutation.mutate()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deleteBlogMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                              </>
                            ) : "Delete Blog"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    {article.article.status === ArticleStatus.PUBLISHED && (
                      <Button variant="outline" type="button" onClick={handleViewArticle}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Blog
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" type="button" onClick={() => navigate('/admin/blogs')}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateBlogMutation.isPending}>
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
    </AdminLayout>
  );
};

export default AdminEditBlogPage;