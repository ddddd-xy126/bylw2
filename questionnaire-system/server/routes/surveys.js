const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");
const { authenticate, optionalAuth } = require("../middleware/auth");
const {
  validateSurvey,
  validateId,
  validatePagination,
} = require("../middleware/validator");

// 获取问卷列表（部分接口支持可选认证）
router.get("/", optionalAuth, validatePagination, surveyController.getSurveys);

// 获取用户创建的问卷（带状态筛选）
router.get("/user/:userId", authenticate, surveyController.getUserSurveys);

// 获取单个问卷详情
router.get("/:id", optionalAuth, validateId, surveyController.getSurveyById);

// 创建问卷（需要认证）
router.post("/", authenticate, validateSurvey, surveyController.createSurvey);

// 更新问卷
router.put("/:id", authenticate, validateId, surveyController.updateSurvey);
router.patch("/:id", authenticate, validateId, surveyController.updateSurvey);

// 删除问卷
router.delete("/:id", authenticate, validateId, surveyController.deleteSurvey);

// 获取问卷统计数据
router.get(
  "/:id/stats",
  authenticate,
  validateId,
  surveyController.getSurveyStats
);

// 收藏/取消收藏问卷
router.post(
  "/:id/favorite",
  authenticate,
  validateId,
  surveyController.toggleFavorite
);

// 检查是否收藏
router.get(
  "/:id/favorite/check",
  authenticate,
  validateId,
  surveyController.checkFavorite
);

module.exports = router;
