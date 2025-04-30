import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";
import { UserRoleType, UserRole } from "@shared/schema";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "blog-platform-jwt-secret";

// Extended Request with user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRoleType;
  };
}

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Authentication error" });
  }
};

// Admin role middleware
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

// Author role middleware
export const requireAuthor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== UserRole.AUTHOR) {
    return res.status(403).json({ message: "Author access required" });
  }

  next();
};

// Any authenticated user middleware
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  next();
};
