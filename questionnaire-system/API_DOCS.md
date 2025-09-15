// 📋 API 接口文档和端口配置
// 后端: http://localhost:3000
// 前端: http://localhost:5173

## 🚀 端口配置

- 后端服务器: http://localhost:3000
- 前端开发服务器: http://localhost:5173
- 前端代理: /api/_ → http://localhost:3000/api/_

## 🛠️ 完整 API 接口列表

### 1️⃣ 系统健康检查

GET /api/health - 健康检查

### 2️⃣ 用户认证 (/api/user & /api/auth)

POST /api/user/register - 用户注册
POST /api/user/login - 用户登录  
POST /api/auth/login - 备用登录接口
GET /api/user/profile - 获取用户资料 [需 token]

### 3️⃣ 用户中心 (/api/user)

GET /api/user/favorites - 获取用户收藏 [需 token]
POST /api/user/favorites/:surveyId - 收藏问卷 [需 token]
DELETE /api/user/favorites/:surveyId - 取消收藏 [需 token]
GET /api/user/answers - 获取答卷记录 [需 token]
GET /api/user/achievements - 获取成就 [需 token]
GET /api/user/reports - 获取 AI 报告 [需 token]

### 4️⃣ 问卷管理 (/api/questionnaire)

GET /api/questionnaire - 获取问卷列表
POST /api/questionnaire - 创建问卷 [需 token]
GET /api/questionnaire/:id - 获取问卷详情

### 5️⃣ 问卷调查 (/api/surveys)

GET /api/surveys - 获取调查问卷列表
GET /api/surveys/:id - 获取问卷详情
POST /api/surveys/:id/submit - 提交答卷 [需 token]
GET /api/surveys/:id/comments - 获取评论
POST /api/surveys/:id/comments - 发表评论 [需 token]

### 6️⃣ 管理后台 (/api/admin) [需管理员权限]

POST /api/admin/seed-admin - 创建管理员账号
GET /api/admin/users - 获取所有用户
POST /api/admin/users - 创建用户
DELETE /api/admin/users/:id - 删除用户
POST /api/admin/users/:id/ban - 封禁用户
POST /api/admin/users/:id/unban - 解封用户
POST /api/admin/surveys - 创建问卷
DELETE /api/admin/surveys/:id - 删除问卷
GET /api/admin/questions - 获取题目列表
POST /api/admin/questions - 创建题目
DELETE /api/admin/questions/:id - 删除题目

## 🔑 认证说明

- [需 token]: 需要在请求头添加 Authorization: Bearer <token>
- [需管理员权限]: 需要管理员角色token

## 📱 测试账号

- 管理员: admin@example.com / admin123
- 用户 1: user@example.com / user123
- 用户 2: alice@example.com / alice123
- 用户 3: bob@example.com / bob123
- 用户 4: catherine@example.com / catherine123
- 用户 5: david@example.com / david123
- 封禁用户: banned@example.com / banned123
