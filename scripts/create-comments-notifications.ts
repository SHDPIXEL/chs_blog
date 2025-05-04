/**
 * Script to create sample comments and notifications for the blog platform
 * 
 * Run with: npx tsx scripts/create-comments-notifications.ts
 */

import { db } from "../server/db";
import { 
  users, articles, comments, notifications, 
  NotificationType 
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function createCommentsAndNotifications() {
  console.log("Creating sample comments and notifications...");

  try {
    // Get published articles
    const publishedArticles = await db
      .select()
      .from(articles)
      .where(eq(articles.published, true));
    
    if (publishedArticles.length === 0) {
      console.error("No published articles found. Please run create-sample-articles.ts first.");
      return;
    }

    // Get all authors
    const authorUsers = await db
      .select()
      .from(users);
    
    if (authorUsers.length === 0) {
      console.error("No users found. Please run create-dummy-users.ts first.");
      return;
    }

    // Sample comment data
    const commentNames = [
      'Alex Thompson', 'Maria Garcia', 'James Wilson', 'Sofia Chen', 
      'Daniel Kim', 'Olivia Martinez', 'Ethan Johnson', 'Ava Patel'
    ];
    
    const commentEmails = [
      'alex@example.com', 'maria@example.com', 'james@example.com', 
      'sofia@example.com', 'daniel@example.com', 'olivia@example.com', 
      'ethan@example.com', 'ava@example.com'
    ];
    
    const commentContents = [
      'Great article! This was really helpful.',
      'I\'ve been looking for information like this. Thanks for sharing!',
      'Have you considered covering [related topic] in a future article?',
      'I disagree with some points, but overall a good perspective.',
      'This answered exactly what I was looking for. Well written!',
      'The code examples are clear and easy to follow. Thanks!',
      'I found a small typo in the section about [topic]. Otherwise perfect!',
      'How would this approach scale with larger applications?',
      'Looking forward to more content like this!',
      'I\'ve implemented this solution and it worked perfectly. Thank you!'
    ];

    // Create comments for each published article
    console.log("Creating comments...");
    
    for (const article of publishedArticles) {
      // Generate 2-5 comments per article
      const commentCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < commentCount; i++) {
        const nameIndex = Math.floor(Math.random() * commentNames.length);
        const contentIndex = Math.floor(Math.random() * commentContents.length);
        
        const [comment] = await db.insert(comments).values({
          content: commentContents[contentIndex],
          authorName: commentNames[nameIndex],
          authorEmail: commentEmails[nameIndex],
          articleId: article.id,
          isApproved: Math.random() > 0.2 // 80% chance of being approved
        }).returning();
        
        // 30% chance of adding a reply
        if (Math.random() > 0.7) {
          const replyNameIndex = Math.floor(Math.random() * commentNames.length);
          const replyContentIndex = Math.floor(Math.random() * commentContents.length);
          
          await db.insert(comments).values({
            content: `In reply to your comment: ${commentContents[replyContentIndex]}`,
            authorName: commentNames[replyNameIndex],
            authorEmail: commentEmails[replyNameIndex],
            articleId: article.id,
            parentId: comment.id,
            isApproved: true
          });
          
          // Update reply count
          await db.update(comments)
            .set({ replyCount: 1 })
            .where(eq(comments.id, comment.id));
        }
      }
      
      console.log(`Created comments for article: ${article.title}`);
    }

    // Create notifications
    console.log("\nCreating notifications...");
    
    // Define notification types and templates
    const notificationTypes = [
      { 
        type: NotificationType.ARTICLE_PUBLISHED, 
        title: 'Article Published',
        messageTemplate: 'Your article "{title}" has been published successfully.'
      },
      { 
        type: NotificationType.ARTICLE_APPROVED, 
        title: 'Article Approved',
        messageTemplate: 'Your article "{title}" has been approved and is ready to publish.'
      },
      { 
        type: NotificationType.ARTICLE_REJECTED, 
        title: 'Article Needs Revision',
        messageTemplate: 'Your article "{title}" needs some revisions before publishing.'
      },
      { 
        type: NotificationType.COMMENT_RECEIVED, 
        title: 'New Comment',
        messageTemplate: 'Someone commented on your article "{title}".'
      }
    ];
    
    // Create notifications for each author
    for (const user of authorUsers) {
      // Get articles by this author
      const authorArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.authorId, user.id));
      
      if (authorArticles.length > 0) {
        // Create 2-4 notifications per author
        const notificationCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < notificationCount; i++) {
          const article = authorArticles[Math.floor(Math.random() * authorArticles.length)];
          const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          const message = notificationType.messageTemplate.replace('{title}', article.title);
          
          await db.insert(notifications).values({
            userId: user.id,
            type: notificationType.type,
            title: notificationType.title,
            message: message,
            articleId: article.id,
            articleSlug: article.slug,
            read: Math.random() > 0.5 // 50% chance of being read
          });
        }
        
        console.log(`Created notifications for user: ${user.name}`);
      }
    }

    console.log("\nSample comments and notifications created successfully!");

  } catch (error) {
    console.error("Error creating comments and notifications:", error);
  }
}

// Run the function
createCommentsAndNotifications()
  .then(() => {
    console.log('Comments and notifications creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during comments and notifications creation:', error);
    process.exit(1);
  });