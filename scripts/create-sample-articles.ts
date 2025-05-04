/**
 * Script to create sample articles for the blog platform
 * 
 * Run with: npx tsx scripts/create-sample-articles.ts
 */

import { db } from "../server/db";
import { users, articles, ArticleStatus, categories, tags, articleCategories, articleTags, articleCoAuthors } from "../shared/schema";
import { eq } from "drizzle-orm";

// Helper function to generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to get random items from an array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function createSampleArticles() {
  console.log("Creating sample articles...");

  try {
    // Get all authors
    const authorUsers = await db
      .select()
      .from(users)
      .where(eq(users.role, "author"));
    
    if (authorUsers.length === 0) {
      console.error("No author users found. Please run create-dummy-users.ts first.");
      return;
    }

    const mainAuthor = authorUsers.find(u => u.email === "author@example.com") || authorUsers[0];
    console.log(`Using main author: ${mainAuthor.name} (${mainAuthor.email})`);

    // Get all categories and tags
    const allCategories = await db.select().from(categories);
    const allTags = await db.select().from(tags);

    if (allCategories.length === 0 || allTags.length === 0) {
      console.error("No categories or tags found. Please run create-categories-tags.ts first.");
      return;
    }

    // Sample articles data
    const sampleArticles = [
      {
        title: "Getting Started with Modern JavaScript",
        content: `
# Getting Started with Modern JavaScript

JavaScript has evolved significantly over the years, and modern JavaScript features make coding more efficient and enjoyable. In this blog post, we'll explore some essential features of modern JavaScript that every developer should know.

## Arrow Functions

Arrow functions provide a concise syntax for writing functions:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

## Template Literals

Template literals make string concatenation more readable:

\`\`\`javascript
const name = 'Sarah';
const greeting = \`Hello, \${name}!\`;
\`\`\`

By mastering these modern JavaScript features, you'll write cleaner, more efficient code that's easier to maintain and read.
        `,
        excerpt: "Learn the essential features of modern JavaScript that every developer should know.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1024"
      },
      {
        title: "Understanding React Hooks",
        content: `
# Understanding React Hooks

React Hooks have revolutionized how we write React components. This draft explores the most useful hooks and when to use them.

## useState

The useState hook allows you to add state to functional components:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

## useEffect

The useEffect hook performs side effects in functional components:

\`\`\`jsx
useEffect(() => {
  // This runs after every render
  document.title = \`You clicked \${count} times\`;
  
  // Cleanup function (optional)
  return () => {
    document.title = 'React App';
  };
}, [count]); // Only re-run if count changes
\`\`\`

More content to be added on custom hooks and advanced patterns.
        `,
        excerpt: "A comprehensive guide to React Hooks, exploring useState, useEffect, useContext, and more.",
        status: ArticleStatus.DRAFT,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1024"
      },
      {
        title: "Building a Full-Stack App with Node.js and React",
        content: `
# Building a Full-Stack App with Node.js and React

This guide walks through creating a complete web application using Node.js for the backend and React for the frontend.

## Project Setup

First, we'll set up the project structure:

\`\`\`
fullstack-app/
├── client/        # React frontend
├── server/        # Node.js backend
├── shared/        # Shared code/types
└── package.json
\`\`\`

## Backend Setup with Express

Let's start by setting up a basic Express server:

\`\`\`javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});
\`\`\`

This article will be expanded with database integration, authentication, and deployment guidance.
        `,
        excerpt: "Learn how to build and deploy a complete web application using Node.js and React with step-by-step instructions.",
        status: ArticleStatus.REVIEW,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?q=80&w=1024"
      },
      {
        title: "CSS Grid vs Flexbox: When to Use Each",
        content: `
# CSS Grid vs Flexbox: When to Use Each

CSS Grid and Flexbox are powerful layout tools, but they serve different purposes. This guide will help you understand when to use each one for optimal results.

## Flexbox: One-Dimensional Layouts

Flexbox is ideal for one-dimensional layouts (either rows OR columns):

\`\`\`css
.flex-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

## Grid: Two-Dimensional Layouts

CSS Grid excels at two-dimensional layouts (rows AND columns):

\`\`\`css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
}
\`\`\`

By understanding these differences, you can choose the right layout tool for each design challenge.
        `,
        excerpt: "Compare CSS Grid and Flexbox to understand their strengths and when to use each layout method for optimal web design.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=1024"
      },
      {
        title: "Introduction to TypeScript for JavaScript Developers",
        content: `
# Introduction to TypeScript for JavaScript Developers

TypeScript has become an essential tool for JavaScript developers looking to improve code quality and catch errors early. This guide will introduce you to TypeScript and its key features.

## What is TypeScript?

TypeScript is a superset of JavaScript that adds static type checking. It compiles down to plain JavaScript, so it works anywhere JavaScript runs.

## Getting Started

First, install TypeScript:

\`\`\`bash
npm install -g typescript
\`\`\`

Create a simple TypeScript file (e.g., hello.ts):

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("TypeScript"));
\`\`\`

Compile it with:

\`\`\`bash
tsc hello.ts
\`\`\`

By adding TypeScript to your projects, you'll improve code quality and catch errors early.
        `,
        excerpt: "Learn the fundamentals of TypeScript and how it enhances JavaScript development with static type checking and improved tooling.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1024"
      }
    ];

    // Create articles
    console.log("Creating sample articles...");
    
    for (const articleData of sampleArticles) {
      const slug = generateSlug(articleData.title);
      
      // Check if article already exists
      const [existingArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.slug, slug));
        
      if (existingArticle) {
        console.log(`Article "${articleData.title}" already exists, skipping...`);
        continue;
      }
      
      // Choose a random author if not the first two (which are assigned to main author)
      const authorId = sampleArticles.indexOf(articleData) < 2 
        ? mainAuthor.id 
        : getRandomItems(authorUsers, 1)[0].id;
      
      // Create the article
      const [newArticle] = await db.insert(articles).values({
        title: articleData.title,
        slug: slug,
        content: articleData.content,
        excerpt: articleData.excerpt,
        authorId: authorId,
        status: articleData.status,
        published: articleData.published,
        featuredImage: articleData.featuredImage,
        publishedAt: articleData.published ? new Date() : null
      }).returning();
      
      console.log(`Created article: ${articleData.title} (${articleData.status})`);
      
      // Add random categories (1-2)
      const categoryCount = Math.floor(Math.random() * 2) + 1;
      const selectedCategories = getRandomItems(allCategories, categoryCount);
      
      for (const category of selectedCategories) {
        await db.insert(articleCategories).values({
          articleId: newArticle.id,
          categoryId: category.id
        });
      }
      
      // Add random tags (2-4)
      const tagCount = Math.floor(Math.random() * 3) + 2;
      const selectedTags = getRandomItems(allTags, tagCount);
      
      for (const tag of selectedTags) {
        await db.insert(articleTags).values({
          articleId: newArticle.id,
          tagId: tag.id
        });
      }
      
      // Add co-author to some articles (30% chance)
      if (Math.random() > 0.7) {
        // Get a different author than the main one
        const coAuthors = authorUsers.filter(u => u.id !== authorId);
        if (coAuthors.length > 0) {
          const coAuthor = getRandomItems(coAuthors, 1)[0];
          
          await db.insert(articleCoAuthors).values({
            articleId: newArticle.id,
            userId: coAuthor.id
          });
          
          console.log(`Added co-author ${coAuthor.name} to article: ${articleData.title}`);
        }
      }
    }

    console.log("\nSample articles created successfully!");

  } catch (error) {
    console.error("Error creating sample articles:", error);
  }
}

// Run the function
createSampleArticles()
  .then(() => {
    console.log('Article creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during article creation:', error);
    process.exit(1);
  });