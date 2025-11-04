# 从 JSON-Server 迁移到真实后端指南

## 📋 概述

本文档说明如何将当前基于 `json-server` 的 mock 数据迁移到真实的 Node.js + Express + MySQL 后端。

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

## 🔧 迁移步骤

### 第一阶段：后端基础设施 (1-2天)

#### 1. 创建 server 目录结构

```bash
mkdir -p server/{config,controllers,middleware,models,routes,services,utils}
cd server
npm init -y
```

#### 2. 安装后端依赖

```bash
npm install express mysql2 sequelize jsonwebtoken bcryptjs cors dotenv
npm install -D nodemon
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

### 第四阶段：前端适配 (1天)

#### 修改 `client/src/api/index.js`

```javascript
import axios from "axios";
import { useUserStore } from "@/store/user";

// 切换到真实后端
const instance = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
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

#### 修改 `client/vite.config.js`

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
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

#### 环境变量 `client/.env.development`

```env
VITE_API_URL=http://localhost:3000/api
```

#### 环境变量 `client/.env.production`

```env
VITE_API_URL=https://your-production-domain.com/api
```

#### 简化 API 调用（示例：`client/src/api/auth.js`）

```javascript
import apiClient from "./index";

export async function login(data) {
  // 后端已经处理所有逻辑，前端只需要调用
  return await apiClient.post('/auth/login', data);
}

export async function register(data) {
  return await apiClient.post('/auth/register', data);
}

export async function getProfile(userId) {
  return await apiClient.get(`/user/profile/${userId}`);
}
```

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

## 🚀 快速开始迁移

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
