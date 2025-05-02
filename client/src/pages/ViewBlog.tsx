import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Article, User, Category, Tag } from '@shared/schema';
import { Loader2, Calendar, User as UserIcon, Tag as TagIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';

interface ViewBlogProps {}

interface ArticleWithRelations {
  article: Article;
  categories: Category[];
  tags: Tag[];
  coAuthors: User[];
}

const ViewBlog: React.FC<ViewBlogProps> = () => {
  const params = useParams<{ id: string }>();
  const articleId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Fetch the article data
  const { data, isLoading, error } = useQuery<ArticleWithRelations>({
    queryKey: [`/api/articles/${articleId}/full`],
    queryFn: async () => {
      try {
        const res = await apiRequest('GET', `/api/articles/${articleId}/full`);
        return res.json();
      } catch (error) {
        // If article is not found or user is not authorized, handle gracefully
        if (error instanceof Error && (error.message.includes('403') || error.message.includes('401'))) {
          // Navigate to home if unauthorized
          navigate('/');
        }
        throw error;
      }
    }
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Article not found</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>The article you're looking for doesn't exist or is not published yet.</p>
              </div>
              <div className="mt-4">
                <Button size="sm" onClick={() => navigate('/')}>
                  Return Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const { article, categories, tags, coAuthors } = data;
  const formattedDate = format(new Date(article.createdAt), 'MMMM dd, yyyy');
  
  // Check if the current user is the author or a co-author and can edit
  const canEdit = isAuthenticated && user && (
    article.authorId === user.id ||
    coAuthors.some(author => author.id === user.id) ||
    user.role === 'admin'
  );
  
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <div className="flex items-center">
                <Button variant="ghost" className="p-2" onClick={() => navigate('/')}>
                  <span className="font-semibold text-xl">Blog Platform</span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {canEdit && (
                <Button onClick={() => navigate(`/author/blogs/${article.id}`)}>
                  Edit Article
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate('/author/blogs')}>
                Back to Blogs
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Article content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Article header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-gray-600 gap-4 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>By {coAuthors.find(author => author.id === article.authorId)?.name || 'Unknown Author'}</span>
            </div>
            
            {/* Status badge */}
            <Badge variant={article.status === 'published' ? 'default' : 
                   article.status === 'review' ? 'outline' : 'secondary'}>
              {article.status === 'published' ? 'Published' : 
               article.status === 'review' ? 'In Review' : 'Draft'}
            </Badge>
            
            {coAuthors.length > 0 && (
              <div className="flex items-center">
                <span>Co-authors: </span>
                <span className="ml-1">
                  {coAuthors.map(author => author.name).join(', ')}
                </span>
              </div>
            )}
          </div>
          
          {/* Featured image */}
          {article.featuredImage && (
            <div className="mb-8">
              <img 
                src={article.featuredImage} 
                alt={article.title}
                className="w-full h-auto rounded-lg object-cover max-h-96" 
              />
            </div>
          )}
          
          {/* Categories and tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Categories:</span>
                {categories.map(category => (
                  <Badge key={category.id} variant="outline" className="font-medium">
                    {category.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 ml-4">
                <TagIcon className="h-4 w-4 text-gray-600" />
                {tags.map(tag => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Separator className="mb-6" />
        </div>
        
        {/* Article excerpt if available */}
        {article.excerpt && (
          <div className="mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Excerpt</h3>
              <p className="text-gray-700 italic">{article.excerpt}</p>
            </div>
          </div>
        )}
        
        {/* Article content */}
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
              {canEdit && (
                <Button variant="ghost" onClick={() => navigate(`/author/blogs/${article.id}`)}>
                  Edit Article
                </Button>
              )}
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} Blog Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ViewBlog;