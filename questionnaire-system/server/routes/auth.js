const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateLogin, validateRegister } = require("../middleware/validator");
const { authenticate } = require("../middleware/auth");

// 注册
router.post("/register", validateRegister, authController.register);

// 登录
router.post("/login", validateLogin, authController.login);

// 登出
router.post("/logout", authController.logout);

// 刷新 Token
router.post("/refresh", authController.refreshToken);

// 获取当前用户信息
router.get("/me", authenticate, authController.getCurrentUser);

module.exports = router;
