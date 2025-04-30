import { db } from "../server/db";
import { users, UserRole, articles, ArticleStatus } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting to seed database...");

  // Check if users already exist
  const [adminCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@example.com"));

  const [authorCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));

  // Create admin user if not exists
  if (!adminCheck) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    await db.insert(users).values({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists. Skipping creation.");
  }

  // Create author user if not exists
  let authorId: number;
  
  if (!authorCheck) {
    console.log("Creating author user with profile...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const [newAuthor] = await db.insert(users).values({
      name: "Sarah Johnson",
      email: "author@example.com",
      password: hashedPassword,
      role: UserRole.AUTHOR,
      bio: "Professional tech writer with over 5 years of experience in blogging about web development, JavaScript, and modern frameworks. I love sharing knowledge and helping others learn to code.",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      bannerUrl: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1024",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/sarahjohnson",
        github: "https://github.com/sarahjohnson",
        linkedin: "https://linkedin.com/in/sarahjohnson"
      })
    }).returning();
    
    authorId = newAuthor.id;
    console.log("Author user created with profile details.");
  } else {
    console.log("Author user already exists. Updating profile details...");
    authorId = authorCheck.id;
    
    // Update the author with profile details if they don't have them
    if (!authorCheck.bio) {
      await db.update(users)
        .set({
          name: "Sarah Johnson",
          bio: "Professional tech writer with over 5 years of experience in blogging about web development, JavaScript, and modern frameworks. I love sharing knowledge and helping others learn to code.",
          avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
          bannerUrl: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1024",
          socialLinks: JSON.stringify({
            twitter: "https://twitter.com/sarahjohnson",
            github: "https://github.com/sarahjohnson",
            linkedin: "https://linkedin.com/in/sarahjohnson"
          })
        })
        .where(eq(users.id, authorId));
      
      console.log("Author profile updated.");
    }
  }
  
  // Check if we need to create sample blogs
  // First query to get a count from the articles table
  const articlesResult = await db.select().from(articles).limit(1);
  const count = articlesResult.length;
  
  if (count === 0) {
    console.log("Creating sample blog posts...");
    
    // Create published blog
    await db.insert(articles).values({
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
    });
    
    // Create draft blog
    await db.insert(articles).values({
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
    });
    
    // Create in-review blog
    await db.insert(articles).values({
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
    });
    
    console.log("Sample blog posts created successfully.");
  } else {
    console.log("Blog posts already exist. Skipping sample content creation.");
  }

  console.log("Database seeding completed.");
}

// Run the seeding function
seed()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(() => {
    // Simply exit the process, the pool will be cleaned up automatically
    process.exit(0);
  });