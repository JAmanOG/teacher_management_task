import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { lessons, chapters } from "../../db/schema.js";
import { eq } from "drizzle-orm";

// - GET /lessons
// - GET /lessons/:id
// - POST /lessons
// - PUT /lessons/:id
// - DELETE /lessons/:id
// - PATCH /lessons/:id/complete
// - GET /lessons/chapter/:chapterId

const getAllLessons = asynchandler(async (req, res) => {
  const { chapterId } = req.query;

  let query = db.select().from(lessons);

  if (chapterId) {
    query = query.where("chapterId", chapterId);
  }

  const lessonsList = await query;
  if (!lessonsList || lessonsList.length === 0) {
    throw new ApiError(404, "No lessons found");
  }
  
  return res
    .status(200)
    .json(new ApiResponse(200, lessonsList, "Lessons retrieved successfully"));
  
});

const getLessonById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const lesson = await db.select().from(lessons).where({ id }).first();

  if (!lesson) {
    throw new ApiError(404, "Lesson not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, lesson, "Lesson retrieved successfully"));
});

const createLesson = asynchandler(async (req, res) => {
  const { title, chapterId, isCompleted, notes, duration } = req.body;

  console.log("Creating lesson with data:", req.body);

  if (!title || !chapterId || !notes || !duration) {
    throw new ApiError(
      400,
      "Title, chapterId, notes and duration are required"
    );
  }

  const chapter = await db.select().from(chapters).where(eq(chapters.id, chapterId)).limit(1);
  if (!chapter || chapter.length === 0) {
    throw new ApiError(404, "Chapter not found");
  }


  const newLesson = await db
    .insert(lessons)
    .values({ 
      title, 
      chapterId,
      isCompleted,
      notes, 
      duration 
    })
    .returning();

  if (!newLesson || newLesson.length === 0) {
    throw new ApiError(500, "Failed to create lesson");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newLesson[0], "Lesson created successfully"));
});


const updateLesson = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { title, chapterId, notes, duration, isCompleted, completedDate } = req.body;

  console.log("Updating lesson with ID:", id);
  console.log("Update data:", req.body);

  if (!title || !chapterId || !notes || !duration) {
    throw new ApiError(
      400,
      "Title, chapterId, notes and duration are required"
    );
  }

  const updatedLesson = await db
    .update(lessons)
    .set({ title, chapterId, notes, duration, isCompleted, completedDate: completedDate ? new Date(completedDate) : undefined })
    .where(eq(lessons.id, id))
    .returning();

  if (!updatedLesson || updatedLesson.length === 0) {
    throw new ApiError(404, "Lesson not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLesson[0], "Lesson updated successfully"));
});

const deleteLesson = asynchandler(async (req, res) => {
  const { id } = req.params;

  const deletedLesson = await db.delete(lessons).where(
    eq(lessons.id, id)
  ).returning();

  if (!deletedLesson || deletedLesson.length === 0) {
    throw new ApiError(404, "Lesson not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deletedLesson[0], "Lesson deleted successfully")
    );
});

const completeLesson = asynchandler(async (req, res) => {
  const { id } = req.params;

  const updatedLesson = await db
    .update(lessons)
    .set({ isCompleted: true, completedDate: new Date() })
    .where({ id })
    .returning("*");

  if (!updatedLesson || updatedLesson.length === 0) {
    throw new ApiError(404, "Lesson not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedLesson[0], "Lesson marked as completed"));
});

const getLessonsByChapter = asynchandler(async (req, res) => {
  const { chapterId } = req.params;

  if (!chapterId) {
    throw new ApiError(400, "Chapter ID is required");
  }

  const chapter = await db.select().from(chapters).where({ id: chapterId }).first();
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  const lessonsList = await db
    .select()
    .from(lessons)
    .where({ chapterId });

  if (!lessonsList || lessonsList.length === 0) {
    throw new ApiError(404, "No lessons found for this chapter");
  }
    return res
        .status(200)
        .json(new ApiResponse(200, lessonsList, "Lessons retrieved successfully"));
});

export {
  getAllLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
  getLessonsByChapter,
  getLessonById
};
