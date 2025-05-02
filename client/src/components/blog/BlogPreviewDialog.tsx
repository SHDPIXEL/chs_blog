import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, Tag as TagIcon, Eye, MessageSquare, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Author {
  name: string;
  avatarUrl?: string;
}

interface BlogPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  excerpt?: string; // Added excerpt support
  author: Author | string;
  createdAt: string;
  image?: string | null;
  categories?: string[];
  tags?: string[];
}

const BlogPreviewDialog: React.FC<BlogPreviewProps> = ({
  open,
  onOpenChange,
  title,
  content,
  excerpt,
  author,
  createdAt,
  image,
  categories = [],
  tags = [],
}) => {
  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Handle either string or Author object or undefined
  const authorName = typeof author === 'string' ? author : (author?.name || 'Anonymous');
  const authorAvatar = typeof author === 'string' ? undefined : author?.avatarUrl;
  
  // Format date for display
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Blog Preview</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Article header */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="flex items-center gap-3 mb-4">
                {categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="bg-gray-100">
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {title}
              </h1>
              
              <div className="flex items-center mb-8">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={authorAvatar} alt={authorName} />
                  <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium hover:text-blue-600 transition-colors cursor-pointer">
                      {authorName || 'Anonymous'}
                    </p>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{formattedDate}</span>
                    <span className="mx-2">•</span>
                    <span>{Math.ceil(content.length / 1000)} min read</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      0 views
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Featured image */}
            {image && (
              <div className="max-w-5xl mx-auto mb-12 rounded-lg overflow-hidden">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-[400px] object-cover"
                />
              </div>
            )}
            
            {/* Excerpt if available */}
            {excerpt && (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">Excerpt</h3>
                  <p className="text-gray-700 italic">{excerpt}</p>
                </div>
              </div>
            )}
            
            {/* Article content */}
            <div className="max-w-4xl mx-auto">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-12 flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      #{tag}
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
                <h2 className="text-2xl font-bold mb-6">About the Author</h2>
                
                {/* Main Author Card */}
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={authorAvatar} alt={authorName} />
                        <AvatarFallback className="text-lg">{getInitials(authorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{authorName || 'Anonymous'}</h3>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">Author</Badge>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Author of this blog post.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPreviewDialog;