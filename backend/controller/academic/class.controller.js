import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { classes,userClasses } from "../../db/schema.js";

// - GET /classes
// - GET /classes/:id
// - POST /classes
// - PUT /classes/:id
// - DELETE /classes/:id
// - GET /classes/teacher/:teacherId
// - POST /classes/:id/assign-teacher

const getAllClasses = asynchandler(async (req, res) => {
  const classesList = await db.select().from(classes);

  if (!classesList || classesList.length === 0) {
    throw new ApiError(404, "No classes found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Classes retrieved successfully", classesList));
});

const getClassById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const classData = await db.select().from(classes).where({ id }).first();

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success(classData, "Class retrieved successfully"));
});

const createClass = asynchandler(async (req, res) => {
  const { name, gradeLevel, academicYear } = req.body;

  if (!name || !gradeLevel || !academicYear) {
    throw new ApiError(400, "Name, gradeLevel and academicYear are required");
  }

  const newClass = await db
    .insert(classes)
    .values({ name, gradeLevel, academicYear })
    .returning("*");
  if (!newClass || newClass.length === 0) {
    throw new ApiError(500, "Failed to create class");
  }

  res
    .status(201)
    .json(ApiResponse.success("Class created successfully", newClass[0]));
});


const updateClass = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, gradeLevel, academicYear } = req.body;

  if (!name || !gradeLevel || !academicYear) {
    throw new ApiError(400, "Name, gradeLevel and academicYear are required");
  }

  const updatedClass = await db
    .update(classes)
    .set({ name, gradeLevel, academicYear })
    .where({ id })
    .returning("*");

  if (!updatedClass || updatedClass.length === 0) {
    throw new ApiError(404, "Class not found or update failed");
  }

  res
    .status(200)
    .json(ApiResponse.success(updatedClass[0], "Class updated successfully"));
});

const deleteClass = asynchandler(async (req, res) => {
  const { id } = req.params;

  const deletedClass = await db
    .delete(classes)
    .where({ id })
    .returning("*");

  if (!deletedClass || deletedClass.length === 0) {
    throw new ApiError(404, "Class not found");
  }

  res
    .status(200)
    .json(ApiResponse.success(deletedClass[0], "Class deleted successfully"));
});

const getClassesByTeacherId = asynchandler(async (req, res) => {
  const { teacherId } = req.params;

  const classesList = await db
    .select()
    .from(userClasses)
    .where({ user_id: teacherId });

  if (!classesList || classesList.length === 0) {
    throw new ApiError(404, "No classes found for this teacher");
  }
  
  return res
    .status(200)
    .json(ApiResponse.success(classesList, "Classes retrieved successfully"));
});

const assignTeacherToClass = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { teacherId } = req.body;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  const classData = await db.select().from(classes).where({ id }).first();
  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  const assignedTeacher = await db
    .insert(userClasses)
    .values({ class_id: id, user_id: teacherId })
    .returning("*");

  if (!assignedTeacher || assignedTeacher.length === 0) {
    throw new ApiError(500, "Failed to assign teacher to class");
  }

  return res
    .status(200)
    .json(ApiResponse.success(assignedTeacher[0], "Teacher assigned to class successfully"));
});

export {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByTeacherId,
  assignTeacherToClass
};