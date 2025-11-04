# DB.JSON 数据库结构详细文档

## 📋 概述

本文档详细描述了问卷系统的 JSON 数据库结构，包含数据表设计、字段定义、关联关系、API 使用方法和后端迁移指南。

---

## 🗂️ 数据库结构总览

```
db.json
├── users (5条)           # 用户表
├── categories (8条)      # 问卷分类表
├── surveys (3条)         # 问卷表
├── questions (2条)       # 题目库表
├── answers (2条)         # 答题记录表
├── comments (2条)        # 评论表
├── favorites (3条)       # 收藏表
├── achievements (2条)    # 成就表
├── reports (1条)         # 分析报告表
├── forumPosts (2条)      # 论坛帖子表
├── adminStats (1条)      # 管理员统计表
├── systemStatus (1条)    # 系统状态表
└── activityData (7条)    # 活动数据表
```

---

## 📊 数据表详细结构

### 1. 用户表 (users)

**作用**: 存储系统用户的基本信息和状态

```json
{
  "id": "string",              // 主键ID (唯一标识)
  "username": "string",        // 用户名 (唯一，用于登录)
  "nickname": "string",        // 显示昵称
  "email": "string",           // 邮箱地址 (唯一，用于登录)
  "phone": "string",           // 手机号码
  "password": "string",        // 密码 (明文存储，仅用于开发环境)
  "avatar": "string",          // 头像路径
  "role": "admin|user",        // 用户角色
  "banned": boolean,           // 是否被禁用
  "isActive": boolean,         // 是否活跃用户
  "points": number,            // 积分数量
  "level": number,             // 用户等级 (1-5)
  "bio": "string",             // 个人简介
  "city": "string",            // 所在城市
  "gender": "male|female|''",  // 性别
  "age": number,               // 年龄
  "profession": "string",      // 职业
  "joinedDate": "YYYY-MM-DD",  // 加入日期
  "createdAt": "ISO_DATE",     // 创建时间
  "lastLoginAt": "ISO_DATE",   // 最后登录时间
  "lastLoginIp": "string"      // 最后登录IP
}
```

**索引建议**:
- PRIMARY KEY: `id`
- UNIQUE: `username`, `email`
- INDEX: `role`, `isActive`, `createdAt`

**测试数据**:
- 管理员: `admin` / `admin123`
- 普通用户: `zhangsan123` / `123456`
- 其他用户: `lisi_career`, `wangprof`, `zhangjob`

---

### 2. 问卷分类表 (categories)

**作用**: 管理问卷的分类信息

```json
{
  "id": "string",             // 分类ID
  "name": "string",           // 分类名称
  "slug": "string",           // URL友好标识 (用于路由)
  "count": number,            // 该分类下的问卷数量
  "description": "string"     // 分类描述
}
```

**分类列表**:
1. 心理健康 (psychology) - 18个问卷
2. 学习能力 (learning) - 15个问卷
3. 职业发展 (career) - 12个问卷
4. 生活方式 (lifestyle) - 14个问卷
5. 兴趣爱好 (hobbies) - 9个问卷
6. 人际关系 (social) - 11个问卷
7. 情绪管理 (emotion) - 13个问卷
8. 认知能力 (cognitive) - 10个问卷

**索引建议**:
- PRIMARY KEY: `id`
- UNIQUE: `slug`
- INDEX: `name`

---

### 3. 问卷表 (surveys)

**作用**: 存储问卷的基本信息和配置

```json
{
  "id": "string",                     // 问卷ID
  "title": "string",                  // 问卷标题
  "description": "string",            // 问卷描述
  "category": "string",               // 分类名称 (冗余字段，便于显示)
  "categoryId": number,               // 分类ID (外键)
  "author": "string",                 // 作者姓名 (冗余字段)
  "authorId": number,                 // 作者ID (外键)
  "questions": number,                // 题目数量统计
  "duration": number,                 // 预估完成时长(分钟)
  "difficulty": "简单|中等|困难",      // 难度等级
  "status": "draft|published|archived", // 发布状态
  "tags": ["string"],                 // 标签数组
  "thumbnail": "string",              // 缩略图路径
  "rating": number,                   // 平均评分 (1-5)
  "participants": number,             // 参与人数
  "participantCount": number,         // 参与人数统计 (冗余)
  "createdAt": "ISO_DATE",           // 创建时间
  "updatedAt": "ISO_DATE",           // 更新时间
  "questionList": [                   // 题目列表
    {
      "id": number,                   // 题目ID
      "type": "single|multiple",      // 题目类型
      "title": "string",              // 题目标题
      "options": [                    // 选项列表
        {
          "id": "string",             // 选项ID (a,b,c,d)
          "text": "string"            // 选项文本
        }
      ],
      "required": boolean             // 是否必答
    }
  ]
}
```

