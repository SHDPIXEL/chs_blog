/**
 * Script to create categories and tags for the blog platform
 * 
 * Run with: npx tsx scripts/create-categories-tags.ts
 */

import { db } from "../server/db";
import { categories, tags } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createCategoriesAndTags() {
  console.log("Creating categories and tags...");

  try {
    // Create categories
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
    
    console.log("Creating categories...");
    for (const category of categoryData) {
      const [existingCategory] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, category.slug));
        
      if (!existingCategory) {
        await db.insert(categories).values(category);
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category ${category.name} already exists`);
      }
    }

    // Create tags
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
    
    console.log("Creating tags...");
    for (const tag of tagData) {
      const [existingTag] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, tag.slug));
        
      if (!existingTag) {
        await db.insert(tags).values(tag);
        console.log(`Created tag: ${tag.name}`);
      } else {
        console.log(`Tag ${tag.name} already exists`);
      }
    }

    console.log("\nCategories and tags created successfully!");

  } catch (error) {
    console.error("Error creating categories and tags:", error);
  }
}

// Run the function
createCategoriesAndTags()
  .then(() => {
    console.log('Categories and tags creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during categories and tags creation:', error);
    process.exit(1);
  });