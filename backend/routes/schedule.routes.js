import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import {createSchedule,deleteSchedule,getAllSchedules,getScheduleById,getSchedulesByClass,getSchedulesByDay,getSchedulesByTeacher,updateSchedule
} from "../controller/academic/schedule.controller.js";

const router = Router();

router.get("/schedules", auth.user, getAllSchedules);
router.get("/schedules/:id", auth.user, getScheduleById);
router.post("/schedules", auth.user, createSchedule);
router.put("/schedules/:id", auth.user, updateSchedule);
router.delete("/schedules/:id", auth.user, deleteSchedule);
router.get("/schedules/teacher/:teacherId", auth.user, getSchedulesByTeacher);
router.get("/schedules/day/:dayOfWeek", auth.user, getSchedulesByDay);
router.get("/schedules/class/:classId", auth.user, getSchedulesByClass);

export default router;