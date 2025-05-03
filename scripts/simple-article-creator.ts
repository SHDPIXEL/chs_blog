/**
 * Simple script to create a few test articles for preview functionality
 */

import { db } from "../server/db";
import { articles, categories, articleCategories, users, tags, articleTags, UserRole, ArticleStatus } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createSimpleArticles() {
  console.log("Creating test articles for preview functionality...");

  // Check if we have already created the articles
  const existingArticles = await db
    .select({ count: articles.id })
    .from(articles);

  if (existingArticles.length >= 3) {
    console.log("Test articles already exist. Updating them instead.");
    
    // Update the first article to be a draft
    await db.update(articles)
      .set({
        title: "Test Draft Article",
        slug: "test-draft-article",
        content: `<h1>This is a Draft Article</h1>
        <p>This article is in draft status and is not published. It's only visible to the author and administrators.</p>
        <h2>Draft Features</h2>
        <p>When you're in draft mode, you can make changes without affecting the live site.</p>
        <ul>
          <li>Make edits freely</li>
          <li>Save your progress</li>
          <li>Preview how it will look</li>
          <li>Submit for review when ready</li>
        </ul>
        <p>This preview page lets you see exactly how your article will appear when published.</p>`,
        excerpt: "This is a test draft article that demonstrates how drafts look in the preview.",
        status: ArticleStatus.DRAFT,
        published: false,
      })
      .where(eq(articles.id, 1));

    // Update the second article to be in review
    await db.update(articles)
      .set({
        title: "Test Review Article",
        slug: "test-review-article",
        content: `<h1>This Article is In Review</h1>
        <p>This article has been submitted for review and is waiting for approval from an administrator.</p>
        <h2>Review Process</h2>
        <p>The review process ensures quality content before publication.</p>
        <p>Once an article is submitted for review:</p>
        <ol>
          <li>Administrators will be notified</li>
          <li>They'll check the article for content quality</li>
          <li>They may suggest edits or improvements</li>
          <li>Once approved, the article can be published</li>
        </ol>
        <p>This preview shows how the article will look when published for visitors.</p>`,
        excerpt: "This test article shows how articles in review status appear in the preview mode.",
        status: ArticleStatus.REVIEW,
        published: false,
      })
      .where(eq(articles.id, 2));

    // Update the third article to be published
    await db.update(articles)
      .set({
        title: "Test Published Article",
        slug: "test-published-article",
        content: `<h1>This is a Published Article</h1>
        <p>This article is published and visible to all visitors.</p>
        <h2>Published Content</h2>
        <p>When content is published, it becomes part of your public blog.</p>
        <p>Published articles:</p>
        <ul>
          <li>Appear in your blog listings</li>
          <li>Can be found through search</li>
          <li>May appear in featured sections</li>
          <li>Are accessible by direct URL</li>
        </ul>
        <p>This preview is exactly how the article appears to public visitors.</p>
        <h2>Rich Text Features</h2>
        <p>Our editor supports many formatting options:</p>
        <blockquote>
          <p>This is a blockquote that might contain an important quote or highlight.</p>
        </blockquote>
        <p>You can also include <a href="#">links</a>, <strong>bold text</strong>, and <em>italic text</em>.</p>`,
        excerpt: "This test published article demonstrates how published content appears in the blog system.",
        status: ArticleStatus.PUBLISHED,
        published: true,
      })
      .where(eq(articles.id, 3));
    
    console.log("Test articles updated successfully.");
    return;
  }

  // Get the author (we need at least one user in the system)
  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.role, UserRole.AUTHOR))
    .limit(1);

  if (!author) {
    console.error("No author found in the system. Please create an author first.");
    return;
  }

  // Create categories if they don't exist
  let categoryIds: number[] = [];
  const existingCategories = await db.select().from(categories);
  
  if (existingCategories.length === 0) {
    const newCategories = await db.insert(categories)
      .values([
        { name: "Research", slug: "research" },
        { name: "Education", slug: "education" },
        { name: "Opinion", slug: "opinion" }
      ])
      .returning();
    
    categoryIds = newCategories.map(cat => cat.id);
  } else {
    categoryIds = existingCategories.map(cat => cat.id);
  }

  // Create tags if they don't exist
  let tagIds: number[] = [];
  const existingTags = await db.select().from(tags);
  
  if (existingTags.length === 0) {
    const newTags = await db.insert(tags)
      .values([
        { name: "Academic", slug: "academic" },
        { name: "Technology", slug: "technology" },
        { name: "Culture", slug: "culture" }
      ])
      .returning();
    
    tagIds = newTags.map(tag => tag.id);
  } else {
    tagIds = existingTags.map(tag => tag.id);
  }

  // Create a draft article
  const [draftArticle] = await db.insert(articles)
    .values({
      title: "Test Draft Article",
      slug: "test-draft-article",
      content: `<h1>This is a Draft Article</h1>
      <p>This article is in draft status and is not published. It's only visible to the author and administrators.</p>
      <h2>Draft Features</h2>
      <p>When you're in draft mode, you can make changes without affecting the live site.</p>
      <ul>
        <li>Make edits freely</li>
        <li>Save your progress</li>
        <li>Preview how it will look</li>
        <li>Submit for review when ready</li>
      </ul>
      <p>This preview page lets you see exactly how your article will appear when published.</p>`,
      excerpt: "This is a test draft article that demonstrates how drafts look in the preview.",
      status: ArticleStatus.DRAFT,
      published: false,
      authorId: author.id,
    })
    .returning();

  // Create a review article
  const [reviewArticle] = await db.insert(articles)
    .values({
      title: "Test Review Article",
      slug: "test-review-article",
      content: `<h1>This Article is In Review</h1>
      <p>This article has been submitted for review and is waiting for approval from an administrator.</p>
      <h2>Review Process</h2>
      <p>The review process ensures quality content before publication.</p>
      <p>Once an article is submitted for review:</p>
      <ol>
        <li>Administrators will be notified</li>
        <li>They'll check the article for content quality</li>
        <li>They may suggest edits or improvements</li>
        <li>Once approved, the article can be published</li>
      </ol>
      <p>This preview shows how the article will look when published for visitors.</p>`,
      excerpt: "This test article shows how articles in review status appear in the preview mode.",
      status: ArticleStatus.REVIEW,
      published: false,
      authorId: author.id,
    })
    .returning();

  // Create a published article
  const [publishedArticle] = await db.insert(articles)
    .values({
      title: "Test Published Article",
      slug: "test-published-article",
      content: `<h1>This is a Published Article</h1>
      <p>This article is published and visible to all visitors.</p>
      <h2>Published Content</h2>
      <p>When content is published, it becomes part of your public blog.</p>
      <p>Published articles:</p>
      <ul>
        <li>Appear in your blog listings</li>
        <li>Can be found through search</li>
        <li>May appear in featured sections</li>
        <li>Are accessible by direct URL</li>
      </ul>
      <p>This preview is exactly how the article appears to public visitors.</p>
      <h2>Rich Text Features</h2>
      <p>Our editor supports many formatting options:</p>
      <blockquote>
        <p>This is a blockquote that might contain an important quote or highlight.</p>
      </blockquote>
      <p>You can also include <a href="#">links</a>, <strong>bold text</strong>, and <em>italic text</em>.</p>`,
      excerpt: "This test published article demonstrates how published content appears in the blog system.",
      status: ArticleStatus.PUBLISHED,
      published: true,
      authorId: author.id,
    })
    .returning();

  // Associate categories with articles
  if (categoryIds.length > 0) {
    const articleCategoryValues = [
      { articleId: draftArticle.id, categoryId: categoryIds[0] },
      { articleId: reviewArticle.id, categoryId: categoryIds[1] },
      { articleId: publishedArticle.id, categoryId: categoryIds[2] },
    ];

    await db.insert(articleCategories).values(articleCategoryValues);
  }

  // Associate tags with articles
  if (tagIds.length > 0) {
    const articleTagValues = [
      { articleId: draftArticle.id, tagId: tagIds[0] },
      { articleId: reviewArticle.id, tagId: tagIds[1] },
      { articleId: publishedArticle.id, tagId: tagIds[2] },
    ];

    await db.insert(articleTags).values(articleTagValues);
  }

  console.log("Test articles created successfully!");
  console.log(`Created articles with IDs: ${draftArticle.id}, ${reviewArticle.id}, ${publishedArticle.id}`);
}

createSimpleArticles()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error creating test articles:", error);
    process.exit(1);
  });
