import * as mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";
import 'dotenv/config';

// MySQL Configuration
if (!process.env.MYSQL_HOST || 
    !process.env.MYSQL_USER || 
    !process.env.MYSQL_DATABASE) {
  throw new Error(
    "MySQL configuration missing. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
  );
}

// Create MySQL connection pool
const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create and export the pool and db instance
export const pool = mysql.createPool(config);
export const db = drizzle(pool, { schema, mode: 'default' });

console.log("Using MySQL database connection");
