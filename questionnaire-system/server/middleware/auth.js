const jwt = require("jsonwebtoken");
const { User } = require("../models");
const jwtConfig = require("../config/jwt");

// 验证 JWT Token
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, jwtConfig.secret);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "无效的认证令牌",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "认证令牌已过期",
      });
    }
    next(error);
  }
};

// 验证管理员权限
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "未认证",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "需要管理员权限",
    });
  }

  next();
};

// 可选认证（不强制要求登录）
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      const decoded = jwt.verify(token, jwtConfig.secret);
      const user = await User.findByPk(decoded.id);

      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // 忽略错误，继续执行
  }
  next();
};
