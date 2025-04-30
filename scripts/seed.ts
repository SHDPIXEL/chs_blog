import { db } from "../server/db";
import { users, UserRole } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting to seed database...");

  // Check if users already exist
  const [adminCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@example.com"));

  const [authorCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));

  // Create admin user if not exists
  if (!adminCheck) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    await db.insert(users).values({
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
    });
    console.log("Admin user created.");
  } else {
    console.log("Admin user already exists. Skipping creation.");
  }

  // Create author user if not exists
  if (!authorCheck) {
    console.log("Creating author user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    await db.insert(users).values({
      name: "Author User",
      email: "author@example.com",
      password: hashedPassword,
      role: UserRole.AUTHOR,
    });
    console.log("Author user created.");
  } else {
    console.log("Author user already exists. Skipping creation.");
  }

  console.log("Database seeding completed.");
}

// Run the seeding function
seed()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(() => {
    // Simply exit the process, the pool will be cleaned up automatically
    process.exit(0);
  });