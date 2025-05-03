# Database Switching Guide

This project supports both PostgreSQL and MySQL databases. You can easily switch between them using the provided tools.

## Configuration

### PostgreSQL Configuration

PostgreSQL is the default database. To use it, set these environment variables:

```
DATABASE_URL=postgres://username:password@hostname:port/database
USE_MYSQL=false  # Or remove this line entirely
```

### MySQL Configuration

To use MySQL, set these environment variables:

```
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_PORT=3306  # Optional, defaults to 3306
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_database_name
```

## Switching Between Databases

### Using the Switch Script

The easiest way to switch databases is using the provided script:

```bash
# Switch to MySQL
node scripts/switch-database.js mysql

# Switch to PostgreSQL
node scripts/switch-database.js postgres
```

This script will update your `.env` file with the appropriate settings.

### Manual Switching

You can also manually switch by editing the `.env` file and setting `USE_MYSQL=true` for MySQL or `USE_MYSQL=false` for PostgreSQL.

## Setting Up MySQL for the First Time

When using MySQL for the first time, run the setup script:

```bash
USE_MYSQL=true npx tsx scripts/mysql-setup.ts
```

This will initialize your MySQL database with the necessary tables.

## Running the Application with MySQL

To run the application with MySQL:

```bash
USE_MYSQL=true npm run dev
```

Or simply run `npm run dev` after switching to MySQL using the switch script.

## Database Migrations

### PostgreSQL Migrations

For PostgreSQL migrations, use:

```bash
npm run db:push
```

### MySQL Migrations

For MySQL migrations, use:

```bash
USE_MYSQL=true npx tsx scripts/mysql-schema-push.ts
```

## Implementation Details

The database switching is implemented using the following files:

- `server/unified-db.ts` - Main entry point that selects the appropriate database
- `server/mysql-db.ts` - MySQL-specific configuration
- `scripts/mysql-setup.ts` - MySQL initialization script
- `scripts/mysql-schema-push.ts` - MySQL migration script
- `drizzle.mysql.config.ts` - Drizzle configuration for MySQL

The system uses environment variables to determine which database to use, with PostgreSQL being the default if `USE_MYSQL` is not set to `true`.