**关联关系**:
- `categoryId` → `categories.id`
- `authorId` → `users.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `categoryId`, `authorId`, `status`, `createdAt`
- FULLTEXT: `title`, `description`

---

### 4. 题目库表 (questions)

**作用**: 通用题目库，可复用于多个问卷

```json
{
  "id": "string",                    // 题目ID
  "type": "single|multiple|text",    // 题目类型
  "title": "string",                 // 题目标题
  "options": [                       // 选项数组 (单选/多选题)
    {
      "id": "string",                // 选项ID
      "text": "string"               // 选项文本
    }
  ],
  "category": "string",              // 题目分类
  "usageCount": number,              // 使用次数统计
  "createdAt": "ISO_DATE"            // 创建时间
}
```

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `type`, `category`, `usageCount`

---

### 5. 答题记录表 (answers)

**作用**: 存储用户的答题记录和结果

```json
{
  "id": "string",                    // 记录ID
  "userId": number,                  // 用户ID (外键)
  "surveyId": number,                // 问卷ID (外键)
  "surveyTitle": "string",           // 问卷标题 (冗余字段)
  "score": number,                   // 总分
  "result": "string",                // 结果评价
  "submittedAt": "ISO_DATE",         // 提交时间
  "duration": number,                // 答题时长(秒)
  "answers": [                       // 答案详情
    {
      "questionId": number,          // 题目ID
      "answer": "string|string[]"    // 用户答案 (单选为字符串，多选为数组)
    }
  ]
}
```

**关联关系**:
- `userId` → `users.id`
- `surveyId` → `surveys.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `userId`, `surveyId`, `submittedAt`
- COMPOSITE: `(userId, surveyId)` (用户-问卷组合索引)

---

### 6. 评论表 (comments)

**作用**: 存储用户对问卷的评论和评分

```json
{
  "id": "string",                    // 评论ID
  "surveyId": number,                // 问卷ID (外键)
  "userId": number,                  // 用户ID (外键)
  "username": "string",              // 用户名 (冗余字段)
  "avatar": "string",                // 用户头像 (冗余字段)
  "content": "string",               // 评论内容
  "rating": number,                  // 评分 (1-5星)
  "createdAt": "ISO_DATE"            // 创建时间
}
```

**关联关系**:
- `surveyId` → `surveys.id`
- `userId` → `users.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `surveyId`, `userId`, `createdAt`, `rating`

---

### 7. 收藏表 (favorites)

**作用**: 存储用户的问卷收藏记录

```json
{
  "id": "string",                    // 收藏记录ID
  "userId": number,                  // 用户ID (外键)
  "surveyId": number,                // 问卷ID (外键)
  "createdAt": "ISO_DATE"            // 收藏时间
}
```

**关联关系**:
- `userId` → `users.id`
- `surveyId` → `surveys.id`

**索引建议**:
- PRIMARY KEY: `id`
- UNIQUE: `(userId, surveyId)` (防止重复收藏)
- INDEX: `userId`, `surveyId`, `createdAt`

**设计说明**:
- 采用关系型设计，便于扩展 (可添加收藏标签、备注等)
- 支持按时间排序的收藏历史
- 便于统计某个问卷的收藏数量

---

### 8. 成就表 (achievements)

**作用**: 记录用户解锁的成就

```json
{
  "id": "string",                    // 成就记录ID
  "userId": number,                  // 用户ID (外键)
  "title": "string",                 // 成就标题
  "description": "string",           // 成就描述
  "icon": "string",                  // 成就图标 (emoji或图片路径)
  "unlockedAt": "ISO_DATE"           // 解锁时间
}
```

**关联关系**:
- `userId` → `users.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `userId`, `unlockedAt`

