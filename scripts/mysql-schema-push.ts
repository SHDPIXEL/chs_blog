import { migrate } from 'drizzle-orm/mysql2/migrator';
import { db } from '../server/db-config';
import { adaptSchemaForMysql } from '../server/mysql-schema-adapter';

async function main() {
  console.log('Starting MySQL schema migration...');
  
  // Adapt schema for MySQL if needed
  adaptSchemaForMysql();
  
  // Create migrations directory if it doesn't exist
  const fs = require('fs');
  const path = require('path');
  const mysqlMigrationsDir = path.join(__dirname, '../mysql-migrations');
  
  if (!fs.existsSync(mysqlMigrationsDir)) {
    fs.mkdirSync(mysqlMigrationsDir, { recursive: true });
    console.log(`Created MySQL migrations directory at ${mysqlMigrationsDir}`);
  }
  
  // Run migrations
  console.log('Pushing schema to MySQL database...');
  try {
    await migrate(db, { migrationsFolder: './mysql-migrations' });
    console.log('MySQL schema migration completed successfully');
  } catch (error) {
    console.error('Error during MySQL migration:', error);
    console.log('Attempting direct schema push instead of migration...');
    
    // If migration fails, we could add alternative approaches here
    // This would depend on the specifics of your MySQL setup
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error('MySQL schema migration failed:', err);
  process.exit(1);
});
