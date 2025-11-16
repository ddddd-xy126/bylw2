const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const { validateId, validatePagination } = require("../middleware/validator");

// 获取所有用户列表（支持分页和排序）
router.get("/", userController.getAllUsers);

// 获取单个用户
router.get("/:id", userController.getUserById);

// 更新用户（支持 PATCH）
router.patch("/:id", authenticate, userController.updateUser);

// 获取用户资料
router.get("/profile/:id?", authenticate, userController.getProfile);

// 更新用户资料
router.put("/profile", authenticate, userController.updateProfile);

// 修改密码
router.put("/password", authenticate, userController.changePassword);

// 获取用户统计
router.get("/stats/:id?", authenticate, userController.getUserStats);

// 获取用户的问卷列表
router.get(
  "/surveys/:id?",
  authenticate,
  validatePagination,
  userController.getUserSurveys
);

// 获取用户的答题记录
router.get(
  "/answers/:id?",
  authenticate,
  validatePagination,
  userController.getUserAnswers
);

// 获取用户的收藏列表
router.get(
  "/favorites/:id?",
  authenticate,
  validatePagination,
  userController.getUserFavorites
);

// 获取用户的积分历史
router.get(
  "/points/:id?",
  authenticate,
  validatePagination,
  userController.getPointHistory
);

module.exports = router;