---

### 9. 分析报告表 (reports)

**作用**: 存储系统生成的个性化分析报告

```json
{
  "id": "string",                    // 报告ID
  "userId": number,                  // 用户ID (外键)
  "title": "string",                 // 报告标题
  "type": "string",                  // 报告类型
  "generatedAt": "ISO_DATE",         // 生成时间
  "content": {                       // 报告内容 (JSON对象)
    "summary": "string",             // 摘要
    "scores": {                      // 各项得分
      "logic": number,               // 逻辑思维
      "memory": number,              // 记忆能力
      "creativity": number           // 创造力
    },
    "suggestions": ["string"]        // 建议列表
  }
}
```

**关联关系**:
- `userId` → `users.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `userId`, `type`, `generatedAt`

---

### 10. 论坛帖子表 (forumPosts)

**作用**: 存储论坛中的讨论帖子

```json
{
  "id": "string",                    // 帖子ID
  "title": "string",                 // 帖子标题
  "excerpt": "string",               // 摘要
  "content": "string",               // 帖子内容
  "category": "string",              // 帖子分类
  "authorId": number,                // 作者ID (外键)
  "author": "string",                // 作者姓名 (冗余字段)
  "views": number,                   // 浏览次数
  "replies": number,                 // 回复数量
  "likes": number,                   // 点赞数量
  "createdAt": "ISO_DATE"            // 创建时间
}
```

**关联关系**:
- `authorId` → `users.id`

**索引建议**:
- PRIMARY KEY: `id`
- INDEX: `authorId`, `category`, `createdAt`, `views`
- FULLTEXT: `title`, `content`

---

### 11. 管理员统计表 (adminStats)

**作用**: 存储系统的统计数据 (单条记录)

```json
{
  "totalUsers": number,              // 总用户数
  "totalSurveys": number,            // 总问卷数
  "totalAnswers": number,            // 总答题数
  "activeUsers": number,             // 活跃用户数
  "todayRegistrations": number,      // 今日注册数
  "todaySubmissions": number,        // 今日提交数
  "monthlyGrowth": {                 // 月度增长率
    "users": number,                 // 用户增长率 (%)
    "surveys": number,               // 问卷增长率 (%)
    "answers": number                // 答题增长率 (%)
  }
}
```

---

### 12. 系统状态表 (systemStatus)

**作用**: 存储系统运行状态信息 (单条记录)

```json
{
  "serverStatus": "healthy|warning|error",  // 服务器状态
  "databaseStatus": "healthy|warning|error", // 数据库状态
  "memoryUsage": number,                     // 内存使用率 (%)
  "cpuUsage": number,                        // CPU使用率 (%)
  "diskUsage": number,                       // 磁盘使用率 (%)
  "uptime": "string",                        // 运行时间描述
  "lastBackup": "ISO_DATE"                   // 最后备份时间
}
```

---

### 13. 活动数据表 (activityData)

**作用**: 存储系统的日活跃数据，用于图表展示

```json
{
  "id": "string",                    // 记录ID
  "date": "YYYY-MM-DD",              // 日期
  "users": number,                   // 用户活动数
  "surveys": number,                 // 问卷创建数
  "answers": number                  // 答题数量
}
```

**索引建议**:
- PRIMARY KEY: `id`
- UNIQUE: `date`
- INDEX: `date`

---

## 🔗 数据关联关系图

```
users (1) ←→ (N) surveys        # 用户创建问卷
users (1) ←→ (N) answers        # 用户答题记录
users (1) ←→ (N) comments       # 用户评论
users (1) ←→ (N) favorites      # 用户收藏
users (1) ←→ (N) achievements   # 用户成就
users (1) ←→ (N) reports        # 用户报告
users (1) ←→ (N) forumPosts     # 用户发帖

categories (1) ←→ (N) surveys   # 分类包含问卷

