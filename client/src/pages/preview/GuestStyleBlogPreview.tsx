import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Loader2, AlertTriangle, ArrowLeft, MessageSquare, Share2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdminLayout from '@/components/layout/AdminLayout';
import AuthorLayout from '@/components/layout/AuthorLayout';
import { ContentRenderer } from '@/components/blog/ContentRenderer';
import { getInitials } from '@/lib/avatarUtils';

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
  bio?: string;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: string;
  published: boolean;
  authorId: number;
  author?: User;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  viewCount?: number;
}

interface BlogData {
  article: Article;
  categories: Category[];
  tags: Tag[];
  coAuthors: User[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function GuestStyleBlogPreview() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const numericId = id ? parseInt(id) : 0;
  const isAdmin = user?.role === 'admin';
  const [readingProgress, setReadingProgress] = useState(0);
  
  const {
    data: blogData,
    isLoading,
    error,
  } = useQuery<BlogData>({
    queryKey: [`/api/articles/${numericId}/preview`],
    enabled: !!id && !isNaN(numericId),
  });

  // Calculate reading progress as user scrolls
  useEffect(() => {
    const calculateReadingProgress = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', calculateReadingProgress);
    calculateReadingProgress();

    return () => window.removeEventListener('scroll', calculateReadingProgress);
  }, []);

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

      {/* Preview Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-700 mr-2" />
            <p className="text-yellow-700 font-medium">
              Preview Mode - This is how the article will appear when published
            </p>
          </div>
          <div>
            <p className="text-yellow-600 text-sm">
              Status: <span className="font-medium">{article.status}</span> | 
              {article.published ? ' Published' : ' Not Published'}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 h-1.5 bg-gray-200 z-40 shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-200 ease-in-out"
          style={{
            width: `${readingProgress}%`,
            boxShadow: readingProgress > 0 ? "0 0 10px rgba(204, 0, 51, 0.5)" : "none",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={() => navigate(isAdmin ? '/admin/blogs' : '/author/blogs')}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blogs</span>
          </Button>
        </div>

        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            {categories?.map((category: Category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="bg-gray-100"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          <div className="flex items-center mb-8">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage
                src={article.author?.avatarUrl}
                alt={article.author?.name}
              />
              <AvatarFallback>
                {article.author?.name
                  ? getInitials(article.author.name)
                  : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium cursor-pointer">
                  {article.author?.name || "Anonymous"}
                </p>
                {coAuthors.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {coAuthors
                      .slice(0, 3)
                      .map(
                        (coAuthor: User, index: number) => (
                          <Avatar
                            key={index}
                            className="h-6 w-6 border-2 border-white"
                          >
                            <AvatarImage
                              src={coAuthor.avatarUrl}
                              alt={coAuthor.name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(coAuthor.name)}
                            </AvatarFallback>
                          </Avatar>
                        ),
                      )}
                    {coAuthors.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                        +{coAuthors.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>{article.createdAt ? formatDate(article.createdAt.toString()) : 'Draft'}</span>
                <span className="mx-2">•</span>
                <span>
                  {Math.ceil(article.content.length / 1000)} min read
                </span>
                {coAuthors.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{coAuthors.length + 1} authors</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {article.viewCount || 0} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured image */}
        {article.featuredImage && (
          <div className="max-w-4xl mx-auto mb-12 rounded-lg overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Excerpt if available */}
        {article.excerpt && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Excerpt</h3>
              <p className="text-gray-700 italic">{article.excerpt}</p>
            </div>
          </div>
        )}

        {/* Article content */}
        <div className="max-w-4xl mx-auto">
          <ContentRenderer
            content={article.content}
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
          />

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {tags.map((tag: Tag) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Article actions */}
          <div className="mt-12 flex justify-between items-center py-4 border-t border-b">
            <div className="flex gap-6">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
              >
                <MessageSquare className="h-5 w-5" />
                <span>Comment</span>
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Author info */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              About the {coAuthors.length > 0 ? "Authors" : "Author"}
            </h2>

            {/* Main Author Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={article.author?.avatarUrl}
                      alt={article.author?.name}
                    />
                    <AvatarFallback className="text-lg">
                      {article.author?.name
                        ? getInitials(article.author.name)
                        : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{article.author?.name}</h3>
                    <p className="text-gray-600 mb-4">{article.author?.bio || "No author bio available."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Co-authors */}
            {coAuthors && coAuthors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coAuthors.map((coAuthor: User) => (
                  <Card key={coAuthor.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={coAuthor.avatarUrl} alt={coAuthor.name} />
                          <AvatarFallback>
                            {getInitials(coAuthor.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{coAuthor.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">Co-Author</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Edit buttons section */}
          <div className="mt-16 pt-6 border-t flex justify-between">
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
      </div>
    </Layout>
  );
}
