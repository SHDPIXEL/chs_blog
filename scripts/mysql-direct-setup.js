#!/usr/bin/env node

/**
 * Direct MySQL setup script for blog management system
 * 
 * This script creates all the necessary MySQL tables with the same structure
 * as the PostgreSQL tables in the original system.
 * 
 * Usage: node scripts/mysql-direct-setup.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupMySqlDatabase() {
  console.log("Starting MySQL database setup...");

  // Get MySQL connection details from environment variables
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'blog_db',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306
  };
  
  let connection;
  
  try {
    // First connect without database to create it if needed
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user, 
      password: config.password,
      port: config.port
    });
    
    console.log("Connected to MySQL server");
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    console.log(`Ensured database ${config.database} exists`);
    
    // Close this connection
    await connection.end();
    
    // Connect to the specific database
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port
    });
    
    console.log(`Connected to database ${config.database}`);
    
    // Create tables
    console.log("Creating tables...");
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`email\` VARCHAR(255) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(50) NOT NULL,
        \`bio\` TEXT NULL,
        \`avatar_url\` VARCHAR(255) NULL,
        \`banner_url\` VARCHAR(255) NULL,
        \`social_links\` TEXT NULL,
        \`can_publish\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`email_UNIQUE\` (\`email\` ASC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created users table");
    
    // Assets table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`assets\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`filename\` VARCHAR(255) NOT NULL,
        \`original_name\` VARCHAR(255) NOT NULL,
        \`path\` VARCHAR(255) NOT NULL,
        \`url\` VARCHAR(255) NOT NULL,
        \`mimetype\` VARCHAR(100) NOT NULL,
        \`size\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`title\` VARCHAR(255) NULL,
        \`description\` TEXT NULL,
        \`tags\` JSON NULL DEFAULT (JSON_ARRAY()),
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_assets_user_idx\` (\`user_id\` ASC),
        CONSTRAINT \`fk_assets_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created assets table");
    
    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`name_UNIQUE\` (\`name\` ASC),
        UNIQUE INDEX \`slug_UNIQUE\` (\`slug\` ASC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created categories table");
    
    // Tags table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`tags\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`name_UNIQUE\` (\`name\` ASC),
        UNIQUE INDEX \`slug_UNIQUE\` (\`slug\` ASC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created tags table");
    
    // Articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`articles\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL,
        \`content\` LONGTEXT NOT NULL,
        \`excerpt\` TEXT NULL,
        \`author_id\` INT NOT NULL,
        \`status\` VARCHAR(50) NOT NULL DEFAULT 'draft',
        \`published\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`featured_image\` VARCHAR(255) NULL,
        \`meta_title\` VARCHAR(255) NULL,
        \`meta_description\` TEXT NULL,
        \`keywords\` JSON NULL DEFAULT (JSON_ARRAY()),
        \`canonical_url\` VARCHAR(255) NULL,
        \`scheduled_publish_at\` TIMESTAMP NULL,
        \`view_count\` INT NOT NULL DEFAULT 0,
        \`review_remarks\` TEXT NULL,
        \`reviewed_by\` INT NULL,
        \`reviewed_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`published_at\` TIMESTAMP NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`slug_UNIQUE\` (\`slug\` ASC),
        INDEX \`fk_articles_author_idx\` (\`author_id\` ASC),
        INDEX \`fk_articles_reviewer_idx\` (\`reviewed_by\` ASC),
        INDEX \`status_idx\` (\`status\` ASC),
        INDEX \`published_idx\` (\`published\` ASC),
        INDEX \`scheduled_idx\` (\`scheduled_publish_at\` ASC),
        CONSTRAINT \`fk_articles_author\`
          FOREIGN KEY (\`author_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_articles_reviewer\`
          FOREIGN KEY (\`reviewed_by\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE SET NULL
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created articles table");
    
    // Article-Category relation (many-to-many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`article_categories\` (
        \`article_id\` INT NOT NULL,
        \`category_id\` INT NOT NULL,
        PRIMARY KEY (\`article_id\`, \`category_id\`),
        INDEX \`fk_ac_category_idx\` (\`category_id\` ASC),
        CONSTRAINT \`fk_ac_article\`
          FOREIGN KEY (\`article_id\`)
          REFERENCES \`articles\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_ac_category\`
          FOREIGN KEY (\`category_id\`)
          REFERENCES \`categories\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created article_categories table");
    
    // Article-Tag relation (many-to-many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`article_tags\` (
        \`article_id\` INT NOT NULL,
        \`tag_id\` INT NOT NULL,
        PRIMARY KEY (\`article_id\`, \`tag_id\`),
        INDEX \`fk_at_tag_idx\` (\`tag_id\` ASC),
        CONSTRAINT \`fk_at_article\`
          FOREIGN KEY (\`article_id\`)
          REFERENCES \`articles\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_at_tag\`
          FOREIGN KEY (\`tag_id\`)
          REFERENCES \`tags\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created article_tags table");
    
    // Article-CoAuthor relation (many-to-many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`article_co_authors\` (
        \`article_id\` INT NOT NULL,
        \`user_id\` INT NOT NULL,
        PRIMARY KEY (\`article_id\`, \`user_id\`),
        INDEX \`fk_aca_user_idx\` (\`user_id\` ASC),
        CONSTRAINT \`fk_aca_article\`
          FOREIGN KEY (\`article_id\`)
          REFERENCES \`articles\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_aca_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created article_co_authors table");
    
    // Comments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`comments\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`content\` TEXT NOT NULL,
        \`author_name\` VARCHAR(255) NOT NULL,
        \`author_email\` VARCHAR(255) NOT NULL,
        \`article_id\` INT NOT NULL,
        \`parent_id\` INT NULL,
        \`reply_count\` INT NOT NULL DEFAULT 0,
        \`is_approved\` BOOLEAN NOT NULL DEFAULT TRUE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_comments_article_idx\` (\`article_id\` ASC),
        INDEX \`fk_comments_parent_idx\` (\`parent_id\` ASC),
        CONSTRAINT \`fk_comments_article\`
          FOREIGN KEY (\`article_id\`)
          REFERENCES \`articles\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_comments_parent\`
          FOREIGN KEY (\`parent_id\`)
          REFERENCES \`comments\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created comments table");
    
    // Notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`notifications\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`type\` VARCHAR(50) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`message\` TEXT NOT NULL,
        \`article_id\` INT NULL,
        \`comment_id\` INT NULL,
        \`read\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        INDEX \`fk_notifications_user_idx\` (\`user_id\` ASC),
        INDEX \`fk_notifications_article_idx\` (\`article_id\` ASC),
        INDEX \`fk_notifications_comment_idx\` (\`comment_id\` ASC),
        CONSTRAINT \`fk_notifications_user\`
          FOREIGN KEY (\`user_id\`)
          REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_notifications_article\`
          FOREIGN KEY (\`article_id\`)
          REFERENCES \`articles\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE,
        CONSTRAINT \`fk_notifications_comment\`
          FOREIGN KEY (\`comment_id\`)
          REFERENCES \`comments\` (\`id\`)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Created notifications table");
    
    console.log("\nMySQL database setup completed successfully!");
    console.log("\nYou can now replace server/db.ts with MySQL configuration to use this database.");
  } catch (error) {
    console.error("Error during MySQL setup:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  setupMySqlDatabase().catch(error => {
    console.error("Failed to set up MySQL database:", error);
    process.exit(1);
  });
}

module.exports = { setupMySqlDatabase };
