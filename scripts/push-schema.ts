import * as schema from "../shared/schema";
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log('Pushing schema to database...');
  
  try {
    // Create tables in correct order to respect foreign key constraints
    console.log('Creating users table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        banner_url TEXT,
        social_links TEXT,
        can_publish BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating articles table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'draft',
        published BOOLEAN NOT NULL DEFAULT false,
        featured_image TEXT,
        meta_title TEXT,
        meta_description TEXT,
        keywords JSONB DEFAULT '[]',
        canonical_url TEXT,
        scheduled_publish_at TIMESTAMP WITH TIME ZONE,
        view_count INTEGER NOT NULL DEFAULT 0,
        review_remarks TEXT,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE
      )
    `);

    console.log('Creating categories table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating tags table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating assets table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        path TEXT NOT NULL,
        url TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INTEGER NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT,
        description TEXT,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    console.log('Creating article_categories table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_categories (
        article_id INTEGER NOT NULL REFERENCES articles(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        PRIMARY KEY (article_id, category_id)
      )
    `);

    console.log('Creating article_tags table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_tags (
        article_id INTEGER NOT NULL REFERENCES articles(id),
        tag_id INTEGER NOT NULL REFERENCES tags(id),
        PRIMARY KEY (article_id, tag_id)
      )
    `);

    console.log('Creating article_co_authors table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS article_co_authors (
        article_id INTEGER NOT NULL REFERENCES articles(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        PRIMARY KEY (article_id, user_id)
      )
    `);

    console.log('Creating notifications table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        article_id INTEGER REFERENCES articles(id),
        comment_id INTEGER, -- To be modified after comments table is created
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    console.log('Creating comments table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_email TEXT NOT NULL,
        article_id INTEGER NOT NULL REFERENCES articles(id),
        parent_id INTEGER REFERENCES comments(id),
        reply_count INTEGER NOT NULL DEFAULT 0,
        is_approved BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);
    
    // Now that the comments table exists, add the foreign key reference to notifications
    console.log('Adding comment_id foreign key to notifications...');
    await db.execute(sql`
      ALTER TABLE notifications
      ADD CONSTRAINT fk_notifications_comment_id
      FOREIGN KEY (comment_id) REFERENCES comments(id)
    `);

    console.log('Schema pushed successfully!');
  } catch (error) {
    console.error('Error pushing schema:', error);
  }
}

main();
