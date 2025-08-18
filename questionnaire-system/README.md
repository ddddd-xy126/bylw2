# 智能问卷分析系统（Vue3 + Node.js）

基于 Vue3 与 Node.js 的智能问卷分析系统，融合扣子平台 AI 的个性化反馈机制。系统包含用户端与后台管理端两部分，前后端通过 API 交互完成问卷创建、填写、审核、发布、数据分析与个性化报告生成。

## 技术选型

- 前端：Vue3、Vite、Pinia、Vue Router、Element Plus、ECharts、GSAP、Lottie、CSS3、SVG、html2canvas、jsPDF、Axios
- 后端：Node.js、Express、JWT、Sequelize ORM、MySQL、Axios（调用扣子平台 API）

## 目录结构

```text
questionnaire-system/
├── client/                  # 前端（Vite + Vue3）
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── questionnaire/
│   │   ├── views/
│   │   │   ├── admin/
│   │   │   └── user/
│   │   ├── router/
│   │   ├── store/
│   │   ├── api/
│   │   ├── utils/
│   │   ├── animations/
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # 后端（Express + Sequelize + MySQL）
│   ├── config/
│   │   └── config.default.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 快速开始

### 环境准备

- Node.js 18+
- 本地 MySQL（建议创建数据库 `questionnaire_db`）

### 后端启动

1. 进入 `server/`：
2. 安装依赖：`npm i`
3. 配置数据库：编辑 `config/config.default.js`（或使用环境变量覆盖）
4. 启动：`npm run dev`

服务默认运行于 `http://localhost:3000`，启动时会自动 `sequelize.sync()` 同步模型。

### 前端启动

1. 进入 `client/`
2. 安装依赖：`npm i`
3. 开发模式：`npm run dev`

开发服务器默认 `http://localhost:5173`，已通过 Vite 代理将 `/api` 转发到 `http://localhost:3000`。

## 主要功能概览

- 用户端：注册登录、个人中心（资料、收藏、历史、成就）、问卷管理（分类/搜索/推荐/排行榜/动态答题/评分评论）、个性化反馈报告（AI 分析 + 图表 + 下载）、游戏化交互（动画、积分、徽章）
- 管理端：问卷与题目管理（创建/编辑/审核/发布/下架/删除/跳转逻辑/权限）、人员信息管理、数据可视化统计

## 扣子平台 AI 接入

在 `server/services/aiService.js` 中预置 `generateAnalysis` 服务。可通过环境变量或 `config.default.js` 配置扣子平台 API 地址与密钥，然后在 `questionnaireController` 的相应处理函数中调用生成个性化报告。

## 许可证

MIT


