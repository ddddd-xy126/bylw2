# 从 JSON-Server 迁移到真实后端指南（前后端分离架构）

## 📋 概述

本文档说明如何将当前基于 `json-server` 的 mock 数据迁移到真实的 Node.js + Express + MySQL 后端。

**重要：本项目采用前后端完全分离架构**
- 前端：独立的 Vue3 项目（client 目录）
- 后端：独立的 Node.js API 服务（新建 server 目录）
- 两者通过 HTTP API 通信，可独立部署

## 🏗️ 前后端分离架构说明

### 项目结构（迁移后）

```
questionnaire-system/
├── client/                    # 前端项目（Vue3）
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.development       # 前端环境变量
│
├── server/                    # 后端项目（Node.js + Express）
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── middleware/            # 中间件
│   ├── models/                # Sequelize 模型
│   ├── routes/                # 路由
│   ├── services/              # 业务服务
│   ├── utils/                 # 工具函数
│   ├── app.js                 # Express 应用
│   ├── package.json           # 后端依赖
│   └── .env                   # 后端环境变量
│
├── MIGRATION_GUIDE.md
└── README.md
```

### 前后端通信方式

**开发环境**：
- 前端：`http://localhost:5173` (Vite dev server)
- 后端：`http://localhost:3000` (Express server)
- 前端通过 Vite proxy 或直接调用后端 API

**生产环境**：
- 前端：打包成静态文件，部署到 Nginx/CDN
- 后端：部署到服务器（如 阿里云/腾讯云）
- 通过 CORS 跨域访问

### 迁移优势

✅ **前端改动极小** - 只需修改 API 配置文件
✅ **可独立开发** - 前后端团队可并行工作
✅ **可独立部署** - 前后端分别部署和扩展
✅ **技术栈灵活** - 可随时切换后端技术
✅ **易于测试** - 可单独测试前端或后端

---

## ✅ 迁移便利性分析

### 优势

1. **API 层已抽象化** - 所有 API 调用集中在 `client/src/api/` 目录
2. **数据结构已设计** - `db.json` 可直接映射到数据库表
3. **JWT 准备就绪** - 已有 token 拦截器和认证逻辑
4. **前后端分离** - 前端代码无需大改，只需修改 API 实现

### 迁移工作量评估

- **后端开发**: 3-5 天
- **前端适配**: 1-2 天
- **测试调试**: 2-3 天
- **总计**: 约 1-1.5 周

---

## 🔧 迁移步骤（前后端分离）

### 🎯 总体策略

**关键原则**：前后端完全独立，通过 RESTful API 通信

**开发流程**：
1. 在项目根目录新建独立的 `server` 文件夹
2. 后端项目有自己的 `package.json` 和依赖
3. 前端项目保持在 `client` 文件夹，只修改 API 调用地址
4. 两个项目可以分别启动、测试、部署

---

### 第一阶段：搭建独立后端项目 (1天)

#### 1. 创建独立的后端项目

```bash
# 在项目根目录下
cd questionnaire-system

# 创建后端项目目录
mkdir server
cd server

# 初始化 Node.js 项目（独立的 package.json）
npm init -y

# 修改 package.json
```

**`server/package.json`**（完整配置）

