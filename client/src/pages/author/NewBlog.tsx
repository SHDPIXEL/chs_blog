import React, { useState } from 'react';
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
import { ArrowLeft, Save, Eye, ImagePlus } from 'lucide-react';
import { ArticleStatus, Asset } from '@shared/schema';
import { AssetPickerButton } from '@/components/assets';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

// Define form schema using zod
const blogFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().max(200, 'Excerpt cannot exceed 200 characters').optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED]),
  featuredImage: z.string().optional().or(z.literal('')),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const NewBlogPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  
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

  // Handle asset selection for featured image
  const handleAssetSelect = (asset: Asset | Asset[]) => {
    const selectedAsset = Array.isArray(asset) ? asset[0] : asset;
    if (selectedAsset && selectedAsset.url) {
      form.setValue('featuredImage', selectedAsset.url);
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
                                    field.onChange('');
                                    setFeaturedImagePreview(null);
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-muted-foreground h-full">
                                <ImagePlus className="h-12 w-12 mb-2 opacity-50" />
                                <p className="text-sm text-center">No image selected</p>
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
                              Select a high-quality image that represents the content of your blog post
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
                          Use the toolbar to format your content, add links and images
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
                          <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li><span className="font-medium">Draft:</span> Save as work in progress</li>
                            <li><span className="font-medium">Review:</span> Submit for editorial review</li>
                            <li><span className="font-medium">Publish:</span> Make this blog post public</li>
                          </ul>
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