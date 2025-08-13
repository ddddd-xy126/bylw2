## 智能问卷分析系统 README

基于 SRS v1.0 的前后端分离项目骨架，覆盖认证、问卷、管理、数据分析与 AI 报告的最小可运行实现与扩展位。

- 前端：Vue 3 + Vite + Pinia + Vue Router + ECharts
- 后端：Node.js + Express + MySQL（mysql2/promise）+ JWT（2 小时有效期可配置）
- AI：扣子平台 API 客户端占位（可在 `.env` 配置真实地址与密钥）

### 目录结构
```
bylw2/
  backend/
    src/
      routes/
        health.js
        auth.js
        questionnaires.js
        admin.js
        analysis.js
      middleware/
        auth.js
      services/
        aiClient.js
      config/
        index.js
      db/
        pool.js
      app.js
      server.js
    sql/
      schema.sql
      seed.sql
    package.json
  frontend/
    src/
      components/
        AnimatedProgress.vue
        GamifiedQuestion.vue
      pages/
        Home.vue
        QuestionnaireList.vue
        QuestionnaireDetail.vue
        Reports.vue
        Achievements.vue
        Profile.vue
      router/
        index.js
      stores/
        index.js
      services/
        api.js
      main.js
      App.vue
    index.html
    vite.config.js
    package.json
  env.sample
  docker-compose.yml
  .gitignore
  README.md
```

## 快速开始（Windows PowerShell）

### 1) 配置环境变量
```
copy env.sample .env
copy env.sample .\backend\.env
```

### 2) 启动数据库（MySQL + Adminer）
```
docker compose up -d
```

### 3) 初始化数据库结构与示例数据
```
Get-Content .\backend\sql\schema.sql | docker exec -i bylw2-mysql mysql -uroot -p$env:MYSQL_ROOT_PASSWORD
Get-Content .\backend\sql\seed.sql   | docker exec -i bylw2-mysql mysql -uroot -p$env:MYSQL_ROOT_PASSWORD lw_survey
```

### 4) 安装依赖
```
cd backend && npm i
cd ..\frontend && npm i
```

### 5) 启动开发服务
```
# 终端 1
cd backend && npm run dev
# 终端 2
cd frontend && npm run dev
```
- 后端：http://localhost:3001
- 前端：http://localhost:5173

## 账号与认证
- 演示账号：`demo@example.com / demopass`
- 登录成功后返回 `JWT`（默认 2 小时），前端通过 `Authorization: Bearer <token>` 访问受保护接口。

## API 概览（简要）
- 公共
  - `GET /api/health` 健康检查
  - `POST /api/auth/register` 注册（占位版本，内存用户）
  - `POST /api/auth/login` 登录获取 JWT
  - `POST /api/auth/forgot` 找回密码（占位）
- 受保护（需 JWT）
  - `GET /api/questionnaires?status=published` 问卷列表
  - `GET /api/questionnaires/:id` 问卷详情（含逻辑占位）
  - `POST /api/questionnaires/:id/submit` 提交答案（计分占位）
  - `POST /api/admin/questionnaires/:id/publish` 问卷发布（流程占位）
  - `POST /api/admin/questionnaires/:id/logic` 题目逻辑配置（条件分支）
  - `POST /api/analysis` 调用 AI 分析（扣子平台客户端占位）

## SRS 覆盖映射
- 认证
  - AUTH-01 邮箱/手机号+验证码注册：接口占位，后续接入短信/邮件
  - AUTH-02 JWT 登录验证：已实现，默认有效期 2 小时（`JWT_EXPIRES_IN`）
  - AUTH-03 密码找回：接口占位
- 用户中心
  - USER-01 历史记录管理：后端表结构已留出 `submissions`，前端后续补页面
  - USER-02 成就系统：`achievements/user_achievements` 表与示例徽章
  - USER-03 AI 分析报告：`/api/analysis` 已对接占位客户端
- 问卷交互
  - QUIZ-01 动态跳转逻辑：`question_logic` 表与接口占位
  - QUIZ-02 限时挑战模式：`GamifiedQuestion` 组件含倒计时骨架
  - QUIZ-03 拖拽排序题型：待引入 `vue-draggable-next`（前端占位）
- 管理端
  - ADMIN-01 问卷发布：接口占位（状态流转枚举齐全）
  - ADMIN-02 题目逻辑配置：接口占位，`IF ... THEN` 规则 JSON 存储
- 数据分析
  - DATA-01 答案分布：`Reports.vue` 饼图演示
  - DATA-02 完成率趋势：折线图演示

## 环境变量（env.sample）
- 通用
  - `NODE_ENV`：环境（development/production）
- 后端
  - `PORT`：后端端口（默认 3001）
  - `CORS_ORIGIN`：前端地址（默认 http://localhost:5173）
  - `JWT_SECRET`、`JWT_EXPIRES_IN`：JWT 配置
  - `MYSQL_HOST`、`MYSQL_PORT`、`MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE`：数据库连接
  - `KOZI_API_BASE_URL`、`KOZI_API_KEY`：扣子平台 API 配置
- Docker
  - `MYSQL_ROOT_PASSWORD`、`MYSQL_CONTAINER_NAME`

## 注意事项
- 当前用户/问卷为最小演示与占位实现，生产请落库并完善校验与权限。
- 若无需 Adminer，可从 `docker-compose.yml` 移除该服务。
- Windows 下如遇权限/路径问题，请以管理员终端运行 Docker 命令。

## 下一步建议
- 完成注册验证码/找回密码邮件短信接入
- 前端接入拖拽排序与题目类型组件化
- 问卷逻辑配置 UI 与解释器落库
- 接入真实扣子平台 API 并完善报告模板
- 数据统计维度与导出（CSV/Excel）
