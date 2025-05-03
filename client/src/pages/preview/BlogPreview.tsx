import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthorLayout from '@/components/layout/AuthorLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Define types for better type safety
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published: boolean;
  featured: boolean;
  authorId: number;
  author?: User;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  readingTime?: number;
}

interface BlogData {
  article: Article;
  categories: Category[];
  tags: Tag[];
  coAuthors: User[];
}

export default function BlogPreview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const numericId = id ? parseInt(id) : 0;
  const isAdmin = user?.role === 'admin';
  
  const {
    data: blogData,
    isLoading,
    error,
  } = useQuery<BlogData>({
    queryKey: [`/api/articles/${numericId}/preview`],
    enabled: !!id && !isNaN(numericId),
  });

  // If there's no valid ID or user isn't authenticated, redirect
  useEffect(() => {
    if ((!id || isNaN(numericId)) && !isLoading) {
      navigate('/admin/blogs');
    }
  }, [id, numericId, isLoading, navigate]);

  // Choose the appropriate layout based on user role
  const Layout = isAdmin ? AdminLayout : AuthorLayout;

  if (isLoading) {
    return (
      <Layout>
        <Helmet>
          <title>Blog Preview | Centre for Human Sciences | Rishihood University</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading preview...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Helmet>
          <title>Preview Error | Centre for Human Sciences | Rishihood University</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error 
                ? error.message 
                : "You don't have permission to preview this article or it doesn't exist."}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate(isAdmin ? '/admin/blogs' : '/author/blogs')}>
            Return to Blog List
          </Button>
        </div>
      </Layout>
    );
  }

  if (!blogData || !blogData.article) {
    return (
      <Layout>
        <Helmet>
          <title>Preview Not Found | Centre for Human Sciences | Rishihood University</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="p-8">
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Not Found</AlertTitle>
            <AlertDescription>
              The article you're trying to preview couldn't be found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate(isAdmin ? '/admin/blogs' : '/author/blogs')}>
            Return to Blog List
          </Button>
        </div>
      </Layout>
    );
  }

  const { article, categories, tags, coAuthors } = blogData;
  
  return (
    <Layout>
      <Helmet>
        <title>{`Preview: ${article.title} | Centre for Human Sciences | Rishihood University`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="container max-w-5xl py-8">
        {/* Preview Banner */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 rounded-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-700 mr-2" />
            <p className="text-yellow-700 font-medium">
              Preview Mode - This is how the article will appear when published
            </p>
          </div>
          <p className="text-yellow-600 text-sm mt-1">
            Status: <span className="font-medium">{article.status}</span> | 
            {article.published ? ' Published' : ' Not Published'}
          </p>
        </div>
        
        {/* Article Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{article.title}</h1>
          
          {/* Author and Date Information */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-muted-foreground">
            <div className="flex items-center">
              {article.author?.avatarUrl && (
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src={article.author.avatarUrl} 
                    alt={article.author.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{article.author?.name || 'Unknown Author'}</p>
                {article.createdAt && (
                  <p className="text-sm">
                    {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
            
            {/* Reading Time */}
            {article.readingTime && (
              <div className="text-sm">
                <span>{article.readingTime} min read</span>
              </div>
            )}
          </div>
          
          {/* Categories and Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories?.map((category: Category) => (
              <Badge key={category.id} variant="secondary" className="bg-primary/10 hover:bg-primary/20">
                {category.name}
              </Badge>
            ))}
            {tags?.map((tag: Tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>
          
          {/* Featured Image */}
          {article.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={article.featuredImage} 
                alt={article.title} 
                className="w-full h-auto"
              />
            </div>
          )}
        </div>
        
        {/* Article Content */}
        <div 
          className="prose max-w-none lg:prose-lg prose-headings:text-foreground prose-p:text-foreground/90"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />
        
        {/* Co-Authors Section */}
        {coAuthors && coAuthors.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">Co-Authors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coAuthors.map((coAuthor: User) => (
                <Card key={coAuthor.id}>
                  <CardContent className="flex items-center p-4">
                    {coAuthor.avatarUrl && (
                      <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                        <img 
                          src={coAuthor.avatarUrl} 
                          alt={coAuthor.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{coAuthor.name}</h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="mt-10 pt-6 border-t flex justify-between">
          <Button 
            variant="outline"
            onClick={() => navigate(isAdmin ? '/admin/blogs' : '/author/blogs')}
          >
            Back to Blogs
          </Button>
          
          <div className="space-x-2">
            {isAdmin && (
              <Button 
                onClick={() => navigate(`/admin/blogs/${article.id}`)}
                variant="secondary"
              >
                Edit Article
              </Button>
            )}
            
            {!isAdmin && article.authorId === user?.id && (
              <Button 
                onClick={() => navigate(`/author/blogs/${article.id}`)}
                variant="secondary"
              >
                Edit Article
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}