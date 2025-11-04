# 智能问卷分析系统（Vue3 前端）# 智能问卷分析系统（Vue3 + Node.js）



基于 Vue3 的纯前端问卷系统，支持用户端测评、个人中心与排行榜等功能展示。基于 Vue3 + Express + MySQL 的前后端分离问卷系统，支持用户端测评、个人中心与排行榜，及后台的问卷/用户/管理员管理与数据统计。已对接后端 API，前端通过 Vite 代理访问 `/api` 前缀，即可直连后端。



## 技术选型## 技术选型



- 前端：Vue3、Vite、Pinia、Vue Router、Element Plus、Axios- 前端：Vue3、Vite、Pinia、Vue Router、Element Plus、Axios

- 后端：Node.js、Express、JWT、Sequelize ORM、MySQL

## 目录结构

## 目录结构（规整后）

```text

questionnaire-system/```text

├── client/                         # 前端（Vite + Vue3）questionnaire-system/

│   ├── public/├── client/                         # 前端（Vite + Vue3）

│   │   └── badges/                 # 徽章图标资源│   ├── public/

│   ├── src/│   ├── src/

│   │   ├── assets/                 # 样式文件│   │   ├── assets/

│   │   │   ├── element.scss│   │   ├── components/

│   │   │   ├── main.scss│   │   │   ├── common/

│   │   │   └── theme.scss│   │   │   └── questionnaire/

│   │   ├── components/             # 公共组件│   │   ├── layouts/

│   │   │   ├── ColorSystemDemo.vue│   │   │   ├── AdminLayout.vue

│   │   │   ├── DynamicProgress.vue│   │   │   └── UserLayout.vue      # 全站头部：智能问卷分析系统 | 问卷广场 | 登录/注册 或 昵称/退出

│   │   │   ├── LiquidFill.vue│   │   ├── views/

│   │   │   └── TreeGrowth.vue│   │   │   ├── frontend/                       # 前台页面

│   │   ├── composables/            # 组合式函数│   │   │   │   ├── auth/

│   │   │   └── useHomeLogic.js│   │   │   │   │   ├── LoginPage.vue           # /login

│   │   ├── hooks/                  # 自定义 hooks│   │   │   │   │   ├── RegisterPage.vue        # /register

│   │   │   └── useListFilter.js│   │   │   │   │   └── ResetPasswordPage.vue   # /reset-password

│   │   ├── layouts/                # 布局组件│   │   │   │   ├── home/

│   │   │   ├── AdminLayout.vue│   │   │   │   │   └── HomePage.vue            # /home（问卷广场）

│   │   │   └── UserLayout.vue     # 全站头部│   │   │   │   ├── survey/

│   │   ├── views/                  # 页面视图│   │   │   │   │   ├── DetailPage.vue          # /surveys/:id（详情）

│   │   │   ├── frontend/           # 前台页面│   │   │   │   │   ├── AnswerPage.vue          # /surveys/answer/:id（作答）

│   │   │   │   ├── auth/           # 登录/注册/重置密码│   │   │   │   │   └── ResultPage.vue          # /surveys/result/:recordId（报告）

│   │   │   │   ├── home/           # 问卷广场│   │   │   │   ├── rankings/

│   │   │   │   ├── survey/         # 问卷详情/作答/结果│   │   │   │   │   ├── RankingsLayout.vue      # /rankings（父级）

│   │   │   │   ├── rankings/       # 排行榜│   │   │   │   │   ├── ParticipationPage.vue   # /rankings/participation

│   │   │   │   ├── user/           # 个人中心│   │   │   │   │   ├── RatingPage.vue          # /rankings/rating

│   │   │   │   └── questionnaire/  # 问卷创建│   │   │   │   │   ├── UserPointsPage.vue      # /rankings/user-points

│   │   │   ├── backend/            # 后台管理页面│   │   │   │   │   └── components/             # 排行榜相关组件

│   │   │   │   └── admin/│   │   │   │   ├── user/

│   │   │   ├── common/             # 通用演示页│   │   │   │   │   ├── ProfileLayout.vue       # /profile（父级带侧边菜单）

│   │   │   └── error/              # 错误页面│   │   │   │   │   ├── HistoryPage.vue         # /profile/history

│   │   ├── router/                 # 路由配置│   │   │   │   │   └── components/profile/     # 用户相关组件

