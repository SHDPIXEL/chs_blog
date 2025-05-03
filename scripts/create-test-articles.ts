/**
 * Script to create test articles for the blog preview feature
 * 
 * Run with: npx tsx scripts/create-test-articles.ts
 */

import { db } from "../server/db";
import {
  articles,
  users,
  ArticleStatus,
  articleCategories,
  articleTags,
  articleCoAuthors
} from "../shared/schema";
import { eq } from "drizzle-orm";

async function createTestArticles() {
  console.log("Creating test articles for preview functionality...");

  // Get the author ID
  const [author] = await db.select().from(users).where(eq(users.email, "author@example.com"));
  if (!author) {
    console.error("Author user not found! Please run generate-dummy-data.ts first.");
    return;
  }
  const authorId = author.id;
  
  console.log(`Using author ID: ${authorId}`);

  // Create a draft article
  const [draftArticle] = await db.insert(articles).values({
    title: "Understanding React Hooks - Draft",
    slug: "understanding-react-hooks-draft",
    content: `<h1>Understanding React Hooks</h1>
    <p>React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class component.</p>
    <h2>Why Hooks?</h2>
    <p>Hooks solve several problems in React:</p>
    <ul>
      <li>Reusing stateful logic between components</li>
      <li>Complex components become hard to understand</li>
      <li>Classes confuse both people and machines</li>
    </ul>
    <h2>Basic Hooks</h2>
    <p>The most common hooks you'll use are:</p>
    <ul>
      <li><strong>useState</strong> - For managing state in functional components</li>
      <li><strong>useEffect</strong> - For handling side effects</li>
      <li><strong>useContext</strong> - For consuming context in a more elegant way</li>
    </ul>
    <p>This is still a draft article that needs more content and editing.</p>`,
    excerpt: "An introduction to React Hooks for managing state in functional components - draft version",
    authorId,
    status: ArticleStatus.DRAFT,
    published: false,
    metaTitle: "Understanding React Hooks - A Complete Guide",
    metaDescription: "Learn how to use React Hooks effectively in your functional components",
    featuredImage: "/uploads/react-hooks.jpg"
  }).returning();
  
  console.log(`Created draft article with ID: ${draftArticle.id}`);
  
  // Assign categories and tags to the draft article
  await db.insert(articleCategories).values({
    articleId: draftArticle.id,
    categoryId: 1 // JavaScript category
  });
  
  await db.insert(articleTags).values([
    { articleId: draftArticle.id, tagId: 1 }, // React tag
    { articleId: draftArticle.id, tagId: 6 }  // Beginner tag
  ]);
  
  // Create an article in review state
  const [reviewArticle] = await db.insert(articles).values({
    title: "Advanced TypeScript Patterns - In Review",
    slug: "advanced-typescript-patterns-review",
    content: `<h1>Advanced TypeScript Patterns</h1>
    <p>TypeScript has become the standard for large-scale JavaScript applications, offering compile-time type checking and improved developer experience.</p>
    <h2>Type Utilities</h2>
    <p>TypeScript provides several utility types that make working with types easier:</p>
    <pre><code>// Partial makes all properties optional
type User = { name: string; age: number };
type PartialUser = Partial<User>; // { name?: string; age?: number }</code></pre>
    <h2>Discriminated Unions</h2>
    <p>A powerful pattern for modeling state transitions:</p>
    <pre><code>type State = 
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error };</code></pre>
    <h2>Conclusion</h2>
    <p>Using these patterns can greatly improve the type safety and maintainability of your TypeScript projects.</p>
    <p>This article is awaiting editor review.</p>`,
    excerpt: "Discover advanced TypeScript patterns for more maintainable code - currently in review",
    authorId,
    status: ArticleStatus.REVIEW,
    published: false,
    metaTitle: "Advanced TypeScript Patterns Every Developer Should Know",
    metaDescription: "Learn how to leverage TypeScript's type system with advanced patterns and techniques",
    featuredImage: "/uploads/typescript-patterns.jpg"
  }).returning();
  
  console.log(`Created review article with ID: ${reviewArticle.id}`);
  
  // Assign categories and tags to the review article
  await db.insert(articleCategories).values({
    articleId: reviewArticle.id,
    categoryId: 1 // JavaScript category
  });
  
  await db.insert(articleTags).values([
    { articleId: reviewArticle.id, tagId: 3 }, // TypeScript tag
    { articleId: reviewArticle.id, tagId: 7 }  // Advanced tag
  ]);
  
  // Create a published article
  const [publishedArticle] = await db.insert(articles).values({
    title: "CSS Grid for Modern Web Layouts - Published",
    slug: "css-grid-modern-web-layouts",
    content: `<h1>CSS Grid for Modern Web Layouts</h1>
    <p>CSS Grid Layout is a powerful two-dimensional layout system designed specifically for the web.</p>
    <h2>Getting Started with Grid</h2>
    <p>To use CSS Grid, you first need to set the display property:</p>
    <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
}</code></pre>
    <h2>Grid vs Flexbox</h2>
    <p>While Flexbox is designed for one-dimensional layouts (either rows OR columns), Grid is designed for two-dimensional layouts (rows AND columns).</p>
    <h2>Advanced Grid Features</h2>
    <p>Some powerful features of Grid include:</p>
    <ul>
      <li>Named grid areas</li>
      <li>Implicit and explicit grids</li>
      <li>Auto-placement algorithms</li>
    </ul>
    <p>This article has been published and is available for all readers.</p>`,
    excerpt: "Learn how to create responsive layouts with CSS Grid - a comprehensive guide",
    authorId,
    status: ArticleStatus.PUBLISHED,
    published: true,
    publishedAt: new Date(),
    metaTitle: "CSS Grid: The Ultimate Guide for Modern Web Layouts",
    metaDescription: "Everything you need to know about using CSS Grid for responsive web design",
    featuredImage: "/uploads/css-grid.jpg",
    viewCount: 157
  }).returning();
  
  console.log(`Created published article with ID: ${publishedArticle.id}`);
  
  // Assign categories and tags to the published article
  await db.insert(articleCategories).values({
    articleId: publishedArticle.id,
    categoryId: 2 // Web Development category
  });
  
  await db.insert(articleTags).values([
    { articleId: publishedArticle.id, tagId: 4 }, // CSS tag
    { articleId: publishedArticle.id, tagId: 8 }  // Tutorial tag
  ]);

  console.log("Test articles created successfully!");
}

createTestArticles()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error creating test articles:", error);
    process.exit(1);
  });