```json
{
  "name": "questionnaire-backend",
  "version": "1.0.0",
  "description": "智能问卷分析系统后端API",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js"
  },
  "keywords": ["questionnaire", "api", "express"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "sequelize": "^6.35.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

#### 2. 安装后端依赖

```bash
npm install
```

#### 3. 创建后端目录结构

```bash
mkdir -p config controllers middleware models routes services utils scripts public/avatars public/images
```

最终结构：
```
server/
├── config/
│   ├── database.js           # 数据库配置
│   └── jwt.js                # JWT 配置
├── controllers/              # 控制器（处理请求）
│   ├── authController.js
│   ├── userController.js
│   ├── surveyController.js
│   └── adminController.js
├── middleware/               # 中间件
│   ├── auth.js               # 认证中间件
│   └── errorHandler.js       # 错误处理
├── models/                   # Sequelize 模型
│   ├── index.js              # 模型汇总和关联
│   ├── User.js
│   ├── Survey.js
│   ├── Answer.js
│   ├── Favorite.js
│   └── Category.js
├── routes/                   # 路由定义
│   ├── auth.js               # /api/auth/*
│   ├── user.js               # /api/user/*
│   ├── survey.js             # /api/survey/*
│   └── admin.js              # /api/admin/*
├── services/                 # 业务逻辑服务
│   ├── cozeService.js        # AI 分析服务
│   └── pdfService.js         # PDF 生成服务
├── utils/                    # 工具函数
│   └── helpers.js
├── scripts/                  # 脚本
│   ├── migrate.js            # 数据库迁移
│   └── seed.js               # 种子数据
├── public/                   # 静态资源
│   ├── avatars/
│   └── images/
├── .env                      # 环境变量
├── .gitignore
├── app.js                    # 入口文件
└── package.json
```

#### 3. 配置文件 `server/config/database.js`

```javascript
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'questionnaire_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize;
```

#### 4. 环境变量 `server/.env`

```env
PORT=3000
DB_HOST=localhost
DB_NAME=questionnaire_db
DB_USER=root
DB_PASS=your_password

JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# 扣子平台 API（AI 分析）
COZE_API_KEY=your_coze_api_key
COZE_BOT_ID=your_bot_id
```

---

### 第二阶段：数据库模型 (1天)

#### 根据 `db.json` 创建 Sequelize 模型

**`server/models/User.js`**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: DataTypes.STRING(20),
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar: DataTypes.STRING(255),
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bio: DataTypes.TEXT,
  city: DataTypes.STRING(50),
  gender: DataTypes.ENUM('male', 'female', 'other', ''),
  age: DataTypes.INTEGER,
  profession: DataTypes.STRING(100),
  joinedDate: DataTypes.DATEONLY,
  lastLoginAt: DataTypes.DATE,
  lastLoginIp: DataTypes.STRING(45),
  unlockedBadges: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  completedSurveys: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = User;
```

**`server/models/Survey.js`**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: DataTypes.TEXT,
  category: DataTypes.STRING(50),
  categoryId: DataTypes.INTEGER,
  author: DataTypes.STRING(100),
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  duration: DataTypes.INTEGER,
  difficulty: DataTypes.STRING(20),
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'published', 'archived'),
    defaultValue: 'draft'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  thumbnail: DataTypes.STRING(255),
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0
  },
  participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  participantCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  favoriteCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  questionList: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  answers: {
    type: DataTypes.JSON,
    defaultValue: []
  }
}, {
  timestamps: true
});

module.exports = Survey;
```

**`server/models/Answer.js`**

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  surveyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  surveyTitle: DataTypes.STRING(200),
  score: DataTypes.INTEGER,
  result: DataTypes.STRING(100),
  duration: DataTypes.INTEGER,
  answers: {
    type: DataTypes.JSON,
    allowNull: false
  },
  comment: DataTypes.JSON
}, {
  timestamps: true,
  createdAt: 'submittedAt'
});

module.exports = Answer;
```

**`server/models/index.js`** - 建立关联

```javascript
const sequelize = require('../config/database');
const User = require('./User');
const Survey = require('./Survey');
const Answer = require('./Answer');
const Favorite = require('./Favorite');
const Category = require('./Category');

// 用户与问卷的关系
User.hasMany(Survey, { foreignKey: 'authorId', as: 'surveys' });
Survey.belongsTo(User, { foreignKey: 'authorId', as: 'creator' });

// 用户与答案的关系
User.hasMany(Answer, { foreignKey: 'userId', as: 'answers' });
Answer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 问卷与答案的关系
Survey.hasMany(Answer, { foreignKey: 'surveyId', as: 'answers' });
Answer.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

// 收藏关系
User.belongsToMany(Survey, { through: Favorite, as: 'favorites' });
Survey.belongsToMany(User, { through: Favorite, as: 'favoritedBy' });

module.exports = {
  sequelize,
  User,
  Survey,
  Answer,
  Favorite,
  Category
};
```

