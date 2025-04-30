import React from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthorLayout from "@/components/layout/AuthorLayout";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleStatus } from "@shared/schema";

// Blog form schema
const blogFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters",
  }),
  excerpt: z.string().optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED]),
  featuredImage: z.string().url().optional().or(z.literal("")),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

const NewBlogPage = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Default form values
  const defaultValues: Partial<BlogFormValues> = {
    title: "",
    content: "",
    excerpt: "",
    status: ArticleStatus.DRAFT,
    featuredImage: "",
  };
  
  // Form definition with validation
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: async (data: BlogFormValues) => {
      const res = await apiRequest("POST", "/api/articles", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/author/articles"] });
      toast({
        title: "Success",
        description: "Blog post created successfully",
      });
      setLocation("/author/blogs");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post",
        variant: "destructive",
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
          onButtonClick={() => setLocation("/author/blogs")}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content column */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter blog title"
                              className="text-lg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Tabs defaultValue="write">
                      <TabsList className="mb-4">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="write">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Write your blog content here..."
                                  className="min-h-[400px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                You can use Markdown formatting.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="preview">
                        <div className="prose prose-blue max-w-none min-h-[400px] p-4 border rounded-md">
                          {form.watch("content") ? (
                            <div dangerouslySetInnerHTML={{ __html: form.watch("content") }} />
                          ) : (
                            <div className="text-gray-400 italic">
                              Your preview will appear here...
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar column */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Status</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={ArticleStatus.DRAFT}>Draft</SelectItem>
                              <SelectItem value={ArticleStatus.REVIEW}>Send for Review</SelectItem>
                              <SelectItem value={ArticleStatus.PUBLISHED}>Publish</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Set the status of your blog post
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel>Excerpt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief summary of your blog"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            A short summary that appears in blog listings
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Featured Image URL</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            URL for the featured image
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/author/blogs")}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBlogMutation.isPending}
                    >
                      {createBlogMutation.isPending
                        ? "Saving..."
                        : "Save Blog"}
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Preview of featured image */}
                {form.watch("featuredImage") && (
                  <Card>
                    <CardContent className="pt-6">
                      <Label>Featured Image Preview</Label>
                      <div className="mt-2 rounded-md overflow-hidden border">
                        <img
                          src={form.watch("featuredImage")}
                          alt="Featured"
                          className="w-full h-auto object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </AuthorLayout>
  );
};

export default NewBlogPage;