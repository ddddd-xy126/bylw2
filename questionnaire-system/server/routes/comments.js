const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const { authenticate } = require("../middleware/auth");
const {
  validateComment,
  validateId,
  validatePagination,
} = require("../middleware/validator");

// 获取问卷的评论列表
router.get(
  "/survey/:surveyId",
  validatePagination,
  commentController.getComments
);

// 创建评论
router.post(
  "/survey/:surveyId",
  authenticate,
  validateComment,
  commentController.createComment
);

// 更新评论
router.put("/:id", authenticate, validateId, commentController.updateComment);

// 删除评论
router.delete(
  "/:id",
  authenticate,
  validateId,
  commentController.deleteComment
);

module.exports = router;
