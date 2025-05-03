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
        console.error("JWT verification error:", err.name, err.message);
        return res.status(403).json({ 
          message: "Invalid or expired token", 
          error: err.message,
          name: err.name
        });
      }

      // Validate that decoded contains all required fields
      if (!decoded || !decoded.id || !decoded.email || !decoded.role) {
        console.error("Invalid token content:", decoded);
        return res.status(403).json({ 
          message: "Invalid token format",
          content: decoded ? "Missing user properties" : "No decoded content"
        });
      }

      // Add user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
      
      console.log("Authenticated user:", req.user.email, "Role:", req.user.role);
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
    console.error("Admin middleware: No user in request");
    return res.status(401).json({ message: "Authentication required" });
  }

  console.log("Admin middleware: Checking role", req.user.role, "Expected:", UserRole.ADMIN);
  
  if (req.user.role !== UserRole.ADMIN) {
    console.error("Admin access required but user role is:", req.user.role);
    return res.status(403).json({ 
      message: "Admin access required",
      userRole: req.user.role,
      requiredRole: UserRole.ADMIN
    });
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
