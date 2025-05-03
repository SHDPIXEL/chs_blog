import React from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content, className = '' }) => {
  // You can add custom content processing here if needed
  // For example, handling custom markdown or blog-specific elements
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: content || '' }}
    />
  );
};
