# Blog System Integration Guide

This directory contains examples and utilities to help you integrate the blog system with your main React TypeScript website. The integration uses a REST API approach with JWT authentication for secured endpoints.

## Setup Instructions

### 1. Configure Environment Variables

In your main React TypeScript project, create or update your `.env` file with the following variables:

```
REACT_APP_BLOG_API_URL=https://your-blog-app.replit.app
REACT_APP_BLOG_JWT_SECRET=your_shared_jwt_secret
```

### 2. Generate JWT Secret Key

To secure the communication between your main website and the blog system:

1. Run the JWT key generator script in the blog system:
   ```
   node scripts/create-jwt-key.js
   ```

2. Copy the generated JWT secret and use it in both applications.

### 3. Configure CORS

The blog system has been configured to accept requests from your main website. Make sure to update the allowed origins in `server/cors-config.ts` with the domain of your main website.

### 4. Import API Utilities

Copy the API utility files from this directory to your main website project:

- `api-utils.ts` - Contains all the necessary functions to interact with the blog API

### 5. Use the Example Components

These example components demonstrate how to integrate with the blog system:

- `BlogList.tsx` - Displays a list of published blog articles
- `BlogDetail.tsx` - Shows a single blog article
- `BlogSearch.tsx` - Implements search functionality for blog content

## Authentication

For public endpoints (published articles, categories), no authentication is required.

For secured endpoints (admin/author operations), you need to:

1. Authenticate with the blog system's `/api/auth/login` endpoint
2. Store the returned JWT token
3. Include the token in subsequent API requests

## API Endpoints

The blog system exposes the following main endpoints:

### Public Endpoints

- `GET /api/articles/published` - List all published articles
- `GET /api/articles/slug/:slug` - Get article by slug
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug/articles` - Get articles by category

### Authentication Endpoints

- `POST /api/auth/login` - Authenticate user and get JWT token
- `GET /api/auth/me` - Get current user info (requires JWT)

### Secured Endpoints

- `GET /api/articles` - Get all articles (requires JWT)
- `POST /api/articles` - Create new article (requires JWT)
- `GET /api/articles/:id` - Get article by ID (requires JWT)
- `PUT /api/articles/:id` - Update article (requires JWT)

## Customization

The example components are designed to work with minimal styling. You should customize the CSS classes to match your website's design system.
