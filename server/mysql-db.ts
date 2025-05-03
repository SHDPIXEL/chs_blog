import * as mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

/**
 * MySQL database connection configuration
 * This file provides a separate MySQL connection that can be used
 * by setting USE_MYSQL=true in your environment variables
 */

export function createMySqlConnection() {
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

  const db = drizzle(pool, { schema, mode: 'default' });
  
  return { pool, db };
}
