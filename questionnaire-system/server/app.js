const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// 中间件
app.use(helmet());
// CORS_ORIGIN 支持逗号分隔多个域名，例如: https://bylw2.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
// 放行本项目在 Vercel 上的所有部署域名（生产/预览/分支域名各不相同）
const vercelPattern = /^https:\/\/bylw2[\w-]*(-ddddd-xy126s-projects)?\.vercel\.app$/;
app.use(
  cors({
    origin(origin, callback) {
      // 允许无 Origin 的请求（如 curl、健康检查）
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || vercelPattern.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS 不允许的来源: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 请求日志（开发环境）
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// 健康检查
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API 路由
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/surveys", require("./routes/surveys"));
app.use("/api/answers", require("./routes/answers"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/announcements", require("./routes/announcements"));
app.use("/api/favorites", require("./routes/favorites"));
app.use("/api/badges", require("./routes/badges"));
app.use("/api/recycleBin", require("./routes/recycleBin"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/reports", require("./routes/reports"));

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "接口不存在",
  });
});

// 全局错误处理
app.use(require("./middleware/errorHandler"));

module.exports = app;
