import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {assignTeacherToClass,createClass,deleteClass,getAllClasses,getClassById,getClassesByTeacherId,updateClass} from "../controller/academic/class.controller.js";

const router = Router();

router.get("/classes", auth.user, getAllClasses);
router.get("/classes/:id", auth.user, getClassById);
router.post("/classes", auth.user, createClass);
router.put("/classes/:id", auth.user, updateClass);
router.delete("/classes/:id", auth.user, deleteClass);
router.get("/classes/teacher/:teacherId", auth.user, getClassesByTeacherId);
router.post("/classes/:id/assign-teacher", auth.user, assignTeacherToClass);

export default router;