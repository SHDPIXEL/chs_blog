/**
 * Script to create an admin user for the blog management system
 * 
 * Run with: npx tsx scripts/create-admin-user.ts
 */

import { db } from "../server/db";
import { users, UserRole } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function createAdminUser() {
  console.log("Starting to create admin user...");

  // Check if admin user already exists
  const [adminCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@example.com"));

  if (adminCheck) {
    console.log("Admin user already exists with ID:", adminCheck.id);
    return;
  }

  // Create admin user
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const [newAdmin] = await db.insert(users).values({
    name: "Admin User",
    email: "admin@example.com",
    password: hashedPassword,
    role: UserRole.ADMIN,
    bio: "System administrator with full access to the blog management system.",
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    canPublish: true
  }).returning();
  
  console.log(`Admin user created with ID: ${newAdmin.id}`);
  console.log("Login credentials:");
  console.log("Email: admin@example.com");
  console.log("Password: password123");
}

createAdminUser()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch(error => {
    console.error("Error creating admin user:", error);
    process.exit(1);
  });
