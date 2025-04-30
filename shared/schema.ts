import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define valid roles
export const UserRole = {
  ADMIN: "admin",
  AUTHOR: "author",
} as const;

// Define article status
export const ArticleStatus = {
  DRAFT: "draft",
  REVIEW: "review",
  PUBLISHED: "published",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type ArticleStatusType = typeof ArticleStatus[keyof typeof ArticleStatus];

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: [UserRole.ADMIN, UserRole.AUTHOR] }).notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  socialLinks: text("social_links"), // JSON string containing social media links
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Articles table
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: integer("author_id").references(() => users.id).notNull(),
  status: text("status", { enum: [ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED] })
    .default(ArticleStatus.DRAFT)
    .notNull(),
  published: boolean("published").default(false).notNull(),
  featuredImage: text("featured_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define user insert schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Define user profile update schema
export const updateUserProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  bannerUrl: z.string().url().optional().nullable(),
  socialLinks: z.string().optional().nullable(),
});

// Define login schema
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Define insert article schema
export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Define article update schema
export const updateArticleSchema = z.object({
  title: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED]).optional(),
  published: z.boolean().optional(),
  featuredImage: z.string().url().optional().nullable(),
});

// Type definitions based on schema
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type Article = typeof articles.$inferSelect;
