import { users, type User, type InsertUser, articles, type Article, type InsertArticle } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Article operations 
  getArticle(id: number): Promise<Article | undefined>;
  getArticlesByAuthor(authorId: number): Promise<Article[]>;
  getPublishedArticles(): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private articles: Map<number, Article>;
  private userIdCounter: number;
  private articleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.articles = new Map();
    this.userIdCounter = 1;
    this.articleIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: timestamp 
    };
    this.users.set(id, user);
    return user;
  }

  // Article methods
  async getArticle(id: number): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticlesByAuthor(authorId: number): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      (article) => article.authorId === authorId
    );
  }

  async getPublishedArticles(): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      (article) => article.published
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = this.articleIdCounter++;
    const timestamp = new Date();
    const article: Article = {
      ...insertArticle,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: number, updateData: Partial<InsertArticle>): Promise<Article | undefined> {
    const article = this.articles.get(id);
    if (!article) return undefined;

    const updatedArticle: Article = {
      ...article,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.articles.set(id, updatedArticle);
    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<boolean> {
    if (!this.articles.has(id)) return false;
    return this.articles.delete(id);
  }
}

export const storage = new MemStorage();
