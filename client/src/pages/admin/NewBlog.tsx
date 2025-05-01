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
  FormDescription,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/layouts/AdminLayout';
import { AssetPickerButton } from '@/components/assets';
import { Asset } from '@shared/schema';
import { z } from 'zod';
import { ArticleStatus, extendedArticleSchema, Category, Tag, User } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import PageHeader from '@/components/ui/PageHeader';
import { 
  ArrowLeft, 
  ImagePlus, 
  Layout, 
  Search, 
  Tags, 
  Users, 
  Save, 
  Eye 
} from 'lucide-react';

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

  const [keywordInput, setKeywordInput] = useState<string>('');
  
  // Handle adding a keyword
  const addKeyword = () => {
    if (keywordInput.trim()) {
      const currentKeywords = form.getValues('keywords') || [];
      if (!currentKeywords.includes(keywordInput.trim())) {
        form.setValue('keywords', [...currentKeywords, keywordInput.trim()]);
      }
      setKeywordInput('');
    }
  };
  
  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    const currentKeywords = form.getValues('keywords') || [];
    form.setValue('keywords', currentKeywords.filter(k => k !== keyword));
  };

  return (
    <AdminLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="Create New Blog" 
          buttonText="Back to Blogs"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate('/admin/blogs')}
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
                                  <p className="text-sm text-center">No image selected</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-center">
                              <AssetPickerButton 
                                onSelect={(asset: Asset) => setFeaturedImage(asset.url)}
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
                              <SelectItem value={ArticleStatus.PUBLISHED}>Publish</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            <ul className="list-disc pl-5 space-y-1 mt-1">
                              <li><span className="font-medium">Draft:</span> Save as work in progress</li>
                              <li><span className="font-medium">Publish:</span> Make this blog post public immediately</li>
                            </ul>
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  {/* SEO Tab */}
                  <TabsContent value="seo" className="space-y-6 px-4">
                    <div className="rounded-lg border p-4 bg-muted/30">
                      <h3 className="text-sm font-medium">Search Engine Optimization</h3>
                      <p className="text-sm text-muted-foreground mt-1 mb-2">
                        Optimize your blog post for search engines to improve visibility
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
                            if (e.key === 'Enter') {
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
                        Press Enter to add a keyword. These help categorize your content.
                      </FormDescription>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {form.getValues('keywords')?.map((keyword, index) => (
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
                        <h3 className="text-base font-medium mb-3">Categories</h3>
                        <ScrollArea className="h-[300px] border rounded-md p-4">
                          <div className="space-y-2">
                            {categories ? (
                              categories.map((category) => (
                                <div key={category.id} className="flex items-start space-x-2">
                                  <Checkbox
                                    id={`category-${category.id}`}
                                    onCheckedChange={(checked) => {
                                      const currentCategoryIds = form.getValues("categoryIds") || [];
                                      if (checked) {
                                        form.setValue("categoryIds", [...currentCategoryIds, category.id]);
                                      } else {
                                        form.setValue(
                                          "categoryIds",
                                          currentCategoryIds.filter((id) => id !== category.id)
                                        );
                                      }
                                    }}
                                    checked={form.getValues("categoryIds")?.includes(category.id)}
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
                              <p className="text-muted-foreground">Loading categories...</p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                      
                      <div>
                        <h3 className="text-base font-medium mb-3">Tags</h3>
                        <FormField
                          control={form.control}
                          name="tagIds"
                          render={() => (
                            <FormItem>
                              <ScrollArea className="h-[300px] border rounded-md p-4">
                                <div className="space-y-2">
                                  {tags ? (
                                    tags.map((tag) => (
                                      <div key={tag.id} className="flex items-start space-x-2">
                                        <Checkbox
                                          id={`tag-${tag.id}`}
                                          onCheckedChange={(checked) => {
                                            const currentTagIds = form.getValues("tagIds") || [];
                                            if (checked) {
                                              form.setValue("tagIds", [...currentTagIds, tag.id]);
                                            } else {
                                              form.setValue(
                                                "tagIds",
                                                currentTagIds.filter((id) => id !== tag.id)
                                              );
                                            }
                                          }}
                                          checked={form.getValues("tagIds")?.includes(tag.id)}
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
                                    <p className="text-muted-foreground">Loading tags...</p>
                                  )}
                                </div>
                              </ScrollArea>
                              <FormDescription>
                                Select tags that are relevant to your blog post
                              </FormDescription>
                            </FormItem>
                          )}
                        />
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
                                  .filter(author => author.id !== user?.id) // Exclude current user
                                  .map((author) => (
                                    <div key={author.id} className="flex items-start space-x-2">
                                      <Checkbox
                                        id={`author-${author.id}`}
                                        onCheckedChange={(checked) => {
                                          const currentCoAuthors = form.getValues("coAuthorIds") || [];
                                          if (checked) {
                                            form.setValue("coAuthorIds", [...currentCoAuthors, author.id]);
                                          } else {
                                            form.setValue(
                                              "coAuthorIds",
                                              currentCoAuthors.filter((id) => id !== author.id)
                                            );
                                          }
                                        }}
                                        checked={form.getValues("coAuthorIds")?.includes(author.id)}
                                      />
                                      <div>
                                        <label
                                          htmlFor={`author-${author.id}`}
                                          className="text-sm font-medium leading-none"
                                        >
                                          {author.name}
                                        </label>
                                        <p className="text-xs text-muted-foreground">{author.email}</p>
                                      </div>
                                    </div>
                                  ))
                              ) : (
                                <p className="text-muted-foreground">Loading authors...</p>
                              )}
                            </div>
                          </ScrollArea>
                          <FormDescription>
                            Co-authors will be able to edit this post and will be credited in the byline
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <CardFooter className="flex justify-between border-t px-6 py-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/blogs')}
                  >
                    Cancel
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      type="submit"
                      disabled={createArticleMutation.isPending}
                      className="gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {createArticleMutation.isPending ? "Creating..." : "Create Blog"}
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

export default NewBlog;