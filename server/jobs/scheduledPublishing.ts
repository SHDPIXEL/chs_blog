import { db } from '../db';
import { articles, ArticleStatus } from '@shared/schema';
import { eq, and, lte, isNotNull } from 'drizzle-orm';
import { log } from '../vite';
import { utcToIst, formatIstDate, getNowInIst } from '@shared/utils/dateTime';
import { notEqual } from 'assert';

/**
 * Check for scheduled posts that need to be published
 * This function finds articles with a scheduledPublishAt date in the past
 * and marks them as actually published
 */


export async function processScheduledArticles() {
  try {
    const now = getNowInIst();
    const nowIst = utcToIst(now);

    log(`now : ${now}, nowist : ${nowIst}`);
    log(`Checking for scheduled articles to publish at ${now.toISOString()} (${formatIstDate(now)})`, 'scheduler');
    
    // First, let's get all articles with scheduledPublishAt for debugging
    const allScheduledArticles = await db
      .select({
        id: articles.id,
        title: articles.title,
        status: articles.status,
        published: articles.published,
        scheduledPublishAt: articles.scheduledPublishAt
      })
      .from(articles)
      .where(
        and(
          eq(articles.status, "published"),
          eq(articles.published, "false"),
          isNotNull(articles.scheduledPublishAt)
        )
      );
    
    if (allScheduledArticles.length > 0) {
      log(`Debug: Found ${allScheduledArticles.length} articles with scheduledPublishAt dates:`, 'scheduler');
      for (const article of allScheduledArticles) {
        const scheduleTime = article.scheduledPublishAt instanceof Date 
          ? article.scheduledPublishAt.toISOString() 
          : article.scheduledPublishAt;

        // Ensure the date is valid before logging
        if (scheduleTime && !isNaN(new Date(scheduleTime).getTime())) {
          const scheduleTimeIst = formatIstDate(article.scheduledPublishAt);
          log(`- Article ID ${article.id}: "${article.title}" status=${article.status}, published=${article.published}
             UTC: ${scheduleTime}
             IST: ${scheduleTimeIst}`, 'scheduler');
        } else {
          log(`- Article ID ${article.id}: "${article.title}" has an invalid scheduledPublishAt date`, 'scheduler');
        }
      }
    } else {
      log(`Debug: No articles with scheduledPublishAt dates found`, 'scheduler');
    }
    
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
          eq(articles.published, "false"),
          isNotNull(articles.scheduledPublishAt),
          lte(articles.scheduledPublishAt, now)
        )
      );
      
    if (scheduledArticles.length === 0) {
      log('No scheduled articles to publish', 'scheduler');
      return { success: true, published: 0, message: 'No scheduled articles to publish' };
    }
    
    log(`Found ${scheduledArticles.length} scheduled article(s) to publish at ${formatIstDate(now)}`, 'scheduler');
    
    // Update each article to be published
    for (const article of scheduledArticles) {

      log(`update for Arcticle : ${article.publishedAt?.toISOString()}, ${article.id} , ${article.title}, ${article.published}, ${article.status}, ${article.scheduledPublishAt?.toISOString()}`);
      if (article.scheduledPublishAt && !isNaN(new Date(article.scheduledPublishAt).getTime())) {
        await db
          .update(articles)
          .set({ 
            published: "true",
            publishedAt: now // Set the actual publish time
          })
          .where(eq(articles.id, article.id));
        
        const scheduledTimeIst = formatIstDate(article.scheduledPublishAt);
        const publishTimeIst = formatIstDate(now);
        
        log(`Published scheduled article: ${article.title} (ID: ${article.id})
           Scheduled for: ${scheduledTimeIst}
           Published at: ${publishTimeIst}`, 'scheduler');
      } else {
        log(`Article ID ${article.id} has an invalid scheduledPublishAt date, skipping publish`, 'scheduler');
      }
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

