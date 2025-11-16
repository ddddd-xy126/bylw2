const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// 中间件
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
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