surveys (1) ←→ (N) answers      # 问卷的答题记录
surveys (1) ←→ (N) comments     # 问卷的评论
surveys (1) ←→ (N) favorites    # 问卷的收藏
```

---

## 🚀 API 使用示例

### RESTful 端点

```bash
# 用户相关
GET    /users                    # 获取用户列表
GET    /users/1                  # 获取指定用户
POST   /users                    # 创建用户
PUT    /users/1                  # 更新用户
DELETE /users/1                  # 删除用户

# 问卷相关
GET    /surveys                  # 获取问卷列表
GET    /surveys/1                # 获取指定问卷
GET    /surveys?status=published # 获取已发布问卷
GET    /surveys?categoryId=1     # 按分类筛选

# 收藏相关
GET    /favorites?userId=1       # 获取用户收藏
POST   /favorites                # 添加收藏
DELETE /favorites/1              # 删除收藏

# 答题记录
GET    /answers?userId=1         # 获取用户答题记录
POST   /answers                  # 提交答案

# 论坛相关
GET    /forumPosts               # 获取帖子列表
POST   /forumPosts               # 发布帖子
```

### 查询参数支持

```bash
# 分页
GET /users?_page=1&_limit=10

# 排序
GET /surveys?_sort=createdAt&_order=desc

# 过滤
GET /surveys?status=published&categoryId=1

# 搜索
GET /surveys?q=心理测试

# 范围查询
GET /answers?submittedAt_gte=2024-01-01&submittedAt_lte=2024-01-31
```

---

## 🔄 后端迁移指南

### 1. 数据库选择建议

**推荐技术栈**:
- **MySQL/PostgreSQL**: 主要业务数据
- **Redis**: 缓存和会话存储
- **Elasticsearch**: 全文搜索 (可选)

### 2. 表结构迁移

**SQL创建语句示例** (MySQL):

```sql
-- 用户表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user',
    banned BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    points INT DEFAULT 0,
    level INT DEFAULT 1,
    bio TEXT,
    city VARCHAR(100),
    gender ENUM('male', 'female', ''),
    age INT,
    profession VARCHAR(100),
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    INDEX idx_role (role),
    INDEX idx_active (is_active),
    INDEX idx_created (created_at)
);

-- 问卷分类表
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    count INT DEFAULT 0,
    description TEXT,
    INDEX idx_name (name)
);

-- 问卷表
CREATE TABLE surveys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT,
    author_id BIGINT NOT NULL,
    questions_count INT DEFAULT 0,
    duration INT DEFAULT 0,
    difficulty ENUM('简单', '中等', '困难') DEFAULT '中等',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    tags JSON,
    thumbnail VARCHAR(255),
    rating DECIMAL(2,1) DEFAULT 0,
    participants INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (author_id) REFERENCES users(id),
    INDEX idx_category (category_id),
    INDEX idx_author (author_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FULLTEXT idx_title_desc (title, description)
);

-- 收藏表
CREATE TABLE favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    survey_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_survey (user_id, survey_id),
    INDEX idx_user (user_id),
    INDEX idx_survey (survey_id),
    INDEX idx_created (created_at)
);
```

### 3. 数据迁移脚本

**Node.js 迁移脚本示例**:

```javascript
const fs = require('fs');
const mysql = require('mysql2/promise');

