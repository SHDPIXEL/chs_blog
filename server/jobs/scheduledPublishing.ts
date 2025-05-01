import { db } from '../db';
import { articles, ArticleStatus } from '@shared/schema';
import { eq, and, lte } from 'drizzle-orm';

/**
 * Check for scheduled posts that need to be published
 * This function finds all approved articles with a publishedAt date in the past
 * and updates their status to PUBLISHED
 */
export async function processScheduledArticles() {
  try {
    const now = new Date();
    
    // Find articles that are approved and have a publishedAt date in the past
    const scheduledArticles = await db
      .select()
      .from(articles)
      .where(
        and(
          eq(articles.status, ArticleStatus.PUBLISHED),
          lte(articles.publishedAt, now),
          eq(articles.published, false) // Not yet actually published
        )
      );
      
    if (scheduledArticles.length === 0) {
      return { success: true, published: 0, message: 'No scheduled articles to publish' };
    }
    
    // Update each article to be published
    for (const article of scheduledArticles) {
      await db
        .update(articles)
        .set({ 
          published: true
        })
        .where(eq(articles.id, article.id));
      
      console.log(`Published scheduled article: ${article.title} (ID: ${article.id})`);
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