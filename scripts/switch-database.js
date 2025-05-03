#!/usr/bin/env node

/**
 * Simple utility script to switch between PostgreSQL and MySQL
 * 
 * Usage: 
 *   node scripts/switch-database.js mysql    # Switch to MySQL
 *   node scripts/switch-database.js postgres # Switch to PostgreSQL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the database type from command line argument
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Please specify database type: mysql or postgres');
  process.exit(1);
}

const dbType = args[0].toLowerCase();

if (dbType !== 'mysql' && dbType !== 'postgres') {
  console.log('Invalid database type. Use "mysql" or "postgres"');
  process.exit(1);
}

// Path to .env file
const envPath = path.join(__dirname, '../.env');

// Check if .env file exists
if (!fs.existsSync(envPath)) {
  console.log('No .env file found. Creating from sample.env...');
  fs.copyFileSync(path.join(__dirname, '../sample.env'), envPath);
}

// Read existing .env file
let envContent = fs.readFileSync(envPath, 'utf8');

// Update USE_MYSQL flag
if (dbType === 'mysql') {
  // Switch to MySQL
  console.log('Switching to MySQL database...');
  envContent = envContent.replace(/USE_MYSQL=false/g, 'USE_MYSQL=true');
  if (!envContent.includes('USE_MYSQL=')) {
    envContent += '\nUSE_MYSQL=true\n';
  }
} else {
  // Switch to PostgreSQL
  console.log('Switching to PostgreSQL database...');
  envContent = envContent.replace(/USE_MYSQL=true/g, 'USE_MYSQL=false');
  if (!envContent.includes('USE_MYSQL=')) {
    envContent += '\nUSE_MYSQL=false\n';
  }
}

// Write updated .env file
fs.writeFileSync(envPath, envContent, 'utf8');

console.log(`Successfully switched to ${dbType === 'mysql' ? 'MySQL' : 'PostgreSQL'} database!`);
console.log('\nReminder:');

if (dbType === 'mysql') {
  console.log('- Ensure you have set the MySQL connection details in .env');
  console.log('- Run "USE_MYSQL=true npx tsx scripts/mysql-setup.ts" to initialize MySQL');
  console.log('- Use "USE_MYSQL=true npm run dev" to start the server with MySQL');
} else {
  console.log('- Ensure you have set the DATABASE_URL in .env');
  console.log('- Use "npm run dev" to start the server with PostgreSQL');
}
