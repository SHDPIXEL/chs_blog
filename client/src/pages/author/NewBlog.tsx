import React from 'react';
import { useLocation } from 'wouter';
import AuthorLayout from '@/components/layout/AuthorLayout';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { ArticleStatus } from '@shared/schema';
import { AssetPickerButton } from '@/components/assets';

// Define form schema using zod
const blogFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(200, 'Excerpt cannot exceed 200 characters').optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED]),
  featuredImage: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const NewBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Set up form with default values
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: ArticleStatus.DRAFT,
      featuredImage: '',
    },
  });
  
  // Submit mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const res = await apiRequest('POST', '/api/articles', {
        ...data,
        published: data.status === ArticleStatus.PUBLISHED,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/author/articles'] });
      toast({
        title: 'Blog created',
        description: `Your blog "${data.title}" has been created successfully`,
      });
      navigate('/author/blogs');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create blog',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: BlogFormValues) => {
    createBlogMutation.mutate(data);
  };
  
  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Create New Blog" 
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate('/author/blogs')}
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
                <CardContent className="space-y-6">
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
                          A clear and engaging title that summarizes your blog post
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Content field */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your blog content here..." 
                            className="min-h-[300px] font-mono"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Supports Markdown formatting for rich content
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
                          A short description that appears in blog listings (max 200 characters)
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
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/your-image.jpg" 
                                {...field} 
                              />
                            </FormControl>
                          </div>
                          <div className="flex-shrink-0">
                            <AssetPickerButton 
                              onSelect={(asset) => {
                                if (Array.isArray(asset)) {
                                  // Just use the first asset if somehow multiple are selected
                                  if (asset.length > 0 && asset[0].url) {
                                    field.onChange(asset[0].url);
                                  }
                                } else if (asset && asset.url) {
                                  field.onChange(asset.url);
                                }
                              }}
                              variant="outline"
                            >
                              Browse Assets
                            </AssetPickerButton>
                          </div>
                        </div>
                        {field.value && (
                          <div className="mt-2 border rounded-md overflow-hidden w-full max-w-xs">
                            <img 
                              src={field.value} 
                              alt="Featured image preview" 
                              className="w-full h-auto max-h-40 object-cover"
                            />
                          </div>
                        )}
                        <FormDescription>
                          A URL to an image that represents your blog post
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
                            <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={ArticleStatus.REVIEW}>Submit for Review</SelectItem>
                            <SelectItem value={ArticleStatus.PUBLISHED}>Publish</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Draft: Save as work in progress<br />
                          Review: Submit for editorial review<br />
                          Publish: Make this blog post public
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/author/blogs')}
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
                      {createBlogMutation.isPending ? 'Saving...' : 'Save Blog'}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Preview functionality would be implemented here
                        toast({
                          title: 'Preview',
                          description: 'Preview functionality coming soon',
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