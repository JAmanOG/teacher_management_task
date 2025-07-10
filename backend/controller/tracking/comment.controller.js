import { asynchandler } from "../../utils/asynchandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";
import db from "../../db/indexDb.js";
import { comments } from "../../db/schema.js";


// - GET /comments
// - GET /comments/:id
// - POST /comments
// - PUT /comments/:id
// - DELETE /comments/:id
// - GET /comments/chapter/:chapterId
// - GET /comments/author/:authorId

const getAllComments = asynchandler(async (req, res) => {
  const commentsList = await db.select().from(comments);

  if (!commentsList || commentsList.length === 0) {
    throw new ApiError(404, "No comments found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comments retrieved successfully", commentsList));
});

const getCommentById = asynchandler(async (req, res) => {
  const { id } = req.params;

  const comment = await db.select().from(comments).where({ id }).first();

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comment retrieved successfully", comment));
});

const createComment = asynchandler(async (req, res) => {

    // TODO: only higher authority can create comment
    const { content, chapterId, authorId, priority } = req.body;
    if (!content || !chapterId || !authorId) {
        throw new ApiError(400, "Content, chapterId and authorId are required");
    }

    const newComment = await db.insert(comments)
        .values({ content, chapterId, authorId, priority })
        .returning("*");
    if (!newComment || newComment.length === 0) {
        throw new ApiError(500, "Failed to create comment");
    }

    return res
        .status(201)
        .json(ApiResponse.success("Comment created successfully", newComment[0]));
});

const updateComment = asynchandler(async (req, res) => {
  const { id } = req.params;
  const { content, chapterId, authorId, priority } = req.body;

  if (!content || !chapterId || !authorId) {
    throw new ApiError(400, "Content, chapterId and authorId are required");
  }

  const updatedComment = await db
    .update(comments)
    .set({ content, chapterId, authorId, priority })
    .where({ id })
    .returning("*");

  if (!updatedComment || updatedComment.length === 0) {
    throw new ApiError(404, "Comment not found or failed to update");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comment updated successfully", updatedComment[0]));
});

const deleteComment = asynchandler(async (req, res) => {
  const { id } = req.params;

  const deletedComment = await db
    .delete(comments)
    .where({ id })
    .returning("*");

  if (!deletedComment || deletedComment.length === 0) {
    throw new ApiError(404, "Comment not found or failed to delete");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comment deleted successfully", deletedComment[0]));
});

const getCommentsByChapterId = asynchandler(async (req, res) => {
  const { chapterId } = req.params;

  const commentsList = await db
    .select()
    .from(comments)
    .where({ chapterId });

  if (!commentsList || commentsList.length === 0) {
    throw new ApiError(404, "No comments found for this chapter");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comments retrieved successfully", commentsList));
});

const getCommentsByAuthorId = asynchandler(async (req, res) => {
  const { authorId } = req.params;

  const commentsList = await db
    .select()
    .from(comments)
    .where({ authorId });

  if (!commentsList || commentsList.length === 0) {
    throw new ApiError(404, "No comments found for this author");
  }

  return res
    .status(200)
    .json(ApiResponse.success("Comments retrieved successfully", commentsList));
});
export {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByChapterId,
  getCommentsByAuthorId
};