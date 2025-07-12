import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  isPasswordCorrect,
  hashedPassword,
  excludeFields,
} from "../../helper/funchelper.js";
import { users } from "../../db/schema.js";
import { eq, and, or, ilike, inArray, ne } from "drizzle-orm";

// Constants
const ROLE_PERMISSIONS = {
  "Teacher": ["view_teachers", "view_lessons", "edit_lessons"],
  "Head Teacher": ["view_teachers", "add_teachers", "edit_teachers", "view_lessons", "edit_lessons", "view_reports"],
  "Admin": ["view_teachers", "add_teachers", "edit_teachers", "delete_teachers", "manage_roles", "view_lessons", "edit_lessons", "view_reports", "export_data"],
  "Principal": ["view_teachers", "add_teachers", "edit_teachers", "delete_teachers", "manage_roles", "view_lessons", "edit_lessons", "view_reports", "export_data", "manage_system"]
};

const VALID_ROLES = Object.keys(ROLE_PERMISSIONS);
const VALID_STATUSES = ["Active", "Inactive", "Suspended"];

// Utility functions
const isUserExists = async (id) => {
  if (!id) return null;
  const user = await db.select().from(users).where(eq(users.id, id));

  console.log("Checking if user exists with ID:", id);
  return user.length > 0 ? user[0] : null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateRole = (role) => {
  return VALID_ROLES.includes(role);
};

const validateStatus = (status) => {
  return VALID_STATUSES.includes(status);
};

const checkEmailUniqueness = async (email, excludeUserId = null) => {
  console.log("Checking email uniqueness for:", email, "excluding user ID:", excludeUserId);
  
  try {
    let query;
    
    if (excludeUserId) {
      query = db.select()
        .from(users)
        .where(and(
          eq(users.email, email),
          ne(users.id, excludeUserId)
        ));
    } else {
      query = db.select()
        .from(users)
        .where(eq(users.email, email));
    }
    
    const existingUser = await query;
    console.log("Existing user found:", existingUser.length > 0);
    return existingUser.length === 0;
  } catch (error) {
    console.error("Error in checkEmailUniqueness:", error);
    throw error;
  }
};
const generateAccessTokenAndRefreshToken = async (user) => {
  const userExists = await isUserExists(user.id);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await db
      .update(users)
      .set({ refreshToken: refreshToken })
      .where(eq(users.id, user.id));
    
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens: " + error.message);
  }
};

const Register = asynchandler(async (req, res) => {
  // const { email, password, fullName, phoneNumber, subject, role, status, permissions } = req.body;
  
  const { email, password, fullName, phoneNumber, subject, role, status, permissions } = req.body;

  console.log("Registering user:", { email, fullName, role, status });

  
  // Validation
  if (!email || !password || !fullName || !role) {
    throw new ApiError(400, "Required fields missing: email, password, fullName, and role are required");
  }
  
  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  
  if (!validateRole(role)) {
    throw new ApiError(400, `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}`);
  }
  
  if (status && !validateStatus(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses are: ${VALID_STATUSES.join(", ")}`);
  }
  
  // Password strength validation
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long");
  }
  
  // Check email uniqueness
  const isEmailUnique = await checkEmailUniqueness(email);
  if (!isEmailUnique) {
    throw new ApiError(409, "User already exists with this email");
  }

  console.log("Reached here, creating user with email:", email);

  // Set permissions based on role
  let finalPermissions = [];
  if (permissions && Array.isArray(permissions)) {
    finalPermissions = permissions;
  } else {
    finalPermissions = ROLE_PERMISSIONS[role] || [];
  }

  try {
    // Hash password
    const hashedPwd = await hashedPassword(password);

    console.log("Reached here, creating user with hashed password")

    // Create new user with UUID
    const newUser = await db.insert(users).values({
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      passwordHash: hashedPwd,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber?.trim(),
      subject: subject?.trim(),
      role,
      status: status || "Active",
      permissions: finalPermissions,
      joinDate: new Date(),
    }).returning();

    const userResponse = excludeFields(newUser[0], ['passwordHash', 'refreshToken']);

    console.log("User created successfully:", userResponse);
    return res.status(201).json(
      new ApiResponse(201, userResponse, "User registered successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to create user: " + error.message);
  }
});

const getUserProfile = asynchandler(async (req, res) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userResponse = excludeFields(user, ['passwordHash', 'refreshToken']);
  return res.status(200).json(
    new ApiResponse(200, userResponse, "User profile retrieved successfully")
  );
});

const getAllUserByRole = asynchandler(async (req, res) => {
  const { role } = req.query;
  if (!role || !validateRole(role)) {
    throw new ApiError(400, `Invalid or missing role. Valid roles are: ${VALID_ROLES.join(", ")}`);
  }

  try {
    const usersList = await db.select().from(users).where(eq(users.role, role));
  
    return res.status(200).json(
      new ApiResponse(200, usersList, "Users retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to retrieve users: " + error.message);
  }
});

const updateUserProfile = asynchandler(async (req, res) => {
  const userId = req.user?.id;
  const { fullName, phoneNumber, email, subject, role, status } = req.body;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate required fields
  const requiredFields = { fullName, phoneNumber, email, subject, role, status };
  const missingFields = Object.entries(requiredFields)
    .filter(([key, value]) => value === undefined || value === null || value === "")
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new ApiError(400, `Required fields missing: ${missingFields.join(", ")}`);
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Validate role
  if (!validateRole(role)) {
    throw new ApiError(400, `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}`);
  }

  // Validate status
  if (!validateStatus(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses are: ${VALID_STATUSES.join(", ")}`);
  }

  // Check email uniqueness (excluding current user)
  if (email !== user.email) {
    const isEmailUnique = await checkEmailUniqueness(email, userId);
    if (!isEmailUnique) {
      throw new ApiError(409, "Email already exists");
    }
  }

  try {
    const updatedUser = await db.update(users)
      .set({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber?.trim(),
        email: email.toLowerCase().trim(),
        subject: subject?.trim(),
        role,
        status
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    return res.status(200).json(
      new ApiResponse(200, userResponse, "User profile updated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to update user profile: " + error.message);
  }
});

const changeUserPassword = asynchandler(async (req, res) => {
  const userId = req.user?.id;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "New password must be at least 8 characters long");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await comparePassword(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, "Old password is incorrect");
  }

  try {
    const hashedPwd = await hashedPassword(newPassword);

    await db.update(users)
      .set({ passwordHash: hashedPwd })
      .where(eq(users.id, userId));

    return res.status(200).json(
      new ApiResponse(200, null, "Password changed successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to change password: " + error.message);
  }
});

const getUserById = asynchandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userResponse = excludeFields(user, ['passwordHash', 'refreshToken']);
  return res.status(200).json(
    new ApiResponse(200, userResponse, "User retrieved successfully")
  );
});

