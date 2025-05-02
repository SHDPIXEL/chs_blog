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
        // Cast img to HTMLImageElement to access style property
        const imgElement = img as HTMLImageElement;
        
        console.log(`Processing image ${index + 1}:`, {
          src: imgElement.getAttribute("src"),
          link: imgElement.getAttribute("link"),
          width: imgElement.getAttribute("width"),
          height: imgElement.getAttribute("height"),
          isInAnchor: imgElement.parentElement?.tagName.toLowerCase() === "a",
          parentElement: imgElement.parentElement?.tagName,
        });
        
        // If image has a link but is not in an anchor
        const imgLink = imgElement.getAttribute("link");
        if (imgLink && imgElement.parentElement?.tagName.toLowerCase() !== "a") {
          console.log(`Image ${index + 1} has link attribute but no anchor parent, creating anchor`);
          
          // Create a wrapper with proper styling
          const wrapper = document.createElement("a");
          wrapper.href = imgLink;
          wrapper.target = "_blank";
          wrapper.rel = "noopener noreferrer";
          wrapper.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          imgElement.classList.add("rounded-md");
          
          // Get image dimensions from attributes
          const width = imgElement.getAttribute("width");
          const height = imgElement.getAttribute("height");
          
          // Apply dimensions to wrapper
          if (width) {
            wrapper.style.width = width.includes('px') ? width : `${width}px`;
            wrapper.style.display = 'block';
          }
          
          if (height) {
            imgElement.style.height = height.includes('px') ? height : `${height}px`;
          }
          
          // Make sure the image fills the container
          imgElement.style.maxWidth = '100%';
          imgElement.style.objectFit = 'contain';
          
          // Replace the image with wrapped version
          imgElement.parentNode?.insertBefore(wrapper, imgElement);
          wrapper.appendChild(imgElement);
          
          // Remove the link attribute as it's now implemented as an anchor
          imgElement.removeAttribute("link");
          
          // Add indicator that this is a link
          const indicator = document.createElement("div");
          indicator.className = "absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center";
          indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
          wrapper.appendChild(indicator);
        }
      });
      
      // 2. Fetch anchors again after previous modifications
      const anchors = contentRef.current.querySelectorAll("a");
      console.log(`Found ${anchors.length} anchors in content`);
      
      anchors.forEach((anchor, index) => {
        // Cast to HTMLAnchorElement to access style property
        const anchorElement = anchor as HTMLAnchorElement;
        
        // Check if the anchor has an image as a direct child
        const imgElement = anchorElement.querySelector("img") as HTMLImageElement;
        if (!imgElement) return; // Skip anchors without images
        
        console.log(`Processing anchor with image ${index + 1}:`, {
          href: anchorElement.href,
          hasImage: !!imgElement,
          imageSource: imgElement?.getAttribute("src"),
          width: imgElement?.getAttribute("width"),
          height: imgElement?.getAttribute("height"),
          hasLinkIndicator: anchorElement.querySelector(".bg-blue-500") !== null,
        });
        
        // Style the anchor element if it doesn't already have the class
        if (!anchorElement.className.includes("inline-block")) {
          anchorElement.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          imgElement.classList.add("rounded-md");
          
          // Get image dimensions from attributes
          const width = imgElement.getAttribute('width');
          const height = imgElement.getAttribute('height');
          
          // Apply dimensions to both the image and anchor if they exist
          if (width) {
            // Set the anchor container width to match the image width
            anchorElement.style.width = width.includes('px') ? width : `${width}px`;
            anchorElement.style.display = 'block'; // Make sure it takes up the full width
          }
          
          if (height) {
            // Set the image height 
            imgElement.style.height = height.includes('px') ? height : `${height}px`;
          }
          
          // Make sure the image fills the container
          imgElement.style.maxWidth = '100%';
          imgElement.style.objectFit = 'contain';
          
          // Add indicator that this is a link if not already present
          if (!anchorElement.querySelector(".bg-blue-500")) {
            const indicator = document.createElement("div");
            indicator.className = "absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md shadow-md text-xs flex items-center";
            indicator.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 mr-1"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg><span class="hidden sm:inline">Link</span>';
            anchorElement.appendChild(indicator);
          }
        }
      });
      
      // 3. Legacy support - also process div[data-type="image"] with data-link for older content
      const imageContainers = contentRef.current.querySelectorAll('div[data-type="image"]');
      console.log(`Found ${imageContainers.length} image containers with data-type="image"`);
      
      imageContainers.forEach((container, index) => {
        const link = container.getAttribute("data-link");
        const imgElement = container.querySelector("img") as HTMLImageElement;
        
        if (!imgElement) {
          console.log(`Image container ${index + 1} has no image, skipping`);
          return;
        }
        
        console.log(`Processing image container ${index + 1}:`, {
          dataLink: link,
          hasImage: !!imgElement,
          width: imgElement.getAttribute("width"),
          height: imgElement.getAttribute("height"),
          isImgInAnchor: imgElement.parentElement?.tagName.toLowerCase() === "a",
        });
        
        if (link && imgElement && imgElement.parentElement?.tagName.toLowerCase() !== "a") {
          // Create a wrapper with proper styling
          const wrapper = document.createElement("a");
          wrapper.href = link;
          wrapper.target = "_blank";
          wrapper.rel = "noopener noreferrer";
          wrapper.className = "inline-block relative cursor-pointer hover:opacity-95 transition-all";
          
          // Apply some styling to indicate it's a linked image
          imgElement.classList.add("rounded-md");
          
          // Get image dimensions from attributes
          const width = imgElement.getAttribute("width");
          const height = imgElement.getAttribute("height");
          
          // Apply dimensions to wrapper
          if (width) {
            wrapper.style.width = width.includes('px') ? width : `${width}px`;
            wrapper.style.display = 'block';
          }
          
          if (height) {
            imgElement.style.height = height.includes('px') ? height : `${height}px`;
          }
          
          // Make sure the image fills the container
          imgElement.style.maxWidth = '100%';
          imgElement.style.objectFit = 'contain';
          
          // Replace the image with wrapped version
          imgElement.parentNode?.insertBefore(wrapper, imgElement);
          wrapper.appendChild(imgElement);
          
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