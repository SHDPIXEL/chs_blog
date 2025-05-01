import { db } from '../db';
import { articles, ArticleStatus } from '@shared/schema';
import { eq, and, lte, isNotNull } from 'drizzle-orm';
import { log } from '../vite';

/**
 * Check for scheduled posts that need to be published
 * This function finds articles with a scheduledPublishAt date in the past
 * and marks them as actually published
 */
export async function processScheduledArticles() {
  try {
    const now = new Date();
    log(`Checking for scheduled articles to publish at ${now.toISOString()}`, 'scheduler');
    
    // Find articles that:
    // 1. Have PUBLISHED status (approved by admin)
    // 2. Have not been actually published yet (published = false)
    // 3. Have a scheduledPublishAt date that is in the past and not null
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.status, ArticleStatus.PUBLISHED),
          eq(articles.published, false),
          isNotNull(articles.scheduledPublishAt),
          lte(articles.scheduledPublishAt, now)
        )
      );
      
    if (scheduledArticles.length === 0) {
      log('No scheduled articles to publish', 'scheduler');
      return { success: true, published: 0, message: 'No scheduled articles to publish' };
    }
    
    log(`Found ${scheduledArticles.length} scheduled article(s) to publish`, 'scheduler');
    
    // Update each article to be published
    for (const article of scheduledArticles) {
      await db
        .update(articles)
        .set({ 
          published: true,
          publishedAt: now // Set the actual publish time
        })
        .where(eq(articles.id, article.id));
      
      log(`Published scheduled article: ${article.title} (ID: ${article.id})`, 'scheduler');
    }
    
    return { 
      success: true, 
      published: scheduledArticles.length,
      message: `Published ${scheduledArticles.length} scheduled article(s)`
    };
  } catch (error) {
    console.error('Error processing scheduled articles:', error);
    return { 
      success: false, 
      published: 0,
      message: `Error processing scheduled articles: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}