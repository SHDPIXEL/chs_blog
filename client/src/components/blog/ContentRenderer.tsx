import React, { useEffect, useRef } from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className = '' }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Process images to enhance styling after the content is rendered
    if (contentRef.current) {
      // 1. Handle images inside anchors (new pattern from editor)
      const linkedImages = contentRef.current.querySelectorAll('a > img');
      
      linkedImages.forEach(img => {
        const anchor = img.parentElement;
        
        if (anchor && anchor.tagName.toLowerCase() === 'a') {
          // Style the anchor element
          anchor.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          img.classList.add('rounded-md');
          
          // Add indicator that this is a link
          const indicator = document.createElement('div');
          indicator.className = 'absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center';
          indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
          anchor.appendChild(indicator);
        }
      });
      
      // 2. Legacy support - also process div[data-type="image"] with data-link for older content
      const images = contentRef.current.querySelectorAll('img');
      
      images.forEach(img => {
        // Skip images that are already inside anchor tags
        if (img.parentElement?.tagName.toLowerCase() === 'a') return;
        
        // Check if the image is inside a custom linked image container
        const parentDiv = img.closest('div[data-type="image"]');
        
        if (parentDiv) {
          // Extract link from the data-link attribute if it exists
          const link = parentDiv.getAttribute('data-link');
          
          if (link) {
            // Create a wrapper with proper styling
            const wrapper = document.createElement('a');
            wrapper.href = link;
            wrapper.target = "_blank";
            wrapper.rel = "noopener noreferrer";
            wrapper.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
            
            // Apply some styling to indicate it's a linked image
            img.classList.add('rounded-md');
            
            // Replace the image with wrapped version
            img.parentNode?.insertBefore(wrapper, img);
            wrapper.appendChild(img);
            
            // Add indicator that this is a link
            const indicator = document.createElement('div');
            indicator.className = 'absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center';
            indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
            wrapper.appendChild(indicator);
          }
        }
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef} 
      className={className} 
      dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}