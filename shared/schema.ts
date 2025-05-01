import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, uuid } from "drizzle-orm/pg-core";
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

// Define notification types
export const NotificationType = {
  ARTICLE_APPROVED: "article_approved",
  ARTICLE_REJECTED: "article_rejected",
  ARTICLE_PUBLISHED: "article_published",
  COMMENT_RECEIVED: "comment_received",
} as const;

export type NotificationTypeValue = typeof NotificationType[keyof typeof NotificationType];

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
  slug: text("slug").notNull(),
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
  canonicalUrl: text("canonical_url"),
  
  // Scheduling
  scheduledPublishAt: timestamp("scheduled_publish_at"),
  
  // Statistics
  viewCount: integer("view_count").default(0).notNull(),
  
  // Review and approval fields
  reviewRemarks: text("review_remarks"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
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

// Comments table for blog posts
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  articleId: integer("article_id").references(() => articles.id).notNull(),
  parentId: integer("parent_id").references((): any => comments.id), // For nested replies
  replyCount: integer("reply_count").default(0).notNull(), // Store count of replies to this comment
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  articleId: integer("article_id").references(() => articles.id),
  commentId: integer("comment_id").references(() => comments.id), // Reference to the comment if notification is about a comment
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  slug: z.string().min(5).optional(),
  content: z.string().min(10).optional(),
  excerpt: z.string().optional(),
  status: z.enum([ArticleStatus.DRAFT, ArticleStatus.REVIEW, ArticleStatus.PUBLISHED]).optional(),
  published: z.boolean().optional(),
  viewCount: z.number().int().nonnegative().optional(),
  // Accept any string for featuredImage, including relative paths
  featuredImage: z.string().optional().nullable(),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description should be at most 160 characters").optional(),
  canonicalUrl: z.string().optional().nullable(),
  // Scheduling
  scheduledPublishAt: z.union([z.string(), z.date(), z.null()]).optional(),
  publishedAt: z.union([z.string(), z.date(), z.null()]).optional(),
  // Review fields
  reviewRemarks: z.string().optional().nullable(),
  reviewedBy: z.number().optional().nullable(),
  reviewedAt: z.union([z.string(), z.date(), z.null()]).optional(),
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
  notifications: many(notifications, { relationName: "userNotifications" }),
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
  notifications: many(notifications, { relationName: "articleNotifications" }),
  comments: many(comments, { relationName: "articleComments" }),
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

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
    relationName: "articleComments",
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parentComment",
  }),
  replies: many(comments, { relationName: "childComments" }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "userNotifications",
  }),
  article: one(articles, {
    fields: [notifications.articleId],
    references: [articles.id],
    relationName: "articleNotifications",
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
  canonicalUrl: z.string().optional(),
  scheduledPublishAt: z.union([z.string(), z.date(), z.null()]).optional(),
});

export const updateExtendedArticleSchema = updateArticleSchema.extend({
  categoryIds: z.array(z.number()).optional(),
  tagIds: z.array(z.number()).optional(),
  coAuthorIds: z.array(z.number()).optional(),
  keywords: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(160, "Meta description should be at most 160 characters").optional(),
  canonicalUrl: z.string().optional(),
  scheduledPublishAt: z.union([z.string(), z.date(), z.null()]).optional(),
});

// Notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

// Comment schemas
export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).optional(),
  isApproved: z.boolean().optional(),
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
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type UpdateNotification = z.infer<typeof updateNotificationSchema>;
export type Comment = typeof comments.$inferSelect & { replyCount?: number };  // Add optional replyCount
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type UpdateComment = z.infer<typeof updateCommentSchema>;
