import { db } from "../server/db";
import { users, UserRole, articles, ArticleStatus, categories, tags, articleCategories, articleTags } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq, SQL, sql } from "drizzle-orm";

export async function seed() {
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
  
  // Create additional authors
  const authorEmails = [
    'mark.wilson@example.com',
    'emily.chen@example.com',
    'james.rodriguez@example.com',
    'jessica.lee@example.com'
  ];
  
  const authorNames = [
    'Mark Wilson',
    'Emily Chen',
    'James Rodriguez',
    'Jessica Lee'
  ];
  
  const authorBios = [
    'Senior software engineer with a focus on front-end development and UI/UX. I have worked with Fortune 500 companies to optimize their web applications.',
    'Fullstack developer specializing in React and Node.js. I enjoy teaching coding concepts and building accessible web applications.',
    'DevOps specialist with experience in AWS, Docker, and Kubernetes. I write about cloud architecture and deployment strategies.',
    'Mobile app developer with expertise in React Native and Flutter. I share tips on creating cross-platform applications and optimizing performance.'
  ];
  
  const authorAvatars = [
    'https://randomuser.me/api/portraits/men/42.jpg',
    'https://randomuser.me/api/portraits/women/28.jpg',
    'https://randomuser.me/api/portraits/men/36.jpg',
    'https://randomuser.me/api/portraits/women/15.jpg'
  ];
  
  const authorBanners = [
    'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024',
    'https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1024',
    'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024',
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1024'
  ];
  
  // Create additional authors if they don't exist
  const additionalAuthorIds: number[] = [];
  
  for (let i = 0; i < authorEmails.length; i++) {
    const [existingAuthor] = await db
      .select()
      .from(users)
      .where(eq(users.email, authorEmails[i]));
      
    if (!existingAuthor) {
      console.log(`Creating additional author: ${authorNames[i]}...`);
      const hashedPassword = await bcrypt.hash("password123", 10);
      const [newAuthor] = await db.insert(users).values({
        name: authorNames[i],
        email: authorEmails[i],
        password: hashedPassword,
        role: UserRole.AUTHOR,
        bio: authorBios[i],
        avatarUrl: authorAvatars[i],
        bannerUrl: authorBanners[i],
        socialLinks: JSON.stringify({
          twitter: `https://twitter.com/${authorNames[i].toLowerCase().replace(' ', '')}`,
          github: `https://github.com/${authorNames[i].toLowerCase().replace(' ', '')}`,
          linkedin: `https://linkedin.com/in/${authorNames[i].toLowerCase().replace(' ', '')}`
        })
      }).returning();
      
      additionalAuthorIds.push(newAuthor.id);
      console.log(`Created author: ${authorNames[i]}`);
    } else {
      additionalAuthorIds.push(existingAuthor.id);
      console.log(`Author ${authorNames[i]} already exists.`);
    }
  }
  
  // Check if we need to create categories
  const categoriesResult = await db.select().from(categories).limit(1);
  const hasCategoriesAlready = categoriesResult.length > 0;
  
  const categoryData = [
    { name: 'JavaScript', slug: 'javascript', description: 'Articles about JavaScript programming language, frameworks, and tools.' },
    { name: 'Web Development', slug: 'web-development', description: 'Resources for web developers including frontend and backend topics.' },
    { name: 'Mobile Development', slug: 'mobile-development', description: 'Everything related to building mobile applications.' },
    { name: 'DevOps', slug: 'devops', description: 'Continuous integration, deployment, and cloud infrastructure topics.' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design principles and practices.' },
    { name: 'Career Development', slug: 'career-development', description: 'Tips and advice for growing your tech career.' }
  ];
  
  let categoryIds: number[] = [];
  
  if (!hasCategoriesAlready) {
    console.log("Creating categories...");
    
    for (const category of categoryData) {
      const [newCategory] = await db.insert(categories).values(category).returning();
      categoryIds.push(newCategory.id);
      console.log(`Created category: ${category.name}`);
    }
  } else {
    console.log("Categories already exist. Fetching category IDs...");
    const existingCategories = await db.select().from(categories);
    categoryIds = existingCategories.map(c => c.id);
  }
  
  // Check if we need to create tags
  const tagsResult = await db.select().from(tags).limit(1);
  const hasTagsAlready = tagsResult.length > 0;
  
  const tagData = [
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'CSS', slug: 'css' },
    { name: 'Performance', slug: 'performance' },
    { name: 'Beginner', slug: 'beginner' },
    { name: 'Advanced', slug: 'advanced' },
    { name: 'Tutorial', slug: 'tutorial' },
    { name: 'Career', slug: 'career' },
    { name: 'Best Practices', slug: 'best-practices' }
  ];
  
  let tagIds: number[] = [];
  
  if (!hasTagsAlready) {
    console.log("Creating tags...");
    
    for (const tag of tagData) {
      const [newTag] = await db.insert(tags).values(tag).returning();
      tagIds.push(newTag.id);
      console.log(`Created tag: ${tag.name}`);
    }
  } else {
    console.log("Tags already exist. Fetching tag IDs...");
    const existingTags = await db.select().from(tags);
    tagIds = existingTags.map(t => t.id);
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
    
    // Additional blog posts with various authors and categories
    const additionalBlogContent = [
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

## When to Use Flexbox

- For simple rows or columns of items
- When content size should determine layout
- For alignment and distribution within a container
- For components like navigation menus, card layouts

## When to Use Grid

- For more complex two-dimensional layouts
- When you need precise control over rows and columns
- For overall page layouts and complex components
- When you need items to span multiple rows or columns

By understanding these differences, you can choose the right tool for each layout challenge you face.
        `,
        excerpt: "Learn the key differences between CSS Grid and Flexbox and understand which layout tool is best for different scenarios.",
        authorId: additionalAuthorIds[0],
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1024"
      },
      {
        title: "Understanding TypeScript Generics",
        content: `
# Understanding TypeScript Generics

TypeScript generics allow you to create reusable components that work with a variety of types rather than a single one. This guide explains how to use them effectively.

## Basic Generic Functions

Creating a simple generic function:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

// Usage
const num = identity<number>(42); // Type is number
const str = identity("hello");    // Type inference - str is string
\`\`\`

## Generic Interfaces

You can also create generic interfaces:

\`\`\`typescript
interface Box<T> {
  contents: T;
}

const numberBox: Box<number> = { contents: 123 };
const stringBox: Box<string> = { contents: "hello" };
\`\`\`

## Generic Constraints

Limit the types that can be used with a generic:

\`\`\`typescript
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);  // Now we know it has a length property
  return arg;
}

logLength("hello");     // Works, string has length
logLength([1, 2, 3]);   // Works, array has length
// logLength(123);      // Error, number doesn't have length
\`\`\`

## Use Cases

Generics are particularly useful for:

1. Creating reusable components
2. Working with collections of different types
3. Building type-safe APIs
4. Implementing advanced patterns like higher-order components

By mastering generics, you'll write more flexible and reusable TypeScript code.
        `,
        excerpt: "Master TypeScript generics to write more flexible, reusable, and type-safe code with this comprehensive guide.",
        authorId: additionalAuthorIds[1],
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1024"
      },
      {
        title: "Building a CI/CD Pipeline with GitHub Actions",
        content: `
# Building a CI/CD Pipeline with GitHub Actions

GitHub Actions offers a powerful way to automate your software development workflows. In this guide, I'll walk you through setting up a complete CI/CD pipeline.

## Getting Started

Create a workflow file in your repository at \`.github/workflows/main.yml\`:

\`\`\`yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
\`\`\`

## Adding Deployment

Extend your workflow to include deployment steps:

\`\`\`yaml
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to production
        uses: some-deployment-action@v1
        with:
          api-key: "DEPLOY_API_KEY"
\`\`\`

## Best Practices

1. Keep secrets in GitHub Secrets
2. Cache dependencies to speed up workflows
3. Use specific versions of actions
4. Run tests before deployment
5. Configure environment-specific workflows

With this setup, you'll have automated testing and deployment for your projects.
        `,
        excerpt: "Learn how to set up an efficient CI/CD pipeline using GitHub Actions to automate testing and deployment of your applications.",
        authorId: additionalAuthorIds[2],
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1024"
      },
      {
        title: "Getting Started with React Native",
        content: `
# Getting Started with React Native

React Native lets you build mobile apps using JavaScript and React. This guide will help you set up your first React Native project and understand the basics.

## Setting Up Your Environment

First, install the React Native CLI:

\`\`\`bash
npm install -g react-native-cli
\`\`\`

Then create a new project:

\`\`\`bash
npx react-native init MyFirstApp
cd MyFirstApp
\`\`\`

## Running Your App

For iOS:

\`\`\`bash
npx react-native run-ios
\`\`\`

For Android:

\`\`\`bash
npx react-native run-android
\`\`\`

## Your First Component

Create a simple component:

\`\`\`jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HelloWorld = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello, React Native!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default HelloWorld;
\`\`\`

## React Native vs. React Web

Key differences:
- Use native components like View, Text instead of div, span
- StyleSheet instead of CSS
- No DOM or web-specific APIs
- Platform-specific code with Platform module

This is just the beginning of your React Native journey. Next, you'll want to learn about navigation, state management, and accessing native functionality.
        `,
        excerpt: "Start building cross-platform mobile applications with this beginner-friendly introduction to React Native development.",
        authorId: additionalAuthorIds[3],
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1024"
      },
      {
        title: "10 Essential UI Design Principles for Developers",
        content: `
# 10 Essential UI Design Principles for Developers

As a developer, understanding basic UI design principles can significantly improve your applications. Here are 10 essential principles to follow.

## 1. Visual Hierarchy

Guide users' attention by establishing clear visual priorities:
- Use size, color, and contrast to highlight important elements
- Place primary actions prominently
- Create a natural flow from most to least important

## 2. Consistency

Maintain consistency throughout your interface:
- Use the same patterns for similar functionality
- Keep spacing, colors, and typography consistent
- Follow platform conventions and guidelines

## 3. Simplicity

Embrace "less is more":
- Remove unnecessary elements
- Use progressive disclosure for complex features
- Focus on essential functionality first

## 4. Feedback

Always confirm user actions:
- Show loading states during processing
- Acknowledge successful actions
- Provide clear error messages

## 5. Accessibility

Design for all users:
- Maintain sufficient color contrast
- Support keyboard navigation
- Add alt text for images
- Test with screen readers

## 6. Whitespace

Don't fear empty space:
- Use margins and padding generously
- Group related elements together
- Let content breathe

## 7. Alignment

Align elements to create order:
- Use a grid system
- Align text consistently (usually left-aligned for LTR languages)
- Create visual connections through alignment

## 8. Clarity

Make your interface self-explanatory:
- Use clear, descriptive labels
- Make interactive elements obvious
- Provide context when needed

## 9. Color Psychology

Use color purposefully:
- Limit your palette to 2-3 primary colors
- Use red for errors, green for success
- Ensure colors support your brand identity

## 10. Responsive Design

Design for all devices:
- Use fluid layouts and flexible components
- Test on multiple screen sizes
- Prioritize mobile usability

By applying these principles, you'll create interfaces that are not only visually appealing but also more usable and effective.
        `,
        excerpt: "Discover the fundamental UI design principles that every developer should know to create more usable, attractive, and effective applications.",
        authorId: additionalAuthorIds[0],
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?q=80&w=1024"
      }
    ];
    
    // Insert additional blogs
    console.log("Creating additional blog posts...");
    
    for (let i = 0; i < additionalBlogContent.length; i++) {
      const blog = additionalBlogContent[i];
      const [newArticle] = await db.insert(articles).values(blog).returning();
      console.log(`Created blog: ${blog.title}`);
      
      // Assign categories to each blog
      // Use modulo to ensure even distribution across categories
      const categoryIndex1 = i % categoryIds.length;
      const categoryIndex2 = (i + 1) % categoryIds.length;
      
      await db.insert(articleCategories).values({
        articleId: newArticle.id,
        categoryId: categoryIds[categoryIndex1]
      });
      
      await db.insert(articleCategories).values({
        articleId: newArticle.id,
        categoryId: categoryIds[categoryIndex2]
      });
      
      // Assign tags to each blog
      // Use modulo to ensure even distribution across tags
      const tagIndex1 = i % tagIds.length;
      const tagIndex2 = (i + 2) % tagIds.length;
      const tagIndex3 = (i + 4) % tagIds.length;
      
      await db.insert(articleTags).values({
        articleId: newArticle.id,
        tagId: tagIds[tagIndex1]
      });
      
      await db.insert(articleTags).values({
        articleId: newArticle.id,
        tagId: tagIds[tagIndex2]
      });
      
      await db.insert(articleTags).values({
        articleId: newArticle.id,
        tagId: tagIds[tagIndex3]
      });
    }
    
    // Also associate original blogs with categories and tags
    const originalBlogs = await db.select().from(articles).where(sql`id <= 3`);
    
    if (originalBlogs.length > 0) {
      console.log("Assigning categories and tags to original blogs...");
      
      for (let i = 0; i < originalBlogs.length; i++) {
        const blog = originalBlogs[i];
        
        // Assign categories
        const categoryIndex1 = i % categoryIds.length;
        const categoryIndex2 = (i + 2) % categoryIds.length;
        
        await db.insert(articleCategories).values({
          articleId: blog.id,
          categoryId: categoryIds[categoryIndex1]
        }).onConflictDoNothing();
        
        await db.insert(articleCategories).values({
          articleId: blog.id,
          categoryId: categoryIds[categoryIndex2]
        }).onConflictDoNothing();
        
        // Assign tags
        const tagIndex1 = i % tagIds.length;
        const tagIndex2 = (i + 3) % tagIds.length;
        
        await db.insert(articleTags).values({
          articleId: blog.id,
          tagId: tagIds[tagIndex1]
        }).onConflictDoNothing();
        
        await db.insert(articleTags).values({
          articleId: blog.id,
          tagId: tagIds[tagIndex2]
        }).onConflictDoNothing();
      }
    }
    
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