async function migrateData() {
    // 读取JSON数据
    const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    
    // 连接数据库
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'questionnaire_system'
    });
    
    try {
        // 迁移用户数据
        for (const user of data.users) {
            await connection.execute(`
                INSERT INTO users (
                    username, nickname, email, phone, password_hash,
                    avatar, role, banned, is_active, points, level,
                    bio, city, gender, age, profession, joined_date,
                    created_at, last_login_at, last_login_ip
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.username, user.nickname, user.email, user.phone,
                user.password, // 注意：生产环境需要加密
                user.avatar, user.role, user.banned, user.isActive,
                user.points, user.level, user.bio, user.city,
                user.gender, user.age, user.profession, user.joinedDate,
                user.createdAt, user.lastLoginAt, user.lastLoginIp
            ]);
        }
        
        // 迁移分类数据
        for (const category of data.categories) {
            await connection.execute(`
                INSERT INTO categories (name, slug, count, description)
                VALUES (?, ?, ?, ?)
            `, [category.name, category.slug, category.count, category.description]);
        }
        
        // 迁移收藏数据
        for (const favorite of data.favorites) {
            await connection.execute(`
                INSERT INTO favorites (user_id, survey_id, created_at)
                VALUES (?, ?, ?)
            `, [favorite.userId, favorite.surveyId, favorite.createdAt]);
        }
        
        console.log('数据迁移完成!');
        
    } catch (error) {
        console.error('迁移失败:', error);
    } finally {
        await connection.end();
    }
}

migrateData();
```

### 4. API重构建议

**Express.js 路由示例**:

```javascript
// routes/favorites.js
const express = require('express');
const router = express.Router();

// 获取用户收藏
router.get('/', async (req, res) => {
    const { userId } = req.query;
    
    const favorites = await db.query(`
        SELECT f.*, s.title, s.thumbnail, s.rating
        FROM favorites f
        JOIN surveys s ON f.survey_id = s.id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json(favorites);
});

// 添加收藏
router.post('/', async (req, res) => {
    const { userId, surveyId } = req.body;
    
    try {
        await db.execute(`
            INSERT INTO favorites (user_id, survey_id)
            VALUES (?, ?)
        `, [userId, surveyId]);
        
        res.json({ success: true, message: '收藏成功' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ error: '已经收藏过此问卷' });
        } else {
            res.status(500).json({ error: '收藏失败' });
        }
    }
});

module.exports = router;
```

---

## 🎯 最佳实践建议

### 1. 数据设计原则
- ✅ **保持关系型结构**: 便于查询和扩展
- ✅ **合理使用冗余**: 提升查询性能
- ✅ **添加时间戳**: 便于数据追踪
- ✅ **设置外键约束**: 保证数据完整性

### 2. 性能优化
- 🚀 **创建合适索引**: 基于查询模式设计
- 🚀 **分页查询**: 避免大量数据加载
- 🚀 **缓存热点数据**: 使用Redis缓存
- 🚀 **读写分离**: 高并发场景下分离读写

### 3. 安全考虑
- 🔒 **密码加密**: 使用bcrypt等安全算法
- 🔒 **SQL注入防护**: 使用参数化查询
- 🔒 **权限控制**: 实施基于角色的访问控制
- 🔒 **数据验证**: 前后端双重验证

### 4. 扩展规划
- 📈 **分表策略**: 大数据量时考虑分表
- 📈 **微服务化**: 按业务域拆分服务
- 📈 **消息队列**: 异步处理提升性能
- 📈 **监控告警**: 完善的监控体系

---

## 📋 数据完整性检查清单

### 迁移前检查
- [ ] 所有外键关系正确
- [ ] 必填字段不为空
- [ ] 唯一约束不冲突
- [ ] 数据类型匹配
- [ ] 时间格式统一

### 迁移后验证
- [ ] 数据条数一致
- [ ] 关联查询正常
- [ ] API接口功能正常
- [ ] 性能满足要求
- [ ] 备份恢复测试

---

## 🆘 常见问题解答

**Q: 为什么收藏表不用数组存储？**
A: 关系型设计便于扩展功能（如收藏分类、备注）、支持复杂查询（时间排序、统计）、符合数据库设计规范。

**Q: 如何处理大量用户的收藏数据？**
A: 可以考虑分表、缓存热门收藏、定期清理无效收藏等策略。

**Q: JSON字段在关系型数据库中如何处理？**
A: MySQL 5.7+、PostgreSQL 支持原生JSON类型；较老版本可存储为TEXT并在应用层解析。

**Q: 数据迁移过程中如何保证服务不中断？**
A: 采用灰度迁移、读写分离、蓝绿部署等策略，确保平滑迁移。

---

## 📝 版本更新记录

- **v1.0** (2024-01-01): 初始版本，基础数据结构设计
- **v1.1** (2024-01-15): 添加论坛功能相关表
- **v1.2** (2024-01-25): 优化收藏表结构，添加成就系统

---

*本文档随系统开发持续更新，如有疑问请联系开发团队。*