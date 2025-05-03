/**
 * Unified database adapter that allows switching between PostgreSQL and MySQL
 * Based on the USE_MYSQL environment variable
 */

import { Pool as PgPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { createMySqlConnection } from './mysql-db';

// Configure Neon websocket for PostgreSQL
neonConfig.webSocketConstructor = ws;

// Determine which database to use
const useMySql = process.env.USE_MYSQL === 'true';

// Initialize the correct database based on environment variable
let pool: any;
let db: any;

if (useMySql) {
  console.log('Using MySQL database connection');
  try {
    const mysqlConnection = createMySqlConnection();
    pool = mysqlConnection.pool;
    db = mysqlConnection.db;
  } catch (error) {
    console.error('Failed to initialize MySQL connection:', error);
    throw error;
  }
} else {
  console.log('Using PostgreSQL database connection');
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set for PostgreSQL configuration");
    }
    pool = new PgPool({ connectionString: process.env.DATABASE_URL });
    db = drizzlePg({ client: pool, schema });
  } catch (error) {
    console.error('Failed to initialize PostgreSQL connection:', error);
    throw error;
  }
}

// Export the database connection
export { pool, db };

// Helper function to determine current database type
export function isDatabaseMySql(): boolean {
  return useMySql;
}
