import { db } from "../server/db";
import { users, articles, ArticleStatus, articleCategories, articleTags } from "../shared/schema";
import { eq } from "drizzle-orm";

async function addFinalArticle() {
  console.log("Adding the final article in review status...");

  // Get existing author
  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));

  if (!author) {
    console.error("No author found with email author@example.com. Aborting.");
    return;
  }

  // Create in-review article
  const [reviewArticle] = await db.insert(articles).values({
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
    authorId: author.id,
    status: ArticleStatus.REVIEW,
    published: false,
    featuredImage: "https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?q=80&w=1024"
  }).returning();
  
  console.log(`Created review article: ${reviewArticle.title}`);
  
  // Add categories and tags to the review article
  await db.insert(articleCategories).values({
    articleId: reviewArticle.id,
    categoryId: 2 // Web Development category
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: 1 // React tag
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: 2 // Node.js tag
  });
  
  await db.insert(articleTags).values({
    articleId: reviewArticle.id,
    tagId: 8 // Tutorial tag
  });
  
  console.log("Final article creation completed!");
}

// Run the function
addFinalArticle()
  .then(() => {
    console.log('Final article added successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error adding final article:', error);
    process.exit(1);
  });