│   │   │   ├── index.js│   │   │   │   └── questionnaire/

│   │   │   ├── adminRoutes.js│   │   │   │       ├── CreatePage.vue          # /create

│   │   │   └── userRoutes.js│   │   │   │       ├── TemplateSelectionPage.vue # /create/templates

│   │   ├── store/                  # 状态管理│   │   │   │       └── CustomCreatePage.vue    # /create/custom

│   │   │   ├── index.js│   │   │   ├── backend/                        # 后台管理页面

│   │   │   ├── user.js│   │   │   │   └── admin/

│   │   │   ├── questionnaire.js│   │   │   │       ├── LoginPage.vue           # /admin/login

│   │   │   └── data.js│   │   │   │       ├── DashboardPage.vue       # /admin/dashboard

│   │   ├── api/                    # API 接口│   │   │   │       └── components/             # 后台管理组件

│   │   │   ├── index.js│   │   │   │   └── profile/

│   │   │   ├── auth.js│   │   │   │       ├── ProfileLayout.vue       # /profile（父级带侧边菜单）

│   │   │   ├── user.js│   │   │   │       ├── Info.vue                # /profile/info

│   │   │   ├── admin.js│   │   │   │       ├── Creations.vue           # /profile/creations

│   │   │   ├── questionnaire.js│   │   │   │       ├── CreationEditor.vue      # /profile/creations/editor

│   │   │   └── survey.js│   │   │   │       ├── History.vue             # /profile/history

│   │   ├── utils/                  # 工具函数│   │   │   │       ├── Collections.vue         # /profile/collections

│   │   │   ├── logicEngine.js│   │   │   │       ├── Achievements.vue        # /profile/achievements

│   │   │   ├── recommendation.js│   │   │   │       └── Reports.vue             # /profile/reports

│   │   │   └── scoring.js│   │   │   └── error/

│   │   ├── App.vue│   │   │       ├── 403.vue

│   │   └── main.js│   │   │       └── 404.vue

│   ├── index.html│   │   ├── router/

│   ├── package.json│   │   │   ├── index.js                        # 合并路由与全局守卫（requiresAuth / requiresAdmin）

│   ├── vite.config.js│   │   │   ├── adminRoutes.js

│   └── db.json                     # json-server 模拟数据│   │   │   └── userRoutes.js

││   │   ├── store/

└── README.md│   │   │   ├── index.js

```│   │   │   └── user.js                         # token/profile 本地持久化

│   │   ├── api/                                # 统一 Axios 实例（自动注入 Authorization）

## 主要功能│   │   ├── utils/

│   │   ├── animations/

### 用户端│   │   ├── App.vue

│   │   └── main.js

- **认证系统**：│   ├── index.html

  - `/login` - 用户登录│   ├── package.json

  - `/register` - 用户注册│   └── vite.config.js                          # devServer 代理 /api → http://localhost:3000

  - `/reset-password` - 重置密码│

├── server/                         # 后端（Express + Sequelize + MySQL）

- **问卷广场**：│   ├── config/

  - `/home` - 浏览所有问卷│   │   └── config.default.js

│   ├── controllers/

- **问卷相关**：│   │   ├── adminController.js

  - `/surveys/:id` - 问卷详情│   │   ├── questionnaireController.js

  - `/surveys/answer/:id` - 作答问卷│   │   └── userController.js

  - `/surveys/result/:recordId` - 查看测评报告│   ├── middleware/

│   │   ├── authMiddleware.js                  # verifyToken / isAdmin

- **排行榜**：│   │   └── errorHandler.js

  - `/rankings/participation` - 参与度排行│   ├── models/

  - `/rankings/rating` - 评分排行│   │   ├── index.js（可选）

  - `/rankings/user-points` - 用户积分排行│   │   ├── user.js（含 role: ENUM('user','admin')）

│   │   ├── questionnaire.js

- **个人中心** (需登录)：│   │   ├── question.js

  - `/profile/info` - 个人资料│   │   └── answer.js

  - `/profile/creations` - 我的创作│   ├── routes/

  - `/profile/history` - 作答历史│   │   ├── index.js                           # 聚合 /user /questionnaire /admin /auth

  - `/profile/collections` - 我的收藏│   │   ├── userRoutes.js                      # /api/user/*

  - `/profile/achievements` - 成就徽章│   │   ├── questionnaireRoutes.js             # /api/questionnaire/*

  - `/profile/reports` - 我的报告│   │   ├── admin.js                           # /api/admin/*（受保护）

│   │   └── auth.js                            # /api/auth/login（与 /api/user/login 等价）

- **问卷创建**：│   ├── services/

  - `/create` - 创建问卷│   ├── app.js

  - `/create/templates` - 模板选择│   └── package.json

  - `/create/custom` - 自定义创建│

└── README.md

### 管理端```



