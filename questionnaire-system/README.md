# 智能问卷分析系统（Vue3 + Node.js）

基于 Vue3 + Express + MySQL 的前后端分离问卷系统，支持用户端测评、个人中心与排行榜，及后台的问卷/用户/管理员管理与数据统计。已对接后端 API，前端通过 Vite 代理访问 `/api` 前缀，即可直连后端。

## 技术选型

- 前端：Vue3、Vite、Pinia、Vue Router、Element Plus、Axios
- 后端：Node.js、Express、JWT、Sequelize ORM、MySQL

## 目录结构（规整后）

```text
questionnaire-system/
├── client/                         # 前端（Vite + Vue3）
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── questionnaire/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.vue
│   │   │   └── UserLayout.vue      # 全站头部：智能问卷分析系统 | 问卷广场 | 登录/注册 或 昵称/退出
│   │   ├── views/
│   │   │   ├── frontend/                       # 前台页面
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.vue           # /login
│   │   │   │   │   ├── RegisterPage.vue        # /register
│   │   │   │   │   └── ResetPasswordPage.vue   # /reset-password
│   │   │   │   ├── home/
│   │   │   │   │   └── HomePage.vue            # /home（问卷广场）
│   │   │   │   ├── survey/
│   │   │   │   │   ├── DetailPage.vue          # /surveys/:id（详情）
│   │   │   │   │   ├── AnswerPage.vue          # /surveys/answer/:id（作答）
│   │   │   │   │   └── ResultPage.vue          # /surveys/result/:recordId（报告）
│   │   │   │   ├── rankings/
│   │   │   │   │   ├── RankingsLayout.vue      # /rankings（父级）
│   │   │   │   │   ├── ParticipationPage.vue   # /rankings/participation
│   │   │   │   │   ├── RatingPage.vue          # /rankings/rating
│   │   │   │   │   ├── UserPointsPage.vue      # /rankings/user-points
│   │   │   │   │   └── components/             # 排行榜相关组件
│   │   │   │   ├── user/
│   │   │   │   │   ├── ProfileLayout.vue       # /profile（父级带侧边菜单）
│   │   │   │   │   ├── HistoryPage.vue         # /profile/history
│   │   │   │   │   └── components/profile/     # 用户相关组件
│   │   │   │   └── questionnaire/
│   │   │   │       ├── CreatePage.vue          # /create
│   │   │   │       ├── TemplateSelectionPage.vue # /create/templates
│   │   │   │       └── CustomCreatePage.vue    # /create/custom
│   │   │   ├── backend/                        # 后台管理页面
│   │   │   │   └── admin/
│   │   │   │       ├── LoginPage.vue           # /admin/login
│   │   │   │       ├── DashboardPage.vue       # /admin/dashboard
│   │   │   │       └── components/             # 后台管理组件
│   │   │   │   └── profile/
│   │   │   │       ├── ProfileLayout.vue       # /profile（父级带侧边菜单）
│   │   │   │       ├── Info.vue                # /profile/info
│   │   │   │       ├── Creations.vue           # /profile/creations
│   │   │   │       ├── CreationEditor.vue      # /profile/creations/editor
│   │   │   │       ├── History.vue             # /profile/history
│   │   │   │       ├── Collections.vue         # /profile/collections
│   │   │   │       ├── Achievements.vue        # /profile/achievements
│   │   │   │       └── Reports.vue             # /profile/reports
│   │   │   └── error/
│   │   │       ├── 403.vue
│   │   │       └── 404.vue
│   │   ├── router/
│   │   │   ├── index.js                        # 合并路由与全局守卫（requiresAuth / requiresAdmin）
│   │   │   ├── adminRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── store/
│   │   │   ├── index.js
│   │   │   └── user.js                         # token/profile 本地持久化
│   │   ├── api/                                # 统一 Axios 实例（自动注入 Authorization）
│   │   ├── utils/
│   │   ├── animations/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js                          # devServer 代理 /api → http://localhost:3000
│
├── server/                         # 后端（Express + Sequelize + MySQL）
│   ├── config/
│   │   └── config.default.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── questionnaireController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js                  # verifyToken / isAdmin
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js（可选）
│   │   ├── user.js（含 role: ENUM('user','admin')）
│   │   ├── questionnaire.js
│   │   ├── question.js
│   │   └── answer.js
│   ├── routes/
│   │   ├── index.js                           # 聚合 /user /questionnaire /admin /auth
│   │   ├── userRoutes.js                      # /api/user/*
│   │   ├── questionnaireRoutes.js             # /api/questionnaire/*
│   │   ├── admin.js                           # /api/admin/*（受保护）
│   │   └── auth.js                            # /api/auth/login（与 /api/user/login 等价）
│   ├── services/
│   ├── app.js
│   └── package.json
│
└── README.md
```

