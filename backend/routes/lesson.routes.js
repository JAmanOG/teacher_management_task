import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {completeLesson,createLesson,deleteLesson,getAllLessons,getLessonById,getLessonsByChapter,updateLesson} from "../controller/academic/lesson.controller.js";

const router = Router();

router.get("/lessons", auth.user, getAllLessons);
router.get("/lessons/:id", auth.user, getLessonById);
router.post("/lessons", auth.user, createLesson);
router.put("/lessons/:id", auth.user, updateLesson);
router.delete("/lessons/:id", auth.user, deleteLesson);
router.patch("/lessons/:id/complete", auth.user, completeLesson);
router.get("/lessons/chapter/:chapterId", auth.user, getLessonsByChapter);

export default router;