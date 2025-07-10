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
} from "../helper/funchelper";
import { userRoles } from "../../db/schema.js";

// TODO: Implement role management logic