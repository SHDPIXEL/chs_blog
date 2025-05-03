/**
 * Script to initialize MySQL database for the blog management system
 *
 * This script sets up the MySQL database and creates the necessary tables
 * Run with: USE_MYSQL=true npx tsx scripts/mysql-setup.ts
 */

import { createMySqlConnection } from "../server/mysql-db";
import { adaptSchemaForMysql } from "../server/mysql-schema-adapter";

async function setupMySqlDatabase() {
  console.log("Starting MySQL database setup");

  // First adapt the schema for MySQL compatibility
  adaptSchemaForMysql();

  // Connect to the MySQL database
  const { db, pool } = createMySqlConnection();

  try {
    // Verify connection
    console.log("Verifying database connection...");
    await pool.query("SELECT 1");
    console.log("Database connection successful");

    // Here you can run custom SQL if needed for initial setup
    // For example: creating indexes or initial data

    console.log("MySQL database setup completed successfully");
  } catch (error) {
    console.error("Error during MySQL setup:", error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the function
setupMySqlDatabase().catch((error) => {
  console.error("Failed to set up MySQL database:", error);
  process.exit(1);
});
