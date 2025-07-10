import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { users, chapters,studentSubjects,students } from "../../db/schema.js";

// - GET /dashboard/stats
// - GET /dashboard/teacher-stats
// - GET /dashboard/chapter-progress
// - GET /dashboard/attendance-summary
// - GET /dashboard/charts-data

const getDashboardStats = asynchandler(async (req, res) => {
    // Fetch total number of students
    const totalStudents = await db.$count().from(students).then(count => count[0].count);
    
    // Fetch total number of chapters
    const totalChapters = await db.$count().from(chapters).then(count => count[0].count);
    
    // Fetch total number of subjects
    const totalSubjects = await db.$count().from(studentSubjects).then(count => count[0].count);
    
    // Fetch total number of teachers
    const totalTeachers = await db.$count().from(users).where({ role: 'teacher' }).then(count => count[0].count);
    
    return res.status(200).json(ApiResponse.success("Dashboard stats retrieved successfully", {
        totalStudents,
        totalChapters,
        totalSubjects,
        totalTeachers
    }));
    });

const getTeacherStats = asynchandler(async (req, res) => {
    // Fetch total number of teachers
    const totalTeachers = await db.$count().from(users).where({ role: 'teacher' }).then(count => count[0].count);
    
    // Fetch total number of chapters taught by teachers
    const totalChaptersTaught = await db.$count().from(chapters).where({ teacherId: req.user.id }).then(count => count[0].count);
    
    return res.status(200).json(ApiResponse.success("Teacher stats retrieved successfully", {
        totalTeachers,
        totalChaptersTaught
    }));
});

const getChapterProgress = asynchandler(async (req, res) => {
    // Fetch chapter progress for the logged-in teacher
    const chaptersProgress = await db.select().from(chapters).where({ teacherId: req.user.id });
    
    if (!chaptersProgress || chaptersProgress.length === 0) {
        throw new ApiError(404, "No chapters found for this teacher");
    }
    
    return res.status(200).json(ApiResponse.success("Chapter progress retrieved successfully", chaptersProgress));
});
