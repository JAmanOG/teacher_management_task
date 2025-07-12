import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { schedules } from "../../db/schema.js";
import { eq } from "drizzle-orm";

// - GET /schedules
// - GET /schedules/:id
// - POST /schedules
// - PUT /schedules/:id
// - DELETE /schedules/:id
// - GET /schedules/teacher/:teacherId
// - GET /schedules/day/:dayOfWeek
// - GET /schedules/class/:classId

const getAllSchedules = asynchandler(async (req, res) => {
  const { teacherId, dayOfWeek, classId, subject, room } = req.query;

  let query = db.select().from(schedules);

  if (teacherId) {
    query = query.where("teacherId", teacherId);
  }
  if (dayOfWeek) {
    query = query.where("dayOfWeek", dayOfWeek);
  }
  if (classId) {
    query = query.where("classId", classId);
  }
  if (subject) {
    query = query.where("subject", subject);
  }
  if (room) {
    query = query.where("room", room);
  }

  const schedulesList = await query;

  return res
    .status(200)
    .json(new ApiResponse(200, schedulesList, "Schedules retrieved successfully")); 
});

const getScheduleById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const schedule = await db.select().from(schedules).where({ id }).first();

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, schedule, "Schedule retrieved successfully"));
});

const createSchedule = asynchandler(async (req, res) => {
  const { teacherId, classId, subject, room, dayOfWeek, timeSlot } =
    req.body;

  if (
    !teacherId ||
    !classId ||
    !subject ||
    !room ||
    !dayOfWeek ||
    !timeSlot ) {
    throw new ApiError(400, "All fields are required");
  }
  
  console.log("body", req.body);

  const newSchedule = await db
    .insert(schedules)
    .values({
      teacherId,
      classId,
      subject,
      room,
      dayOfWeek,
      timeSlot: timeSlot,
    })
    .returning();

  return res
    .status(201)
    .json(new ApiResponse(201, newSchedule[0], "Schedule created successfully"));
});

const updateSchedule = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { teacherId, classId, subject, room, dayOfWeek, timeSlot } =
    req.body;

  if (
    !teacherId ||
    !classId ||
    !subject ||
    !room ||
    !dayOfWeek ||
    !timeSlot
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedSchedule = await db
    .update(schedules)
    .set({
      teacherId,
      classId,
      subject,
      room,
      dayOfWeek,
      timeSlot,
    })
    .where(eq(schedules.id, id))
    .returning();

  if (!updatedSchedule || updatedSchedule.length === 0) {
    throw new ApiError(404, "Schedule not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSchedule[0], "Schedule updated successfully"));
});

const deleteSchedule = asynchandler(async (req, res) => {
  const { id } = req.params;
  const deletedSchedule = await db
    .delete(schedules)
    .where({ id })
    .returning("*");

  if (!deletedSchedule || deletedSchedule.length === 0) {
    throw new ApiError(404, "Schedule not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedSchedule[0], "Schedule deleted successfully"));
});

const getSchedulesByTeacher = asynchandler(async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }


  const schedulesList = await db
    .select()
    .from(schedules)
    .where({ teacherId });

  if (!schedulesList || schedulesList.length === 0) {
    throw new ApiError(404, "No schedules found for this teacher");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, schedulesList, "Schedules retrieved successfully"));
});

const getSchedulesByDay = asynchandler(async (req, res) => {
  const { dayOfWeek } = req.params;

  if (!dayOfWeek) {
    throw new ApiError(400, "Day of the week is required");
  }

  const schedulesList = await db
    .select()
    .from(schedules)
    .where({ dayOfWeek });

  if (!schedulesList || schedulesList.length === 0) {
    throw new ApiError(404, "No schedules found for this day");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, schedulesList, "Schedules retrieved successfully"));
});

const getSchedulesByClass = asynchandler(async (req, res) => {
  const { classId } = req.params;

  if (!classId) {
    throw new ApiError(400, "Class ID is required");
  }

  const schedulesList = await db
    .select()
    .from(schedules)
    .where({ classId });

  if (!schedulesList || schedulesList.length === 0) {
    throw new ApiError(404, "No schedules found for this class");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, schedulesList, "Schedules retrieved successfully"));
});

export {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByTeacher,
  getSchedulesByDay,
  getSchedulesByClass,
};