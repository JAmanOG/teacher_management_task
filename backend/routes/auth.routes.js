import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {BulkDeleteUsers,Register,changeUserPassword,deleteUserById,exportUsers,getUserById,getUserProfile,getUserStatus,login,logout,searchUsers,updateUserById,updateUserProfile,updateUserStatus} from "../controller/auth/user.controller.js";

const router = Router();

router.post("/register", Register);
router.post("/login", login);
router.post("/logout", auth.user, logout);
router.get("/profile", auth.user, getUserProfile);
router.get("/profile/:id", auth.user, getUserById);
router.put("/users/profile", auth.user, updateUserProfile);
router.put("/profile/:id", auth.user, updateUserById);
router.patch("/profile/:id/status", auth.user, updateUserStatus);
router.post("/profile/:id/change-password", auth.user, changeUserPassword);
router.get("/profile/:id/status", auth.user, getUserStatus);
router.get("/search", auth.user, searchUsers);
router.delete("/profile/:id", auth.user, deleteUserById);
router.post("/bulk-delete", auth.user, BulkDeleteUsers);
router.get("/export", auth.user, exportUsers);

export default router;