- `/admin/login` - 管理员登录## 前后端连通性说明

- `/admin/dashboard` - 管理仪表板

- 其他管理功能页面- 前端 Axios 实例 `client/src/api/index.js` 统一设置 `baseURL: '/api'`，并在请求拦截器中自动注入 `Authorization: Bearer <token>`。

- 前端开发代理见 `client/vite.config.js`：将 `/api` 代理到 `http://localhost:3000`（后端）。

## 快速开始- 后端在 `server/app.js` 中挂载 `app.use('/api', apiRoutes)`，与前端 `/api/*` 路径直接对接。



### 1. 安装依赖## 主要路由与权限



```bash前端（示例）：

cd client

npm install- 用户端：

```  - `/home`（问卷广场）

  - `/surveys/:id`（详情）→ `/surveys/answer/:id`（作答）→ `/surveys/result/:recordId`（报告）

### 2. 启动开发服务器  - `/rankings/*`（参与度/评分/积分）

  - `/profile/*`（资料/创作/历史/收藏/成就/报告），父路由 `meta: { requiresAuth: true }`

```bash  - `/login`、`/register`、`/reset-password`

npm run dev- 管理端（均需管理员）：

```  - `/admin/login`（管理员登录）

  - `/admin/dashboard`

应用将运行在 `http://localhost:5173`  - `/admin/admins`、`/admin/users`

  - `/admin/surveys`、`/admin/surveys/create`、`/admin/surveys/edit/:id`、`/admin/surveys/review`

### 3. (可选) 使用 Mock 数据  - `/admin/statistics/completion`、`/admin/statistics/distribution`



如果需要使用 json-server 模拟后端数据：权限策略：



```bash- 全局路由守卫位于 `client/src/router/index.js`，按 `to.meta.requiresAuth` 和 `to.meta.requiresAdmin` 判定：

# 在 client 目录下  - 未登录访问需登录路由 → 重定向至 `/login`（或管理员页重定向 `/admin/login`）

npx json-server --watch db.json --port 3002  - 非管理员访问管理员路由 → 重定向 `/403`

```- 用户状态存储于 Pinia：`store/user.js`，并持久化到 `localStorage`。



## 构建生产版本后端 API（节选）：



```bash- 认证与用户

cd client  - `POST /api/user/register` 注册

npm run build  - `POST /api/user/login` 登录（也可 `POST /api/auth/login`）

```  - `GET  /api/user/profile`（需登录）

- 问卷

构建产物将输出到 `client/dist` 目录。  - `GET  /api/questionnaire` 列表

  - `GET  /api/questionnaire/:id` 详情（含题目示例数据）

## 权限策略  - `POST /api/questionnaire` 创建（需登录）

- 管理员（需 `verifyToken + isAdmin`）

- 全局路由守卫位于 `client/src/router/index.js`  - `GET    /api/admin/users` 用户列表

- 通过 `meta.requiresAuth` 控制需要登录的路由  - `DELETE /api/admin/surveys/:id` 删除问卷

- 通过 `meta.requiresAdmin` 控制需要管理员权限的路由

- 用户状态存储在 Pinia (`store/user.js`) 并持久化到 `localStorage`## 快速开始



## 主要技术特性1. 后端



- ⚡️ **Vite** - 极速的开发体验```bash

- 🎨 **Element Plus** - 优雅的 UI 组件库cd server

- 🗂 **Pinia** - 直观的状态管理npm i

- 🛣 **Vue Router** - 官方路由解决方案# 配置数据库：编辑 config/config.default.js（或用环境变量覆盖）

- 📦 **组件化** - 高度模块化的组件设计npm run dev

- 🎭 **动画效果** - 丰富的可视化组件# 运行在 http://localhost:3000，启动时会 sequelize.sync()

```

## 许可证

2. 前端

MIT

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
