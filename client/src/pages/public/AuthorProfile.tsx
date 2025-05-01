import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Calendar, BookOpen } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { getInitials } from '@/lib/avatarUtils';
import { format } from 'date-fns';

const BlogCard = ({ blog }: { blog: any }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {blog.featuredImage && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={blog.featuredImage} 
            alt={blog.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            {blog.categories?.slice(0, 1).map((category: any) => (
              <Badge key={category.id} variant="outline" className="bg-slate-100">
                {category.name}
              </Badge>
            ))}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">
            <Link href={`/blogs/${blog.id}`}>
              <a className="hover:text-blue-600 transition-colors">
                {blog.title}
              </a>
            </Link>
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {blog.excerpt || blog.content.substring(0, 120).replace(/<[^>]*>?/gm, '')}...
          </p>
        </div>
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>{format(new Date(blog.publishedAt || blog.createdAt), 'MMM d, yyyy')}</span>
            <span>{Math.ceil(blog.content.length / 1000)} min read</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AuthorProfile: React.FC = () => {
  const [, params] = useRoute('/authors/:id');
  const authorId = params?.id ? parseInt(params.id) : 0;

  // Fetch author profile data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/authors/${authorId}/public`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/authors/${authorId}/public`);
        if (!res.ok) throw new Error('Failed to fetch author profile');
        return await res.json();
      } catch (error) {
        console.error('Error fetching author profile:', error);
        return null;
      }
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Error or not found state
  if (error || !data) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Author not found</h1>
            <p className="mt-4 text-gray-600">The author you're looking for does not exist or has been removed.</p>
            <Link href="/blogs">
              <Button className="mt-8 bg-rose-600 hover:bg-rose-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const { author, articles, totalArticles } = data;

  return (
    <PublicLayout>
      <Helmet>
        <title>{author.name} - Author Profile | BlogCMS</title>
        <meta name="description" content={`${author.name}'s profile and articles`} />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blogs</span>
            </Button>
          </Link>
        </div>
        
        {/* Author profile header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <Avatar className="h-32 w-32 border-4 border-white shadow-md">
              <AvatarImage 
                src={author.avatarUrl} 
                alt={author.name} 
              />
              <AvatarFallback className="text-3xl">{getInitials(author.name)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{author.name}</h1>
              
              <div className="flex flex-wrap gap-3 items-center mb-5">
                <Badge variant="secondary" className="px-3 py-1">
                  {author.role}
                </Badge>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Joined {format(new Date(author.createdAt), 'MMMM yyyy')}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{totalArticles} Articles</span>
                </div>
              </div>
              
              {author.bio && (
                <p className="text-gray-700 mb-6">
                  {author.bio}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Author's articles */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{author.name}'s Articles</h2>
          
          {articles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article: any) => (
                  <BlogCard key={article.id} blog={article} />
                ))}
              </div>
              
              {totalArticles > articles.length && (
                <div className="mt-10 text-center">
                  <p className="text-gray-600 mb-4">
                    Showing {articles.length} of {totalArticles} articles
                  </p>
                  <Button>
                    Load More Articles
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">No articles yet</h3>
              <p className="text-gray-500 mt-2">
                {author.name} hasn't published any articles yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default AuthorProfile;