/**
 * Utility script to fix linked images in a specific article
 * 
 * Run with: npx tsx scripts/fix-article-images.ts [articleId]
 * Example: npx tsx scripts/fix-article-images.ts 17
 */

import { db } from '../server/db';
import { articles } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { JSDOM } from 'jsdom';

/**
 * Fixes linked images in an article's content
 * @param articleId - The ID of the article to fix
 */
async function fixArticleImages(articleId: number) {
  console.log(`Fixing linked images for article ID: ${articleId}`);
  
  // Fetch the article
  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId)
  });
  
  if (!article) {
    console.error(`Article with ID ${articleId} not found`);
    return;
  }
  
  console.log(`Found article: "${article.title}"`);
  
  // Skip if no content
  if (!article.content) {
    console.log('No content to process');
    return;
  }
  
  // Check if there are any linked images
  const hasLinkedImages = article.content.includes('link="') || 
                          article.content.includes('data-link="');
  
  if (!hasLinkedImages) {
    console.log('No linked images found in content');
    return;
  }
  
  // Create a DOM parser to manipulate HTML
  const dom = new JSDOM(article.content);
  const doc = dom.window.document;
  
  // Find all images with link attribute
  const linkedImages = doc.querySelectorAll('img[link]');
  
  if (linkedImages.length > 0) {
    console.log(`Found ${linkedImages.length} images with direct link attribute`);
    
    // Process each linked image
    linkedImages.forEach((img, index) => {
      const link = img.getAttribute('link');
      if (!link) return;
      
      console.log(`Processing image ${index + 1} with link: ${link}`);
      
      // Create a new anchor element
      const anchor = doc.createElement('a');
      anchor.href = link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      
      // Clone the image element
      const imgClone = img.cloneNode(true) as HTMLImageElement;
      
      // Remove the link attribute from the cloned image
      imgClone.removeAttribute('link');
      
      // Add the image to the anchor
      anchor.appendChild(imgClone);
      
      // Replace the original image with the new anchor+image
      if (img.parentNode) {
        img.parentNode.replaceChild(anchor, img);
      }
    });
  }
  
  // Also find all div containers with data-link attribute
  const linkedContainers = doc.querySelectorAll('div[data-type="image"][data-link]');
  
  if (linkedContainers.length > 0) {
    console.log(`Found ${linkedContainers.length} div containers with data-link attribute`);
    
    // Process each container
    linkedContainers.forEach((container, index) => {
      const link = container.getAttribute('data-link');
      const img = container.querySelector('img');
      
      if (!link || !img) return;
      
      console.log(`Processing container ${index + 1} with link: ${link}`);
      
      // Don't process if the image is already in an anchor
      if (img.parentElement?.tagName.toLowerCase() === 'a') {
        console.log(`Image in container ${index + 1} is already in an anchor, skipping`);
        return;
      }
      
      // Create a new anchor element
      const anchor = doc.createElement('a');
      anchor.href = link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      
      // Add the image to the anchor
      anchor.appendChild(img.cloneNode(true));
      
      // Replace the original image with the new anchor+image
      if (img.parentNode) {
        img.parentNode.replaceChild(anchor, img);
      }
    });
  }
  
  // Get the updated HTML content
  const updatedContent = doc.body.innerHTML;
  
  // Compare old and new content
  if (updatedContent === article.content) {
    console.log('No changes made to content');
    return;
  }
  
  // Print the changes (for verification)
  console.log('\nOriginal content:');
  console.log(article.content);
  console.log('\nUpdated content:');
  console.log(updatedContent);
  
  // Confirm update
  const shouldUpdate = process.argv.includes('--confirm');
  
  if (shouldUpdate) {
    // Update the article in the database
    await db.update(articles)
      .set({ content: updatedContent })
      .where(eq(articles.id, articleId));
    
    console.log(`\nArticle ID ${articleId} updated with new linked image format`);
  } else {
    console.log('\nTo apply these changes, run the script again with --confirm');
    console.log(`Example: npx tsx scripts/fix-article-images.ts ${articleId} --confirm`);
  }
}

// Get the article ID from command line argument
const articleId = parseInt(process.argv[2]);

if (isNaN(articleId)) {
  console.error('Please provide a valid article ID');
  console.log('Usage: npx tsx scripts/fix-article-images.ts [articleId]');
  process.exit(1);
}

// Run the script
fixArticleImages(articleId)
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });