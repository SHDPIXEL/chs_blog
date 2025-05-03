import { Pool as PgPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzlePg } from 'drizzle-orm/neon-serverless';
import * as mysql from 'mysql2/promise';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon websocket
neonConfig.webSocketConstructor = ws;

// Database type selection
const USE_MYSQL = process.env.USE_MYSQL === 'true';

// Database configuration
interface DbConfig {
  pool: any;
  db: any;
}

// MySQL configuration
function setupMysql(): DbConfig {
  if (!process.env.MYSQL_HOST || 
      !process.env.MYSQL_USER || 
      !process.env.MYSQL_PASSWORD || 
      !process.env.MYSQL_DATABASE) {
    throw new Error("MySQL configuration missing. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE");
  }

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const db = drizzleMysql(pool, { schema, mode: 'default' });
  
  return { pool, db };
}

// PostgreSQL configuration
function setupPostgres(): DbConfig {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set for PostgreSQL configuration");
  }

  const pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  const db = drizzlePg({ client: pool, schema });
  
  return { pool, db };
}

// Export the configured database based on USE_MYSQL flag
export const dbConfig = USE_MYSQL ? setupMysql() : setupPostgres();
export const pool = dbConfig.pool;
export const db = dbConfig.db;

// Export a helper function to check current database type
export function isDatabaseMysql(): boolean {
  return USE_MYSQL;
}
