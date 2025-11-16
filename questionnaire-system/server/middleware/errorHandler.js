// 全局错误处理中间件
module.exports = (err, req, res, next) => {
  console.error("Error:", err);

  // Sequelize 验证错误
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "数据验证失败",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Sequelize 唯一性约束错误
  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "数据已存在",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: `${e.path} 已被使用`,
      })),
    });
  }

  // Sequelize 外键约束错误
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "关联数据不存在",
    });
  }

  // JWT 错误
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "无效的认证令牌",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "认证令牌已过期",
    });
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "服务器内部错误",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
