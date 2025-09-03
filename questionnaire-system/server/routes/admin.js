import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = Router();

// seed admin (only when ALLOW_ADMIN_SEED=true) - not protected by auth to allow initial setup
router.post("/seed-admin", adminController.seedAdmin);

router.get("/users", [verifyToken, isAdmin], adminController.getAllUsers);
// create or update user (admin only)
router.post("/users", [verifyToken, isAdmin], adminController.createUser);
// delete user
router.delete("/users/:id", [verifyToken, isAdmin], adminController.deleteUser);
router.delete(
  "/surveys/:id",
  [verifyToken, isAdmin],
  adminController.deleteSurvey
);

// admin survey create (protected)
router.post("/surveys", [verifyToken, isAdmin], adminController.createSurvey);

// questions management
router.get("/questions", [verifyToken, isAdmin], adminController.listQuestions);
router.post(
  "/questions",
  [verifyToken, isAdmin],
  adminController.createQuestion
);
router.delete(
  "/questions/:id",
  [verifyToken, isAdmin],
  adminController.deleteQuestion
);

// user ban/unban
router.post("/users/:id/ban", [verifyToken, isAdmin], adminController.banUser);
router.post(
  "/users/:id/unban",
  [verifyToken, isAdmin],
  adminController.unbanUser
);

export default router;
