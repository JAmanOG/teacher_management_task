import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {createStudent,deleteStudent,getAllStudents,getStudentById,getStudentsByClass,updateStudent} from "../controller/academic/student.controller.js";

const router = Router();

router.get("/students", auth.user, getAllStudents);
router.get("/students/:id", auth.user, getStudentById);
router.post("/students", auth.user, createStudent);
router.put("/students/:id", auth.user, updateStudent);
router.delete("/students/:id", auth.user, deleteStudent);
router.get("/students/class/:classId", auth.user, getStudentsByClass);

export default router;