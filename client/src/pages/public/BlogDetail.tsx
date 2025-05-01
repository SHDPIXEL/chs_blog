import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageSquare, Share2, Eye } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { CommentsList } from '@/components/comments/CommentsList';
import { getInitials } from '@/lib/avatarUtils';

// Demo images for placeholder
const demoImages = [
  '/uploads/96af7ed8-cd23-4f38-b2ed-9e03a54bc72b.png',
  '/uploads/08a69f11-51da-491a-a8d4-cedebb5f3d90.png',
  '/uploads/d03cc5f2-2997-4bde-9ebe-80894b10adbd.png',
  '/uploads/e51dde8b-a72e-4c15-b668-d0e6d9aae7ec.png',
];

const BlogDetail: React.FC = () => {
  const [, params] = useRoute('/blogs/:id');
  const articleId = params?.id ? parseInt(params.id) : 0;

  // Fetch article details
  const { data: article, isLoading, error } = useQuery({
    queryKey: [`/api/articles/${articleId}/public`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/public`);
        if (!res.ok) throw new Error('Failed to fetch article');
        return await res.json();
      } catch (error) {
        console.error('Error fetching article:', error);
        return null;
      }
    }
  });

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  // If loading or error
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
            <p className="mt-4 text-gray-600">The article you're looking for does not exist or has been removed.</p>
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

  const { article: articleData, categories = [], tags = [], coAuthors = [] } = article;

  return (
    <PublicLayout>
      <Helmet>
        <title>{articleData.title} | BlogCMS</title>
        <meta name="description" content={articleData.excerpt} />
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
        
        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            {categories.map((category: any) => (
              <Badge key={category.id} variant="outline" className="bg-gray-100">
                {category.name}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {articleData.title}
          </h1>
          
          <div className="flex items-center mb-8">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage src={articleData.author?.avatarUrl} alt={articleData.author?.name} />
              <AvatarFallback>{articleData.author?.name ? getInitials(articleData.author.name) : 'A'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/authors/${articleData.author?.id}`}>
                  <p className="font-medium hover:text-blue-600 transition-colors cursor-pointer">
                    {articleData.author?.name || 'Anonymous'}
                  </p>
                </Link>
                {coAuthors.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {coAuthors.slice(0, 3).map((coAuthor: any, index: number) => (
                      <Avatar key={index} className="h-6 w-6 border-2 border-white">
                        <AvatarImage src={coAuthor.avatarUrl} alt={coAuthor.name} />
                        <AvatarFallback className="text-xs">{getInitials(coAuthor.name)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {coAuthors.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                        +{coAuthors.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>{formatDate(articleData.createdAt.toString())}</span>
                <span className="mx-2">•</span>
                <span>{Math.ceil(articleData.content.length / 1000)} min read</span>
                {coAuthors.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{coAuthors.length + 1} authors</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {Intl.NumberFormat().format(articleData.viewCount || 0)} views
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured image */}
        {articleData.featuredImage && (
          <div className="max-w-5xl mx-auto mb-12 rounded-lg overflow-hidden">
            <img 
              src={articleData.featuredImage} 
              alt={articleData.title} 
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}
        
        {/* Article content */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
            dangerouslySetInnerHTML={{ __html: articleData.content }}
          />
          
          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {tags.map((tag: any) => (
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
                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
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
            <h2 className="text-2xl font-bold mb-6">About the {coAuthors.length > 0 ? 'Authors' : 'Author'}</h2>
            
            {/* Main Author Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={articleData.author?.avatarUrl} alt={articleData.author?.name} />
                    <AvatarFallback className="text-lg">{articleData.author?.name ? getInitials(articleData.author.name) : 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{articleData.author?.name || 'Anonymous'}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">Main Author</Badge>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {articleData.author?.bio || 'Academic researcher and writer specializing in philosophy and ethics.'}
                    </p>
                    <Link href={`/authors/${articleData.author?.id}`}>
                      <Button variant="outline">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Co-authors Cards */}
            {coAuthors.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-2">Co-Authors</h3>
                {coAuthors.map((coAuthor: any) => (
                  <Card key={coAuthor.id} className="bg-gray-50">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row gap-6">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={coAuthor.avatarUrl} alt={coAuthor.name} />
                          <AvatarFallback>{getInitials(coAuthor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-lg font-bold mb-2">{coAuthor.name}</h3>
                          <p className="text-gray-700 text-sm mb-4">
                            {coAuthor.bio || 'Contributor to this article'}
                          </p>
                          <Link href={`/authors/${coAuthor.id}`}>
                            <Button variant="outline" size="sm">View Profile</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          {/* Related articles would go here */}
          
          {/* Comments section */}
          <div id="comments-section" className="mt-16">
            <CommentsList articleId={articleId} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default BlogDetail;