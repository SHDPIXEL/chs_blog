#!/usr/bin/env node

/**
 * Database Setup Script for Blog Management System
 * 
 * This script initializes the database schema and adds test data.
 * 
 * Run with: node setup-database.js
 */

// Run schema push and seed data
console.log("Setting up the database...");

import { execSync } from 'child_process';

try {
  // Step 1: Push schema to database
  console.log("\n=== PUSHING SCHEMA TO DATABASE ===");
  execSync('npm run db:push', { stdio: 'inherit' });
  
  // Step 2: Create sample users
  console.log("\n=== CREATING SAMPLE USERS AND DATA ===");
  execSync('npx tsx scripts/seed.ts', { stdio: 'inherit' });
  
  // Step 3: Create additional content 
  console.log("\n=== CREATING ADDITIONAL CONTENT ===");
  execSync('npx tsx scripts/seed-content.ts', { stdio: 'inherit' });
  
  console.log("\n=== DATABASE SETUP COMPLETE ===");
  console.log("You can now log in with the following credentials:");
  console.log("- Admin: admin@example.com / password123");
  console.log("- Author: author@example.com / password123");
  
} catch (error) {
  console.error("\n=== ERROR DURING DATABASE SETUP ===");
  console.error(error.message);
  process.exit(1);
}