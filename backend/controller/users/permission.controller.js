import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { permissions,users } from "../../db/schema.js";

// - GET /permissions
// - GET /permissions/:id
// - POST /permissions
// - PUT /permissions/:id
// - DELETE /permissions/:id

export const getAllPermissions = asynchandler(async (req, res) => {
  const allPermissions = await db.select().from(permissions);
  if (!allPermissions || allPermissions.length === 0) {
    throw new ApiError(404, "No permissions found");
  }
  
  return res
    .status(200)
    .json(ApiResponse.success(allPermissions, "Permissions retrieved successfully"));
});

export const getPermissionById = asynchandler(async (req, res) => {
  const { id } = req.params;
  const permission = await db.select().from(permissions).where({ id }).first();
  if (!permission) {
    throw new ApiError(404, "Permission not found");
  }
  return res
    .status(200)
    .json(ApiResponse.success(permission, "Permission retrieved successfully"));
});

export const createPermission = asynchandler(async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }
    const newPermission = await db
        .insert(permissions)
        .values({ name, description })
        .returning("*");

    return res
        .status(201)
        .json(ApiResponse.success(newPermission[0], "Permission created successfully"));
});

export const updatePermission = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  const updatedPermission = await db
    .update(permissions)
    .set({ name, description })
    .where({ id })
    .returning("*");
  if (!updatedPermission || updatedPermission.length === 0) {
    throw new ApiError(404, "Permission not found");
  }
  return res
    .status(200)
    .json(ApiResponse.success(updatedPermission[0], "Permission updated successfully"));
});

export const deletePermission = asynchandler(async (req, res) => {
    const { id } = req.params;
    const deletedPermission = await db
        .delete(permissions)
        .where({ id })
        .returning("*");
    if (!deletedPermission || deletedPermission.length === 0) {
        throw new ApiError(404, "Permission not found");
    }
    return res
        .status(200)
        .json(ApiResponse.success(deletedPermission[0], "Permission deleted successfully"));
});
