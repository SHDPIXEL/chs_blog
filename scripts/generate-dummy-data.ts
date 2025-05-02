import { db } from "../server/db";
import { users, UserRole, articles, ArticleStatus, categories, tags, articleCategories, articleTags } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq, SQL, sql } from "drizzle-orm";

async function generateDummyData() {
  console.log("Starting to generate dummy data...");

  // Create author user if not exists
  const [authorCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));

  let authorId: number;
  
  if (!authorCheck) {
    console.log("Creating author user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const [newAuthor] = await db.insert(users).values({
      name: "Sarah Johnson",
      email: "author@example.com",
      password: hashedPassword,
      role: UserRole.AUTHOR,
      bio: "Professional tech writer with over 5 years of experience in blogging about web development, JavaScript, and modern frameworks.",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      canPublish: true
    }).returning();
    
    authorId = newAuthor.id;
    console.log("Author user created with ID:", authorId);
  } else {
    authorId = authorCheck.id;
    console.log("Using existing author with ID:", authorId);
  }

  // Create categories if they don't exist
  const categoryNames = [
    'JavaScript', 
    'Web Development', 
    'Mobile Development', 
    'DevOps', 
    'UI/UX Design', 
    'Career Development'
  ];
  
  const categoryDescriptions = [
    'Articles about JavaScript programming language, frameworks, and tools.',
    'Resources for web developers including frontend and backend topics.',
    'Everything related to building mobile applications.',
    'Continuous integration, deployment, and cloud infrastructure topics.',
    'User interface and experience design principles and practices.',
    'Tips and advice for growing your tech career.'
  ];
  
  const categoryIds: number[] = [];
  
  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const description = categoryDescriptions[i];
    
    // Check if category exists
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    
    if (!existingCategory) {
      console.log(`Creating category: ${name}`);
      const [newCategory] = await db.insert(categories).values({
        name,
        slug,
        description
      }).returning();
      categoryIds.push(newCategory.id);
    } else {
      console.log(`Category ${name} already exists.`);
      categoryIds.push(existingCategory.id);
    }
  }
  
  // Create tags if they don't exist
  const tagNames = [
    'React', 
    'Node.js', 
    'TypeScript', 
    'CSS', 
    'Performance', 
    'Beginner', 
    'Advanced', 
    'Tutorial'
  ];
  
  const tagIds: number[] = [];
  
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace('.', '');
    
    // Check if tag exists
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug));
    
    if (!existingTag) {
      console.log(`Creating tag: ${name}`);
      const [newTag] = await db.insert(tags).values({
        name,
        slug
      }).returning();
      tagIds.push(newTag.id);
    } else {
      console.log(`Tag ${name} already exists.`);
      tagIds.push(existingTag.id);
    }
  }

  // Blog titles and excerpts
  const blogData = [
    {
      title: "Modern JavaScript Features You Should Know",
      excerpt: "A comprehensive guide to ES6+ features that every JavaScript developer should master.",
      content: `
# Modern JavaScript Features You Should Know

JavaScript has evolved significantly in recent years. Here's a guide to some of the most important features you should be using in your code today.

## Arrow Functions

Arrow functions provide a concise syntax and lexical \`this\` binding:

\`\`\`javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
\`\`\`

## Destructuring

Destructuring allows you to extract values from arrays and objects:

\`\`\`javascript
// Object destructuring
const person = { name: 'John', age: 30 };
const { name, age } = person;

// Array destructuring
const colors = ['red', 'green', 'blue'];
const [firstColor, secondColor] = colors;
\`\`\`

## Spread and Rest Operators

These operators make working with arrays and objects much more convenient:

\`\`\`javascript
// Spread operator for arrays
const numbers = [1, 2, 3];
const moreNumbers = [...numbers, 4, 5]; // [1, 2, 3, 4, 5]

// Spread operator for objects
const baseConfig = { version: '1.0', api: 'https://api.example.com' };
const config = { ...baseConfig, timeout: 5000 };

// Rest parameter
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
\`\`\`

## Optional Chaining

Optional chaining prevents errors when accessing nested properties:

\`\`\`javascript
// Without optional chaining
const streetName = user && user.address && user.address.street;

// With optional chaining
const streetName = user?.address?.street;
\`\`\`

## Nullish Coalescing

The nullish coalescing operator provides a fallback only for nullish values (null or undefined):

\`\`\`javascript
// Returns fallback only if value is null or undefined
const username = user.name ?? 'Anonymous';
\`\`\`

By adopting these modern JavaScript features, you'll write cleaner, more maintainable code.
      `,
      status: ArticleStatus.PUBLISHED,
      image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=2000"
    },
    {
      title: "Building Responsive UIs with Tailwind CSS",
      excerpt: "Learn how to create beautiful, responsive interfaces efficiently using the utility-first CSS framework.",
      content: `
# Building Responsive UIs with Tailwind CSS

Tailwind CSS has revolutionized how developers build interfaces. This guide will show you how to leverage its utility-first approach for responsive designs.

## Getting Started with Tailwind

First, you'll need to install Tailwind CSS in your project:

\`\`\`bash
npm install tailwindcss
npx tailwindcss init
\`\`\`

## Core Concepts

Tailwind uses utility classes for styling directly in your HTML:

\`\`\`html
<!-- Traditional CSS approach -->
<div class="card">
  <h2 class="card-title">Hello World</h2>
  <p class="card-text">Content here</p>
</div>

<!-- Tailwind approach -->
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold mb-2 text-gray-800">Hello World</h2>
  <p class="text-gray-600">Content here</p>
</div>
\`\`\`

## Responsive Design

Tailwind makes responsive design straightforward with breakpoint prefixes:

\`\`\`html
<div class="w-full md:w-1/2 lg:w-1/3">
  <!-- Full width on mobile, half width on medium screens, third width on large screens -->
</div>
\`\`\`

## Dark Mode

Implementing dark mode is simple with Tailwind's dark variant:

\`\`\`html
<div class="bg-white dark:bg-gray-800 text-black dark:text-white">
  <!-- Content that changes color in dark mode -->
</div>
\`\`\`

## Customization

You can customize Tailwind through the configuration file:

\`\`\`javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3490dc',
        secondary: '#ffed4a',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
      }
    }
  }
}
\`\`\`

By mastering these Tailwind CSS concepts, you'll build responsive, maintainable UIs in record time.
      `,
      status: ArticleStatus.PUBLISHED,
      image: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?q=80&w=2071"
    },
    {
      title: "Mastering React Hooks",
      excerpt: "A deep dive into React Hooks and how they can simplify your functional components.",
      content: `
# Mastering React Hooks

React Hooks have transformed how we build components in React. This guide will help you understand and use them effectively.

## useState: Managing State

The useState hook lets you add state to functional components:

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

## useEffect: Handling Side Effects

The useEffect hook lets you perform side effects in functional components:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
    
    // Cleanup function (optional)
    return () => {
      document.title = 'React App';
    };
  }, [count]); // Only re-run if count changes

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

## useContext: Accessing Context

The useContext hook provides a way to pass data through the component tree without prop drilling:

\`\`\`jsx
import React, { useContext } from 'react';

const ThemeContext = React.createContext('light');

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Themed Button</button>;
}
\`\`\`

## useRef: Accessing DOM Elements

The useRef hook gives you a way to access DOM elements directly:

\`\`\`jsx
import React, { useRef } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);
  
  const onButtonClick = () => {
    // \`current\` points to the mounted text input element
    inputEl.current.focus();
  };
  
  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
\`\`\`

## Custom Hooks: Reusing Logic

You can create your own hooks to reuse stateful logic between components:

\`\`\`jsx
import { useState, useEffect } from 'react';

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return width;
}

// Using the custom hook
function ResponsiveComponent() {
  const width = useWindowWidth();
  return <p>Window width is {width}</p>;
}
\`\`\`

By mastering these hooks, you'll be able to write cleaner, more maintainable React components.
      `,
      status: ArticleStatus.PUBLISHED,
      image: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=2070"
    },
    {
      title: "TypeScript: Why You Should Start Using It Today",
      excerpt: "Discover the benefits of TypeScript and how it can make your JavaScript code more robust and maintainable.",
      content: `
# TypeScript: Why You Should Start Using It Today

TypeScript adds static typing to JavaScript, enhancing developer productivity and code quality. Here's why you should consider adopting it.

## Type Safety

TypeScript helps catch errors during development instead of runtime:

\`\`\`typescript
// JavaScript
function add(a, b) {
  return a + b;
}

add("5", 10); // Returns "510" instead of 15

// TypeScript
function add(a: number, b: number): number {
  return a + b;
}

add("5", 10); // Error: Argument of type 'string' is not assignable to parameter of type 'number'
\`\`\`

## Better IDE Support

TypeScript provides excellent IDE support with autocompletion and inline documentation:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
  /** User's role in the system */
  role: "admin" | "user" | "guest";
}

function getUserEmail(user: User): string {
  return user.email; // IDE provides autocomplete for all User properties
}
\`\`\`

## Enhanced Refactoring

TypeScript makes refactoring safer and more efficient:

\`\`\`typescript
// Before refactoring
interface Product {
  id: number;
  name: string;
  price: number;
}

// After refactoring (TypeScript will show errors anywhere the price property is used)
interface Product {
  id: number;
  name: string;
  cost: number; // Renamed from price
}
\`\`\`

## Interfaces and Type Definitions

TypeScript allows you to define clear contracts for your code:

\`\`\`typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface User {
  id: number;
  username: string;
}

async function fetchUser(id: number): Promise<ApiResponse<User>> {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}
\`\`\`

## Gradual Adoption

You can adopt TypeScript gradually in existing JavaScript projects:

\`\`\`typescript
// Existing JavaScript file renamed to .ts
// Add types progressively
let count = 0; // TypeScript infers this as number
const names = ["Alice", "Bob"]; // TypeScript infers string[]

// Add explicit types where helpful
function processUser(user: { id: number; name: string }) {
  console.log(\`Processing \${user.name}\`);
}
\`\`\`

Starting with TypeScript might require some initial setup, but the long-term benefits for code quality and maintenance are substantial.
      `,
      status: ArticleStatus.DRAFT
    },
    {
      title: "Testing React Applications with Jest and React Testing Library",
      excerpt: "Learn how to write effective tests for your React components to ensure reliability and prevent regressions.",
      content: `
# Testing React Applications with Jest and React Testing Library

Testing is a crucial part of building reliable React applications. This guide covers how to test your components effectively using Jest and React Testing Library.

## Setting Up

First, install the necessary dependencies:

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
\`\`\`

## Writing Your First Test

Let's test a simple Button component:

\`\`\`jsx
// Button.jsx
import React from 'react';

function Button({ onClick, children }) {
  return (
    <button onClick={onClick} className="button">
      {children}
    </button>
  );
}

export default Button;
\`\`\`

\`\`\`jsx
// Button.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from './Button';

test('renders button with correct text', () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/click me/i);
  expect(buttonElement).toBeInTheDocument();
});

test('calls onClick handler when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  
  fireEvent.click(screen.getByText(/click me/i));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
\`\`\`

## Testing Asynchronous Code

Testing components that fetch data:

\`\`\`jsx
// UserProfile.jsx
import React, { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUser();
  }, [userId]);
  
  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default UserProfile;
\`\`\`

\`\`\`jsx
// UserProfile.test.jsx
import React from 'react';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserProfile from './UserProfile';

// Mock the fetch API
global.fetch = jest.fn();

test('displays user data when fetch succeeds', async () => {
  const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
  
  fetch.mockResolvedValueOnce({
    json: async () => mockUser
  });
  
  render(<UserProfile userId={1} />);
  
  // Verify loading state is shown
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  // Wait for loading to disappear
  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
  
  // Verify user data is displayed
  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  expect(screen.getByText(\`Email: \${mockUser.email}\`)).toBeInTheDocument();
  
  // Verify fetch was called correctly
  expect(fetch).toHaveBeenCalledWith('/api/users/1');
});
\`\`\`

## Testing Custom Hooks

You can test custom hooks using the \`renderHook\` utility:

\`\`\`jsx
// useCounter.js
import { useState, useCallback } from 'react';

function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}

export default useCounter;
\`\`\`

\`\`\`jsx
// useCounter.test.js
import { renderHook, act } from '@testing-library/react';
import useCounter from './useCounter';

test('should increment counter', () => {
  const { result } = renderHook(() => useCounter());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});

test('should decrement counter', () => {
  const { result } = renderHook(() => useCounter(3));
  
  act(() => {
    result.current.decrement();
  });
  
  expect(result.current.count).toBe(2);
});

test('should reset counter', () => {
  const { result } = renderHook(() => useCounter(10));
  
  act(() => {
    result.current.increment();
    result.current.reset();
  });
  
  expect(result.current.count).toBe(10);
});
\`\`\`

With these testing techniques, you can ensure your React components and hooks work correctly and remain reliable as your application evolves.
      `,
      status: ArticleStatus.REVIEW
    },
    {
      title: "Optimizing React Performance",
      excerpt: "Advanced techniques to make your React applications faster and more responsive.",
      content: `
# Optimizing React Performance

As React applications grow, performance can become a concern. This guide covers strategies to optimize your React applications.

## Identifying Performance Issues

Before optimizing, identify where problems exist:

- Use React DevTools Profiler
- Measure component render times
- Look for excessive re-renders

## Memoization with React.memo

Prevent unnecessary re-renders with React.memo:

\`\`\`jsx
import React from 'react';

// Without memoization - re-renders on every parent render
function MovieCard({ title, director, year }) {
  return (
    <div className="movie-card">
      <h3>{title}</h3>
      <p>Directed by {director}</p>
      <p>Released: {year}</p>
    </div>
  );
}

// With memoization - only re-renders when props change
const MemoizedMovieCard = React.memo(function MovieCard({ title, director, year }) {
  return (
    <div className="movie-card">
      <h3>{title}</h3>
      <p>Directed by {director}</p>
      <p>Released: {year}</p>
    </div>
  );
});
\`\`\`

## Optimizing State Updates

Organize your state to avoid unnecessary renders:

\`\`\`jsx
// Bad: Everything re-renders when any part of the state changes
const [state, setState] = useState({
  user: null,
  posts: [],
  comments: [],
  isLoading: false
});

// Good: Split state to isolate updates
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [comments, setComments] = useState([]);
const [isLoading, setIsLoading] = useState(false);
\`\`\`

## useMemo and useCallback

Optimize expensive calculations and prevent function recreation:

\`\`\`jsx
import React, { useState, useMemo, useCallback } from 'react';

function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  
  // Memoize expensive filtering operation
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]); // Only recalculate when items or query changes
  
  // Prevent handleClick from being recreated on every render
  const handleClick = useCallback((id) => {
    console.log('Item clicked:', id);
  }, []); // Empty dependency array means function is created once
  
  return (
    <div>
      <input 
        type="text" 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        placeholder="Search..." 
      />
      <ul>
        {filteredItems.map(item => (
          <li key={item.id} onClick={() => handleClick(item.id)}>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
\`\`\`

## Virtualization for Long Lists

Use virtualization libraries for rendering long lists:

\`\`\`jsx
import React from 'react';
import { FixedSizeList } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="row">
      {items[index].name}
    </div>
  );
  
  return (
    <FixedSizeList
      height={500}
      width="100%"
      itemCount={items.length}
      itemSize={35}
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

## Code Splitting

Split your code to load only what's needed:

\`\`\`jsx
import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

// Import components dynamically
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/settings" component={Settings} />
      </Switch>
    </Suspense>
  );
}
\`\`\`

By implementing these optimization techniques, you can significantly improve the performance of your React applications, providing a better user experience.
      `,
      status: ArticleStatus.REVIEW
    }
  ];

  // Create blog posts
  for (const blog of blogData) {
    const slug = blog.title.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
    
    // Check if article with this title already exists
    const [existingArticle] = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));
    
    if (!existingArticle) {
      console.log(`Creating blog post: ${blog.title}`);
      
      const published = blog.status === ArticleStatus.PUBLISHED;
      const publishedAt = published ? new Date() : null;
      
      const [newArticle] = await db.insert(articles).values({
        title: blog.title,
        slug: slug,
        content: blog.content,
        excerpt: blog.excerpt,
        authorId: authorId,
        status: blog.status,
        published: published,
        featuredImage: blog.image || null,
        publishedAt: publishedAt
      }).returning();
      
      console.log(`Created blog post with ID: ${newArticle.id}`);
      
      // Assign random categories to the article (2-3 categories per article)
      const numCategories = Math.floor(Math.random() * 2) + 2; // 2-3 categories
      const shuffledCategories = [...categoryIds].sort(() => 0.5 - Math.random());
      const selectedCategories = shuffledCategories.slice(0, numCategories);
      
      for (const categoryId of selectedCategories) {
        await db.insert(articleCategories).values({
          articleId: newArticle.id,
          categoryId: categoryId
        });
      }
      
      // Assign random tags to the article (3-5 tags per article)
      const numTags = Math.floor(Math.random() * 3) + 3; // 3-5 tags
      const shuffledTags = [...tagIds].sort(() => 0.5 - Math.random());
      const selectedTags = shuffledTags.slice(0, numTags);
      
      for (const tagId of selectedTags) {
        await db.insert(articleTags).values({
          articleId: newArticle.id,
          tagId: tagId
        });
      }
    } else {
      console.log(`Blog post "${blog.title}" already exists.`);
    }
  }

  console.log("Dummy data generation completed!");
}

generateDummyData()
  .then(() => {
    console.log('Successfully generated dummy data');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error generating dummy data:', error);
    process.exit(1);
  });