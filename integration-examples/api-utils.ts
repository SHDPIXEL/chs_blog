/**
 * API Utilities for External Integration
 * 
 * This file contains helper functions for integrating with the blog API
 * from your main React TypeScript website.
 */

// Base URL for your blog API
const API_BASE_URL = process.env.REACT_APP_BLOG_API_URL || 'https://your-blog-app.replit.app';

// Function to format the authorization header
const getAuthHeader = (token: string) => {
  return { Authorization: `Bearer ${token}` };
};

/**
 * Fetch articles from the blog system
 * @param token JWT token for authentication (optional for public articles)
 */
export const fetchArticles = async (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...token ? getAuthHeader(token) : {},
  };

  const response = await fetch(`${API_BASE_URL}/api/articles/published`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching articles: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch a specific article by slug
 * @param slug The article slug
 * @param token JWT token for authentication (optional for public articles)
 */
export const fetchArticleBySlug = async (slug: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...token ? getAuthHeader(token) : {},
  };

  const response = await fetch(`${API_BASE_URL}/api/articles/slug/${slug}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching article: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch articles by category slug
 * @param categorySlug The category slug
 * @param token JWT token for authentication (optional for public articles)
 */
export const fetchArticlesByCategory = async (categorySlug: string, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...token ? getAuthHeader(token) : {},
  };

  const response = await fetch(`${API_BASE_URL}/api/categories/${categorySlug}/articles`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching articles by category: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch all categories
 * @param token JWT token for authentication (optional for public categories)
 */
export const fetchCategories = async (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...token ? getAuthHeader(token) : {},
  };

  const response = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error fetching categories: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Authenticate with the blog system
 * @param email User email
 * @param password User password
 */
export const loginToBlogSystem = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Search articles with filters
 * @param filters Search filters
 * @param token JWT token for authentication (optional for public searches)
 */
export const searchArticles = async (filters: any, token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...token ? getAuthHeader(token) : {},
  };

  const queryString = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryString.append(key, String(value));
  });

  const response = await fetch(`${API_BASE_URL}/api/articles/search?${queryString}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Error searching articles: ${response.statusText}`);
  }

  return response.json();
};