---

### 第三阶段：API 路由和控制器 (1-2天)

#### JWT 中间件 `server/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user || user.banned) {
      return res.status(401).json({ message: '无效的令牌或用户已被禁用' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '令牌验证失败' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};
```

#### 认证控制器 `server/controllers/authController.js`

```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  try {
    const { username, nickname, email, password } = req.body;
    
    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: '用户名或邮箱已存在' });
    }
    
    // 创建用户
    const user = await User.create({
      username,
      nickname: nickname || username,
      email,
      password,
      avatar: `/avatars/default.jpg`,
      joinedDate: new Date()
    });
    
    // 生成 token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }]
      }
    });
    
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    if (user.banned) {
      return res.status(403).json({ message: '该账号已被禁用' });
    }
    
    // 验证密码
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 更新最后登录时间
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: req.ip
    });
    
    // 生成 token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### 主应用 `server/app.js`

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const surveyRoutes = require('./routes/survey');
const adminRoutes = require('./routes/admin');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/avatars', express.static('public/avatars'));
app.use('/images', express.static('public/images'));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questionnaire', surveyRoutes);
app.use('/api/survey', surveyRoutes);
app.use('/api/admin', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || '服务器错误' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synchronized');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database connection failed:', err);
});
```

---

### 第四阶段：前端适配（关键！） (0.5-1天)

**重点**：前后端分离，前端只需要改 API 调用地址！

#### 方案 A：使用 Vite Proxy（推荐用于开发）

**优点**：解决开发环境跨域问题

**`client/vite.config.js`**

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    // ✅ 开启代理，转发到后端
    proxy: {
      '/api': {
        target: 'http://localhost:3000',  // 后端地址
        changeOrigin: true,
        // rewrite: (path) => path  // 保持 /api 前缀
      }
    }
  }
})
```

**`client/src/api/index.js`**（使用代理）

```javascript
import axios from "axios";
import { useUserStore } from "@/store/user";

// 开发环境：使用相对路径，Vite 会代理到后端
// 生产环境：使用环境变量配置的完整 URL
const instance = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "/api",  // ✅ 改这里
  timeout: 10000 
});

instance.interceptors.request.use((config) => {
  const store = useUserStore();
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message;
    return Promise.reject(new Error(message));
  }
);

export default instance;
```

#### 方案 B：直接调用后端（需要后端配置 CORS）

**`client/src/api/index.js`**（直接调用）

```javascript
const instance = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000 
});
```

后端需要配置 CORS（已在 app.js 中配置）：
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // 前端地址
  credentials: true
}));
```

#### 环境变量配置

**`client/.env.development`**（开发环境）

```env
# 开发环境使用 Vite proxy
VITE_API_URL=/api

# 或者直接调用后端
# VITE_API_URL=http://localhost:3000/api
```

**`client/.env.production`**（生产环境）

```env
# 生产环境使用完整 URL
VITE_API_URL=https://api.yourdomain.com/api
```

#### API 调用简化示例

由于后端已经处理所有业务逻辑，前端 API 调用大幅简化！

**之前（json-server）**：
```javascript
// client/src/api/auth.js
export async function login(data) {
  // ❌ 前端需要自己查找用户、验证密码
  const users = await apiClient.get('/users');
  const user = users.find(u => 
    (u.username === data.username || u.email === data.username) && 
    u.password === data.password
  );
  
  if (!user) {
    throw new Error("用户名或密码错误");
  }
  
  return {
    token: `mock-jwt-token-${user.id}`,
    user: { ...user }
  };
}
```

**现在（真实后端）**：
```javascript
// client/src/api/auth.js
export async function login(data) {
  // ✅ 后端已处理所有逻辑，前端只需调用
  return await apiClient.post('/auth/login', data);
}

