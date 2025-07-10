import { Router } from "express";
import userRoutes from './auth.routes.js';
import classRoutes from './class.routes.js';
import chapterRoutes from './chapter.routes.js';
import lessonRoutes from './lesson.routes.js';
import scheduleRoutes from './schedule.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.use('/auth', userRoutes);
router.use('/class', classRoutes);
router.use('/chapter', chapterRoutes);
router.use('/lesson', lessonRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/student', studentRoutes);

export default router;