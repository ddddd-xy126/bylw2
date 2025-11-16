const express = require("express");
const router = express.Router();
const answerController = require("../controllers/answerController");
const { authenticate } = require("../middleware/auth");
const { validateAnswer, validateId } = require("../middleware/validator");

// 获取答案列表(支持按用户ID筛选)
router.get("/", authenticate, answerController.getAnswers);

// 提交答案
router.post("/", authenticate, validateAnswer, answerController.submitAnswer);

// 获取答案详情
router.get("/:id", authenticate, validateId, answerController.getAnswerById);

// 获取用户在某个问卷的答案
router.get(
  "/survey/:surveyId",
  authenticate,
  answerController.getUserAnswerForSurvey
);

// 检查用户是否已经答过某个问卷
router.get(
  "/survey/:surveyId/check",
  authenticate,
  answerController.checkAnswered
);

// 删除答案
router.delete("/:id", authenticate, validateId, answerController.deleteAnswer);

module.exports = router;