export async function register(data) {
  return await apiClient.post('/auth/register', data);
}

export async function getProfile() {
  return await apiClient.get('/user/profile');
}
```

**其他 API 文件同理简化**：

```javascript
// client/src/api/user.js
import apiClient from './index';

export const getUserAnsweredSurveysApi = async () => {
  return await apiClient.get('/user/answered-surveys');
};

export const getFavoritesApi = async () => {
  return await apiClient.get('/user/favorites');
};

export const addFavoriteApi = async (surveyId) => {
  return await apiClient.post('/user/favorites', { surveyId });
};

// client/src/api/survey.js
export const getSurveyDetail = async (id) => {
  return await apiClient.get(`/survey/${id}`);
};

export const submitSurveyApi = async (id, data) => {
  return await apiClient.post(`/survey/${id}/submit`, data);
};

export const getSurveyCommentsApi = async (id) => {
  return await apiClient.get(`/survey/${id}/comments`);
};
```

#### 前端修改总结

需要修改的文件：
- ✏️ `client/vite.config.js` - 配置 proxy
- ✏️ `client/.env.development` - 添加 API URL
- ✏️ `client/.env.production` - 添加生产 API URL
- ✏️ `client/src/api/index.js` - 修改 baseURL
- ✏️ `client/src/api/*.js` - 简化所有 API 调用（可选优化）

**组件代码无需修改！** 🎉

---

### 第五阶段：AI 分析集成 (1天)

#### 扣子平台服务 `server/services/cozeService.js`

```javascript
const axios = require('axios');

class CozeService {
  constructor() {
    this.apiKey = process.env.COZE_API_KEY;
    this.botId = process.env.COZE_BOT_ID;
    this.baseURL = 'https://api.coze.cn/v1';
  }

  async generateReport(surveyData, answerData) {
    try {
      const response = await axios.post(
        `${this.baseURL}/bot/chat`,
        {
          bot_id: this.botId,
          user_id: answerData.userId.toString(),
          stream: false,
          messages: [{
            role: 'user',
            content: this.buildPrompt(surveyData, answerData)
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return this.parseAIResponse(response.data);
    } catch (error) {
      console.error('AI 分析失败:', error);
      return this.getFallbackReport(answerData);
    }
  }

  buildPrompt(survey, answer) {
    return `
请根据以下问卷调查结果，生成详细的个性化分析报告：

问卷标题：${survey.title}
问卷类型：${survey.category}
答题时长：${answer.duration}秒

用户答案：
${JSON.stringify(answer.answers, null, 2)}

请提供：
1. 整体评价
2. 详细分析
3. 建议和改进方向
4. 评分（1-100分）
`;
  }

  parseAIResponse(response) {
    // 解析 AI 返回的内容
    const content = response.messages?.[0]?.content || '';
    
    return {
      analysis: content,
      score: this.extractScore(content),
      recommendations: this.extractRecommendations(content)
    };
  }

  extractScore(content) {
    const match = content.match(/评分[：:]\s*(\d+)/);
    return match ? parseInt(match[1]) : 75;
  }

  extractRecommendations(content) {
    // 提取建议部分
    const lines = content.split('\n');
    return lines.filter(line => 
      line.includes('建议') || line.includes('改进')
    );
  }

  getFallbackReport(answer) {
    return {
      analysis: '感谢您完成本次问卷！我们已收到您的反馈。',
      score: Math.floor(Math.random() * 30) + 70,
      recommendations: ['继续保持', '积极参与']
    };
  }
}

module.exports = new CozeService();
```

#### 在答题提交中集成 AI

```javascript
// server/controllers/surveyController.js
const cozeService = require('../services/cozeService');

exports.submitAnswer = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { answers, duration } = req.body;
    
    const survey = await Survey.findByPk(surveyId);
    
    // 保存答案
    const answer = await Answer.create({
      userId: req.user.id,
      surveyId,
      surveyTitle: survey.title,
      answers,
      duration
    });
    
    // 调用 AI 生成分析报告
    const aiReport = await cozeService.generateReport(survey, {
      userId: req.user.id,
      answers,
      duration
    });
    
    // 更新答案记录
    await answer.update({
      score: aiReport.score,
      result: aiReport.analysis
    });
    
    res.json({
      answerId: answer.id,
      score: aiReport.score,
      result: aiReport.analysis,
      recommendations: aiReport.recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### 第六阶段：PDF 报告生成（已集成）

前端已有 `html2canvas` + `jsPDF`，无需修改。后端可添加服务端生成：

```javascript
// server/services/pdfService.js
const puppeteer = require('puppeteer');

exports.generatePDF = async (htmlContent) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdf;
};
```

---

## 📊 数据迁移

### 从 db.json 导入到 MySQL

```javascript
// server/scripts/importData.js
const fs = require('fs');
const { User, Survey, Answer, Favorite, Category } = require('../models');

async function importData() {
  const data = JSON.parse(fs.readFileSync('../client/db.json', 'utf8'));
  
  // 导入用户
  for (const user of data.users) {
    await User.create(user);
  }
  
  // 导入问卷
  for (const survey of data.surveys) {
    await Survey.create(survey);
  }
  
  // 导入分类
  for (const category of data.categories) {
    await Category.create(category);
  }
  
  console.log('✅ 数据导入完成');
}

importData();
```

---

## 🎯 总结

### 迁移优势

✅ **前端改动最小** - 只需修改 API 配置
✅ **数据结构已定** - db.json 直接映射到数据库
✅ **认证已准备** - JWT 逻辑已存在
✅ **可逐步迁移** - 可以一个模块一个模块地迁移

### 建议迁移顺序

1. **认证模块** (登录/注册) - 最基础
2. **用户模块** (个人资料) - 简单
3. **问卷模块** (CRUD) - 核心功能
4. **答题模块** (提交/分析) - 集成 AI
5. **管理模块** (后台管理) - 最后

### 关键注意事项

⚠️ **密码加密** - 使用 bcryptjs
⚠️ **SQL 注入防护** - 使用 Sequelize ORM
⚠️ **跨域配置** - CORS 设置
⚠️ **环境变量** - 敏感信息不要提交到代码库
⚠️ **错误处理** - 统一的错误处理中间件

---

## 🚀 开发和部署流程（前后端分离）

### 开发环境运行

**同时启动前后端**（推荐使用两个终端）：

```bash
# 终端 1：启动后端
cd server
npm run dev
# 后端运行在 http://localhost:3000

# 终端 2：启动前端
cd client
npm run dev
# 前端运行在 http://localhost:5173
```

**访问**：打开浏览器访问 `http://localhost:5173`

### 生产环境部署

#### 方案 A：传统部署（推荐）

**前端部署（静态资源）**：
```bash
# 1. 构建前端
cd client
npm run build
# 输出到 client/dist/

# 2. 部署到 Nginx
# 将 dist/ 目录上传到服务器，配置 Nginx
```

**Nginx 配置示例**：
```nginx
server {
    listen 80;
    server_name www.yourdomain.com;
    
    # 前端静态文件
    location / {
        root /var/www/questionnaire/client/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 代理后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**后端部署（Node.js 服务）**：
```bash
# 1. 上传代码到服务器
cd /var/www/questionnaire/server

# 2. 安装依赖
npm install --production

# 3. 使用 PM2 管理进程
npm install -g pm2
pm2 start app.js --name questionnaire-api
pm2 save
pm2 startup
```

#### 方案 B：前后端分离部署

**前端**：部署到 CDN（如阿里云 OSS、腾讯云 COS）
**后端**：部署到云服务器（如阿里云 ECS、腾讯云 CVM）

```bash
# 前端构建并上传到 OSS
cd client
npm run build
# 使用 ossutil 或 Web 控制台上传 dist/ 到 OSS

# 后端部署
ssh user@your-server
cd /var/www/questionnaire-api
git pull
npm install
pm2 restart questionnaire-api
```

### Docker 部署（可选）

**`server/Dockerfile`**：
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

**`docker-compose.yml`**（根目录）：
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=mysql
      - DB_NAME=questionnaire_db
      - DB_USER=root
      - DB_PASS=password
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: questionnaire_db
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
  
  frontend:
    image: nginx:alpine
    volumes:
      - ./client/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

启动：
```bash
docker-compose up -d
```

---

## 📊 迁移时间线

### 快速迁移（1 周）

| 天数 | 任务 | 负责人 |
|------|------|--------|
| Day 1 | 搭建后端项目结构、配置数据库 | 后端 |
| Day 2 | 实现认证和用户模块 | 后端 |
| Day 3 | 实现问卷和答题模块 | 后端 |
| Day 4 | 实现管理员模块、集成 AI | 后端 |
| Day 5 | 前端 API 调整、联调测试 | 前端 |
| Day 6-7 | 完整测试、修复 bug | 全员 |

### 渐进迁移（2-3 周）

**Week 1**：
- 搭建后端基础框架
- 实现认证模块
- 前端对接认证 API
- **保留 json-server 作为其他模块的后备**

**Week 2**：
- 实现用户和问卷模块
- 前端逐步切换到真实 API
- 测试和修复

**Week 3**：
- 实现管理模块
- 集成 AI 分析
- 完全移除 json-server
- 生产部署准备

---

## 🎯 前后端分离的关键要点

### ✅ DO（推荐做法）

1. **独立项目** - server 和 client 有各自的 package.json
2. **环境变量** - API URL 通过环境变量配置
3. **统一接口** - 后端遵循 RESTful API 规范
4. **CORS 配置** - 后端正确配置跨域
5. **错误处理** - 统一的错误响应格式
6. **API 文档** - 使用 Swagger/Apifox 记录 API

### ❌ DON'T（避免做法）

1. ❌ 前后端代码混在一起
2. ❌ 硬编码 API 地址
3. ❌ 前端直接访问数据库
4. ❌ 忽略跨域问题
5. ❌ 没有 API 版本控制

---

## 📝 API 接口对照表

从 json-server 到真实后端的接口映射：

| 功能 | json-server | 真实后端 | HTTP 方法 |
|------|-------------|----------|-----------|
| 登录 | 手动查询 users | POST /api/auth/login | POST |
| 注册 | POST /users | POST /api/auth/register | POST |
| 获取个人信息 | GET /users/:id | GET /api/user/profile | GET |
| 更新个人信息 | PATCH /users/:id | PUT /api/user/profile | PUT |
| 获取问卷列表 | GET /surveys | GET /api/survey/list | GET |
| 获取问卷详情 | GET /surveys/:id | GET /api/survey/:id | GET |
| 创建问卷 | POST /surveys | POST /api/survey | POST |
| 提交答案 | 手动处理 | POST /api/survey/:id/submit | POST |
| 获取收藏 | GET /favorites?userId=x | GET /api/user/favorites | GET |
| 添加收藏 | POST /favorites | POST /api/user/favorites | POST |
| 管理员登录 | 手动查询 | POST /api/admin/login | POST |
| 用户管理 | GET /users | GET /api/admin/users | GET |

---

```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE questionnaire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 2. 初始化后端项目
cd questionnaire-system
mkdir server
cd server
npm init -y
npm install express mysql2 sequelize jsonwebtoken bcryptjs cors dotenv

# 3. 复制模型和控制器代码（按照上述文档）

# 4. 运行后端
npm run dev

# 5. 修改前端 API 配置
# 编辑 client/src/api/index.js，更改 baseURL

# 6. 测试
# 先测试登录/注册，再逐步测试其他功能
```

迁移过程中遇到问题，随时查看此文档！
