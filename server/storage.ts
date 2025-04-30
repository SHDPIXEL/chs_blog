import { 
  users, 
  type User, 
  type InsertUser, 
  type UpdateUserProfile,
  articles, 
  type Article, 
  type InsertArticle,
  type UpdateArticle,
  type ArticleStatusType,
  assets,
  type Asset,
  type InsertAsset,
  type UpdateAsset,
  type SearchAssets
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, type SQL } from "drizzle-orm";
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
  
  // Asset operations
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByUser(userId: number): Promise<Asset[]>;
  searchAssets(params: SearchAssets, userId: number): Promise<{ assets: Asset[], total: number }>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: UpdateAsset): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
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
  
  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }
  
  async getAssetsByUser(userId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }
  
  async searchAssets(params: SearchAssets, userId: number): Promise<{ assets: Asset[], total: number }> {
    // Start with base conditions that are always added
    const baseCondition = eq(assets.userId, userId);
    let conditions: any[] = [baseCondition];
    
    // Apply text search if query is provided
    if (params.query) {
      const searchTerm = `%${params.query}%`;
      const textCondition = or(
        sql`${assets.title} ILIKE ${searchTerm}`,
        sql`${assets.description} ILIKE ${searchTerm}`,
        sql`${assets.originalName} ILIKE ${searchTerm}`
      );
      conditions.push(textCondition);
    }
    
    // Filter by mimetype
    if (params.mimetype) {
      // Use LIKE for partial mimetype matching (e.g., 'image/' should match 'image/png')
      conditions.push(sql`${assets.mimetype} LIKE ${params.mimetype + '%'}`);
    }
    
    // Filter by tags - more complex since tags is a jsonb array
    if (params.tags && params.tags.length > 0) {
      // Create a condition for each tag to check if it exists in the array
      const tagConditions: any[] = params.tags.map(tag => 
        sql`${assets.tags} @> ${JSON.stringify([tag])}`
      );
      
      // Combine conditions with OR for tags, only if we have tags
      if (tagConditions.length > 0) {
        conditions.push(or(...tagConditions));
      }
    }
    
    // Build the query with all conditions using AND
    const baseQuery = db.select().from(assets).where(and(...conditions));
    
    // Count total matching records
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(assets).where(and(...conditions));
    const totalCount = await countQuery;
    const total = totalCount[0]?.count || 0;
    
    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    
    // Get paginated results
    const results = await baseQuery
      .orderBy(desc(assets.createdAt))
      .limit(limit)
      .offset(offset);
    
    return {
      assets: results,
      total: Number(total),
    };
  }
  
  async createAsset(asset: InsertAsset): Promise<Asset> {
    const [createdAsset] = await db.insert(assets).values(asset).returning();
    return createdAsset;
  }
  
  async updateAsset(id: number, assetData: UpdateAsset): Promise<Asset | undefined> {
    const [asset] = await db.update(assets)
      .set({
        ...assetData,
        updatedAt: new Date()
      })
      .where(eq(assets.id, id))
      .returning();
    
    return asset;
  }
  
  async deleteAsset(id: number): Promise<boolean> {
    const result = await db.delete(assets)
      .where(eq(assets.id, id))
      .returning({ id: assets.id });
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