## 前后端连通性说明

- 前端 Axios 实例 `client/src/api/index.js` 统一设置 `baseURL: '/api'`，并在请求拦截器中自动注入 `Authorization: Bearer <token>`。
- 前端开发代理见 `client/vite.config.js`：将 `/api` 代理到 `http://localhost:3000`（后端）。
- 后端在 `server/app.js` 中挂载 `app.use('/api', apiRoutes)`，与前端 `/api/*` 路径直接对接。

## 主要路由与权限

前端（示例）：

- 用户端：
  - `/home`（问卷广场）
  - `/surveys/:id`（详情）→ `/surveys/answer/:id`（作答）→ `/surveys/result/:recordId`（报告）
  - `/rankings/*`（参与度/评分/积分）
  - `/profile/*`（资料/创作/历史/收藏/成就/报告），父路由 `meta: { requiresAuth: true }`
  - `/login`、`/register`、`/reset-password`
- 管理端（均需管理员）：
  - `/admin/login`（管理员登录）
  - `/admin/dashboard`
  - `/admin/admins`、`/admin/users`
  - `/admin/surveys`、`/admin/surveys/create`、`/admin/surveys/edit/:id`、`/admin/surveys/review`
  - `/admin/statistics/completion`、`/admin/statistics/distribution`

权限策略：

- 全局路由守卫位于 `client/src/router/index.js`，按 `to.meta.requiresAuth` 和 `to.meta.requiresAdmin` 判定：
  - 未登录访问需登录路由 → 重定向至 `/login`（或管理员页重定向 `/admin/login`）
  - 非管理员访问管理员路由 → 重定向 `/403`
- 用户状态存储于 Pinia：`store/user.js`，并持久化到 `localStorage`。

后端 API（节选）：

- 认证与用户
  - `POST /api/user/register` 注册
  - `POST /api/user/login` 登录（也可 `POST /api/auth/login`）
  - `GET  /api/user/profile`（需登录）
- 问卷
  - `GET  /api/questionnaire` 列表
  - `GET  /api/questionnaire/:id` 详情（含题目示例数据）
  - `POST /api/questionnaire` 创建（需登录）
- 管理员（需 `verifyToken + isAdmin`）
  - `GET    /api/admin/users` 用户列表
  - `DELETE /api/admin/surveys/:id` 删除问卷

## 快速开始

1. 后端

```bash
cd server
npm i
# 配置数据库：编辑 config/config.default.js（或用环境变量覆盖）
npm run dev
# 运行在 http://localhost:3000，启动时会 sequelize.sync()
```

2. 前端

```bash
cd client
npm i
npm run dev
# 运行在 http://localhost:5173，经 vite 代理访问后端 /api
```

## 备注

- 用户端头部统一在 `UserLayout.vue`，未登录显示“登录/注册”，已登录显示“昵称/退出”。
- `QuestionnaireDetail.vue` 负责动态作答逻辑的核心已抽离为专用作答页 `views/frontend/survey/AnswerPage.vue` 并通过 `/surveys/answer/:id` 路由访问。
- 如需接入 AI 个性化报告，可在 `server/services/` 中扩展服务，并在相应 Controller 中调用。

## 许可证

MIT
