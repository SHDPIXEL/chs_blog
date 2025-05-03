import * as fs from 'fs';
import * as path from 'path';
import { isDatabaseMysql } from './db-config';

/**
 * This function converts PostgreSQL-specific SQL to MySQL syntax
 * Call this before running migrations if using MySQL
 */
export function adaptSchemaForMysql(): void {
  if (!isDatabaseMysql()) {
    console.log('Using PostgreSQL, no schema adaptation needed');
    return;
  }
  
  console.log('Adapting schema for MySQL...');
  
  // Read the schema file
  const schemaPath = path.join(__dirname, '../shared/schema.ts');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  // Replace PostgreSQL-specific types with MySQL types
  schemaContent = schemaContent
    .replace(/pgTable/g, 'mysqlTable')
    .replace(/serial/g, 'int')
    .replace(/text\(\)/g, 'text')
    // Add more replacements as needed
  
  // Write to a temporary file for MySQL schema
  const mysqlSchemaPath = path.join(__dirname, '../shared/mysql-schema.ts');
  fs.writeFileSync(mysqlSchemaPath, schemaContent, 'utf8');
  
  console.log(`Schema adaptation completed. MySQL schema written to ${mysqlSchemaPath}`);
}
