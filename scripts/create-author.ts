import { db } from "../server/db";
import { users, UserRole } from "../shared/schema";
import * as bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

async function createAuthor() {
  console.log("Checking for author user...");
  
  const [authorCheck] = await db
    .select()
    .from(users)
    .where(eq(users.email, "author@example.com"));
    
  if (!authorCheck) {
    console.log("Creating author user with profile...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const [newAuthor] = await db.insert(users).values({
      name: "Sarah Johnson",
      email: "author@example.com",
      password: hashedPassword,
      role: UserRole.AUTHOR,
      bio: "Professional tech writer with over 5 years of experience in blogging about web development, JavaScript, and modern frameworks. I love sharing knowledge and helping others learn to code.",
      avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
      bannerUrl: "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1024",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/sarahjohnson",
        github: "https://github.com/sarahjohnson",
        linkedin: "https://linkedin.com/in/sarahjohnson"
      }),
      canPublish: true
    }).returning();
    
    console.log("Author user created with profile details.", newAuthor);
    return newAuthor;
  } else {
    console.log("Author user already exists:", authorCheck);
    return authorCheck;
  }
}

// Run the function
createAuthor()
  .then(() => {
    console.log('Author created or verified successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating author:', error);
    process.exit(1);
  });