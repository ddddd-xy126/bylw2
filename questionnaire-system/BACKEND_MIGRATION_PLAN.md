# 后端迁移方案 - JSON Server 到 MySQL + Express

> 📚 本文档详细说明如何从 JSON Server 迁移到正式的后端架构

---

## 📋 目录

1. [迁移概述](#迁移概述)
2. [技术栈](#技术栈)
3. [项目结构](#项目结构)
4. [数据库设计](#数据库设计)
5. [后端实现步骤](#后端实现步骤)
6. [前端适配](#前端适配)
7. [数据迁移](#数据迁移)
8. [部署说明](#部署说明)

---

## 迁移概述

### 当前架构

```
前端 (Vue 3)
    ↓ HTTP
JSON Server (db.json)
```

### 目标架构

```
前端 (Vue 3)
    ↓ HTTP + JWT
Express 后端
    ↓ Sequelize ORM
MySQL 数据库
```

### 迁移范围

- ✅ 用户认证系统（JWT）
- ✅ 问卷 CRUD
- ✅ 答题记录
- ✅ 评论系统
- ✅ 积分系统
- ✅ 收藏功能
- ✅ 管理员功能

---

## 技术栈

### 后端

- **Node.js** v18+
- **Express** 4.x - Web 框架
- **Sequelize** 6.x - ORM
- **MySQL2** 3.x - 数据库驱动
- **jsonwebtoken** - JWT 认证
- **bcrypt** - 密码加密
- **cors** - 跨域支持
- **dotenv** - 环境变量
- **express-validator** - 数据验证

### 数据库

- **MySQL** 8.0+
- **数据库名**: questionnaire_db
- **主机**: 127.0.0.1
- **端口**: 3306
- **用户**: root
- **密码**: dxy040126..

---

## 项目结构

```
questionnaire-system/
├── client/                      # 前端项目（现有）
│   ├── src/
│   ├── package.json
│   └── ...
├── server/                      # 新建后端项目
│   ├── config/                  # 配置文件
│   │   ├── database.js         # 数据库配置
│   │   └── jwt.js              # JWT 配置
│   ├── models/                  # Sequelize 模型
│   │   ├── index.js            # 模型入口
│   │   ├── User.js             # 用户模型
│   │   ├── Survey.js           # 问卷模型
│   │   ├── Answer.js           # 答案模型
│   │   ├── Comment.js          # 评论模型
│   │   ├── Favorite.js         # 收藏模型
│   │   ├── Category.js         # 分类模型
│   │   ├── Announcement.js     # 公告模型
│   │   └── PointHistory.js     # 积分历史
│   ├── controllers/             # 控制器
│   │   ├── authController.js   # 认证
│   │   ├── userController.js   # 用户
│   │   ├── surveyController.js # 问卷
│   │   ├── answerController.js # 答案
│   │   ├── commentController.js # 评论
│   │   └── adminController.js  # 管理员
│   ├── routes/                  # 路由
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── surveys.js
│   │   ├── answers.js
│   │   ├── comments.js
│   │   └── admin.js
│   ├── middleware/              # 中间件
│   │   ├── auth.js             # JWT 验证
│   │   ├── admin.js            # 管理员验证
│   │   ├── validator.js        # 数据验证
│   │   └── errorHandler.js    # 错误处理
│   ├── utils/                   # 工具函数
│   │   ├── jwtHelper.js
│   │   ├── bcryptHelper.js
│   │   └── responseHelper.js
│   ├── migrations/              # 数据库迁移脚本
│   │   └── import-from-json.js
│   ├── .env                     # 环境变量
│   ├── app.js                   # Express 应用
│   ├── server.js                # 服务器入口
│   └── package.json
└── README.md
```

---

## 数据库设计

### ER 图概览

```
Users (用户表)
  ├── id (PK)
  ├── username
  ├── password (加密)
  ├── email
  ├── role (user/admin)
  ├── points (积分)
  └── profile (JSON)

Surveys (问卷表)
  ├── id (PK)
  ├── userId (FK → Users)
  ├── title
  ├── description
  ├── category
  ├── categoryId (FK → Categories)
  ├── questionList (JSON)
  ├── status (draft/pending/published/stopped)
  ├── isTemplate
  └── statistics (JSON)

Answers (答案表)
  ├── id (PK)
  ├── userId (FK → Users)
  ├── surveyId (FK → Surveys)
  ├── answers (JSON)
  ├── score
  ├── duration
  └── submittedAt

Comments (评论表)
  ├── id (PK)
  ├── userId (FK → Users)
  ├── surveyId (FK → Surveys)
  ├── rating
  ├── content
  └── createdAt

Favorites (收藏表)
  ├── id (PK)
  ├── userId (FK → Users)
  ├── surveyId (FK → Surveys)
  └── createdAt

Categories (分类表)
  ├── id (PK)
  ├── name
  ├── slug
  └── description

Announcements (公告表)
  ├── id (PK)
  ├── title
  ├── content
  ├── status
  └── createdAt

PointHistories (积分历史表)
  ├── id (PK)
  ├── userId (FK → Users)
  ├── points
  ├── reason
  └── createdAt
```

### 详细表结构

参见下方 SQL 创建脚本

---

## 后端实现步骤

### 步骤 1: 初始化后端项目

```bash
# 创建后端目录
cd questionnaire-system
mkdir server
cd server

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install express sequelize mysql2 dotenv cors
npm install jsonwebtoken bcrypt
npm install express-validator
npm install nodemon --save-dev
```

### 步骤 2: 配置环境变量

创建 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=questionnaire_db
DB_USER=root
DB_PASSWORD=dxy040126..

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 扣子 API 配置
COZE_API_TOKEN=cztei_l7jV8GnbwlkDOQB94EoLFwJgrJ50jZRQ0EKnsM4XRftsJw0T9RHrtM1FViIBGVzpb
COZE_BASE_URL=https://api.coze.cn
COZE_WORKFLOW_ID=7553193807606693928

# CORS 配置
CORS_ORIGIN=http://localhost:5173
```

### 步骤 3: 数据库配置

创建 `config/database.js`：

```javascript
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+08:00", // 东八区
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

module.exports = sequelize;
```

### 步骤 4: 创建数据库

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS questionnaire_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE questionnaire_db;

-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  nickname VARCHAR(50),
  avatar VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  points INT DEFAULT 0,
  gender VARCHAR(20),
  age INT,
  city VARCHAR(50),
  bio TEXT,
  profession VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_points (points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 分类表
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 问卷表
CREATE TABLE surveys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  categoryId INT,
  questionList JSON NOT NULL,
  status ENUM('draft', 'pending', 'published', 'stopped') DEFAULT 'draft',
  isTemplate BOOLEAN DEFAULT FALSE,
  participantCount INT DEFAULT 0,
  responseCount INT DEFAULT 0,
  averageRating DECIMAL(3,2) DEFAULT 0,
  ratingCount INT DEFAULT 0,
  favoriteCount INT DEFAULT 0,
  duration INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  publishedAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_user (userId),
  INDEX idx_status (status),
  INDEX idx_category (categoryId),
  INDEX idx_template (isTemplate),
  FULLTEXT idx_title_desc (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 答案表
CREATE TABLE answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  surveyId INT NOT NULL,
  surveyTitle VARCHAR(200),
  answers JSON NOT NULL,
  score INT,
  result VARCHAR(100),
  duration INT,
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_survey (surveyId),
  INDEX idx_submitted (submittedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  surveyId INT NOT NULL,
  username VARCHAR(50),
  avatar VARCHAR(255),
  rating DECIMAL(2,1),
  content TEXT NOT NULL,
  isDeleted BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_survey (surveyId),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 收藏表
CREATE TABLE favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  surveyId INT NOT NULL,
  surveyTitle VARCHAR(200),
  category VARCHAR(100),
  author VARCHAR(50),
  description TEXT,
  participants INT DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  duration INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (surveyId) REFERENCES surveys(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_survey (userId, surveyId),
  INDEX idx_user (userId),
  INDEX idx_survey (surveyId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 公告表
CREATE TABLE announcements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
  status ENUM('draft', 'published') DEFAULT 'draft',
  priority INT DEFAULT 0,
  createdBy INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 积分历史表
CREATE TABLE point_histories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  points INT NOT NULL,
  reason VARCHAR(200),
  type ENUM('earn', 'spend') DEFAULT 'earn',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (userId),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 管理员活动日志表
CREATE TABLE admin_activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  adminId INT NOT NULL,
  adminName VARCHAR(50),
  title VARCHAR(200),
  description TEXT,
  type VARCHAR(50),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_admin (adminId),
  INDEX idx_type (type),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 步骤 5: 创建 Sequelize 模型

#### User 模型 (`models/User.js`)

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    nickname: {
      type: DataTypes.STRING(50),
    },
    avatar: {
      type: DataTypes.STRING(255),
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    gender: DataTypes.STRING(20),
    age: DataTypes.INTEGER,
    city: DataTypes.STRING(50),
    bio: DataTypes.TEXT,
    profession: DataTypes.STRING(100),
  },
  {
    tableName: "users",
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// 实例方法：验证密码
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// 实例方法：转换为安全对象（不包含密码）
User.prototype.toSafeObject = function () {
  const { password, ...safeUser } = this.toJSON();
  return safeUser;
};

module.exports = User;
```

#### Survey 模型 (`models/Survey.js`)

```javascript
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Survey = sequelize.define(
  "Survey",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: DataTypes.TEXT,
    category: DataTypes.STRING(100),
    categoryId: DataTypes.INTEGER,
    questionList: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("draft", "pending", "published", "stopped"),
      defaultValue: "draft",
    },
    isTemplate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    participantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responseCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    averageRating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    favoriteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    duration: DataTypes.INTEGER,
    publishedAt: DataTypes.DATE,
  },
  {
    tableName: "surveys",
  }
);

module.exports = Survey;
```

#### 其他模型类似创建...

### 步骤 6: 定义模型关系 (`models/index.js`)

```javascript
const sequelize = require("../config/database");
const User = require("./User");
const Survey = require("./Survey");
const Answer = require("./Answer");
const Comment = require("./Comment");
const Favorite = require("./Favorite");
const Category = require("./Category");
const Announcement = require("./Announcement");
const PointHistory = require("./PointHistory");
const AdminActivity = require("./AdminActivity");

// 定义关联关系

// User - Survey (一对多)
User.hasMany(Survey, { foreignKey: "userId", as: "surveys" });
Survey.belongsTo(User, { foreignKey: "userId", as: "creator" });

// User - Answer (一对多)
User.hasMany(Answer, { foreignKey: "userId", as: "answers" });
Answer.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Answer (一对多)
Survey.hasMany(Answer, { foreignKey: "surveyId", as: "answers" });
Answer.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// User - Comment (一对多)
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Comment (一对多)
Survey.hasMany(Comment, { foreignKey: "surveyId", as: "comments" });
Comment.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// User - Favorite (一对多)
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });

// Survey - Favorite (一对多)
Survey.hasMany(Favorite, { foreignKey: "surveyId", as: "favorites" });
Favorite.belongsTo(Survey, { foreignKey: "surveyId", as: "survey" });

// Category - Survey (一对多)
Category.hasMany(Survey, { foreignKey: "categoryId", as: "surveys" });
Survey.belongsTo(Category, { foreignKey: "categoryId", as: "categoryInfo" });

// User - PointHistory (一对多)
User.hasMany(PointHistory, { foreignKey: "userId", as: "pointHistories" });
PointHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
  sequelize,
  User,
  Survey,
  Answer,
  Comment,
  Favorite,
  Category,
  Announcement,
  PointHistory,
  AdminActivity,
};
```

### 步骤 7: 创建路由和控制器

#### 认证路由 (`routes/auth.js`)

```javascript
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateLogin, validateRegister } = require("../middleware/validator");

// 注册
router.post("/register", validateRegister, authController.register);

// 登录
router.post("/login", validateLogin, authController.login);

// 登出
router.post("/logout", authController.logout);

// 刷新 Token
router.post("/refresh", authController.refreshToken);

module.exports = router;
```

#### 认证控制器 (`controllers/authController.js`)

```javascript
const { User } = require("../models");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "用户名或邮箱已存在",
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password,
      points: 100, // 注册赠送 100 积分
    });

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 验证密码
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成 Token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = (req, res) => {
  // JWT 是无状态的，客户端删除 token 即可
  res.json({
    success: true,
    message: "登出成功",
  });
};

exports.refreshToken = async (req, res, next) => {
  // 实现 Token 刷新逻辑
};
```

### 步骤 8: JWT 中间件 (`middleware/auth.js`)

```javascript
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// 验证 JWT Token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    res.status(401).json({
      success: false,
      message: "无效的认证令牌",
    });
  }
};

// 验证管理员权限
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "需要管理员权限",
    });
  }
  next();
};
```

### 步骤 9: Express 应用 (`app.js`)

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

// 中间件
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/surveys", require("./routes/surveys"));
app.use("/api/answers", require("./routes/answers"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/admin", require("./routes/admin"));

// 错误处理
app.use(require("./middleware/errorHandler"));

module.exports = app;
```

### 步骤 10: 服务器入口 (`server.js`)

```javascript
const app = require("./app");
const { sequelize } = require("./models");

const PORT = process.env.PORT || 3000;

// 同步数据库并启动服务器
async function start() {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log("✅ 数据库连接成功");

    // 同步模型（开发环境）
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ 数据库模型已同步");
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ 启动失败:", error);
    process.exit(1);
  }
}

start();
```

---

## 前端适配

### 修改 API 基础地址

修改 `client/src/api/index.js`:

```javascript
const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // 改为后端地址
  timeout: 10000,
});

// 请求拦截器
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // 使用 Bearer Token
  }
  return config;
});

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 后端返回格式: { success, message, data }
    return response.data.data || response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
      router.push("/login");
    }
    return Promise.reject(error);
  }
);
```

### 适配认证 API

修改 `client/src/api/auth.js`:

```javascript
export async function loginApi(credentials) {
  const response = await apiClient.post("/auth/login", credentials);
  return response; // { token, user }
}

export async function registerApi(userData) {
  const response = await apiClient.post("/auth/register", userData);
  return response; // { token, user }
}
```

---

## 数据迁移

### 数据迁移脚本 (`migrations/import-from-json.js`)

```javascript
const fs = require("fs");
const path = require("path");
const {
  sequelize,
  User,
  Survey,
  Answer,
  Comment,
  Favorite,
  Category,
  Announcement,
} = require("../models");

async function importData() {
  try {
    // 读取 db.json
    const dbPath = path.join(__dirname, "../../client/db.json");
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    console.log("开始导入数据...");

    // 1. 导入分类
    if (data.categories) {
      await Category.bulkCreate(data.categories);
      console.log(`✅ 导入 ${data.categories.length} 个分类`);
    }

    // 2. 导入用户
    if (data.users) {
      await User.bulkCreate(data.users);
      console.log(`✅ 导入 ${data.users.length} 个用户`);
    }

    // 3. 导入问卷
    if (data.surveys) {
      await Survey.bulkCreate(data.surveys);
      console.log(`✅ 导入 ${data.surveys.length} 个问卷`);
    }

    // 4. 导入答案
    if (data.answers) {
      await Answer.bulkCreate(data.answers);
      console.log(`✅ 导入 ${data.answers.length} 个答案`);
    }

    // 5. 导入评论
    if (data.comments) {
      await Comment.bulkCreate(data.comments);
      console.log(`✅ 导入 ${data.comments.length} 个评论`);
    }

    // 6. 导入收藏
    if (data.favorites) {
      await Favorite.bulkCreate(data.favorites);
      console.log(`✅ 导入 ${data.favorites.length} 个收藏`);
    }

    // 7. 导入公告
    if (data.announcements) {
      await Announcement.bulkCreate(data.announcements);
      console.log(`✅ 导入 ${data.announcements.length} 个公告`);
    }

    console.log("✅ 数据导入完成！");
  } catch (error) {
    console.error("❌ 数据导入失败:", error);
  } finally {
    await sequelize.close();
  }
}

// 运行导入
importData();
```

### 运行迁移

```bash
cd server
node migrations/import-from-json.js
```

---

## 部署说明

### 开发环境

```bash
# 后端
cd server
npm run dev  # 使用 nodemon

# 前端
cd client
npm run dev
```

### 生产环境

1. **构建前端**

```bash
cd client
npm run build
```

2. **配置后端服务静态文件**

```javascript
// app.js
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});
```

3. **使用 PM2 部署**

```bash
npm install pm2 -g
pm2 start server/server.js --name questionnaire-api
pm2 save
pm2 startup
```

---

## 总结

这个迁移方案提供了：

1. ✅ 完整的后端架构（Express + Sequelize + MySQL）
2. ✅ JWT 认证系统
3. ✅ RESTful API 设计
4. ✅ 数据库设计和模型定义
5. ✅ 数据迁移脚本
6. ✅ 前端适配指南
7. ✅ 部署说明

**下一步行动**:

1. 创建后端项目结构
2. 安装依赖
3. 配置数据库
4. 实现 API 端点
5. 运行数据迁移
6. 测试接口
7. 适配前端
8. 部署上线
