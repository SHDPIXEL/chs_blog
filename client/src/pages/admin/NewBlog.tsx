import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layouts/AdminLayout';
import AssetPickerButton from '@/components/assets/AssetPickerButton';
import { Asset } from '@shared/schema';
import { z } from 'zod';
import { ArticleStatus, extendedArticleSchema, Category, Tag } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

// Custom article schema for admin (simplified options)
const adminArticleSchema = extendedArticleSchema.extend({
  // Admin can only set to draft or published, not review
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.PUBLISHED]).default(ArticleStatus.DRAFT),
});

const NewBlog: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const editorRef = useRef<any>(null);

  // Get categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });

  // Get tags
  const { data: tags } = useQuery<Tag[]>({
    queryKey: ['/api/tags'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/tags');
      return res.json();
    }
  });

  // Get authors for co-author selection
  const { data: authors } = useQuery({
    queryKey: ['/api/users/authors'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/users/authors');
      return res.json();
    }
  });

  const form = useForm<z.infer<typeof adminArticleSchema>>({
    resolver: zodResolver(adminArticleSchema),
    defaultValues: {
      title: '',
      content: '',
      excerpt: '',
      status: ArticleStatus.DRAFT,
      categoryIds: [],
      tagIds: [],
      coAuthorIds: [],
      keywords: [],
      metaTitle: '',
      metaDescription: '',
    },
  });

  const createArticleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof adminArticleSchema>) => {
      // Admin automatically becomes the author
      const articleData = {
        ...values,
        authorId: user?.id,
        featuredImage,
        // For admin, published is set based on status
        published: values.status === ArticleStatus.PUBLISHED
      };
  
      const res = await apiRequest('POST', '/api/articles', articleData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      navigate('/admin/blogs');
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create blog post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const onSubmit = (values: z.infer<typeof adminArticleSchema>) => {
    // Get the content from Tiptap editor
    if (editorRef.current) {
      values.content = editorRef.current.getHTML();
    }
    
    createArticleMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create New Blog</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter blog title" {...field} />
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
                          placeholder="Brief summary of the article"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Content</FormLabel>
                  <div className="border rounded-md mt-1.5 p-4 h-[400px] overflow-y-auto bg-white">
                    <p className="text-gray-500">Rich text editor would be loaded here</p>
                    <Textarea
                      placeholder="Write your content here..."
                      className="w-full h-[300px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) => form.setValue('content', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/2">
                    <FormLabel>Featured Image</FormLabel>
                    <div className="mt-1.5">
                      <AssetPickerButton
                        onSelect={(asset: Asset) => setFeaturedImage(asset.url)}
                        className="w-full h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-md p-4"
                      >
                        {featuredImage ? (
                          <div className="relative w-full h-full">
                            <img
                              src={featuredImage}
                              alt="Featured"
                              className="w-full h-full object-cover rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFeaturedImage(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <p>Click to select a featured image</p>
                          </div>
                        )}
                      </AssetPickerButton>
                    </div>
                  </div>

                  <div className="w-full sm:w-1/2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ArticleStatus.DRAFT}>
                                <div className="flex items-center">
                                  <span>Draft</span>
                                  <Badge variant="secondary" className="ml-2">
                                    Draft
                                  </Badge>
                                </div>
                              </SelectItem>
                              <SelectItem value={ArticleStatus.PUBLISHED}>
                                <div className="flex items-center">
                                  <span>Published</span>
                                  <Badge className="ml-2">Published</Badge>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4">
                      <FormLabel>Categories</FormLabel>
                      <div className="mt-1.5 space-y-2">
                        {categories?.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                const currentCategories =
                                  form.getValues("categoryIds") || [];
                                if (e.target.checked) {
                                  form.setValue("categoryIds", [
                                    ...currentCategories,
                                    category.id,
                                  ]);
                                } else {
                                  form.setValue(
                                    "categoryIds",
                                    currentCategories.filter(
                                      (id) => id !== category.id
                                    )
                                  );
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <span>{category.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/blogs')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createArticleMutation.isPending}
              >
                {createArticleMutation.isPending ? "Creating..." : "Create Blog"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default NewBlog;