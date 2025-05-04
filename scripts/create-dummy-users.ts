/**
 * Script to create dummy users for the blog platform
 * 
 * Run with: npx tsx scripts/create-dummy-users.ts
 */

import { db } from "../server/db";
import { users, UserRole } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function createDummyUsers() {
  console.log("Creating dummy users...");

  try {
    // Admin users
    const adminUsers = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        bio: "Main administrator of the blog platform.",
        avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg"
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        bio: "Senior administrator and content editor.",
        avatarUrl: "https://randomuser.me/api/portraits/men/2.jpg"
      }
    ];

    for (const admin of adminUsers) {
      const [existingAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.email, admin.email));

      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await db.insert(users).values({
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: UserRole.ADMIN,
          bio: admin.bio,
          avatarUrl: admin.avatarUrl,
          canPublish: true
        });
        console.log(`Created admin user: ${admin.name}`);
      } else {
        console.log(`Admin user ${admin.name} already exists`);
      }
    }

    // Author users
    const authorUsers = [
      {
        name: "Sarah Johnson",
        email: "author@example.com",
        password: "password123",
        bio: "Professional tech writer with over 5 years of experience in blogging about web development.",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Mark Wilson",
        email: "mark.wilson@example.com",
        password: "password123",
        bio: "Senior software engineer with a focus on front-end development and UI/UX.",
        avatarUrl: "https://randomuser.me/api/portraits/men/42.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Emily Chen",
        email: "emily.chen@example.com",
        password: "password123",
        bio: "Fullstack developer specializing in React and Node.js.",
        avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1542435503-956c469947f6?q=80&w=1024",
        canPublish: false
      },
      {
        name: "James Rodriguez",
        email: "james.rodriguez@example.com",
        password: "password123",
        bio: "DevOps specialist with experience in AWS, Docker, and Kubernetes.",
        avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1024",
        canPublish: true
      },
      {
        name: "Jessica Lee",
        email: "jessica.lee@example.com",
        password: "password123",
        bio: "Mobile app developer with expertise in React Native and Flutter.",
        avatarUrl: "https://randomuser.me/api/portraits/women/15.jpg",
        bannerUrl: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1024",
        canPublish: false
      }
    ];
    
    for (const author of authorUsers) {
      const [existingAuthor] = await db
        .select()
        .from(users)
        .where(eq(users.email, author.email));

      if (!existingAuthor) {
        const hashedPassword = await bcrypt.hash(author.password, 10);
        await db.insert(users).values({
          name: author.name,
          email: author.email,
          password: hashedPassword,
          role: UserRole.AUTHOR,
          bio: author.bio,
          avatarUrl: author.avatarUrl,
          bannerUrl: author.bannerUrl,
          socialLinks: JSON.stringify({
            twitter: `https://twitter.com/${author.name.toLowerCase().replace(' ', '')}`,
            github: `https://github.com/${author.name.toLowerCase().replace(' ', '')}`,
            linkedin: `https://linkedin.com/in/${author.name.toLowerCase().replace(' ', '')}`
          }),
          canPublish: author.canPublish
        });
        
        console.log(`Created author user: ${author.name}`);
      } else {
        console.log(`Author user ${author.name} already exists`);
      }
    }

    console.log("\nDummy users created successfully!");
    console.log("\nYou can now log in with the following credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("Author: author@example.com / password123");

  } catch (error) {
    console.error("Error creating dummy users:", error);
  }
}

// Run the function
createDummyUsers()
  .then(() => {
    console.log('User creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during user creation:', error);
    process.exit(1);
  });