# Blog Integration Setup Guide

## Introduction

This guide provides step-by-step instructions for integrating the blog system with your React TypeScript website. By following these steps, you'll be able to connect your main website to the blog system using a REST API approach, allowing you to display blog content on your website while maintaining the blog through the dedicated admin interface.

## Prerequisites

- Your React TypeScript website project
- The blog system deployed and running
- Basic knowledge of React and TypeScript

## Step 1: Configure Environment Variables

1. Create or update your `.env` file in your React project:

```
REACT_APP_BLOG_API_URL=https://your-blog-app.replit.app
REACT_APP_BLOG_JWT_SECRET=your_shared_jwt_secret
```

2. Replace `https://your-blog-app.replit.app` with the actual URL of your deployed blog system.

3. For the JWT secret, you should use the same secret key that's used by the blog system. You can generate this key by running:

```bash
node scripts/create-jwt-key.js
```

Copy the generated key to both the blog system's `.env` file and your main website's `.env` file.

## Step 2: Configure CORS on the Blog System

1. In the blog system, make sure the CORS configuration allows requests from your main website:

```typescript
// server/cors-config.ts
export const corsOptions: CorsOptions = {
  origin: ['http://localhost:3000', 'https://your-main-website.com'],
  // other options...
};
```

2. Replace `https://your-main-website.com` with your actual domain.

## Step 3: Copy Integration Files

1. Copy the necessary files from the `integration-examples` directory to your React project:

- `api-utils.ts` → Copy to your utils or services directory
- React components (e.g., `BlogList.tsx`, `BlogDetail.tsx`) → Copy to your components directory
- `blog-styles.css` → Copy to your styles directory

2. Update the imports in each file to match your project structure.

## Step 4: Set Up Authentication (Optional)

If you need access to protected endpoints:

1. Copy the `AuthContext.tsx` file to your context directory.
2. Wrap your application with the `AuthProvider` component in your main App component:

```tsx
// App.tsx
import { AuthProvider } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
};
```

3. Use the `useAuth` hook in components that need authentication.

## Step 5: Add Blog Routes

Add routes for the blog in your routing configuration:

```tsx
// Using React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogSearch from './components/BlogSearch';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/blog/category/:categorySlug" element={<BlogList />} />
        <Route path="/blog/search" element={<BlogSearch />} />
        {/* Add more blog-related routes as needed */}
      </Routes>
    </BrowserRouter>
  );
};
```

## Step 6: Add the Blog Widget to Your Home Page

To showcase your latest blog posts on your home page:

```tsx
// HomePage.tsx
import BlogWidget from './components/BlogWidget';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Your existing content */}
      
      <section className="blog-section">
        <div className="container">
          <BlogWidget count={3} showExcerpt={true} />
        </div>
      </section>
      
      {/* More content */}
    </div>
  );
};
```

## Step 7: Import Styles

Import the blog styles in your main CSS file or in a specific component:

```tsx
// In a component file
import '../styles/blog-styles.css';

// OR in your main CSS file
@import './blog-styles.css';
```

Customize the styles to match your website's design system.

## Step 8: Test the Integration

1. Start your React application
2. Navigate to the blog routes (/blog, etc.)
3. Verify that blog posts are loading correctly
4. Test the authentication if you're using protected endpoints

## Troubleshooting

### CORS Issues

If you encounter CORS errors in the browser console:

1. Verify that your blog system's CORS configuration includes your website's domain
2. Check that the protocol (http/https) matches exactly
3. Restart the blog system after making CORS changes

### Authentication Problems

If you're having trouble with authentication:

1. Make sure both systems are using the same JWT secret
2. Check token expiration settings
3. Verify that the token is being included in request headers correctly

### API Connection Issues

If API calls fail:

1. Confirm the correct API URL in your environment variables
2. Try a simple API endpoint like `/api/categories` to test connectivity
3. Check network requests in the browser developer tools

## Advanced Integration Options

### Custom Endpoints

If you need custom API endpoints for specific functionality, you can add them to the blog system in `server/routes.ts`.

### Server-Side Rendering

For server-side rendering (SSR) with frameworks like Next.js, you'll need to modify the API utility functions to support server-side fetching.

### Content Management

For managing content, it's recommended to use the dedicated admin interface of the blog system rather than building custom content management in your main website.

## Conclusion

You've now successfully integrated the blog system with your React TypeScript website. This integration provides a seamless experience for your users while keeping the blog management separate and specialized.

For any questions or issues, please refer to the project documentation or contact the development team.
