import React, { useEffect, useRef } from "react";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({
  content,
  className = "",
}: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Process images to enhance styling after the content is rendered
    if (contentRef.current) {
      console.log(
        "ContentRenderer processing content with length:",
        content.length,
      );
      
      // Log image data for debugging
      const allImages = contentRef.current.querySelectorAll("img");
      console.log(`Found ${allImages.length} images in content`);
      
      // 1. First check for images with direct link attribute in the img tag
      //    These may come from older content
      allImages.forEach((img, index) => {
        console.log(`Processing image ${index + 1}:`, {
          src: img.getAttribute("src"),
          link: img.getAttribute("link"),
          width: img.getAttribute("width"),
          height: img.getAttribute("height"),
          isInAnchor: img.parentElement?.tagName.toLowerCase() === "a",
          parentElement: img.parentElement?.tagName,
        });
        
        // If image has a link but is not in an anchor
        const imgLink = img.getAttribute("link");
        if (imgLink && img.parentElement?.tagName.toLowerCase() !== "a") {
          console.log(`Image ${index + 1} has link attribute but no anchor parent, creating anchor`);
          
          // Create a wrapper with proper styling
          const wrapper = document.createElement("a");
          wrapper.href = imgLink;
          wrapper.target = "_blank";
          wrapper.rel = "noopener noreferrer";
          wrapper.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          img.classList.add("rounded-md");
          
          // Get image dimensions from attributes
          const width = img.getAttribute("width");
          const height = img.getAttribute("height");
          
          // Apply dimensions to wrapper
          if (width) {
            wrapper.style.width = width.includes('px') ? width : `${width}px`;
            wrapper.style.display = 'block';
          }
          
          if (height) {
            img.style.height = height.includes('px') ? height : `${height}px`;
          }
          
          // Make sure the image fills the container
          img.style.maxWidth = '100%';
          img.style.objectFit = 'contain';
          
          // Replace the image with wrapped version
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          
          // Remove the link attribute as it's now implemented as an anchor
          img.removeAttribute("link");
          
          // Add indicator that this is a link
          const indicator = document.createElement("div");
          indicator.className = "absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center";
          indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
          wrapper.appendChild(indicator);
        }
      });
      
      // 2. Handle images inside anchors (new pattern from editor)
      const linkedImages = contentRef.current.querySelectorAll("a > img");
      console.log(`Found ${linkedImages.length} images already inside anchor tags`);
      
      linkedImages.forEach((img, index) => {
        const anchor = img.parentElement as HTMLAnchorElement;
        
        console.log(`Processing linked image ${index + 1}:`, {
          src: img.getAttribute("src"),
          anchorHref: anchor.href,
          width: img.getAttribute("width"),
          height: img.getAttribute("height"),
          hasLinkIndicator: anchor.querySelector(".bg-blue-500") !== null,
        });
        
        if (anchor && anchor.tagName.toLowerCase() === "a") {
          // Style the anchor element if it doesn't already have the class
          if (!anchor.className.includes("inline-block")) {
            anchor.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
            
            // Apply some styling to indicate it's a linked image
            img.classList.add("rounded-md");
            
            // Get image dimensions from attributes
            const width = img.getAttribute('width');
            const height = img.getAttribute('height');
            
            // Apply dimensions to both the image and anchor if they exist
            if (width) {
              // Set the anchor container width to match the image width
              anchor.style.width = width.includes('px') ? width : `${width}px`;
              anchor.style.display = 'block'; // Make sure it takes up the full width
            }
            
            if (height) {
              // Set the image height 
              img.style.height = height.includes('px') ? height : `${height}px`;
            }
            
            // Make sure the image fills the container
            img.style.maxWidth = '100%';
            img.style.objectFit = 'contain';
            
            // Add indicator that this is a link if not already present
            if (!anchor.querySelector(".bg-blue-500")) {
              const indicator = document.createElement("div");
              indicator.className = "absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center";
              indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
              anchor.appendChild(indicator);
            }
          }
        }
      });
      
      // 3. Legacy support - also process div[data-type="image"] with data-link for older content
      const imageContainers = contentRef.current.querySelectorAll('div[data-type="image"]');
      console.log(`Found ${imageContainers.length} image containers with data-type="image"`);
      
      imageContainers.forEach((container, index) => {
        const link = container.getAttribute("data-link");
        const img = container.querySelector("img");
        
        console.log(`Processing image container ${index + 1}:`, {
          dataLink: link,
          hasImage: !!img,
          width: img?.getAttribute("width"),
          height: img?.getAttribute("height"),
          isImgInAnchor: img?.parentElement?.tagName.toLowerCase() === "a",
        });
        
        if (link && img && img.parentElement?.tagName.toLowerCase() !== "a") {
          // Create a wrapper with proper styling
          const wrapper = document.createElement("a");
          wrapper.href = link;
          wrapper.target = "_blank";
          wrapper.rel = "noopener noreferrer";
          wrapper.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          img.classList.add("rounded-md");
          
          // Get image dimensions from attributes
          const width = img.getAttribute("width");
          const height = img.getAttribute("height");
          
          // Apply dimensions to wrapper
          if (width) {
            wrapper.style.width = width.includes('px') ? width : `${width}px`;
            wrapper.style.display = 'block';
          }
          
          if (height) {
            img.style.height = height.includes('px') ? height : `${height}px`;
          }
          
          // Make sure the image fills the container
          img.style.maxWidth = '100%';
          img.style.objectFit = 'contain';
          
          // Replace the image with wrapped version
          img.parentNode?.insertBefore(wrapper, img);
          wrapper.appendChild(img);
          
          // Add indicator that this is a link
          const indicator = document.createElement("div");
          indicator.className = "absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center";
          indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
          wrapper.appendChild(indicator);
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