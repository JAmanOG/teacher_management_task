import { compare } from "bcryptjs";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";

export const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing passwords: " + error.message);
  }
};

export const generateAccessToken = user => {
  return jwt.sign(
    {
      _id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h"
    }
  );
};

export const generateRefreshToken = user => {
  return jwt.sign(
    {
      _id: user.id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d"
    }
  );
};

export const isPasswordCorrect = async (inputPassword, storedHashedPassword) => {
  return await bcrypt.compare(inputPassword, storedHashedPassword);
};

export const hashedPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error("Error hashing password: " + error.message);
  }
};

export const excludeFields = (obj, fieldsToExclude) => {
  const result = { ...obj };
  fieldsToExclude.forEach(field => delete result[field]);
  return result;
};
