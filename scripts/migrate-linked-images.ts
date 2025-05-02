/**
 * Migration script to convert old format linked images to new format
 * 
 * Old format: <img src="..." width="..." height="..." link="...">
 * New format: <a href="..." target="_blank" rel="noopener noreferrer">
 *               <img src="..." width="..." height="...">
 *             </a>
 * 
 * Run this script with: npx tsx scripts/migrate-linked-images.ts
 */

import { db } from '../server/db';
import { articles } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function migrateLinkedImages() {
  console.log('Starting linked images migration...');
  
  // Fetch all articles
  const allArticles = await db.select().from(articles);
  console.log(`Found ${allArticles.length} articles to process`);
  
  let updatedCount = 0;
  
  for (const article of allArticles) {
    const content = article.content;
    
    // Skip if no content
    if (!content) {
      console.log(`Article ID ${article.id}: No content to process`);
      continue;
    }
    
    // Check if there are any linked images
    if (!content.includes('link="')) {
      console.log(`Article ID ${article.id}: No linked images found`);
      continue;
    }
    
    console.log(`Processing article ID ${article.id}: "${article.title}"`);
    
    // Create a DOM parser to manipulate HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Find all images with link attribute
    const linkedImages = doc.querySelectorAll('img[link]');
    
    if (linkedImages.length === 0) {
      console.log(`Article ID ${article.id}: No linked images found after parsing`);
      continue;
    }
    
    console.log(`Article ID ${article.id}: Found ${linkedImages.length} linked images`);
    
    // Process each linked image
    linkedImages.forEach((img) => {
      const link = img.getAttribute('link');
      if (!link) return;
      
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
      img.parentNode?.replaceChild(anchor, img);
    });
    
    // Get the updated HTML content
    const updatedContent = doc.body.innerHTML;
    
    // Update the article in the database
    await db.update(articles)
      .set({ content: updatedContent })
      .where(eq(articles.id, article.id));
    
    updatedCount++;
    console.log(`Article ID ${article.id}: Updated with new linked image format`);
  }
  
  console.log(`Migration complete. Updated ${updatedCount} articles.`);
}

// Node environment check for running as script
if (require.main === module) {
  migrateLinkedImages()
    .then(() => {
      console.log('Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error during migration:', error);
      process.exit(1);
    });
}

// Export for programmatic use
export { migrateLinkedImages };