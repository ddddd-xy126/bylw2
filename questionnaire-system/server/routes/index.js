import { Router } from "express";
import userRoutes from "./userRoutes.js";
import questionnaireRoutes from "./questionnaireRoutes.js";
import surveyRoutes from "./surveyRoutes.js";
import adminRoutes from "./admin.js";
import authRoutes from "./auth.js";

const router = Router();
router.use("/user", userRoutes);
router.use("/questionnaire", questionnaireRoutes);
router.use("/surveys", surveyRoutes);
router.use("/admin", adminRoutes);
router.use("/auth", authRoutes);

export default router;
