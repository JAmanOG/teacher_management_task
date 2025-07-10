import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asynchandler } from "../utils/asynchandler.js";
import db from "../db/indexDb.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const isAuthenticated = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers("authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Access token is missing");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decodedToken.id))
      .first();
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new ApiError(401, "Invalid or expired token");
    }
    throw error;
  }
});

export const authorizeRoles = (...allowedRoles) => {
    return asynchandler(async (req, res, next) => {
      if (!req.user) {
        throw new ApiError(401, "Authentication required");
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, "You do not have permission to access this resource");
      }
      
      next();
    });
  };

  export const auth = {
    // Authenticate user
    user: isAuthenticated,
    
    // Authenticate as admin
    admin: [isAuthenticated, authorizeRoles("admin")],
    
    // Authenticate as teacher
    teacher: [isAuthenticated, authorizeRoles("teacher", "admin")],
    
    // Custom role authorization
    hasRole: (roles) => [isAuthenticated, authorizeRoles(...roles)]
  };