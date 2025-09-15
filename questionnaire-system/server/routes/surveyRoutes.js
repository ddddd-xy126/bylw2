// server/routes/surveyRoutes.js
import { Router } from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import * as surveyController from "../controllers/surveyController.js";

const router = Router();

// 获取问卷列表（公开）
router.get("/", surveyController.getSurveys);

// 获取问卷详情（公开）
router.get("/:id", surveyController.getSurveyDetail);

// 提交答卷（需登录）
router.post("/:id/submit", [verifyToken], surveyController.submitAnswer);

// 获取问卷评论（公开）
router.get("/:id/comments", surveyController.getSurveyComments);

// 发表评论（需登录）
router.post("/:id/comments", [verifyToken], surveyController.createComment);

export default router;
