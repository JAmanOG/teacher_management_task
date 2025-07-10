import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { schedules } from "../../db/schema.js";

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
    .json(
      ApiResponse.success(
        res,
        "Schedules retrieved successfully",
        schedulesList
      )
    );
});

const getScheduleById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const schedule = await db.select().from(schedules).where({ id }).first();

  if (!schedule) {
    throw new ApiError(404, "Schedule not found");
  }

  return res
    .status(200)
    .json(
      ApiResponse.success(res, "Schedule retrieved successfully", schedule)
    );
});

const createSchedule = asynchandler(async (req, res) => {
  const { teacherId, classId, subject, room, dayOfWeek, startTime, endTime } =
    req.body;

  if (
    !teacherId ||
    !classId ||
    !subject ||
    !room ||
    !dayOfWeek ||
    !startTime ||
    !endTime
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const newSchedule = await db
    .insert(schedules)
    .values({
      teacherId,
      classId,
      subject,
      room,
      dayOfWeek,
      timeSlot: {
        startTime,
        endTime,
      },
    })
    .returning("*");

  return res
    .status(201)
    .json(
      ApiResponse.success(res, "Schedule created successfully", newSchedule[0])
    );
});

const updateSchedule = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { teacherId, classId, subject, room, dayOfWeek, startTime, endTime } =
    req.body;

  if (
    !teacherId ||
    !classId ||
    !subject ||
    !room ||
    !dayOfWeek ||
    !startTime ||
    !endTime
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
      timeSlot: { startTime, endTime },
    })
    .where({ id })
    .returning("*");

  if (!updatedSchedule || updatedSchedule.length === 0) {
    throw new ApiError(404, "Schedule not found");
  }

  return res
    .status(200)
    .json(
      ApiResponse.success(
        res,
        "Schedule updated successfully",
        updatedSchedule[0]
      )
    );
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
    .json(
      ApiResponse.success(
        res,
        "Schedule deleted successfully",
        deletedSchedule[0]
      )
    );
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
    .json(
      ApiResponse.success(res, "Schedules retrieved successfully", schedulesList)
    );
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
    .json(
      ApiResponse.success(res, "Schedules retrieved successfully", schedulesList)
    );
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
    .json(
      ApiResponse.success(res, "Schedules retrieved successfully", schedulesList)
    );
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