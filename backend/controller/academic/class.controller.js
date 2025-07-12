import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { classes,userClasses } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

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
    .json(new ApiResponse(200, classesList, "Classes retrieved successfully"));
});

const getClassById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const classData = await db.select().from(classes).where({ id }).first();

  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, classData, "Class retrieved successfully"));
});

const createClass = asynchandler(async (req, res) => {
  const {
    name,
    gradeLevel,
    academicYear,
    section,
    capacity,
    classTeacherId,
    room,
    description,
    subjects,
  } = req.body;

  console.log("Creating class with data:", req.body);

  if (
    !name ||
    !gradeLevel ||
    !academicYear ||
    !section ||
    !capacity ||
    !classTeacherId ||
    !room ||
    !description
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const sanitizedSubjects = Array.isArray(subjects) ? subjects : [];

  console.log("Sanitized subjects:", sanitizedSubjects);
  console.log("typeof subjects:", typeof subjects);
  console.log("Array.isArray(subjects):", Array.isArray(subjects));

  const newClass = await db
    .insert(classes)
    .values({
      name,
      gradeLevel,
      academicYear,
      section,
      capacity,
      classTeacherId,
      room,
      description,
      subjects: sanitizedSubjects,
    })
    .returning();

  if (!newClass[0]) {
    throw new ApiError(500, "Failed to create class");
  }

  const responseData = {
    id: newClass[0].id,
    name: newClass[0].name,
    gradeLevel: newClass[0].gradeLevel,
    academicYear: newClass[0].academicYear,
    section: newClass[0].section,
    capacity: newClass[0].capacity,
    classTeacherId: newClass[0].classTeacherId,
    room: newClass[0].room,
    description: newClass[0].description,
    subjects: newClass[0].subjects,
  };

  console.log("Class created successfully:", responseData);

  res
    .status(201)
    .json(new ApiResponse(200,responseData, "Class created successfully"));
});

const updateClass = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { name, gradeLevel, academicYear, section, capacity, classTeacherId, room, description, subjects } = req.body;

  console.log("Updating class with ID:", id, "and data:", req.body);

  if (!name || !gradeLevel || !academicYear || !section || !capacity || !classTeacherId || !room || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const sanitizedSubjects = Array.isArray(subjects) ? subjects : [];

  console.log("Sanitized subjects:", sanitizedSubjects);
  console.log("typeof subjects:", typeof subjects);
  console.log("Array.isArray(subjects):", Array.isArray(subjects));
  

  const updatedClass = await db
  .update(classes)
  .set({
    name,
    gradeLevel,
    academicYear,
    section,
    capacity,
    classTeacherId,
    room,
    description,
    subjects: sanitizedSubjects,
  })
  .where(eq(classes.id, id))
  .returning(); 

  if (!updatedClass || updatedClass.length === 0) {
    throw new ApiError(404, "Class not found or update failed");
  }
  console.log("Class updated successfully:", updatedClass[0]);
  const responseData = {
    id: updatedClass[0].id,
    name: updatedClass[0].name,
    gradeLevel: updatedClass[0].gradeLevel,
    academicYear: updatedClass[0].academicYear,
    section: updatedClass[0].section,
    capacity: updatedClass[0].capacity,
    classTeacherId: updatedClass[0].classTeacherId,
    room: updatedClass[0].room,
    description: updatedClass[0].description,
    subjects: updatedClass[0].subjects,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Class updated successfully"));
});

const deleteClass = asynchandler(async (req, res) => {
  const { id } = req.params;

  const deletedClass = await db
    .delete(classes)
    .where(eq(classes.id, id))
    .returning();

  if (!deletedClass || deletedClass.length === 0) {
    throw new ApiError(404, "Class not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedClass[0], "Class deleted successfully"));
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
    .json(new ApiResponse(200, classesList, "Classes retrieved successfully"));
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
    .json(new ApiResponse(200, assignedTeacher[0], "Teacher assigned to class successfully"));
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