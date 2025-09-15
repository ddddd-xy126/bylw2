import { Router } from "express";
import {
  register,
  login,
  profile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getAnswers,
  getAchievements,
  getReports,
} from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// 认证相关
router.post("/register", register);
router.post("/login", login);
router.get("/profile", [verifyToken], profile);

// 收藏相关
router.get("/favorites", [verifyToken], getFavorites);
router.post("/favorites/:surveyId", [verifyToken], addFavorite);
router.delete("/favorites/:surveyId", [verifyToken], removeFavorite);

// 答卷记录
router.get("/answers", [verifyToken], getAnswers);

// 成就系统
router.get("/achievements", [verifyToken], getAchievements);

// 报告
router.get("/reports", [verifyToken], getReports);

export default router;
