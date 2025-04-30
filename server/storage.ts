import { 
  users, 
  type User, 
  type InsertUser, 
  type UpdateUserProfile,
  articles, 
  type Article, 
  type InsertArticle,
  type UpdateArticle,
  type ArticleStatusType
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcrypt";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined>;
  
  // Article operations 
  getArticle(id: number): Promise<Article | undefined>;
  getArticlesByAuthor(authorId: number): Promise<Article[]>;
  getArticlesByStatus(authorId: number, status: ArticleStatusType): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<UpdateArticle>): Promise<Article | undefined>;
  updateArticleStatus(id: number, status: ArticleStatusType): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    
    return user;
  }
  
  async updateUserProfile(id: number, profileData: UpdateUserProfile): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set(profileData)
      .where(eq(users.id, id))
      .returning();
    
    return user;
  }

  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article;
  }

  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.authorId, authorId));
  }
  
  async getArticlesByStatus(authorId: number, status: ArticleStatusType): Promise<Article[]> {
    return await db.select()
      .from(articles)
      .where(and(
        eq(articles.authorId, authorId),
        eq(articles.status, status)
      ));
  }

  async getPublishedArticles(): Promise<Article[]> {
    return await db.select().from(articles).where(eq(articles.published, true));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async updateArticle(id: number, updateData: Partial<UpdateArticle>): Promise<Article | undefined> {
    const [article] = await db.update(articles)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(articles.id, id))
      .returning();
    
    return article;
  }
  
  async updateArticleStatus(id: number, status: ArticleStatusType): Promise<Article | undefined> {
    const [article] = await db.update(articles)
      .set({
        status,
        updatedAt: new Date(),
        // If status is published, also set published flag to true
        ...(status === 'published' ? { published: true } : {})
      })
      .where(eq(articles.id, id))
      .returning();
    
    return article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
