/**
 * CORS Configuration for API Access
 * This allows the main website to access the blog API
 */

import { CorsOptions } from 'cors';

// Configure allowed origins
export const corsOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['http://localhost:3000', 'https://your-main-website.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
