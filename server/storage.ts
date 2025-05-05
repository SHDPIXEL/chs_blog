import {
  users,
  type User,
  type InsertUser,
  type UpdateUserProfile,
  articles,
  type Article,
  type InsertArticle,
  type UpdateArticle,
  type ExtendedInsertArticle,
  type ExtendedUpdateArticle,
  type ArticleStatusType,
  assets,
  type Asset,
  type InsertAsset,
  type UpdateAsset,
  type SearchAssets,
  categories,
  type Category,
  type InsertCategory,
  type UpdateCategory,
  tags,
  type Tag,
  type InsertTag,
  articleCategories,
  articleTags,
  articleCoAuthors,
  notifications,
  type Notification,
  type InsertNotification,
  type ExtendedInsertNotification,
  comments,
  type Comment,
  type InsertComment,
  type UpdateComment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql, asc, inArray, type SQL } from "drizzle-orm";
import * as bcrypt from "bcrypt";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(
    id: number,
    profileData: UpdateUserProfile
  ): Promise<User | undefined>;
  getUsers(role?: string): Promise<User[]>;
  updateUserPublishingRights(
    id: number,
    canPublish: boolean
  ): Promise<User | undefined>;

  // Article operations
  getArticle(id: number): Promise<Article | undefined>;
  getArticleWithRelations(id: number): Promise<
    | {
        article: Article;
        categories: Category[];
        tags: Tag[];
        coAuthors: User[];
      }
    | undefined
  >;
  getArticlesByAuthor(authorId: number): Promise<Article[]>;
  getArticlesByStatus(
    authorId: number,
    status: ArticleStatusType
  ): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  getCoAuthoredArticles(
    userId: number,
    status?: ArticleStatusType
  ): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  createExtendedArticle(article: ExtendedInsertArticle): Promise<Article>;
  updateArticle(
    id: number,
    article: Partial<UpdateArticle>
  ): Promise<Article | undefined>;
  updateExtendedArticle(
    id: number,
    article: Partial<ExtendedUpdateArticle>
  ): Promise<Article | undefined>;
  updateArticleStatus(
    id: number,
    status: ArticleStatusType
  ): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  getArticleCategories(articleId: number): Promise<Category[]>;
  getArticleTags(articleId: number): Promise<Tag[]>;
  getArticleCoAuthors(articleId: number): Promise<User[]>;
  searchArticles(filters: any): Promise<{ articles: Article[]; total: number }>;

  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(
    id: number,
    category: UpdateCategory
  ): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  deleteTag(id: number): Promise<boolean>;

  // Asset operations
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByUser(userId: number): Promise<Asset[]>;
  searchAssets(
    params: SearchAssets,
    userId: number
  ): Promise<{ assets: Asset[]; total: number }>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: UpdateAsset): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;

  // Notification operations
  createNotification(
    notification: InsertNotification | ExtendedInsertNotification
  ): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;

  // Comment operations
  getArticleComments(articleId: number): Promise<Comment[]>;
  getCommentReplies(commentId: number): Promise<Comment[]>;
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(
    id: number,
    comment: UpdateComment
  ): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
}