const updateUserById = asynchandler(async (req, res) => {
  const userId = req.params.id;
  const { fullName, phoneNumber, email, subject, role, status, permissions, password } = req.body;


  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Validate required fields
  if (!fullName || !phoneNumber || !email || !subject || !role || !status || !permissions) {
    throw new ApiError(400, "All fields are required: fullName, phoneNumber, email, subject, role, status, permissions");
  }


  if (password && password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long if provided");
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // Validate role
  if (!validateRole(role)) {
    throw new ApiError(400, `Invalid role. Valid roles are: ${VALID_ROLES.join(", ")}`);
  }

  // Validate status
  if (!validateStatus(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses are: ${VALID_STATUSES.join(", ")}`);
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check email uniqueness (excluding current user)
  if (email !== user.email) {
    const isEmailUnique = await checkEmailUniqueness(email, userId);
    if (!isEmailUnique) {
      throw new ApiError(409, "Email already exists");
    }
  }

  // hash password if provided
  let hashedPwd = user.passwordHash;
  if (password) {
    hashedPwd = await hashedPassword(password);
  }

  try {
    const updatedUser = await db.update(users)
      .set({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.toLowerCase().trim(),
        subject: subject.trim(),
        role,
        status,
        permissions: Array.isArray(permissions) ? permissions : [],
        passwordHash: hashedPwd,
      })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    return res.status(200).json(
      new ApiResponse(200, userResponse, "User updated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to update user: " + error.message);
  }
});

const deleteUserById = asynchandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  try {
    await db.delete(users).where(eq(users.id, userId));

    return res.status(200).json(
      new ApiResponse(200, null, "User deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to delete user: " + error.message);
  }
});

const login = asynchandler(async (req, res) => {
  const { email, password } = req.body;

  console.log("Login attempt for email:", email, "password:", password ? "provided" : "not provided");
  
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  if (!validateEmail(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  try {
    const userResult = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    const user = userResult.length > 0 ? userResult[0] : null;

    console.log("User found:", user ? user.id : "No user found with this email");
    
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    if (user.status === "Inactive" || user.status === "Suspended") {
      console.log("User account is not active:", user.status);
      throw new ApiError(403, "Account is not active");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      console.log("Password mismatch for user ID:", user.id);
      throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const userResponse = excludeFields(user, ['passwordHash', 'refreshToken']);
    
    console.log("User logged in successfully:", userResponse.id);
    return res.status(200).json(
      new ApiResponse(200, { user: userResponse, accessToken }, "Login successful")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Login failed: " + error.message);
  }
});

const GettingAccessToken = asynchandler(async (req, res) => {
  const userId = req.user?.id;
  const refreshToken = req.cookies.refreshToken;

  console.log("Getting access token for user ID:", userId, "with refresh token:", refreshToken);

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!refreshToken || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid or missing refresh token");
  }

  try {
    const newAccessToken = generateAccessToken(user);
    

    return res.status(200).json(
      new ApiResponse(200, { accessToken: newAccessToken }, "Access token generated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to generate access token: " + error.message);
  }
});

const logout = asynchandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  try {
    await db.update(users).set({ refreshToken: null }).where(eq(users.id, userId));

    res.clearCookie("refreshToken");
    return res.status(200).json(
      new ApiResponse(200, null, "Logout successful")
    );
  } catch (error) {
    throw new ApiError(500, "Logout failed: " + error.message);
  }
});

const getUserStatus = asynchandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json(
    new ApiResponse(200, { status: user.status }, "User status retrieved successfully")
  );
});

const updateUserStatus = asynchandler(async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  if (!validateStatus(status)) {
    throw new ApiError(400, `Invalid status. Valid statuses are: ${VALID_STATUSES.join(", ")}`);
  }

  const user = await isUserExists(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  try {
    const updatedUser = await db.update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    return res.status(200).json(
      new ApiResponse(200, { status: userResponse.status }, "User status updated successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to update user status: " + error.message);
  }
});

const BulkDeleteUsers = asynchandler(async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new ApiError(400, "User IDs are required for bulk delete");
  }

  // Validate all user IDs are provided
  const validUserIds = userIds.filter(id => id && typeof id === 'string');
  if (validUserIds.length !== userIds.length) {
    throw new ApiError(400, "All user IDs must be valid strings");
  }

  try {
    // Check if users exist before deleting
    const existingUsers = await db.select().from(users).where(
      inArray(users.id, validUserIds)
    );

    if (existingUsers.length === 0) {
      throw new ApiError(404, "No users found to delete");
    }

    const deletedUsers = await db.delete(users).where(
      inArray(users.id, validUserIds)
    ).returning();

    return res.status(200).json(
      new ApiResponse(200, { deletedCount: deletedUsers.length }, "Users deleted successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to delete users: " + error.message);
  }
});

const searchUsers = asynchandler(async (req, res) => {
  const { query, limit = 10, offset = 0 } = req.query;

  if (!query || query.trim() === '') {
    throw new ApiError(400, "Search query is required");
  }

  const searchQuery = query.trim();
  const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100 results
  const offsetNum = Math.max(parseInt(offset) || 0, 0);

  try {
    const usersList = await db.select().from(users)
      .where(or(
        ilike(users.fullName, `%${searchQuery}%`),
        ilike(users.email, `%${searchQuery}%`),
        ilike(users.subject, `%${searchQuery}%`)
      ))
      .limit(limitNum)
      .offset(offsetNum);

    const userResponses = usersList.map(user => excludeFields(user, ['passwordHash', 'refreshToken']));

    return res.status(200).json(
      new ApiResponse(200, { users: userResponses, total: userResponses.length }, "Users retrieved successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to search users: " + error.message);
  }
});

const exportUsers = asynchandler(async (req, res) => {
  const { format = 'json' } = req.query;

  try {
    const usersList = await db.select().from(users);
    const userResponses = usersList.map(user => excludeFields(user, ['passwordHash', 'refreshToken']));

    if (format.toLowerCase() === 'csv') {
      // Set CSV headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
      
      // Convert to CSV (simple implementation)
      const csvHeader = Object.keys(userResponses[0] || {}).join(',');
      const csvRows = userResponses.map(user => 
        Object.values(user).map(value => `"${value || ''}"`).join(',')
      );
      const csvContent = [csvHeader, ...csvRows].join('\n');
      
      return res.status(200).send(csvContent);
    }

    return res.status(200).json(
      new ApiResponse(200, { users: userResponses, total: userResponses.length }, "Users exported successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Failed to export users: " + error.message);
  }
});

export {
  Register,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getUserById,
  updateUserById,
  deleteUserById,
  generateAccessTokenAndRefreshToken,
  login,
  logout,
  BulkDeleteUsers,
  searchUsers,
  exportUsers,
  getUserStatus,
  getAllUserByRole,
  GettingAccessToken,
  updateUserStatus
};