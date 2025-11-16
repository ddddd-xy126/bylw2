# 问卷系统后端部署指南

## ✅ 已完成的工作

1. ✅ 完整的后端项目结构已创建
2. ✅ 数据库配置已完成
3. ✅ 所有 Sequelize 模型已创建（9 个模型）
4. ✅ 所有中间件已创建（认证、验证、错误处理）
5. ✅ 所有控制器已创建（7 个控制器）
6. ✅ 所有路由已配置（7 个路由文件）
7. ✅ Express 应用和服务器入口已创建
8. ✅ 数据迁移脚本已创建
9. ✅ 前端 API 配置已更新（基础配置和认证 API）

---

## 📦 下一步操作

### 1. 安装后端依赖

```powershell
cd server
npm install
```

### 2. 配置 MySQL 数据库

确保 MySQL 服务已启动，然后创建数据库：

```sql
CREATE DATABASE IF NOT EXISTS questionnaire_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

或使用提供的脚本：

```powershell
# 使用 MySQL 命令行
mysql -u root -p
# 输入密码: dxy040126..
# 然后执行:
CREATE DATABASE IF NOT EXISTS questionnaire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3. 启动后端服务器

```powershell
cd server
npm run dev
```

服务器将在 http://localhost:3000 启动

### 4. 迁移数据

在后端服务器启动后，运行数据迁移脚本：

```powershell
cd server
npm run migrate
```

这将从 `client/db.json` 导入所有现有数据到 MySQL。

### 5. 更新前端 API 调用

需要更新以下 API 文件以适配新后端：

- ✅ `client/src/api/index.js` - 已更新（基础配置）
- ✅ `client/src/api/auth.js` - 已更新
- ⚠️ `client/src/api/questionnaire.js` - 需要更新
- ⚠️ `client/src/api/survey.js` - 需要更新
- ⚠️ `client/src/api/user.js` - 需要更新
- ⚠️ `client/src/api/admin.js` - 需要更新

### 6. 测试接口

使用 Postman 或类似工具测试 API：

#### 注册

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

#### 登录

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}
```

#### 获取问卷列表

```
GET http://localhost:3000/api/surveys?status=published&page=1&limit=10
```

---

## 🔧 环境变量说明

`server/.env` 文件已配置：

- `PORT=3000` - 后端服务器端口
- `DB_HOST=127.0.0.1` - 数据库主机
- `DB_PORT=3306` - 数据库端口
- `DB_NAME=questionnaire_db` - 数据库名称
- `DB_USER=root` - 数据库用户名
- `DB_PASSWORD=dxy040126..` - 数据库密码
- `JWT_SECRET` - JWT 加密密钥
- `CORS_ORIGIN=http://localhost:5173` - 允许的前端地址

---

## 📊 数据库表结构

系统包含 9 张核心表：

1. **users** - 用户表
2. **categories** - 分类表
3. **surveys** - 问卷表
4. **answers** - 答案表
5. **comments** - 评论表
6. **favorites** - 收藏表
7. **announcements** - 公告表
8. **point_histories** - 积分历史表
9. **admin_activities** - 管理员活动日志表

---

## 🔐 认证机制

- 使用 **JWT** 进行用户认证
- Token 通过 `Authorization: Bearer <token>` 头传递
- 密码使用 **bcrypt** 加密存储
- 支持用户和管理员两种角色

---

## 📡 API 端点概览

### 认证相关

- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户信息

### 用户相关

- `GET /api/users/profile/:id?` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `PUT /api/users/password` - 修改密码
- `GET /api/users/surveys/:id?` - 获取用户的问卷
- `GET /api/users/answers/:id?` - 获取用户的答题记录
- `GET /api/users/favorites/:id?` - 获取用户的收藏
- `GET /api/users/points/:id?` - 获取用户的积分历史

### 问卷相关

- `GET /api/surveys` - 获取问卷列表
- `POST /api/surveys` - 创建问卷
- `GET /api/surveys/:id` - 获取问卷详情
- `PUT /api/surveys/:id` - 更新问卷
- `DELETE /api/surveys/:id` - 删除问卷
- `GET /api/surveys/:id/stats` - 获取问卷统计
- `POST /api/surveys/:id/favorite` - 收藏/取消收藏
- `GET /api/surveys/:id/favorite/check` - 检查是否收藏

