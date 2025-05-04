/**
 * Comprehensive Dummy Data Generator for Blog System
 * 
 * This script creates multiple users, articles, categories, tags, comments, assets,
 * and all other data types needed to properly test the blog system.
 * 
 * Run with: npx tsx scripts/generate-full-dummy-data.ts
 */

import { db } from "../server/db";
import { 
  users, UserRole, articles, ArticleStatus, categories, tags, 
  articleCategories, articleTags, articleCoAuthors, comments,
  assets, notifications, NotificationType
} from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq, sql } from "drizzle-orm";

async function generateFullDummyData() {
  console.log("Starting comprehensive dummy data generation...");

  try {
    // Generate admin users
    console.log("\n=== CREATING ADMIN USERS ===");
    const adminUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        bio: "Main administrator of the blog platform. Responsible for content moderation and user management.",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        bio: "Senior administrator specializing in technical content review and system maintenance.",
        avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg"
      }
    ];

    for (const admin of adminUsers) {
      const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, admin.email));

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await db.insert(users).values({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          bio: admin.bio,
          avatarUrl: admin.avatarUrl,
          canPublish: true
        });
        console.log(`Created admin user: ${admin.name}`);
      } else {
        console.log(`Admin user ${admin.name} already exists`);
      }
    }

    // Generate author users
    console.log("\n=== CREATING AUTHOR USERS ===");
    const authorUsers = [
      {
        name: "Sarah Johnson",
        email: "author@example.com",
        password: "password123",
        bio: "Professional tech writer with over 5 years of experience in blogging about web development, JavaScript, and modern frameworks.",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Mark Wilson",
        email: "mark.wilson@example.com",
        password: "password123",
        bio: "Senior software engineer with a focus on front-end development and UI/UX. I have worked with Fortune 500 companies to optimize their web applications.",
        avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Emily Chen",
        email: "emily.chen@example.com",
        password: "password123",
        bio: "Fullstack developer specializing in React and Node.js. I enjoy teaching coding concepts and building accessible web applications.",
        avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1024",
        canPublish: false
      },
      {
        name: "James Rodriguez",
        email: "james.rodriguez@example.com",
        password: "password123",
        bio: "DevOps specialist with experience in AWS, Docker, and Kubernetes. I write about cloud architecture and deployment strategies.",
        avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Jessica Lee",
        email: "jessica.lee@example.com",
        password: "password123",
        bio: "Mobile app developer with expertise in React Native and Flutter. I share tips on creating cross-platform applications and optimizing performance.",
        avatarUrl: "https://randomuser.me/api/portraits/women/15.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1024",
        canPublish: false
      }
    ];

    const authorIds: number[] = [];
    
    for (const author of authorUsers) {
      const [existingAuthor] = await db
        .select()
        .from(users)
        .where(eq(users.email, author.email));

      if (!existingAuthor) {
        const hashedPassword = await bcrypt.hash(author.password, 10);
        const [newAuthor] = await db.insert(users).values({
          name: author.name,
          email: author.email,
          password: hashedPassword,
          role: UserRole.AUTHOR,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
          bannerUrl: author.bannerUrl,
          socialLinks: JSON.stringify({
            twitter: `https://twitter.com/${author.name.toLowerCase().replace(' ', '')}`,
            github: `https://github.com/${author.name.toLowerCase().replace(' ', '')}`,
            linkedin: `https://linkedin.com/in/${author.name.toLowerCase().replace(' ', '')}`
          }),
          canPublish: author.canPublish
        }).returning();
        
        authorIds.push(newAuthor.id);
        console.log(`Created author user: ${author.name}`);
      } else {
        authorIds.push(existingAuthor.id);
        console.log(`Author user ${author.name} already exists`);
      }
    }

    // Generate categories
    console.log("\n=== CREATING CATEGORIES ===");
    const categoryData = [
      { name: 'JavaScript', slug: 'javascript', description: 'Articles about JavaScript programming language, frameworks, and tools.' },
      { name: 'Web Development', slug: 'web-development', description: 'Resources for web developers including frontend and backend topics.' },
      { name: 'Mobile Development', slug: 'mobile-development', description: 'Everything related to building mobile applications.' },
      { name: 'DevOps', slug: 'devops', description: 'Continuous integration, deployment, and cloud infrastructure topics.' },
      { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design principles and practices.' },
      { name: 'Career Development', slug: 'career-development', description: 'Tips and advice for growing your tech career.' },
      { name: 'Data Science', slug: 'data-science', description: 'Articles on data analysis, machine learning, and artificial intelligence.' },
      { name: 'Backend Development', slug: 'backend-development', description: 'Server-side programming, databases, and API development.' },
      { name: 'Security', slug: 'security', description: 'Web security, encryption, and best practices for secure applications.' },
      { name: 'Blockchain', slug: 'blockchain', description: 'Distributed ledger technology, cryptocurrencies, and smart contracts.' }
    ];
    
    const categoryIds: number[] = [];
    
    for (const category of categoryData) {
      const [existingCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category.slug));
        
      if (!existingCategory) {
        const [newCategory] = await db.insert(categories).values(category).returning();
        categoryIds.push(newCategory.id);
        console.log(`Created category: ${category.name}`);
      } else {
        categoryIds.push(existingCategory.id);
        console.log(`Category ${category.name} already exists`);
      }
    }

    // Generate tags
    console.log("\n=== CREATING TAGS ===");
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
      { name: 'Best Practices', slug: 'best-practices' },
      { name: 'Vue.js', slug: 'vuejs' },
      { name: 'Angular', slug: 'angular' },
      { name: 'Database', slug: 'database' },
      { name: 'Docker', slug: 'docker' },
      { name: 'AWS', slug: 'aws' },
      { name: 'Testing', slug: 'testing' },
      { name: 'GraphQL', slug: 'graphql' },
      { name: 'Next.js', slug: 'nextjs' },
      { name: 'Mobile', slug: 'mobile' },
      { name: 'Python', slug: 'python' }
    ];
    
    const tagIds: number[] = [];
    
    for (const tag of tagData) {
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tag.slug));
        
      if (!existingTag) {
        const [newTag] = await db.insert(tags).values(tag).returning();
        tagIds.push(newTag.id);
        console.log(`Created tag: ${tag.name}`);
      } else {
        tagIds.push(existingTag.id);
        console.log(`Tag ${tag.name} already exists`);
      }
    }

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

    // Generate articles with various statuses
    console.log("\n=== CREATING ARTICLES ===");
    
    const articleData = [
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
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1024",
        authorIndex: 0,
        categoryIndices: [0, 1],
        tagIndices: [2, 5]
      },
      {
        title: "Understanding React Hooks",
        content: `
# Understanding React Hooks

React Hooks have revolutionized how we write React components. This guide explores the most useful hooks and when to use them.

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

## useContext

The useContext hook provides a way to pass data through the component tree without manually passing props:

\`\`\`jsx
const ThemeContext = React.createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
\`\`\`

## useReducer

The useReducer hook is an alternative to useState for complex state logic:

\`\`\`jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <div>
      Count: {state.count}
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </div>
  );
}
\`\`\`

## Custom Hooks

You can create your own hooks to reuse stateful logic between components:

\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
}
\`\`\`

By understanding and using these React hooks effectively, you can write more concise and readable React components that are easier to test and maintain.
        `,
        excerpt: "A comprehensive guide to React Hooks, exploring useState, useEffect, useContext, and more to help you write modern React applications.",
        status: ArticleStatus.DRAFT,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=1024",
        authorIndex: 0,
        categoryIndices: [1],
        tagIndices: [0, 5, 7]
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

## Database Integration

For our database, we'll use MongoDB with Mongoose:

\`\`\`javascript
// server/db.js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Define a User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
\`\`\`

## Authentication with JWT

Let's implement user authentication using JSON Web Tokens:

\`\`\`javascript
// server/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('./db');

const secretKey = process.env.JWT_SECRET;

// Register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      secretKey,
      { expiresIn: '1h' }
    );
    
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
\`\`\`

By following this guide, you'll have a solid foundation for building full-stack applications with Node.js and React. In future articles, we'll explore more advanced topics like state management, testing, and deployment strategies.
        `,
        excerpt: "Learn how to build and deploy a complete web application using Node.js and React with step-by-step instructions.",
        status: ArticleStatus.REVIEW,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?q=80&w=1024",
        authorIndex: 0,
        categoryIndices: [1],
        tagIndices: [0, 1, 7]
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

## Combining Flexbox and Grid

The real power comes when you combine both:

\`\`\`css
/* Page layout with Grid */
.page {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: 
    "header header"
    "sidebar main"
    "footer footer";
}

/* Navigation with Flexbox */
.nav {
  display: flex;
  justify-content: space-between;
}
\`\`\`

## Browser Support

Both Grid and Flexbox have excellent browser support today:

- Flexbox: IE11+, all modern browsers
- Grid: Edge 16+, Chrome 57+, Firefox 52+, Safari 10.1+

## Responsive Design Considerations

For responsive design:

\`\`\`css
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .flex-container {
    flex-direction: column;
  }
}
\`\`\`

By understanding the strengths of both CSS Grid and Flexbox, you can choose the right tool for each layout challenge in your projects.
        `,
        excerpt: "Compare CSS Grid and Flexbox to understand their strengths and when to use each layout method for optimal web design.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=1024",
        authorIndex: 1,
        categoryIndices: [1, 4],
        tagIndices: [3, 5, 7]
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

## Basic Type Annotations

TypeScript allows you to annotate variables, function parameters, and return types:

\`\`\`typescript
// Basic types
let isDone: boolean = false;
let decimal: number = 6;
let color: string = "blue";
let list: number[] = [1, 2, 3];
let tuple: [string, number] = ["hello", 10];

// Function with type annotations
function add(a: number, b: number): number {
  return a + b;
}
\`\`\`

## Interfaces

Interfaces define object structures:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number; // Optional property
  readonly createdAt: Date; // Read-only property
}

function createUser(user: User): User {
  return user;
}

const newUser = createUser({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date()
});
\`\`\`

## Classes

TypeScript supports object-oriented programming with classes:

\`\`\`typescript
class Person {
  // Class properties
  private name: string;
  protected age: number;
  
  // Constructor
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  // Method
  greet(): string {
    return \`Hello, my name is \${this.name} and I am \${this.age} years old.\`;
  }
}

class Employee extends Person {
  constructor(name: string, age: number, public jobTitle: string) {
    super(name, age);
  }
  
  greet(): string {
    return \`\${super.greet()} I work as a \${this.jobTitle}.\`;
  }
}
\`\`\`

## Generics

Generics provide type-safe flexibility:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}

const result = identity<string>("Hello"); // Type is string
const numResult = identity<number>(42); // Type is number

// Generic interface
interface Pair<T, U> {
  first: T;
  second: U;
}

const pair: Pair<number, string> = { first: 1, second: "two" };
\`\`\`

## Type Inference

TypeScript can often infer types automatically:

\`\`\`typescript
// No need for explicit type annotation
let greeting = "Hello"; // TypeScript infers string type
let numbers = [1, 2, 3]; // TypeScript infers number[] type

// TypeScript infers return type as number
function square(x: number) {
  return x * x;
}
\`\`\`

## Benefits for JavaScript Developers

- Catch errors during development instead of runtime
- Improved IDE support with better autocompletion
- Self-documenting code with explicit types
- Safer refactoring
- Enhanced team collaboration with clear interfaces

By adding TypeScript to your JavaScript projects, you'll improve code quality, catch errors early, and make your codebase more maintainable as it grows.
        `,
        excerpt: "Learn the fundamentals of TypeScript and how it enhances JavaScript development with static type checking and improved tooling.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1024",
        authorIndex: 1,
        categoryIndices: [0, 1],
        tagIndices: [2, 6, 9]
      },
      {
        title: "Getting Started with Docker for Web Developers",
        content: `
# Getting Started with Docker for Web Developers

Docker has revolutionized how we develop, ship, and run applications. This guide will help web developers get started with Docker to improve their development workflow.

## What is Docker?

Docker is a platform that uses containerization to make it easier to create, deploy, and run applications. Containers package up an application with all its dependencies, ensuring it works consistently across different environments.

## Why Use Docker for Web Development?

- **Consistent environments:** Eliminate "it works on my machine" problems
- **Isolated dependencies:** Each project can use different versions of Node.js, PHP, etc.
- **Simplified onboarding:** New team members can start working quickly
- **Production parity:** Development environment mirrors production

## Installing Docker

First, install Docker Desktop for your operating system:

- [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- [Docker for Linux](https://docs.docker.com/engine/install/)

## Docker Basics

### Docker Images and Containers

- **Image:** A blueprint containing the application and its dependencies
- **Container:** A running instance of an image

### Essential Commands

\`\`\`bash
# Pull an image from Docker Hub
docker pull node:14

# List all images
docker images

# Run a container
docker run -d -p 8080:80 nginx

# List running containers
docker ps

# Stop a container
docker stop container_id

# Remove a container
docker rm container_id
\`\`\`

## Creating a Dockerfile

A Dockerfile is a script that contains instructions to build a Docker image. Here's a simple example for a Node.js application:

\`\`\`dockerfile
# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
\`\`\`

## Building and Running Your Image

\`\`\`bash
# Build an image
docker build -t my-node-app .

# Run the container
docker run -p 3000:3000 my-node-app
\`\`\`

## Docker Compose for Multi-Container Applications

For applications with multiple services (e.g., frontend, backend, database), use Docker Compose. Create a `docker-compose.yml` file:

\`\`\`yaml
version: '3'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/app
    volumes:
      - ./backend:/app
      - /app/node_modules

  db:
    image: postgres:13
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
\`\`\`

Run all services with:

\`\`\`bash
docker-compose up
\`\`\`

## Docker for Development vs. Production

For development:
- Use volumes to mount code from the host
- Enable hot-reloading
- Expose debugging ports

For production:
- Build optimized images
- Minimize image size
- Set proper environment variables
- Use Docker Swarm or Kubernetes for orchestration

## Best Practices

- Use multi-stage builds to keep images small
- Leverage layer caching to speed up builds
- Don't run containers as root
- Always specify versions for base images
- Use `.dockerignore` to exclude unnecessary files

By integrating Docker into your web development workflow, you'll enjoy more consistent environments, simplified dependency management, and smoother deployments.
        `,
        excerpt: "Learn how to use Docker to streamline your web development workflow with containerization for consistent environments across your team.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=1024",
        authorIndex: 3,
        categoryIndices: [3],
        tagIndices: [14, 9, 6]
      },
      {
        title: "Debugging JavaScript: Tips and Techniques",
        content: `
# Debugging JavaScript: Tips and Techniques

Debugging is an essential skill for every JavaScript developer. This article covers practical techniques to help you find and fix bugs more efficiently.

## Browser DevTools

The browser's Developer Tools are your primary debugging weapon:

### Chrome DevTools

1. **Console Tab**: Use `console.log()`, `console.error()`, `console.table()`, etc.

\`\`\`javascript
// Instead of basic console.log
console.log("User:", user);

// Use console.table for arrays or objects
console.table(users);

// Group related logs
console.group("Authentication");
console.log("Attempting login...");
console.log("User authenticated:", isAuthenticated);
console.groupEnd();
\`\`\`

2. **Sources Tab**: Set breakpoints and step through code execution

- Line breakpoints: Click on the line number
- Conditional breakpoints: Right-click on the line number and set a condition
- Function breakpoints: Use `debugger;` in your code

3. **Network Tab**: Monitor network requests and responses

## Using the Debugger Statement

The `debugger` statement creates a breakpoint in your code:

\`\`\`javascript
function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    debugger; // Execution will pause here
    total += item.price * item.quantity;
  }
  return total;
}
\`\`\`

## Error Handling

Proper error handling is crucial for debugging:

\`\`\`javascript
try {
  // Code that might throw an error
  const data = JSON.parse(response);
  processData(data);
} catch (error) {
  console.error("Error processing data:", error.message);
  // Handle the error gracefully
}
\`\`\`

## Source Maps

When working with transpiled or minified code, use source maps to debug the original source:

\`\`\`javascript
// In webpack.config.js
module.exports = {
  // ...
  devtool: 'source-map' // or 'eval-source-map' for development
};
\`\`\`

## Debugging Asynchronous Code

Asynchronous code introduces debugging challenges:

\`\`\`javascript
// Using async/await makes debugging easier
async function fetchUserData() {
  try {
    const response = await fetch('/api/user');
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

// Add breakpoints in .then() chains
fetchData()
  .then(data => {
    debugger; // Can pause here
    return processData(data);
  })
  .then(result => {
    // ...
  })
  .catch(error => {
    console.error("Error:", error);
  });
\`\`\`

## Performance Debugging

For performance issues:

\`\`\`javascript
// Measure time
console.time('operation');
expensiveOperation();
console.timeEnd('operation'); // Outputs: operation: 1234.56ms

// Profile CPU usage
console.profile('rendering');
renderComponent();
console.profileEnd('rendering');
\`\`\`

## Remote Debugging

Debug mobile or remote devices:

1. For Android: Use Chrome's remote debugging via USB
2. For iOS: Use Safari's Web Inspector

## Debugging Node.js Applications

For Node.js:

1. **Using inspect flag**:
\`\`\`bash
node --inspect server.js
\`\`\`

2. **In VS Code**: Use the debugging configuration for Node.js
\`\`\`json
{
  "type": "node",
  "request": "launch",
  "name": "Launch Program",
  "program": "${workspaceFolder}/server.js"
}
\`\`\`

## Debugging Framework-Specific Code

### React

- React DevTools extension
- Error boundaries
- Why Did You Render package

### Vue

- Vue DevTools extension
- Vue-specific debugging techniques

## Common Debugging Pitfalls

- **Not checking browser compatibility**
- **Mutating state unexpectedly**
- **Forgetting to remove debug code before production**
- **Race conditions in async code**

By mastering these debugging techniques, you'll be able to identify and fix JavaScript issues more efficiently, saving time and frustration in your development process.
        `,
        excerpt: "Master essential debugging techniques for JavaScript to help you identify and fix bugs faster in both browser and Node.js environments.",
        status: ArticleStatus.DRAFT,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1024",
        authorIndex: 2,
        categoryIndices: [0, 1],
        tagIndices: [0, 2, 9]
      },
      {
        title: "Creating Accessible Web Forms",
        content: `
# Creating Accessible Web Forms

Accessible web forms ensure that all users, including those with disabilities, can successfully complete and submit forms. This guide covers best practices for creating accessible forms.

## Why Accessibility Matters

- 15% of the world's population has some form of disability
- Legal requirements in many countries (ADA, AODA, EAA)
- Better usability for all users, not just those with disabilities
- Improved SEO and broader audience reach

## Semantic HTML

Use proper semantic HTML elements for forms:

\`\`\`html
<!-- Good -->
<form>
  <fieldset>
    <legend>Personal Information</legend>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>
  </fieldset>
</form>

<!-- Avoid -->
<div class="form">
  <div class="form-group">
    <div>Name:</div>
    <input type="text" name="name">
  </div>
</div>
\`\`\`

## Labels and Instructions

Every form control needs a properly associated label:

\`\`\`html
<!-- Using the for attribute -->
<label for="email">Email Address:</label>
<input type="email" id="email" name="email">

<!-- Wrapping the input with the label -->
<label>
  Password:
  <input type="password" name="password">
</label>
\`\`\`

Provide clear instructions:

\`\`\`html
<label for="password">Password:</label>
<input type="password" id="password" name="password" 
  aria-describedby="password-help">
<p id="password-help">
  Password must be at least 8 characters and include a number and a special character.
</p>
\`\`\`

## Keyboard Navigation

Ensure all form elements are keyboard accessible:

\`\`\`html
<!-- Ensure proper tab order -->
<input type="text" tabindex="1">
<input type="text" tabindex="2">

<!-- Custom elements need keyboard support -->
<div role="button" tabindex="0" onclick="submitForm()" 
  onkeydown="if(event.key==='Enter') submitForm()">
  Submit
</div>
\`\`\`

## Error Handling

Provide clear error messages and validation:

\`\`\`html
<label for="phone">Phone Number:</label>
<input type="tel" id="phone" name="phone" 
  aria-describedby="phone-error" aria-invalid="true">
<p id="phone-error" role="alert">
  Please enter a valid phone number in the format XXX-XXX-XXXX.
</p>
\`\`\`

Use both visual and programmatic indication of errors:

\`\`\`css
input[aria-invalid="true"] {
  border: 2px solid #d9534f;
  background-color: #fdf7f7;
}

.error-message {
  color: #d9534f;
  font-weight: bold;
}
\`\`\`

## ARIA Attributes

Use ARIA attributes when needed:

\`\`\`html
<!-- Required fields -->
<label for="name">Name: <span aria-hidden="true">*</span></label>
<input type="text" id="name" name="name" required 
  aria-required="true">

<!-- Live regions for dynamic content -->
<div aria-live="polite" role="status" id="form-status"></div>
\`\`\`

## Focus Management

Manage focus for a better user experience:

\`\`\`javascript
// Move focus to the first error field
document.querySelector('[aria-invalid="true"]').focus();

// Move focus to a success message after submission
document.getElementById('success-message').focus();
\`\`\`

## Form Controls Beyond Basic Inputs

### Select Menus

\`\`\`html
<label for="country">Country:</label>
<select id="country" name="country">
  <option value="">Select a country</option>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>
\`\`\`

### Checkboxes and Radio Buttons

\`\`\`html
<fieldset>
  <legend>Preferred Contact Method:</legend>
  
  <input type="radio" id="contact-email" name="contact" value="email">
  <label for="contact-email">Email</label>
  
  <input type="radio" id="contact-phone" name="contact" value="phone">
  <label for="contact-phone">Phone</label>
</fieldset>
\`\`\`

### Date Inputs

\`\`\`html
<label for="birthdate">Birth Date:</label>
<input type="date" id="birthdate" name="birthdate">
<!-- Provide fallback for unsupported browsers -->
<p id="date-format-help">Please enter date in YYYY-MM-DD format.</p>
\`\`\`

## Testing Your Forms

- Test with keyboard only (no mouse)
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test with browser zoom (up to 200%)
- Validate using tools like Axe, WAVE, or Lighthouse
- Conduct user testing with people with disabilities

## Making Complex Forms Manageable

For complex forms:

1. **Group related fields** using fieldset and legend
2. **Break into multiple steps** with clear progress indication
3. **Allow users to save and continue** later
4. **Provide inline validation** to catch errors early

By following these accessibility best practices, you'll create forms that work for everyone, provide a better user experience, and help meet legal requirements for digital accessibility.
        `,
        excerpt: "Learn how to create web forms that are accessible to all users, including those with disabilities, by following best practices for form design and implementation.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1497493292307-31c376b6e479?q=80&w=1024",
        authorIndex: 2,
        categoryIndices: [1, 4],
        tagIndices: [3, 5, 9]
      },
      {
        title: "Optimizing React Application Performance",
        content: `
# Optimizing React Application Performance

As React applications grow in size and complexity, performance optimization becomes increasingly important. This guide covers strategies and techniques to make your React apps faster and more efficient.

## Identifying Performance Issues

Before optimizing, identify bottlenecks using:

- React DevTools Profiler
- Chrome DevTools Performance panel
- Lighthouse audits

## Component Optimization

### Preventing Unnecessary Renders

Use React's memoization tools:

\`\`\`jsx
// React.memo for functional components
const MemoizedComponent = React.memo(function MyComponent(props) {
  /* render using props */
});

// shouldComponentUpdate for class components
shouldComponentUpdate(nextProps, nextState) {
  return nextProps.id !== this.props.id;
}
\`\`\`

### Optimizing Event Handlers

Prevent unnecessary re-creation of functions:

\`\`\`jsx
// Bad: Creates a new function on each render
<button onClick={() => handleClick(id)}>Click me</button>

// Good: Use useCallback
const handleClick = useCallback((id) => {
  // handle click
}, []);

// Then use it
<button onClick={() => handleClick(id)}>Click me</button>
\`\`\`

### useMemo for Expensive Calculations

\`\`\`jsx
const memoizedValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
\`\`\`

## State Management Optimization

### Local vs. Global State

Keep state as local as possible:

\`\`\`jsx
// Prefer local state when possible
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\`

### Optimizing Context

Avoid putting everything in a single context:

\`\`\`jsx
// Instead of one large context
const AppContext = React.createContext();

// Split into focused contexts
const UserContext = React.createContext();
const ThemeContext = React.createContext();
const NotificationsContext = React.createContext();
\`\`\`

Use context selectors to prevent unnecessary re-renders:

\`\`\`jsx
function UserNameDisplay() {
  // This component only re-renders when user.name changes
  const userName = useContext(UserContext, user => user.name);
  return <div>{userName}</div>;
}
\`\`\`

## Rendering Optimization

### List Virtualization

For long lists, use virtualization:

\`\`\`jsx
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  );

  return (
    <FixedSizeList
      height={500}
      width={300}
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

### Code Splitting

Split your code to load only what's needed:

\`\`\`jsx
import React, { Suspense, lazy } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/dashboard">
          <Dashboard />
        </Route>
        <Route path="/settings">
          <Settings />
        </Route>
      </Switch>
    </Suspense>
  );
}
\`\`\`

## Optimizing Assets and Dependencies

### Bundle Size Optimization

Analyze and reduce your bundle size:

\`\`\`bash
# Using source-map-explorer
npm install --save-dev source-map-explorer
npx source-map-explorer build/static/js/main.*
\`\`\`

Import only what you need:

\`\`\`jsx
// Bad: Imports entire library
import _ from 'lodash';

// Good: Import only what you need
import debounce from 'lodash/debounce';
\`\`\`

### Image Optimization

- Use responsive images with srcset
- Lazy load images with Intersection Observer
- Use modern formats like WebP
- Optimize images with tools like ImageOptim

\`\`\`jsx
// Lazy loading images
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src="image.jpg"
  effect="blur"
  alt="Image description"
/>
\`\`\`

## Network Optimization

### Data Fetching Strategies

Use efficient data loading patterns:

\`\`\`jsx
// Implement data prefetching
const prefetchUser = (id) => {
  const url = `/api/users/${id}`;
  // Prefetch and cache the data
  queryClient.prefetchQuery(['user', id], () => fetchUser(id));
};

// Hover prefetching example
<li onMouseEnter={() => prefetchUser(user.id)}>
  {user.name}
</li>
\`\`\`

### Caching

Implement proper caching with React Query or SWR:

\`\`\`jsx
import { useQuery } from 'react-query';

function UserProfile({ userId }) {
  const { isLoading, error, data } = useQuery(
    ['user', userId],
    () => fetchUser(userId),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data.name}</div>;
}
\`\`\`

## Testing Performance Improvements

Always measure before and after your optimizations:

1. Set a baseline using Lighthouse or React Profiler
2. Implement one optimization at a time
3. Measure again to confirm improvement
4. Document the improvement and reasons

## Advanced Techniques

### Web Workers

Move expensive computations off the main thread:

\`\`\`jsx
// Using worker-loader
import Worker from 'worker-loader!./worker.js';

const worker = new Worker();
worker.postMessage({ data: complexData });
worker.onmessage = (event) => {
  setResult(event.data);
};
\`\`\`

### Server-Side Rendering (SSR) and Static Generation

Consider SSR or static generation for faster initial loads:

\`\`\`jsx
// Next.js example of static generation
export async function getStaticProps() {
  const posts = await fetchPosts();
  return {
    props: { posts },
    revalidate: 60 // Regenerate page every 60 seconds
  };
}
\`\`\`

By implementing these optimization techniques, you'll create React applications that load faster, respond quicker to user interactions, and provide a better overall user experience.
        `,
        excerpt: "Learn advanced techniques to improve React application performance through component optimization, efficient rendering, and strategic state management.",
        status: ArticleStatus.DRAFT,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1566837945700-30057527ade0?q=80&w=1024",
        authorIndex: 4,
        categoryIndices: [0, 1],
        tagIndices: [0, 4, 6]
      },
      {
        title: "GraphQL vs REST: Choosing the Right API Architecture",
        content: `
# GraphQL vs REST: Choosing the Right API Architecture

When building modern applications, choosing the right API architecture is crucial. This article compares GraphQL and REST to help you make an informed decision for your project.

## Understanding REST

REST (Representational State Transfer) is an architectural style that's been the standard for API development for many years:

### Key Characteristics of REST

- **Resource-based**: Endpoints represent resources (e.g., /users, /products)
- **HTTP methods**: Uses HTTP verbs (GET, POST, PUT, DELETE) for operations
- **Stateless**: Each request contains all needed information
- **Uniform interface**: Consistent approach to resource manipulation
- **Cacheability**: Responses can be cached to improve performance

### Example REST API Endpoints

\`\`\`
GET /api/users                 # Get all users
GET /api/users/123             # Get a specific user
POST /api/users                # Create a user
PUT /api/users/123             # Update a user
DELETE /api/users/123          # Delete a user
GET /api/users/123/posts       # Get posts by a specific user
\`\`\`

## Understanding GraphQL

GraphQL is a query language and runtime for APIs developed by Facebook:

### Key Characteristics of GraphQL

- **Single endpoint**: Typically one endpoint for all operations
- **Client-specified queries**: Clients define the exact data they need
- **Strongly-typed schema**: Defines available data and operations
- **Hierarchical**: Reflects relationships between data
- **Introspection**: Self-documenting API structure

### Example GraphQL Query

\`\`\`graphql
query {
  user(id: "123") {
    id
    name
    email
    posts {
      id
      title
      comments {
        id
        text
        author {
          name
        }
      }
    }
  }
}
\`\`\`

## Key Differences

### Data Fetching

**REST**:
- Multiple endpoints for different resources
- Often results in over-fetching or under-fetching data
- Requires multiple requests for related data

\`\`\`javascript
// REST: Multiple requests to get user and their posts
fetch('/api/users/123')
  .then(res => res.json())
  .then(user => {
    // Now fetch posts in a separate request
    return fetch(`/api/users/${user.id}/posts`);
  })
  .then(res => res.json())
  .then(posts => {
    // Now we have both user and posts
  });
\`\`\`

**GraphQL**:
- Single request gets precisely the data needed
- No over-fetching or under-fetching
- Can request related data in a single query

\`\`\`javascript
// GraphQL: One request for both user and posts
fetch('/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: \`
      query {
        user(id: "123") {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    \`
  })
})
.then(res => res.json())
.then(data => {
  // data contains user and posts
});
\`\`\`

### Versioning and Evolution

**REST**:
- Requires explicit versioning (e.g., /api/v2/users)
- Breaking changes require new versions
- Entire API must be versioned even for small changes

**GraphQL**:
- Allows adding fields without breaking existing queries
- Deprecation of fields with warnings
- Clients only use what they need, so servers can evolve more freely

### Caching

**REST**:
- Uses HTTP caching mechanisms
- Simple and well-established
- Effective for resource-based data

**GraphQL**:
- More complex caching requirements
- Typically requires client-side caching solutions
- Tools like Apollo Client help manage cache

### Documentation

**REST**:
- Requires external documentation (e.g., Swagger/OpenAPI)
- Documentation can become outdated

**GraphQL**:
- Self-documenting with introspection
- Tools like GraphiQL provide interactive documentation
- Type system ensures documentation stays current

## When to Choose REST

REST might be preferable when:

- You need simple CRUD operations on well-defined resources
- HTTP caching is important
- You have limited client-side resources
- Your API is primarily consumed by third parties who need stability
- You need to support older clients or have bandwidth constraints

## When to Choose GraphQL

GraphQL might be preferable when:

- You have complex, nested data requirements
- Different clients need different data from the same backend
- You want to aggregate data from multiple sources
- Network performance is critical (mobile apps)
- Your API evolves frequently with new fields and types
- Your frontend and backend teams need to work independently

## Hybrid Approaches

Some projects benefit from using both:

- GraphQL for complex data requirements
- REST for simple CRUD or file uploads
- REST for public APIs, GraphQL for internal use

## Implementation Considerations

### REST Implementation

\`\`\`javascript
// Node.js with Express
const express = require('express');
const app = express();

app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  // Fetch user from database
  res.json(user);
});

app.get('/api/users/:id/posts', (req, res) => {
  const userId = req.params.id;
  // Fetch posts for user
  res.json(posts);
});
\`\`\`

### GraphQL Implementation

\`\`\`javascript
// Node.js with Apollo Server
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql\`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post!]!
  }
  
  type Post {
    id: ID!
    title: String!
    content: String!
    author: User!
  }
  
  type Query {
    user(id: ID!): User
    users: [User!]!
  }
\`;

const resolvers = {
  Query: {
    user: (_, { id }) => {
      // Fetch user from database
      return user;
    },
    users: () => {
      // Fetch all users
      return allUsers;
    }
  },
  User: {
    posts: (user) => {
      // Fetch posts for this user
      return userPosts;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen();
\`\`\`

## Conclusion

Both REST and GraphQL have their strengths and use cases. Consider your project requirements, team expertise, and future growth when making your decision. Many successful projects use REST, GraphQL, or a combination of both to deliver the best experience for their specific needs.
        `,
        excerpt: "Compare GraphQL and REST API architectures to understand their strengths, weaknesses, and ideal use cases for your next project.",
        status: ArticleStatus.REVIEW,
        published: false,
        featuredImage: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=1024",
        authorIndex: 2,
        categoryIndices: [1, 7],
        tagIndices: [17, 6, 9]
      },
      {
        title: "Mobile App Development with React Native",
        content: `
# Mobile App Development with React Native

React Native allows you to build native mobile apps using JavaScript and React. This guide will introduce you to React Native development and best practices.

## Why Choose React Native?

- **Cross-platform development**: Build for iOS and Android from a single codebase
- **Familiar React paradigms**: Use the same design patterns as React web development
- **Native performance**: Direct mapping to native UI components
- **Large community and ecosystem**: Extensive libraries and support
- **Hot reloading**: See changes instantly during development

## Setting Up Your Development Environment

First, install the necessary tools:

\`\`\`bash
# Install Node.js and npm if you haven't already

# Install Expo CLI (recommended for beginners)
npm install -g expo-cli

# Create a new project
expo init MyAwesomeApp
cd MyAwesomeApp

# Start the development server
npm start
\`\`\`

For a more customizable setup, use React Native CLI:

\`\`\`bash
# Install React Native CLI
npm install -g react-native-cli

# Create a new project
npx react-native init MyNativeApp

# Run on iOS or Android
npx react-native run-ios
# or
npx react-native run-android
\`\`\`

## Core Components

React Native provides a set of built-in components that map to native UI elements:

\`\`\`jsx
import {
  View,         // Container (like div)
  Text,         // Text display
  Image,        // Image display
  ScrollView,   // Scrollable container
  TextInput,    // Text input field
  TouchableOpacity, // Touchable element
  FlatList,     // Efficient list rendering
  StyleSheet,   // Style management
} from 'react-native';

function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello React Native</Text>
      <Image 
        source={require('./assets/logo.png')} 
        style={styles.logo}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter some text"
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Press Me</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginVertical: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
\`\`\`

## Styling in React Native

React Native uses a subset of CSS with JavaScript objects:

\`\`\`jsx
// Flexbox is the primary layout system
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column', // 'row', 'column', 'row-reverse', 'column-reverse'
    justifyContent: 'center', // 'flex-start', 'flex-end', 'center', 'space-between', 'space-around'
    alignItems: 'center', // 'flex-start', 'flex-end', 'center', 'stretch'
  },
  
  // Most CSS properties are camelCased
  // e.g., background-color becomes backgroundColor
  box: {
    width: 100,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    margin: 10,
    padding: 15,
    
    // Shadow properties for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    
    // Elevation for Android shadow
    elevation: 5,
  },
});
\`\`\`

## Navigation

Navigation is handled by libraries like React Navigation:

\`\`\`bash
npm install @react-navigation/native
npm install @react-navigation/stack
expo install react-native-gesture-handler react-native-reanimated
\`\`\`

Basic navigation setup:

\`\`\`jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen 
          name="Details" 
          component={DetailsScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// In HomeScreen.js
function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details', {
          itemId: 86,
          title: 'Product Details',
        })}
      />
    </View>
  );
}

// In DetailsScreen.js
function DetailsScreen({ route, navigation }) {
  const { itemId, title } = route.params;
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Details Screen</Text>
      <Text>Item ID: {itemId}</Text>
      <Text>Title: {title}</Text>
      <Button
        title="Go back"
        onPress={() => navigation.goBack()}
      />
    </View>
  );
}
\`\`\`

## State Management

For local state, use React's useState and useEffect:

\`\`\`jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Similar to componentDidMount and componentDidUpdate
    console.log('Count changed:', count);
    
    return () => {
      // Clean up (like componentWillUnmount)
      console.log('Component unmounting or count changing');
    };
  }, [count]);
  
  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="Increment" onPress={() => setCount(count + 1)} />
    </View>
  );
}
\`\`\`

For more complex state management, consider Redux or Context API:

\`\`\`jsx
// Using Context API
import React, { createContext, useContext, useReducer } from 'react';

// Create context
const AppContext = createContext();

// Create provider
function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Use context in components
function MyComponent() {
  const { state, dispatch } = useContext(AppContext);
  
  return (
    <View>
      <Text>{state.someValue}</Text>
      <Button 
        title="Update" 
        onPress={() => dispatch({ type: 'UPDATE', payload: newValue })} 
      />
    </View>
  );
}
\`\`\`

## Accessing Native Features

React Native provides APIs for many device features:

\`\`\`jsx
// Camera access
import { Camera } from 'expo-camera';

function CameraComponent() {
  const [hasPermission, setHasPermission] = useState(null);
  
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  
  return (
    <View style={{ flex: 1 }}>
      {hasPermission && (
        <Camera style={{ flex: 1 }} type={Camera.Constants.Type.back}>
          {/* Camera view content */}
        </Camera>
      )}
    </View>
  );
}

// Geolocation
import * as Location from 'expo-location';

async function getLocation() {
  let { status } = await Location.requestPermissionsAsync();
  if (status !== 'granted') {
    console.error('Permission to access location was denied');
    return;
  }
  
  let location = await Location.getCurrentPositionAsync({});
  console.log(location);
}
\`\`\`

## Performance Optimization

Keep your React Native app performant:

1. **Use FlatList instead of ScrollView** for long lists
\`\`\`jsx
<FlatList
  data={items}
  renderItem={({ item }) => <Item title={item.title} />}
  keyExtractor={item => item.id}
/>
\`\`\`

2. **Memoize components** with React.memo and useCallback
\`\`\`jsx
const MemoizedItem = React.memo(function Item({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

// In parent component
const handlePress = useCallback((id) => {
  // handle press event
}, [/* dependencies */]);
\`\`\`

3. **Use Hermes** JavaScript engine on Android
\`\`\`
// In android/app/build.gradle
project.ext.react = [
  enableHermes: true  // Enable Hermes
]
\`\`\`

## Testing

Set up testing with Jest and React Native Testing Library:

\`\`\`jsx
// Button.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from './Button';

test('Button press calls onPress handler', () => {
  const onPressMock = jest.fn();
  const { getByText } = render(
    <Button title="Press me" onPress={onPressMock} />
  );
  
  fireEvent.press(getByText('Press me'));
  expect(onPressMock).toHaveBeenCalledTimes(1);
});
\`\`\`

## Deployment

Prepare your app for production:

1. **Configure app icons and splash screens**
2. **Set up proper versioning in app.json/build.gradle/Info.plist**
3. **Generate release builds**

\`\`\`bash
# For Expo
expo build:android -t app-bundle
expo build:ios

# For React Native CLI (Android)
cd android && ./gradlew assembleRelease
\`\`\`

By following these guidelines, you'll be able to build robust, performant, and user-friendly mobile applications with React Native that work seamlessly across iOS and Android platforms.
        `,
        excerpt: "Get started with React Native for cross-platform mobile app development using your existing JavaScript and React skills.",
        status: ArticleStatus.PUBLISHED,
        published: true,
        featuredImage: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1024",
        authorIndex: 4,
        categoryIndices: [2],
        tagIndices: [0, 18, 7]
      }
    ];

    // Create articles with various authors, categories, and tags
    for (const articleInfo of articleData) {
      const [existingArticle] = await db
        .select()
        .from(articles)
        .where(eq(articles.title, articleInfo.title));
        
      if (!existingArticle) {
        // Create the article
        const [newArticle] = await db.insert(articles).values({
          title: articleInfo.title,
          slug: generateSlug(articleInfo.title),
          content: articleInfo.content,
          excerpt: articleInfo.excerpt,
          authorId: authorIds[articleInfo.authorIndex],
          status: articleInfo.status,
          published: articleInfo.published,
          featuredImage: articleInfo.featuredImage,
          publishedAt: articleInfo.published ? new Date() : null
        }).returning();
        
        // Add category relationships
        for (const categoryIndex of articleInfo.categoryIndices) {
          await db.insert(articleCategories).values({
            articleId: newArticle.id,
            categoryId: categoryIds[categoryIndex]
          });
        }
        
        // Add tag relationships
        for (const tagIndex of articleInfo.tagIndices) {
          await db.insert(articleTags).values({
            articleId: newArticle.id,
            tagId: tagIds[tagIndex]
          });
        }
        
        // Add co-authors for some articles if not the first two
        if (articleInfo.authorIndex > 1 && Math.random() > 0.5) {
          // Choose a random co-author different from the main author
          const coAuthorIndex = getRandomItems(
            authorIds.filter((_, index) => index !== articleInfo.authorIndex), 
            1
          )[0];
          
          await db.insert(articleCoAuthors).values({
            articleId: newArticle.id,
            userId: coAuthorIndex
          });
        }
        
        console.log(`Created article: ${articleInfo.title} (${articleInfo.status})`);
      } else {
        console.log(`Article '${articleInfo.title}' already exists`);
      }
    }

    // Generate comments for published articles
    console.log("\n=== CREATING COMMENTS ===");
    const publishedArticleIds = (await db
      .select()
      .from(articles)
      .where(eq(articles.published, true)))
      .map(article => article.id);
      
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
    
    for (const articleId of publishedArticleIds) {
      // Generate 2-5 comments per article
      const commentCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < commentCount; i++) {
        const nameIndex = Math.floor(Math.random() * commentNames.length);
        const contentIndex = Math.floor(Math.random() * commentContents.length);
        
        const [comment] = await db.insert(comments).values({
          content: commentContents[contentIndex],
          authorName: commentNames[nameIndex],
          authorEmail: commentEmails[nameIndex],
          articleId,
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
            articleId,
            parentId: comment.id,
            isApproved: true
          });
          
          // Update reply count
          await db.update(comments)
            .set({ replyCount: 1 })
            .where(eq(comments.id, comment.id));
        }
      }
      
      console.log(`Created comments for article ID: ${articleId}`);
    }

    // Generate notifications
    console.log("\n=== CREATING NOTIFICATIONS ===");
    
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
    for (const authorId of authorIds) {
      // Get articles by this author
      const authorArticles = await db
        .select()
        .from(articles)
        .where(eq(articles.authorId, authorId));
      
      if (authorArticles.length > 0) {
        // Create 2-4 notifications per author
        const notificationCount = Math.floor(Math.random() * 3) + 2;
        
        for (let i = 0; i < notificationCount; i++) {
          const article = authorArticles[Math.floor(Math.random() * authorArticles.length)];
          const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
          
          const message = notificationType.messageTemplate.replace('{title}', article.title);
          
          await db.insert(notifications).values({
            userId: authorId,
            type: notificationType.type,
            title: notificationType.title,
            message: message,
            articleId: article.id,
            articleSlug: article.slug,
            read: Math.random() > 0.5 // 50% chance of being read
          });
        }
        
        console.log(`Created notifications for author ID: ${authorId}`);
      }
    }

    // Generate some assets
    console.log("\n=== CREATING ASSETS ===");
    
    const assetData = [
      {
        filename: 'logo.png',
        originalName: 'company-logo.png',
        path: '/uploads/logo.png',
        url: 'https://via.placeholder.com/200x200',
        mimetype: 'image/png',
        size: 15240,
        title: 'Company Logo',
        description: 'Official logo for the blog',
        tags: ['logo', 'branding']
      },
      {
        filename: 'javascript-code.jpg',
        originalName: 'js-snippet.jpg',
        path: '/uploads/javascript-code.jpg',
        url: 'https://via.placeholder.com/800x400',
        mimetype: 'image/jpeg',
        size: 45680,
        title: 'JavaScript Code Snippet',
        description: 'Example code for JS tutorials',
        tags: ['javascript', 'code', 'tutorial']
      },
      {
        filename: 'react-diagram.png',
        originalName: 'react-component-lifecycle.png',
        path: '/uploads/react-diagram.png',
        url: 'https://via.placeholder.com/600x800',
        mimetype: 'image/png',
        size: 134590,
        title: 'React Component Lifecycle',
        description: 'Diagram explaining React component lifecycle',
        tags: ['react', 'diagram', 'tutorial']
      },
      {
        filename: 'profile-background.jpg',
        originalName: 'profile-bg.jpg',
        path: '/uploads/profile-background.jpg',
        url: 'https://via.placeholder.com/1200x300',
        mimetype: 'image/jpeg',
        size: 245780,
        title: 'Profile Background Image',
        description: 'Background image for user profiles',
        tags: ['background', 'profile', 'design']
      }
    ];
    
    for (let i = 0; i < assetData.length; i++) {
      const asset = assetData[i];
      const userId = authorIds[i % authorIds.length]; // Distribute assets among authors
      
      await db.insert(assets).values({
        ...asset,
        userId,
        tags: JSON.stringify(asset.tags)
      });
      
      console.log(`Created asset: ${asset.title}`);
    }

    console.log("\n=== COMPREHENSIVE DUMMY DATA GENERATION COMPLETE ===");
    console.log("\nYou can now log in with the following credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("Author: author@example.com / password123");

  } catch (error) {
    console.error("Error generating full dummy data:", error);
  }
}

// Run the generator
generateFullDummyData()
  .then(() => {
    console.log('Dummy data generation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during dummy data generation:', error);
    process.exit(1);
  });