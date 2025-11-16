const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validateId } = require("../middleware/validator");

// 获取所有分类（公开）
router.get("/", categoryController.getCategories);

// 获取单个分类
router.get("/:id", validateId, categoryController.getCategoryById);

// 通过 slug 获取分类
router.get("/slug/:slug", categoryController.getCategoryBySlug);

// 创建分类（管理员）
router.post("/", authenticate, requireAdmin, categoryController.createCategory);

// 更新分类（管理员）
router.put(
  "/:id",
  authenticate,
  requireAdmin,
  validateId,
  categoryController.updateCategory
);

// 删除分类（管理员）
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validateId,
  categoryController.deleteCategory
);

module.exports = router;
