import { Router } from "express";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = Router();

router.get("/users", [verifyToken, isAdmin], adminController.getAllUsers);
router.delete(
  "/surveys/:id",
  [verifyToken, isAdmin],
  adminController.deleteSurvey
);

export default router;
