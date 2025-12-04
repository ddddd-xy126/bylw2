const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { validateId, validatePagination } = require("../middleware/validator");

// 所有路由都需要管理员权限
router.use(authenticate, requireAdmin);

// 仪表板统计
router.get("/dashboard/stats", adminController.getDashboardStats);

// 用户管理
router.get("/users", validatePagination, adminController.getAllUsers);
router.put("/users/:id/role", validateId, adminController.updateUserRole);
router.put("/users/:id/ban", validateId, adminController.banUser);
router.put("/users/:id/unban", validateId, adminController.unbanUser);
router.put(
  "/users/:id/reset-password",
  validateId,
  adminController.resetPassword
);
router.delete("/users/:id", validateId, adminController.deleteUser);

// 问卷审核
router.put("/surveys/:id/review", validateId, adminController.reviewSurvey);

// 公告管理
router.get(
  "/announcements",
  validatePagination,
  adminController.getAllAnnouncements
);
router.post("/announcements", adminController.createAnnouncement);
router.put(
  "/announcements/:id",
  validateId,
  adminController.updateAnnouncement
);
router.delete(
  "/announcements/:id",
  validateId,
  adminController.deleteAnnouncement
);

// 管理员活动日志
router.get("/activities", validatePagination, adminController.getActivities);
router.post("/activities", adminController.createActivity);

module.exports = router;
