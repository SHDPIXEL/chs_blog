/**
 * Simple script to create a few test articles for preview functionality
 */

import { db } from "../server/db";
import { users, articles, ArticleStatus } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createSimpleArticles() {
  console.log("Creating simple test articles...");
  
  // Find author
  const author = await db.query.users.findFirst({
    where: eq(users.email, "author@example.com")
  });

  if (!author) {
    console.error("Author not found! Please run the generate-dummy-data.ts script first.");
    process.exit(1);
  }

  console.log(`Using author with ID: ${author.id}`);

  // Create a draft article
  const [draftArticle] = await db.insert(articles).values({
    title: "Test Draft Article",
    slug: "test-draft-article",
    content: "<h1>Test Draft Content</h1><p>This is a test draft article for preview functionality.</p>",
    excerpt: "Test draft for preview",
    authorId: author.id,
    status: ArticleStatus.DRAFT,
    published: false
  }).returning();

  console.log(`Created draft article with ID: ${draftArticle.id}`);

  // Create a review article
  const [reviewArticle] = await db.insert(articles).values({
    title: "Test Review Article",
    slug: "test-review-article",
    content: "<h1>Test Review Content</h1><p>This is a test article in review status for preview functionality.</p>",
    excerpt: "Test review for preview",
    authorId: author.id,
    status: ArticleStatus.REVIEW,
    published: false
  }).returning();

  console.log(`Created review article with ID: ${reviewArticle.id}`);

  // Create a published article
  const [publishedArticle] = await db.insert(articles).values({
    title: "Test Published Article",
    slug: "test-published-article",
    content: "<h1>Test Published Content</h1><p>This is a test published article for preview functionality.</p>",
    excerpt: "Test published for preview",
    authorId: author.id,
    status: ArticleStatus.PUBLISHED,
    published: true,
    publishedAt: new Date()
  }).returning();

  console.log(`Created published article with ID: ${publishedArticle.id}`);

  console.log("All test articles created successfully!");
}

createSimpleArticles().catch(err => {
  console.error("Error creating articles:", err);
  process.exit(1);
});
