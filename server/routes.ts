import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { 
  loginUserSchema, 
  insertUserSchema, 
  UserRole,
  insertArticleSchema
} from "@shared/schema";
import { z } from "zod";
import { authenticateToken, requireAdmin, requireAuthor, requireAuth, type AuthRequest } from "./middleware/auth";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "blog-platform-jwt-secret";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Create user (password will be hashed in storage implementation)
      const newUser = await storage.createUser(validatedData);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      // Validate request body
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Return user info and token
      const { password, ...userWithoutPassword } = user;
      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  // User info route
  app.get("/api/auth/me", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin routes
  app.get("/api/admin/dashboard", authenticateToken, requireAdmin, (req, res) => {
    // Mock dashboard data - in a real app, this would fetch from a database
    return res.json({
      stats: {
        totalUsers: 12,
        totalPosts: 45,
        pageViews: 2340,
        comments: 98
      },
      recentActivity: [
        {
          id: 1,
          type: "userRegistered",
          user: "John Smith",
          role: "author",
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: "postPublished",
          title: "The Future of Web Development",
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    });
  });

  // Author routes
  app.get("/api/author/dashboard", authenticateToken, requireAuthor, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Get articles by author
      const articles = await storage.getArticlesByAuthor(req.user.id);
      
      // Calculate stats
      const published = articles.filter(a => a.published).length;
      const drafts = articles.filter(a => !a.published).length;
      const totalViews = 1234; // In a real app this would be calculated from a view counter
      
      return res.json({
        stats: {
          published,
          drafts,
          totalViews
        },
        articles
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Create article
  app.post("/api/articles", authenticateToken, requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const validatedData = insertArticleSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const article = await storage.createArticle(validatedData);
      return res.status(201).json(article);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
