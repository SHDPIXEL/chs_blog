import React from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, UserPlus } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/ui/PageHeader';
import { Checkbox } from '@/components/ui/checkbox';

// Form validation schema
const authorSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  bio: z.string().optional(),
  canPublish: z.boolean().default(false),
});

type AuthorFormValues = z.infer<typeof authorSchema>;

const AddAuthor: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Set up form with validation
  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      bio: '',
      canPublish: false,
    },
  });

  // Mutation to create a new author
  const createAuthorMutation = useMutation({
    mutationFn: async (data: AuthorFormValues) => {
      const response = await apiRequest('POST', '/api/admin/authors', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Author created',
        description: 'The new author has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/authors'] });
      navigate('/admin/authors');
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create author',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: AuthorFormValues) => {
    createAuthorMutation.mutate(values);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Add New Author | Centre for Human Sciences | Rishihood University</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="p-6">
        <PageHeader
          title="Add New Author"
          buttonText="Back to Authors"
          buttonIcon={ArrowLeft}
          onButtonClick={() => navigate('/admin/authors')}
        />

        <div className="mt-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Author Details</CardTitle>
              <CardDescription>
                Create a new author account in the blog management system
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                  {/* Name field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormDescription>
                          The author's full name as it will appear on articles
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="email@example.com" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Email address used for login and notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Minimum 8 characters" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Temporary password - the author can change this after logging in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bio field */}
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Author Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Brief author biography" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A short description about the author that will appear on their profile
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Publishing permissions */}
                  <FormField
                    control={form.control}
                    name="canPublish"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Publishing Rights
                          </FormLabel>
                          <FormDescription>
                            Allow this author to publish articles without admin approval
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/authors')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createAuthorMutation.isPending}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {createAuthorMutation.isPending ? 'Creating...' : 'Create Author'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddAuthor;
