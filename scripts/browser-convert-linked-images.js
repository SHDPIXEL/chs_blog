/**
 * Browser console utility to convert linked images in HTML content
 * 
 * How to use:
 * 1. Copy this entire file
 * 2. Open your browser console in the blog system
 * 3. Paste and run this script
 * 4. Call convertLinkedImages() with your content string
 * 5. Use the returned HTML string for updating content
 */

/**
 * Converts old format linked images to proper anchor-wrapped images
 * @param {string} htmlContent - The HTML content to process
 * @return {string} - The processed HTML content
 */
function convertLinkedImages(htmlContent) {
  console.log('Processing HTML content...');
  
  // Create a temporary container
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Find all images with link attribute
  const linkedImages = tempDiv.querySelectorAll('img[link]');
  console.log(`Found ${linkedImages.length} linked images`);
  
  if (linkedImages.length === 0) {
    console.log('No linked images found, returning original content');
    return htmlContent;
  }
  
  // Process each linked image
  linkedImages.forEach((img, index) => {
    const link = img.getAttribute('link');
    if (!link) return;
    
    console.log(`Processing image ${index + 1} with link: ${link}`);
    
    // Create a new anchor element
    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    
    // Clone the image element
    const imgClone = img.cloneNode(true);
    
    // Remove the link attribute from the cloned image
    imgClone.removeAttribute('link');
    
    // Add the image to the anchor
    anchor.appendChild(imgClone);
    
    // Replace the original image with the new anchor+image
    img.parentNode.replaceChild(anchor, img);
  });
  
  // Return the updated HTML content
  console.log('Conversion complete');
  return tempDiv.innerHTML;
}

/**
 * Example usage with the provided content
 */
function exampleConversion() {
  const originalContent = `<p>lkn</p><img src="/uploads/0f1c7c0f-245f-45d4-be64-8bfeaa5ca02d.png" width="600px" height="600px" link="https://shdpixel.com">`;
  
  console.log('Original content:');
  console.log(originalContent);
  
  const convertedContent = convertLinkedImages(originalContent);
  
  console.log('Converted content:');
  console.log(convertedContent);
  
  return {
    original: originalContent,
    converted: convertedContent
  };
}

// Run the example conversion
const result = exampleConversion();

// Make the functions available in the global scope for testing
window.convertLinkedImages = convertLinkedImages;
window.exampleConversion = exampleConversion;

console.log('✅ Linked image converter loaded successfully');
console.log('To convert content, call: convertLinkedImages(htmlContent)');
console.log('To run the example again, call: exampleConversion()');

// Return the example result
result;