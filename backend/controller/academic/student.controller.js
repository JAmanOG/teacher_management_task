import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { students, studentSubjects } from "../../db/schema.js";

// - GET /students
// - GET /students/:id
// - POST /students
// - PUT /students/:id
// - DELETE /students/:id
// - GET /students/class/:classId
// - GET /students/teacher/:teacherId
// - POST /students/bulk-import

const getAllStudents = asynchandler(async (req, res) => {
  const studentsList = await db.select().from(students);

  if (!studentsList || studentsList.length === 0) {
    throw new ApiError(404, "No students found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Students retrieved successfully", studentsList));
});

const getStudentById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const student = await db.select().from(students).where({ id }).first();

  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Student retrieved successfully", student));
});

const createStudent = asynchandler(async (req, res) => {
  const { fullName, email,classId, avatar, overallGrade,attendanceRate } = req.body;
    if (!fullName || !email || !classId) {
        throw new ApiError(400, "Full name, email and classId are required");
    }

    const newStudent = await db.insert(students)
        .values({ fullName, email, classId, avatar, overallGrade, attendanceRate })
        .returning("*");
    if (!newStudent || newStudent.length === 0) {
        throw new ApiError(500, "Failed to create student");
    }
    return res
        .status(201)
        .json(ApiResponse.success("Student created successfully", newStudent[0]));
});

const updateStudent = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, email, classId, avatar, overallGrade, attendanceRate } = req.body;

  if (!fullName || !email || !classId) {
    throw new ApiError(400, "Full name, email and classId are required");
  }

  const updatedStudent = await db
    .update(students)
    .set({ fullName, email, classId, avatar, overallGrade, attendanceRate })
    .where({ id })
    .returning("*");

  if (!updatedStudent || updatedStudent.length === 0) {
    throw new ApiError(404, "Student not found or update failed");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Student updated successfully", updatedStudent[0]));
});

const deleteStudent = asynchandler(async (req, res) => {
  const { id } = req.params;

  const deletedStudent = await db
    .delete(students)
    .where({ id })
    .returning("*");

  if (!deletedStudent || deletedStudent.length === 0) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Student deleted successfully", deletedStudent[0]));
});

const getStudentsByClass = asynchandler(async (req, res) => {
  const { classId } = req.params;

  const studentsList = await db
    .select()
    .from(students)
    .where({ classId });

  if (!studentsList || studentsList.length === 0) {
    throw new ApiError(404, "No students found for this class");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Students retrieved successfully", studentsList));
});

// TODO: later other things 

export {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getStudentsByClass
}