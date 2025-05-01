import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import AuthorLayout from '@/components/layout/AuthorLayout';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Article } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Clock, Eye, MessageSquare, Trash2, FileText, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ArticleStatusType } from '@shared/schema';

type ArticleStatusFilter = 'all' | ArticleStatusType;

const AuthorBlogs: React.FC = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<ArticleStatusFilter>('all');
  
  // Fetch all articles or filter by status
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/author/articles', statusFilter],
    queryFn: async () => {
      const endpoint = statusFilter === 'all' 
        ? '/api/author/articles' 
        : `/api/author/articles/${statusFilter}`;
      
      const res = await apiRequest('GET', endpoint);
      return res.json();
    }
  });
  
  // Status badge color mapping
  const getStatusBadgeVariant = (status: ArticleStatusType) => {
    switch (status) {
      case 'published': return 'default';
      case 'draft': return 'secondary';
      case 'review': return 'outline';
      default: return 'secondary';
    }
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <AuthorLayout>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between mb-6">
            <div className="animate-pulse h-8 w-1/4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-10 w-32 bg-gray-200 rounded"></div>
          </div>
          
          <div className="mb-6 animate-pulse h-12 w-full bg-gray-200 rounded"></div>
          
          {Array(3).fill(null).map((_, i) => (
            <div key={i} className="mb-4 animate-pulse">
              <div className="h-32 w-full bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </AuthorLayout>
    );
  }
  
  return (
    <AuthorLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <PageHeader 
          title="My Blogs" 
          buttonText="New Blog"
          buttonIcon={Plus}
          onButtonClick={() => navigate('/author/blogs/new')}
        />
        
        {/* Status filter tabs */}
        <div className="mt-6">
          <Tabs 
            defaultValue="all" 
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as ArticleStatusFilter)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full md:w-2/3 lg:w-1/2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="draft">Drafts</TabsTrigger>
              <TabsTrigger value="review">In Review</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
            </TabsList>
            
            <TabsContent value={statusFilter} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {statusFilter === 'all' ? 'All Blogs' : `${statusFilter} Blogs`}
                  </CardTitle>
                  <CardDescription>
                    {statusFilter === 'all' && 'View and manage all your blog posts'}
                    {statusFilter === 'draft' && 'Blog posts you\'re still working on'}
                    {statusFilter === 'review' && 'Blog posts submitted for review'}
                    {statusFilter === 'published' && 'Blog posts that are live on the site'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <div className="text-red-600 p-4">
                      Error loading blogs: {error instanceof Error ? error.message : 'Unknown error'}
                    </div>
                  ) : articles && articles.length > 0 ? (
                    <div className="space-y-4">
                      {articles.map((article) => (
                        <BlogItem key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No blogs found</h3>
                      <p className="text-gray-500 mb-4">
                        {statusFilter === 'all' && "You haven't created any blogs yet."}
                        {statusFilter === 'draft' && "You don't have any draft blogs."}
                        {statusFilter === 'review' && "You don't have any blogs in review."}
                        {statusFilter === 'published' && "You don't have any published blogs."}
                      </p>
                      <Button onClick={() => navigate('/author/blogs/new')}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Blog
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthorLayout>
  );
};

interface BlogItemProps {
  article: Article;
}

const BlogItem: React.FC<BlogItemProps> = ({ article }) => {
  return (
    <div className="border rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <div className="flex flex-col md:flex-row">
        {/* Featured image (if available) */}
        {article.featuredImage && (
          <div className="md:w-1/4 h-48 md:h-auto">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className={`p-4 ${article.featuredImage ? 'md:w-3/4' : 'w-full'}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
            <Badge variant={getStatusBadgeVariant(article.status as ArticleStatusType)} className="capitalize">
              {article.status}
            </Badge>
          </div>
          
          {article.excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-2">{article.excerpt}</p>
          )}
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Clock className="mr-1 h-4 w-4" />
            <span>
              {article.status === 'published'
                ? `Published ${formatDistanceToNow(new Date(article.createdAt), { addSuffix: true })}`
                : `Last edited ${formatDistanceToNow(new Date(article.updatedAt), { addSuffix: true })}`}
            </span>
            
            {article.status === 'published' && (
              <>
                <span className="mx-2">•</span>
                <Eye className="mr-1 h-4 w-4" />
                <span>243 views</span>
                
                <span className="mx-2">•</span>
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>5 comments</span>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/author/blogs/${article.id}`}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </Button>
            <Button 
              variant={article.status === 'published' ? 'default' : 'outline'} 
              size="sm" 
              asChild
            >
              <Link href={`/blog/${article.id}`}>
                <Eye className="mr-1 h-4 w-4" /> View
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: ArticleStatusType) => {
  switch (status) {
    case 'published': return 'default';
    case 'draft': return 'secondary';
    case 'review': return 'outline';
    default: return 'secondary';
  }
};

export default AuthorBlogs;