function getISTFormattedDateTime() {
  const date = new Date();

  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istDate = new Date(date.getTime() + istOffset);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


export class DatabaseStorage implements IStorage {
  // Helper function to generate slug from string
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/--+/g, "-") // Replace multiple - with single -
      .trim(); // Trim whitespace
  }
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return db
        .select()
        .from(users)
        .where(sql`${users.role} = ${role}`);
    }
    return db.select().from(users);
  }

  async updateUserPublishingRights(
    id: number,
    canPublish: boolean
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ canPublish })
      .where(eq(users.id, id));

    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    });

    return user;
  }

  async updateUserProfile(
    id: number,
    profileData: UpdateUserProfile
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, id));

    return user;
  }

  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    return article;
  }

  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.authorId, authorId))
      .orderBy(desc(articles.createdAt));
  }

  async getArticlesByStatus(
    authorId: number,
    status: ArticleStatusType
  ): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(and(eq(articles.authorId, authorId), eq(articles.status, status)))
      .orderBy(desc(articles.createdAt));
  }

  async getPublishedArticles(): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.published, "true"))
      .orderBy(desc(articles.createdAt));
  }

  async getCoAuthoredArticles(
    userId: number,
    status?: ArticleStatusType
  ): Promise<Article[]> {
    // Start with a query to get all article IDs where the user is a co-author
    const coAuthoredIds = await db
      .select({ articleId: articleCoAuthors.articleId })
      .from(articleCoAuthors)
      .where(eq(articleCoAuthors.userId, userId));

    // If no co-authored articles, return empty array
    if (coAuthoredIds.length === 0) {
      return [];
    }

    // Extract just the IDs into an array
    const articleIds = coAuthoredIds.map((item) => item.articleId);

    // Create conditions array
    const conditions = [inArray(articles.id, articleIds)];

    // Add status condition if provided
    if (status) {
      conditions.push(eq(articles.status, status));
    }

    // Query with all conditions
    return await db
      .select()
      .from(articles)
      .where(and(...conditions))
      .orderBy(desc(articles.createdAt));
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    // Create a copy of insertArticle data with potential modifications
    const articleData: Record<string, any> = { ...insertArticle };

    // Generate slug from title if not provided
    if (!articleData.slug && articleData.title) {
      articleData.slug = this.generateSlug(articleData.title);
    }

    // Handle scheduledPublishAt field if it's a string
    if (
      typeof articleData.scheduledPublishAt === "string" &&
      articleData.scheduledPublishAt
    ) {
      articleData.scheduledPublishAt = new Date(articleData.scheduledPublishAt);
    } else if (articleData.scheduledPublishAt === undefined) {
      // Remove undefined values to avoid database type errors
      delete articleData.scheduledPublishAt;
    }

    // Set publishedAt timestamp if article is published
    if (
      articleData.published === "true" &&
      (!("scheduledPublishAt" in articleData) ||
        !articleData.scheduledPublishAt ||
        typeof articleData.scheduledPublishAt !== "string")
    ) {
      const istDate = getISTFormattedDateTime();
      console.log("from in : ", istDate);
      articleData.publishedAt = istDate;
    }
    

    console.log("from out : ", getISTFormattedDateTime());
    

    const [result] = await db.insert(articles).values(articleData);

    const insertedId = result.insertId || result.id ;

    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, insertedId)) // or `slug`
      .limit(1);

    return article[0];
  }

  async updateArticle(
    id: number,
    updateData: Partial<UpdateArticle>
  ): Promise<Article | undefined> {
    const dataToUpdate: Record<string, any> = { ...updateData };

    try {
      console.log(
        `Updating article ${id} with data:`,
        JSON.stringify(dataToUpdate, null, 2)
      );

      // Convert date string fields to Date objects if they exist
      if (dataToUpdate.reviewedAt) {
        dataToUpdate.reviewedAt = new Date(dataToUpdate.reviewedAt);
      }

      if (dataToUpdate.scheduledPublishAt) {
        dataToUpdate.scheduledPublishAt = new Date(
          dataToUpdate.scheduledPublishAt
        );
      } else if (dataToUpdate.scheduledPublishAt === null) {
        dataToUpdate.scheduledPublishAt = null;
      } else {
        delete dataToUpdate.scheduledPublishAt;
      }

      if (dataToUpdate.publishedAt) {
        dataToUpdate.publishedAt = new Date(dataToUpdate.publishedAt);
      }

      // Generate slug from title if not provided
      if (dataToUpdate.title && !dataToUpdate.slug) {
        dataToUpdate.slug = this.generateSlug(dataToUpdate.title);
      }

      // Clean up keywords field
      if (dataToUpdate.keywords === undefined) {
        delete dataToUpdate.keywords;
      } else if (dataToUpdate.keywords === null) {
        dataToUpdate.keywords = [];
      }

      await db
        .update(articles)
        .set({
          ...dataToUpdate,
        })
        .where(eq(articles.id, id));

      // Fetch and return the updated article
      const updated = await db.query.articles.findFirst({
        where: (articles, { eq }) => eq(articles.id, id),
      });

      return updated ?? undefined;
    } catch (error) {
      console.error(`Error in updateArticle for article ${id}:`, error);
      throw error;
    }
  }

  async updateArticleStatus(
    id: number,
    status: ArticleStatusType
  ): Promise<Article | undefined> {
    // Default update fields
    const updateFields: any = {
      status,
      // Set published flag based on status
      published: (status === "published").toString(),
    };

    // If we're publishing the article, also set publishedAt to now
    if (status === "published") {
      updateFields.publishedAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" , hour12: false,})
    }

    const [article] = await db
      .update(articles)
      .set(updateFields)
      .where(eq(articles.id, id));

    return article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    try {
      // Start a transaction for the deletion process
      return await db.transaction(async (tx) => {
        console.log(`Starting transaction to delete article ${id}`);
  
        // 1. Delete related article-categories records
        await tx.delete(articleCategories).where(eq(articleCategories.articleId, id));
  
        // 2. Delete related article-tags records
        await tx.delete(articleTags).where(eq(articleTags.articleId, id));
  
        // 3. Delete related article-co-authors records
        await tx.delete(articleCoAuthors).where(eq(articleCoAuthors.articleId, id));
  
        // 4. Delete related notifications
        await tx.delete(notifications).where(eq(notifications.articleId, id));
  
        // 5. Delete related comments
        await tx.delete(comments).where(eq(comments.articleId, id));
  
        // 6. Finally, delete the article itself
        const result = await tx.delete(articles).where(eq(articles.id, id));
  
        console.log(`Article ${id} deletion complete`);
        console.log(" Result : ", result);
        // `result` may vary based on ORM: it could be number of rows deleted
        return result.rowCount > 0; // or `result.rowCount > 0` in some ORMs
      });
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      throw error;
    }
  }
  

  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async getAssetsByUser(userId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.userId, userId));
  }

  async searchAssets(
    params: SearchAssets,
    userId: number
  ): Promise<{ assets: Asset[]; total: number }> {
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
      conditions.push(sql`${assets.mimetype} LIKE ${params.mimetype + "%"}`);
    }

    // Filter by tags - more complex since tags is a jsonb array
    if (params.tags && params.tags.length > 0) {
      // Create a condition for each tag to check if it exists in the array
      const tagConditions: any[] = params.tags.map(
        (tag) => sql`${assets.tags} @> ${JSON.stringify([tag])}`
      );

      // Combine conditions with OR for tags, only if we have tags
      if (tagConditions.length > 0) {
        conditions.push(or(...tagConditions));
      }
    }

    // Build the query with all conditions using AND
    const baseQuery = db
      .select()
      .from(assets)
      .where(and(...conditions));

    // Count total matching records
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(assets)
      .where(and(...conditions));
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
    const [createdAsset] = await db.insert(assets).values(asset);
    return createdAsset;
  }

  async updateAsset(
    id: number,
    assetData: UpdateAsset
  ): Promise<Asset | undefined> {
    const [asset] = await db
      .update(assets)
      .set({
        ...assetData,
      })
      .where(eq(assets.id, id));

    return asset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    const result = await db.delete(assets).where(eq(assets.id, id));

    return result.length > 0;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    // Generate slug if not provided
    if (!categoryData.slug) {
      categoryData = {
        ...categoryData,
        slug: this.generateSlug(categoryData.name),
      };
    }

    const [category] = await db.insert(categories).values(categoryData);

    return category;
  }

  async updateCategory(
    id: number,
    categoryData: UpdateCategory
  ): Promise<Category | undefined> {
    // If name is updated but not slug, regenerate slug
    if (categoryData.name && !categoryData.slug) {
      categoryData = {
        ...categoryData,
        slug: this.generateSlug(categoryData.name),
      };
    }

    const [category] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id));

    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // First delete all article-category relations for this category
    await db
      .delete(articleCategories)
      .where(eq(articleCategories.categoryId, id));

    // Then delete the category
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    return result.length > 0;
  }

  // Tag methods
  async getAllTags(): Promise<Tag[]> {
    return db.select().from(tags).orderBy(asc(tags.name));
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.slug, slug));
    return tag;
  }

  async createTag(tagData: InsertTag): Promise<Tag> {
    // Generate slug if not provided
    if (!tagData.slug) {
      tagData = {
        ...tagData,
        slug: this.generateSlug(tagData.name),
      };
    }

    const [tag] = await db.insert(tags).values(tagData);
    return tag;
  }

  async deleteTag(id: number): Promise<boolean> {
    // First delete all article-tag relations for this tag
    await db.delete(articleTags).where(eq(articleTags.tagId, id));

    // Then delete the tag
    const result = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning({ id: tags.id });

    return result.length > 0;
  }

  // Article relation methods
  async getArticleCategories(articleId: number): Promise<Category[]> {
    const articleCategoryRows = await db
      .select({
        categoryId: articleCategories.categoryId,
      })
      .from(articleCategories)
      .where(eq(articleCategories.articleId, articleId));

    if (articleCategoryRows.length === 0) {
      return [];
    }

    const categoryIds = articleCategoryRows.map((row) => row.categoryId);
    return db
      .select()
      .from(categories)
      .where(inArray(categories.id, categoryIds));
  }

  async getArticleTags(articleId: number): Promise<Tag[]> {
    const articleTagRows = await db
      .select({
        tagId: articleTags.tagId,
      })
      .from(articleTags)
      .where(eq(articleTags.articleId, articleId));

    if (articleTagRows.length === 0) {
      return [];
    }

    const tagIds = articleTagRows.map((row) => row.tagId);
    return db.select().from(tags).where(inArray(tags.id, tagIds));
  }

  async getArticleCoAuthors(articleId: number): Promise<User[]> {
    const articleCoAuthorRows = await db
      .select({
        userId: articleCoAuthors.userId,
      })
      .from(articleCoAuthors)
      .where(eq(articleCoAuthors.articleId, articleId));

    if (articleCoAuthorRows.length === 0) {
      return [];
    }

    const userIds = articleCoAuthorRows.map((row) => row.userId);
    return db.select().from(users).where(inArray(users.id, userIds));
  }

  async getArticleWithRelations(id: number): Promise<
    | {
        article: Article;
        categories: Category[];
        tags: Tag[];
        coAuthors: User[];
      }
    | undefined
  > {
    const article = await this.getArticle(id);
    if (!article) {
      return undefined;
    }

    const [categories, tags, coAuthors] = await Promise.all([
      this.getArticleCategories(id),
      this.getArticleTags(id),
      this.getArticleCoAuthors(id),
    ]);

    return {
      article,
      categories,
      tags,
      coAuthors,
    };
  }

  async createExtendedArticle(
    extendedArticle: ExtendedInsertArticle
  ): Promise<Article> {
    // Extract relation data
    const { categoryIds, tagIds, coAuthorIds, ...articleData } =
      extendedArticle;

    // Handle scheduledPublishAt field if it's a string or undefined
    if (
      typeof articleData.scheduledPublishAt === "string" &&
      articleData.scheduledPublishAt
    ) {
articleData.scheduledPublishAt =  new Date(
        new Date(articleData.scheduledPublishAt).toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      );
    } else if (articleData.scheduledPublishAt === undefined) {
      // Remove undefined values to avoid database type errors
      delete (articleData as any).scheduledPublishAt;
    }

    // Create the article
    const article = await this.createArticle(articleData as InsertArticle);

    // Add categories if provided
    if (categoryIds && categoryIds.length > 0) {
      await Promise.all(
        categoryIds.map((categoryId) =>
          db.insert(articleCategories).values({
            articleId: article.id,
            categoryId,
          })
        )
      );
    }

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      await Promise.all(
        tagIds.map((tagId) =>
          db.insert(articleTags).values({
            articleId: article.id,
            tagId,
          })
        )
      );
    }

    // Add co-authors if provided
    if (coAuthorIds && coAuthorIds.length > 0) {
      await Promise.all(
        coAuthorIds.map((userId) =>
          db.insert(articleCoAuthors).values({
            articleId: article.id,
            userId,
          })
        )
      );
    }

    return article;
  }

  async updateExtendedArticle(
    id: number,
    extendedArticle: Partial<ExtendedUpdateArticle>
  ): Promise<Article | undefined> {
    // Extract relation data
    const { categoryIds, tagIds, coAuthorIds, ...articleData } =
      extendedArticle;

    // Handle scheduledPublishAt field if it's a string
    if (
      typeof articleData.scheduledPublishAt === "string" &&
      articleData.scheduledPublishAt
    ) {
      articleData.scheduledPublishAt = new Date(articleData.scheduledPublishAt);
    } else if (articleData.scheduledPublishAt === null) {
      // If explicitly set to null, maintain it as null
      articleData.scheduledPublishAt = null;
    }

    // Update the article basic data
    const article = await this.updateArticle(id, articleData);
    if (!article) {
      return undefined;
    }

    // Update categories if provided
    if (categoryIds) {
      // Delete existing relationships
      await db
        .delete(articleCategories)
        .where(eq(articleCategories.articleId, id));

      // Add new ones
      if (categoryIds.length > 0) {
        await Promise.all(
          categoryIds.map((categoryId) =>
            db.insert(articleCategories).values({
              articleId: id,
              categoryId,
            })
          )
        );
      }
    }

    // Update tags if provided
    if (tagIds) {
      // Delete existing relationships
      await db.delete(articleTags).where(eq(articleTags.articleId, id));

      // Add new ones
      if (tagIds.length > 0) {
        await Promise.all(
          tagIds.map((tagId) =>
            db.insert(articleTags).values({
              articleId: id,
              tagId,
            })
          )
        );
      }
    }

    // Update co-authors if provided
    if (coAuthorIds) {
      // Delete existing relationships
      await db
        .delete(articleCoAuthors)
        .where(eq(articleCoAuthors.articleId, id));

      // Add new ones
      if (coAuthorIds.length > 0) {
        await Promise.all(
          coAuthorIds.map((userId) =>
            db.insert(articleCoAuthors).values({
              articleId: id,
              userId,
            })
          )
        );
      }
    }

    return article;
  }

  async searchArticles(
    filters: any
  ): Promise<{ articles: Article[]; total: number }> {
    // Start with base conditions
    let conditions: any[] = [];

    // Filter by author
    if (filters.authorId) {
      conditions.push(eq(articles.authorId, filters.authorId));
    }

    // Filter by status
    if (filters.status) {
      conditions.push(eq(articles.status, filters.status));
    }

    // Filter by published status
    if (filters.published !== undefined) {
      conditions.push(eq(articles.published, filters.published));
    }

    // Filter by search term (title, content, excerpt)
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      const searchCondition = or(
        sql`${articles.title} ILIKE ${searchTerm}`,
        sql`${articles.content} ILIKE ${searchTerm}`,
        sql`${articles.excerpt} ILIKE ${searchTerm}`
      );
      conditions.push(searchCondition);
    }

    // Build the query with all conditions
    let baseQuery = db.select().from(articles);
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    // Count total matching records
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(articles);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const totalCount = await countQuery;
    const total = totalCount[0]?.count || 0;

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Apply sorting
    let orderByField = desc(articles.createdAt); // Default sorting
    if (filters.orderBy) {
      switch (filters.orderBy) {
        case "title":
          orderByField = asc(articles.title);
          break;
        case "title-desc":
          orderByField = desc(articles.title);
          break;
        case "newest":
          orderByField = desc(articles.createdAt);
          break;
        case "oldest":
          orderByField = asc(articles.createdAt);
          break;
        case "views":
          orderByField = desc(articles.viewCount);
          break;
      }
    }

    // Get paginated results with ordering
    const results = await baseQuery
      .orderBy(orderByField)
      .limit(limit)
      .offset(offset);

    return {
      articles: results,
      total: Number(total),
    };
  }

  // Notification methods
  async createNotification(
    notificationData: InsertNotification | ExtendedInsertNotification
  ): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData);
    return notification;
  }

  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));

    return notification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId))
      .returning({ id: notifications.id });

    return result.length > 0;
  }

  // Comment methods
  async getArticleComments(articleId: number): Promise<Comment[]> {
    // Get all top-level comments (no parent) for the article, ordered by creation time
    // replyCount is now a column in the database, so we don't need to calculate it
    return await db
      .select()
      .from(comments)
      .where(
        and(
          eq(comments.articleId, articleId),
          sql`${comments.parentId} IS NULL`
        )
      )
      .orderBy(asc(comments.createdAt));
  }

  async getCommentReplies(commentId: number): Promise<Comment[]> {
    // Get all replies to a comment, ordered by creation time
    // replyCount is now a column in the database, so we don't need to calculate it
    return await db
      .select()
      .from(comments)
      .where(eq(comments.parentId, commentId))
      .orderBy(asc(comments.createdAt));
  }

  async getComment(id: number): Promise<Comment | undefined> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, id));
    return comment;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment);

    // If this is a reply to another comment (has parentId), update the parent's replyCount
    // and create a notification for the author of the article
    if (comment.parentId) {
      // Increment the parent comment's replyCount
      await db
        .update(comments)
        .set({
          replyCount: sql`${comments.replyCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, comment.parentId));

      // Get the parent comment to see who we're replying to
      const parentComment = await this.getComment(comment.parentId);

      if (parentComment) {
        // Get the article to notify the author
        const article = await this.getArticle(comment.articleId);

        if (article) {
          // Create notification for article author about new reply
          await this.createNotification({
            userId: article.authorId,
            type: "comment_received",
            title: "New Reply to Comment",
            message: `${comment.authorName} replied to a comment on your article "${article.title}"`,
            articleId: article.id,
            commentId: newComment.id,
            articleSlug: article.slug, // Add slug for better navigation
          });
        }
      }
    } else {
      // This is a top-level comment, notify the article author
      const article = await this.getArticle(comment.articleId);

      if (article) {
        // Create notification for article author about new comment
        await this.createNotification({
          userId: article.authorId,
          type: "comment_received",
          title: "New Comment on Article",
          message: `${comment.authorName} commented on your article "${article.title}"`,
          articleId: article.id,
          commentId: newComment.id,
          articleSlug: article.slug, // Add slug for better navigation
        });
      }
    }

    return newComment;
  }

  async updateComment(
    id: number,
    commentData: UpdateComment
  ): Promise<Comment | undefined> {
    const [comment] = await db
      .update(comments)
      .set({
        ...commentData,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id));

    return comment;
  }

  async deleteComment(id: number): Promise<boolean> {
    // First, get the comment to check if it's a reply (has parentId)
    const comment = await this.getComment(id);
    if (!comment) return false;

    // Delete all replies to this comment first
    await db.delete(comments).where(eq(comments.parentId, id));

    // Then delete the comment itself
    const result = await db
      .delete(comments)
      .where(eq(comments.id, id))
      .returning({ id: comments.id });

    // If the deleted comment was a reply, decrement the parent's replyCount
    if (comment.parentId) {
      await db
        .update(comments)
        .set({
          replyCount: sql`GREATEST(${comments.replyCount} - 1, 0)`, // Ensure replyCount never goes below 0
          updatedAt: new Date(),
        })
        .where(eq(comments.id, comment.parentId));
    }

    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
