import { db } from "../server/db";
import { users, articles, ArticleStatus, categories, tags, articleCategories, articleTags } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createArticles() {
  console.log("Starting to create articles...");

  // Get existing author
  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));

  if (!author) {
    console.error("No author found with email author@example.com. Aborting article creation.");
    return;
  }

  const authorId = author.id;
  console.log(`Found author with ID: ${authorId}`);

  // Get existing categories and tags
  const existingCategories = await db.select().from(categories);
  const existingTags = await db.select().from(tags);

  console.log(`Found ${existingCategories.length} categories and ${existingTags.length} tags`);

  if (existingCategories.length === 0 || existingTags.length === 0) {
    console.error("No categories or tags found. Please run the seed-content.ts script first.");
    return;
  }

  // Create published blog
  console.log("Creating sample blog posts...");
  const [publishedArticle] = await db.insert(articles).values({
    title: "Getting Started with Modern JavaScript",
    slug: "getting-started-with-modern-javascript",
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

## Destructuring

Destructuring allows you to extract values from arrays and objects:

\`\`\`javascript
// Object destructuring
const person = { name: 'Sarah', age: 30 };
const { name, age } = person;

// Array destructuring
const numbers = [1, 2, 3];
const [first, second] = numbers;
\`\`\`

## Spread and Rest Operators

The spread operator (...) can be used to expand elements:

\`\`\`javascript
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }
\`\`\`

## Modules

JavaScript modules help organize code into reusable pieces:

\`\`\`javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;

// app.js
import { add, subtract } from './math.js';
\`\`\`

## Async/Await

Async/await makes asynchronous code easier to write and understand:

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
\`\`\`

By mastering these modern JavaScript features, you'll write cleaner, more efficient code that's easier to maintain and read.
    `,
    excerpt: "Learn the essential features of modern JavaScript that every developer should know, including arrow functions, template literals, destructuring, and more.",
    authorId,
    status: ArticleStatus.PUBLISHED,
    published: true,
    featuredImage: "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1024"
  }).returning();
  
  console.log(`Created published article: ${publishedArticle.title}`);
  
  // Add categories and tags to the published article
  await db.insert(articleCategories).values({
    articleId: publishedArticle.id,
    categoryId: existingCategories[0].id // JavaScript category
  });
  
  await db.insert(articleCategories).values({
    articleId: publishedArticle.id,
    categoryId: existingCategories[1].id // Web Development category
  });
  
  await db.insert(articleTags).values({
    articleId: publishedArticle.id,
    tagId: existingTags[2].id // TypeScript tag
  });
  
  await db.insert(articleTags).values({
    articleId: publishedArticle.id,
    tagId: existingTags[5].id // Beginner tag
  });
  
  // Create draft blog
  const [draftArticle] = await db.insert(articles).values({
    title: "Understanding React Hooks",
    slug: "understanding-react-hooks",
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

More content to be added on:
- useContext
- useReducer
- useCallback
- useMemo
- useRef
- Custom hooks

Stay tuned for the complete guide!
    `,
    excerpt: "A comprehensive guide to React Hooks, exploring useState, useEffect, useContext, and more.",
    authorId,
    status: ArticleStatus.DRAFT,
    published: false
  }).returning();
  
  console.log(`Created draft article: ${draftArticle.title}`);
  
  // Add categories and tags to the draft article
  await db.insert(articleCategories).values({
    articleId: draftArticle.id,
    categoryId: existingCategories[1].id // Web Development category
  });
  
  await db.insert(articleTags).values({
    articleId: draftArticle.id,
    tagId: existingTags[0].id // React tag
  });
  
  // Create in-review article
  const [reviewArticle] = await db.insert(articles).values({
    title: "Building a Full-Stack App with Node.js and React",
    slug: "building-a-full-stack-app-with-nodejs-and-react",
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

## Frontend Setup with React

Now, let's set up the React frontend:

\`\`\`jsx
// client/src/App.js
import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    fetch('http://localhost:5000/api/status')
      .then(res => res.json())
      .then(data => setStatus(data.status));
  }, []);
  
  return (
    <div className="App">
      <h1>Full-Stack Application</h1>
      <p>Backend status: {status}</p>
    </div>
  );
}

export default App;
\`\`\`

I'll be expanding this article to include:
- Database integration
- User authentication
- CRUD operations
- Deployment instructions
    `,
    excerpt: "Learn how to build and deploy a complete web application using Node.js and React with step-by-step instructions.",
    authorId,
    status: ArticleStatus.REVIEW,
    published: false,
    featuredImage: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?q=80&w=1024"
  }).returning();
  
  console.log(`Created review article: ${reviewArticle.title}`);
  
  // Add categories and tags to the review article
  await db.insert(articleCategories).values({
    articleId: reviewArticle.id,
    categoryId: existingCategories[1].id // Web Development category
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: existingTags[0].id // React tag
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: existingTags[1].id // Node.js tag
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: existingTags[7].id // Tutorial tag
  });
  
  console.log("Articles created successfully!");
}

// Run the function
createArticles()
  .then(() => {
    console.log('Articles created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating articles:', error);
    process.exit(1);
  });