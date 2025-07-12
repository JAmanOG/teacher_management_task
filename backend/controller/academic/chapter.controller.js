import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { chapters, checkinRecords } from "../../db/schema.js";
import { eq } from "drizzle-orm";

// - GET /chapters (with filters: subject, status, teacher, class)
// - GET /chapters/:id
// - POST /chapters
// - PUT /chapters/:id
// - DELETE /chapters/:id
// - PATCH /chapters/:id/status
// - GET /chapters/teacher/:teacherId
// - GET /chapters/subject/:subject
// - GET /chapters/class/:classId
// - PATCH /chapters/:id/progress

const getAllChapters = asynchandler(async (req, res) => {
  const { subject, status, teacher, classId } = req.query;

  //   let query = chapters.find();
  let query = db.select().from(chapters);

  if (subject) {
    query = query.where("subject", subject);
  }
  if (status) {
    query = query.where("status", status);
  }
  if (teacher) {
    query = query.where("teacher", teacher);
  }
  if (classId) {
    query = query.where("classId", classId);
  }

  const chaptersList = await query.execute();

  res
    .status(200)
    .json(new ApiResponse(200, chaptersList, "Chapters retrieved successfully"));
});

const getChapterById = asynchandler(async (req, res) => {
  //   const chapter = await chapters.findById(req.params.id);
  const chapter = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, req.params.id))

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, chapter, "Chapter retrieved successfully"));
});

const createChapter = asynchandler(async (req, res) => {
  const {
    title,
    subject,
    classId,
    teacherId,
    status,
    totalLessons,
    completedLessons,
    dueDate,
    description,
    objectives,
    resources,
    difficulty,
  } = req.body;

  console.log("Creating chapter with data:", req.body);

  if (!title || !subject || !classId || !teacherId) {
    throw new ApiError(
      400,
      "Title, subject, classId, and teacher are required"
    );
  }

  const newChapter = await db
    .insert(chapters)
    .values({
      title,
      subject,
      teacherId: teacherId,
      classId,
      status: status || "draft",
      totalLessons,
      completedLessons,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
      objectives: objectives || [],
      resources: resources || [],
      difficulty,
    })
    .returning();

  res
    .status(201)
    .json(new ApiResponse(201, newChapter[0], "Chapter created successfully"));
});

const updateChapter = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { title, subject, classId, teacherId, status, totalLessons, completedLessons, difficulty, dueDate, description, objectives, resources } = req.body;

  const chapter = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, id))
    
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }
  if (chapter.teacherId && chapter.teacherId.toString() !== req.user.id) {
    throw new ApiError(
      403,
      "You do not have permission to update this chapter"
    );
  }

  if (!title || !subject || !classId || !teacherId) {
    throw new ApiError(
      400,
      "Title, subject, classId, and teacher are required"
    );
  }

  const updatedChapter = await db
    .update(chapters)
    .set({
      title,
      subject,
      classId,
      teacherId,
      totalLessons,
      completedLessons,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      description,
      objectives: objectives || [],
      resources: resources || [],
      difficulty,
      status: status || chapter.status,
    })
    .where(eq(chapters.id, id))
    .returning();

  res
    .status(200)
    .json(new ApiResponse(200, updatedChapter[0], "Chapter updated successfully"));
});

const deleteChapter = asynchandler(async (req, res) => {
  const { id } = req.params;

  const chapter = await db.select().from(chapters).where(eq(chapters.id, id))
  console.log("Deleting chapter with ID:", id);
  console.log("Chapter data:", chapter);
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }
  if (chapter.teacherId && chapter.teacherId.toString() !== req.user.id) {
    throw new ApiError(
      403,
      "You do not have permission to delete this chapter"
    );
  }

  await db.delete(chapters).where(eq(chapters.id, id));

  res.status(200).json(new ApiResponse(200, null, "Chapter deleted successfully"));
});

const updateChapterStatus = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { status, teacherId } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  //   const chapter = await chapters.findById(id);
  const chapter = await db.select().from(chapters).where({ id }).first();
  if (teacherId && chapter.teacher.toString() !== teacherId) {
    throw new ApiError(
      403,
      "You do not have permission to update this chapter"
    );
  }
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  //   chapter.status = status;
  //   await chapter.save();
  const updatedChapter = await db
    .update(chapters)
    .set({ status })
    .where({ id })
    .returning("*");
  if (!updatedChapter || updatedChapter.length === 0) {
    throw new ApiError(404, "Chapter not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedChapter[0], "Chapter status updated successfully")
    );
});

const getChaptersByTeacher = asynchandler(async (req, res) => {
  const { teacherId } = req.params;

  //   const chaptersList = await chapters.find({ teacher: teacherId });
  const chaptersList = await db
    .select()
    .from(chapters)
    .where("teacherId", teacherId);

  if (!chaptersList || chaptersList.length === 0) {
    throw new ApiError(404, "No chapters found for this teacher");
  }

  res
    .status(200)
    .json(new ApiResponse(200, chaptersList, "Chapters retrieved successfully"));
});

const getChaptersBySubject = asynchandler(async (req, res) => {
  const { subject } = req.params;

  //   const chaptersList = await chapters.find({ subject });
  const chaptersList = await db
    .select()
    .from(chapters)
    .where("subject", subject);

  if (!chaptersList || chaptersList.length === 0) {
    throw new ApiError(404, "No chapters found for this subject");
  }

  res
    .status(200)
    .json(new ApiResponse(200, chaptersList, "Chapters retrieved successfully"));
});

const getChaptersByClass = asynchandler(async (req, res) => {
  const { classId } = req.params;

  //   const chaptersList = await chapters.find({ classId });
  const chaptersList = await db
    .select()
    .from(chapters)
    .where("classId", classId);

  if (!chaptersList || chaptersList.length === 0) {
    throw new ApiError(404, "No chapters found for this class");
  }

  res
    .status(200)
    .json(new ApiResponse(200, chaptersList, "Chapters retrieved successfully"));
});

const updateChapterProgress = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  if (progress === undefined || progress < 0 || progress > 100) {
    throw new ApiError(400, "Progress must be a number between 0 and 100");
  }

  const chapter = await db.select().from(chapters).where({ id }).first();
  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  chapter.progress = progress;
  const updatedChapter = await db
    .update(chapters)
    .set({ progress })
    .where({ id })
    .returning("*");

  if (!updatedChapter || updatedChapter.length === 0) {
    throw new ApiError(404, "Chapter not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedChapter[0],
        "Chapter progress updated successfully"
      )
    );
});

export {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  updateChapterStatus,
  getChaptersByTeacher,
  getChaptersBySubject,
  getChaptersByClass,
  updateChapterProgress,
};
