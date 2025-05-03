#!/usr/bin/env node

/**
 * JWT Secret Key Generator
 * 
 * This script creates a secure JWT secret key for authentication between
 * the blog system and your main website.
 * 
 * Usage: node scripts/create-jwt-key.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function generateJwtSecret() {
  try {
    // Generate a secure random string
    const jwtSecret = crypto.randomBytes(64).toString('hex');
    
    // Create or update the .env file
    const envFilePath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    // Check if .env file exists and read its content
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
      
      // Check if JWT_SECRET already exists in the file
      if (envContent.includes('JWT_SECRET=')) {
        // Replace the existing JWT_SECRET
        envContent = envContent.replace(/JWT_SECRET=.*/g, `JWT_SECRET=${jwtSecret}`);
      } else {
        // Append JWT_SECRET to the file
        envContent += `\nJWT_SECRET=${jwtSecret}`;
      }
    } else {
      // Create new .env file with JWT_SECRET
      envContent = `JWT_SECRET=${jwtSecret}\n`;
    }
    
    // Write the updated content to the .env file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('==================================');
    console.log('JWT Secret Key Generated Successfully!');
    console.log('==================================');
    console.log('This key should be used for authentication between your main website and the blog system.');
    console.log('\nThe key has been added to your .env file.');
    console.log('\nMake sure to use the same JWT secret in your main React TypeScript website for authentication.');
    console.log('==================================');
  } catch (error) {
    console.error('Error generating JWT secret:', error);
    process.exit(1);
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  generateJwtSecret().catch(error => {
    console.error('Failed to generate JWT secret:', error);
    process.exit(1);
  });
}

module.exports = { generateJwtSecret };