### 答案相关

- `POST /api/answers` - 提交答案
- `GET /api/answers/:id` - 获取答案详情
- `GET /api/answers/survey/:surveyId` - 获取用户在某问卷的答案
- `GET /api/answers/survey/:surveyId/check` - 检查是否已答题
- `DELETE /api/answers/:id` - 删除答案

### 评论相关

- `GET /api/comments/survey/:surveyId` - 获取问卷的评论
- `POST /api/comments/survey/:surveyId` - 创建评论
- `PUT /api/comments/:id` - 更新评论
- `DELETE /api/comments/:id` - 删除评论

### 分类相关

- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 获取单个分类
- `GET /api/categories/slug/:slug` - 通过 slug 获取分类
- `POST /api/categories` - 创建分类（管理员）
- `PUT /api/categories/:id` - 更新分类（管理员）
- `DELETE /api/categories/:id` - 删除分类（管理员）

### 管理员相关

- `GET /api/admin/dashboard/stats` - 仪表板统计
- `GET /api/admin/users` - 获取所有用户
- `PUT /api/admin/users/:id/role` - 更新用户角色
- `DELETE /api/admin/users/:id` - 删除用户
- `PUT /api/admin/surveys/:id/review` - 审核问卷
- `GET /api/admin/announcements` - 获取所有公告
- `POST /api/admin/announcements` - 创建公告
- `PUT /api/admin/announcements/:id` - 更新公告
- `DELETE /api/admin/announcements/:id` - 删除公告
- `GET /api/admin/activities` - 获取管理员活动日志

---

## ⚠️ 注意事项

1. **数据迁移警告**: 运行 `npm run migrate` 会清空现有数据库并重新导入。请谨慎操作。

2. **环境配置**: 生产环境需要修改 `.env` 文件中的配置，特别是：

   - `JWT_SECRET` 应使用更复杂的密钥
   - `NODE_ENV` 设置为 `production`
   - 数据库密码不应暴露在代码中

3. **CORS 配置**: 如果前端地址改变，需要更新 `.env` 中的 `CORS_ORIGIN`

4. **端口冲突**: 确保 3000 端口未被占用，或修改 `.env` 中的 `PORT`

---

## 🚀 启动完整系统

### 开发环境

Terminal 1 - 后端：

```powershell
cd server
npm run dev
```

Terminal 2 - 前端：

```powershell
cd client
npm run dev
```

### 生产环境

```powershell
# 构建前端
cd client
npm run build

# 启动后端（使用 PM2）
cd ../server
pm2 start server.js --name questionnaire-api
```

---

## 📝 待完成的前端 API 适配

需要更新以下文件以匹配新的后端 API：

### client/src/api/questionnaire.js

需要修改的函数：

- `listQuestionnaires()` - 适配分页和筛选参数
- `createQuestionnaire()` - 简化 payload
- `updateQuestionnaire()` - 简化 payload
- `submitAnswer()` - 调用新的 /api/answers 端点

### client/src/api/survey.js

需要适配的接口：

- 问卷列表查询
- 评论功能
- 收藏功能

### client/src/api/user.js

需要适配的接口：

- 用户资料获取和更新
- 积分历史
- 用户统计

### client/src/api/admin.js

需要适配的接口：

- 用户管理
- 问卷审核
- 公告管理
- 活动日志

---

## 🐛 故障排查

### 数据库连接失败

- 检查 MySQL 服务是否启动
- 验证数据库配置（用户名、密码、端口）
- 确保数据库 `questionnaire_db` 已创建

### 依赖安装失败

- 检查网络连接
- 尝试使用淘宝镜像: `npm config set registry https://registry.npmmirror.com`

### 端口占用

- 修改 `.env` 中的 `PORT` 值
- 或终止占用 3000 端口的进程

---

## 📖 更多文档

详细的迁移方案请参考: `BACKEND_MIGRATION_PLAN.md`

---

**创建时间**: 2025-11-16  
**系统版本**: 1.0.0  
**作者**: GitHub Copilot
