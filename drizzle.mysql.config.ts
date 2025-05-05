import { defineConfig } from "drizzle-kit";
import 'dotenv/config';

if (!process.env.MYSQL_HOST || 
    !process.env.MYSQL_USER || 
    !process.env.MYSQL_PASSWORD || 
    !process.env.MYSQL_DATABASE) {
  throw new Error("MySQL configuration missing. Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE");
}

const connectionString = `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT || '3306'}/${process.env.MYSQL_DATABASE}`;

export default defineConfig({
  out: "./mysql-migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    uri: connectionString,
  },
});
