import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, User, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Author {
  name: string;
  avatarUrl?: string;
}

interface BlogPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  author: Author;
  date: string;
  categories?: string[];
  tags?: string[];
  featuredImage?: string;
}

const BlogPreviewDialog: React.FC<BlogPreviewProps> = ({
  isOpen,
  onClose,
  title,
  content,
  author,
  date,
  categories = [],
  tags = [],
  featuredImage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Blog Preview</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="container mx-auto max-w-3xl">
            {/* Featured Image */}
            {featuredImage && (
              <div className="mb-6 rounded-lg overflow-hidden h-64 md:h-96">
                <img 
                  src={featuredImage} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Title */}
            <h1 className="font-garamond text-3xl md:text-4xl font-bold text-[#333A3D] mb-4">{title}</h1>
            
            {/* Author and Meta */}
            <div className="flex flex-wrap items-center mb-6">
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-1 text-[#CC0033]" />
                <span className="text-sm font-medium">
                  {author.name}
                </span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-1 text-[#CC0033]" />
                <span className="text-sm">{date || 'Draft'}</span>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-1 text-[#CC0033]" />
                  <span className="text-sm">{categories.join(', ')}</span>
                </div>
              )}
            </div>
            
            <Separator className="mb-6" />
            
            {/* Content */}
            <div 
              className="prose prose-sm md:prose max-w-none font-montserrat"
              dangerouslySetInnerHTML={{ __html: content }}
            />
            
            {/* Tags */}
            {tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="inline-block bg-[#FFEDD2] text-[#81204D] text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPreviewDialog;