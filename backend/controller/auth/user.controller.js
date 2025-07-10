import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
  comparePassword,
  isPasswordCorrect,
  hashedPassword,
  excludeFields,
} from "../../helper/funchelper.js";
import { users } from "../../db/schema.js";

// const isUserExists = await db.select().from(users).where(users.email.eq(user.email)).first();

const isUserExists = async (id) => {
  const user = await db.select().from(users).where(users.id.eq(id)).first();
  return user;
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
      .where(users.id.eq(user.id));
  } catch (error) {
    throw new ApiError(500, "Error generating tokens: " + error.message);
  }

  return { accessToken, refreshToken };
};

const Register = asynchandler(async (req, res) => {
    const { email, password, fullName, phoneNumber,subject,role,status,permissions } = req.body;

    if (!email || !password || !fullName || !role) {
        throw new ApiError(400, "Required fields missing");
    }

    const existingUser = await db.select().from(users).where(users.email.eq(email)).first();
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }

    let finalPermissions = [];
    if (permissions && Array.isArray(permissions)) {
        finalPermissions = permissions;
    }else{
        const rolePermissionMap = {
            "Teacher": ["view_teachers", "view_lessons", "edit_lessons"],
            "Head Teacher": ["view_teachers", "add_teachers", "edit_teachers", "view_lessons", "edit_lessons", "view_reports"],
            "Admin": ["view_teachers", "add_teachers", "edit_teachers", "delete_teachers", "manage_roles", "view_lessons", "edit_lessons", "view_reports", "export_data"],
            "Principal": ["view_teachers", "add_teachers", "edit_teachers", "delete_teachers", "manage_roles", "view_lessons", "edit_lessons", "view_reports", "export_data", "manage_system"]
        };
        finalPermissions = rolePermissionMap[role] || [];
    }

    // Hash password
    const hashedPwd = await hashedPassword(password);

    // Create new user
    const newUser = await db.insert(users).values({
        email,
        passwordHash: hashedPwd,
        fullName,
        phoneNumber,
        subject,
        role,
        status: status || "Active",
        permissions: JSON.stringify(finalPermissions),
        joinDate: new Date(),
    }).returning();

    const userResponse = excludeFields(newUser[0], ['passwordHash', 'refreshToken']);

    return res.status(201).json(
        new ApiResponse(201, userResponse, "User registered successfully")
    );
});

// - GET /users/profile
// - PUT /users/profile
// - POST /users/change-password
// - GET /users/:id
// - PUT /users/:id
// - DELETE /users/:id

const getUserProfile = asynchandler(async (req, res) => {
    const userId = req.user.id;
    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(user, ['passwordHash', 'refreshToken']);
    return res.status(200).json(
        new ApiResponse(200, userResponse, "User profile retrieved successfully")
    );
});

const updateUserProfile = asynchandler(async (req, res) => {
    const userId = req.user.id;
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const { fullName, phoneNumber, email, subject, role, status } = req.body;

    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if(fullName === undefined || phoneNumber === undefined || email === undefined || subject === undefined || role === undefined || status === undefined) {
        throw new ApiError(400, "Required fields missing");
    }

    const updatedUser = await db.update(users)
        .set({
            fullName,
            phoneNumber,
            email,
            subject,
            role,
            status
        })
        .where(users.id.eq(userId))
        .returning();

    if (updatedUser.length === 0) {
        throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    return res.status(200).json(
        new ApiResponse(200, userResponse, "User profile updated successfully")
    );
});

const changeUserPassword = asynchandler(async (req, res) => {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, "Old password is incorrect");
    }

    const hashedPwd = await hashedPassword(newPassword);

    await db.update(users)
        .set({ passwordHash: hashedPwd })
        .where(users.id.eq(userId));

    return res.status(200).json(
        new ApiResponse(200, null, "Password changed successfully")
    );
});

const getUserById = asynchandler(async (req, res) => {
    const userId = req.params.id;

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
    const { fullName, phoneNumber, email, subject, role, status } = req.body;

    if (!fullName || !phoneNumber || !email || !subject || !role || !status) {
        throw new ApiError(400, "Required fields missing");
    }

    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updatedUser = await db.update(users)
        .set({
            fullName,
            phoneNumber,
            email,
            subject,
            role,
            status
        })
        .where(users.id.eq(userId))
        .returning();

    if (updatedUser.length === 0) {
        throw new ApiError(404, "User not found");
    }

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    return res.status(200).json(
        new ApiResponse(200, userResponse, "User updated successfully")
    );
});

const deleteUserById = asynchandler(async (req, res) => {
    const userId = req.params.id;

    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await db.delete(users).where(users.id.eq(userId));

    return res.status(200).json(
        new ApiResponse(200, null, "User deleted successfully")
    );
});

const login = asynchandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await db.select().from(users).where(users.email.eq(email)).first();
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user);
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
    const userResponse = excludeFields(user, ['passwordHash', 'refreshToken']);
    return res.status(200).json(
        new ApiResponse(200, { user: userResponse, accessToken }, "Login successful")
    );
});

const logout = asynchandler(async (req, res) => {
    const userId = req.user.id;
    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    await db.update(users).set({ refreshToken: null }).where(users.id.eq(userId));

    res.clearCookie("refreshToken");
    return res.status(200).json(
        new ApiResponse(200, null, "Logout successful")
    );
});

// - PATCH /users/:id/status
// - GET /users/search
// - POST /users/bulk-delete
// - GET /users/export
// - PATCH /users/:id/profile

const getUserStatus = asynchandler(async (req, res) => {
    const userId = req.params.id;

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

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const user = await isUserExists(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const updatedUser = await db.update(users)
        .set({ status })
        .where(users.id.eq(userId))
        .returning();

    const userResponse = excludeFields(updatedUser[0], ['passwordHash', 'refreshToken']);

    if (updatedUser.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, { status: userResponse.status }, "User status updated successfully")
    );
});

const BulkDeleteUsers = asynchandler(async (req, res) => {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new ApiError(400, "User IDs are required for bulk delete");
    }

    const deletedUsers = await db.delete(users).where(users.id.in(userIds)).returning();

    if (deletedUsers.length === 0) {
        throw new ApiError(404, "No users found to delete");
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Users deleted successfully")
    );
});

const searchUsers = asynchandler(async (req, res) => {
    const { query } = req.query;

    if (!query) {
        throw new ApiError(400, "Search query is required");
    }

    const usersList = await db.select().from(users)
        .where(users.fullName.ilike(`%${query}%`)
            .or(users.email.ilike(`%${query}%`)))
        .returning();

    const userResponses = usersList.map(user => excludeFields(user, ['passwordHash', 'refreshToken']));

    return res.status(200).json(
        new ApiResponse(200, userResponses, "Users retrieved successfully")
    );
});

const exportUsers = asynchandler(async (req, res) => {
    const usersList = await db.select().from(users).returning();

    const userResponses = usersList.map(user => excludeFields(user, ['passwordHash', 'refreshToken']));

    // Here you can implement the logic to export the data in the desired format (CSV, JSON, etc.)
    // For simplicity, we will return the data as JSON
    return res.status(200).json(
        new ApiResponse(200, userResponses, "Users exported successfully")
    );
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
    updateUserStatus
};