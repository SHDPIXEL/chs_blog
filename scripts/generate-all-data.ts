/**
 * Master script to generate all dummy data for the blog platform
 * This script runs all the individual data generation scripts in the correct order
 * 
 * Run with: npx tsx scripts/generate-all-data.ts
 */

import { execSync } from 'child_process';

async function generateAllData() {
  console.log("=== GENERATING ALL DUMMY DATA ===\n");

  try {
    // Step 1: Push database schema first
    console.log("Step 1: Pushing database schema...");
    execSync('npx tsx scripts/push-schema.ts', { stdio: 'inherit' });
    console.log("\n✅ Database schema pushed successfully\n");
    
    // Step 2: Create users
    console.log("Step 2: Creating users...");
    execSync('npx tsx scripts/create-dummy-users.ts', { stdio: 'inherit' });
    console.log("\n✅ Users created successfully\n");
    
    // Step 3: Create categories and tags
    console.log("Step 3: Creating categories and tags...");
    execSync('npx tsx scripts/create-categories-tags.ts', { stdio: 'inherit' });
    console.log("\n✅ Categories and tags created successfully\n");
    
    // Step 4: Create sample articles
    console.log("Step 4: Creating sample articles...");
    execSync('npx tsx scripts/create-sample-articles.ts', { stdio: 'inherit' });
    console.log("\n✅ Sample articles created successfully\n");
    
    // Step 5: Create comments and notifications
    console.log("Step 5: Creating comments and notifications...");
    execSync('npx tsx scripts/create-comments-notifications.ts', { stdio: 'inherit' });
    console.log("\n✅ Comments and notifications created successfully\n");
    
    console.log("=== ALL DUMMY DATA GENERATED SUCCESSFULLY ===");
    console.log("\nYou can now log in with the following credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("Author: author@example.com / password123");
    
  } catch (error) {
    console.error("\n❌ Error generating dummy data:");
    console.error(error);
  }
}

// Run the function
generateAllData()
  .then(() => {
    console.log('\n🎉 All data generation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error during data generation:', error);
    process.exit(1);
  });