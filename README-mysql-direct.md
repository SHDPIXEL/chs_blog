# MySQL Direct Setup Guide

This guide explains how to directly use MySQL instead of PostgreSQL with this application.

## Step 1: Install MySQL Dependencies

```bash
npm install mysql2
```

## Step 2: Set MySQL Environment Variables

Create a `.env` file with your MySQL database credentials:

```
MYSQL_HOST=your_mysql_host
MYSQL_PORT=3306
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name
```

## Step 3: Create MySQL Tables

Run the MySQL table creation script to set up the database structure:

```bash
node scripts/mysql-direct-setup.js
```

This script creates all MySQL tables with the same structure as the PostgreSQL tables in the original application.

## Step 4: Replace the Database Connection

To switch from PostgreSQL to MySQL, replace the content of `server/db.ts` with the MySQL adapter code.

1. First, back up the original PostgreSQL version:

```bash
cp server/db.ts server/db.ts.pg-backup
```

2. Then replace it with the MySQL adapter:

```bash
cp server/mysql-db-adapter.ts server/db.ts
```

## Step 5: Start the Application

Now, you can start the application as usual:

```bash
npm run dev
```

## Switching Back to PostgreSQL

To switch back to PostgreSQL:

```bash
cp server/db.ts.pg-backup server/db.ts
```

## Table Structure

The MySQL tables created have identical structure to the PostgreSQL ones:

- `users`: User accounts including authors and admins
- `articles`: Blog posts with content and metadata
- `categories`: Article categories
- `tags`: Article tags
- `article_categories`: Junction table for article-category relationships
- `article_tags`: Junction table for article-tag relationships
- `article_co_authors`: Junction table for article co-author relationships
- `assets`: Uploaded media files
- `comments`: Article comments
- `notifications`: System notifications

All tables include proper indexes and foreign key constraints to maintain data integrity.
