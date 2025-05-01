import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  canPublish: boolean("can_publish").default(false).notNull(), // New: Permission to directly publish articles
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  path: text("path").notNull(),
  url: text("url").notNull(),
  mimetype: text("mimetype").notNull(),
  size: integer("size").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title"),
  description: text("description"),
  tags: jsonb("tags").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
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
  
  // SEO fields
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  keywords: jsonb("keywords").default([]),
  
  // Statistics
  viewCount: integer("view_count").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Article-Category relation (many-to-many)
export const articleCategories = pgTable("article_categories", {
  articleId: integer("article_id").references(() => articles.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.articleId, t.categoryId] }),
}));

// Article-Tag relation (many-to-many)
export const articleTags = pgTable("article_tags", {
  articleId: integer("article_id").references(() => articles.id).notNull(),
  tagId: integer("tag_id").references(() => tags.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.articleId, t.tagId] }),
}));

// Article-CoAuthor relation (many-to-many)
export const articleCoAuthors = pgTable("article_co_authors", {
  articleId: integer("article_id").references(() => articles.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.articleId, t.userId] }),
}));

// Define user insert schema
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Define user profile update schema
export const updateUserProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  // Accept any string for avatarUrl, including relative paths like "/uploads/image.png"
  avatarUrl: z.union([z.string(), z.string().max(0), z.null()]).optional(),
  // Accept any string for bannerUrl, including relative paths
  bannerUrl: z.union([z.string(), z.string().max(0), z.null()]).optional(),
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
  // Accept any string for featuredImage, including relative paths
  featuredImage: z.string().optional().nullable(),
});

// Define asset schemas
export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAssetSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const searchAssetsSchema = z.object({
  query: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mimetype: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles, { relationName: "userArticles" }),
  coAuthoredArticles: many(articleCoAuthors, { relationName: "userCoAuthoredArticles" }),
  assets: many(assets, { relationName: "userAssets" }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
    relationName: "userArticles",
  }),
  categories: many(articleCategories, { relationName: "articleCategoriesRelation" }),
  tags: many(articleTags, { relationName: "articleTagsRelation" }),
  coAuthors: many(articleCoAuthors, { relationName: "articleCoAuthorsRelation" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articleCategories, { relationName: "categoryArticlesRelation" }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articles: many(articleTags, { relationName: "tagArticlesRelation" }),
}));

export const articleCategoriesRelations = relations(articleCategories, ({ one }) => ({
  article: one(articles, {
    fields: [articleCategories.articleId],
    references: [articles.id],
    relationName: "articleCategoriesRelation",
  }),
  category: one(categories, {
    fields: [articleCategories.categoryId],
    references: [categories.id],
    relationName: "categoryArticlesRelation",
  }),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
    relationName: "articleTagsRelation",
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
    relationName: "tagArticlesRelation",
  }),
}));

export const articleCoAuthorsRelations = relations(articleCoAuthors, ({ one }) => ({
  article: one(articles, {
    fields: [articleCoAuthors.articleId],
    references: [articles.id],
    relationName: "articleCoAuthorsRelation",
  }),
  user: one(users, {
    fields: [articleCoAuthors.userId],
    references: [users.id],
    relationName: "userCoAuthoredArticles",
  }),
}));

export const assetsRelations = relations(assets, ({ one }) => ({
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
    relationName: "userAssets",
  }),
}));

// Define category and tag schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

// Updated article schemas with relations
export const extendedArticleSchema = insertArticleSchema.extend({
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  coAuthorIds: z.array(z.number()).optional(),
  keywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description should be at most 160 characters").optional(),
});

export const updateExtendedArticleSchema = updateArticleSchema.extend({
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  coAuthorIds: z.array(z.number()).optional(),
  keywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description should be at most 160 characters").optional(),
});

// Type definitions based on schema
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type ExtendedInsertArticle = z.infer<typeof extendedArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type ExtendedUpdateArticle = z.infer<typeof updateExtendedArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;
export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type UpdateAsset = z.infer<typeof updateAssetSchema>;
export type SearchAssets = z.infer<typeof searchAssetsSchema>;
