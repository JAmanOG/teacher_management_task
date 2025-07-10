import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {createChapter,deleteChapter,getAllChapters,getChapterById,getChaptersByClass,getChaptersBySubject,getChaptersByTeacher,updateChapter,updateChapterProgress,updateChapterStatus} from "../controller/academic/chapter.controller.js";

const router = Router();

router.get("/chapters", auth.user, getAllChapters);
router.get("/chapters/:id", auth.user, getChapterById);
router.post("/chapters", auth.user, createChapter);
router.put("/chapters/:id", auth.user, updateChapter);
router.delete("/chapters/:id", auth.user, deleteChapter);
router.patch("/chapters/:id/status", auth.user, updateChapterStatus);
router.get("/chapters/teacher/:teacherId", auth.user, getChaptersByTeacher);
router.get("/chapters/subject/:subject", auth.user, getChaptersBySubject);
router.get("/chapters/class/:classId", auth.user, getChaptersByClass);
router.patch("/chapters/:id/progress", auth.user, updateChapterProgress);

export default router;