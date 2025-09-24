# 前端API数据切换说明

## 当前状态
- ✅ 所有API都已替换为假数据
- ✅ 页面可以正常运行，无需后端服务器
- ✅ 支持完整的用户交互流程

## 快速切换到真实后端API

### 方法一：全局配置切换（推荐）
1. 编辑 `src/mockData/config.js` 文件
2. 将 `USE_MOCK_DATA` 改为 `false`
3. 重启前端开发服务器

```javascript
// src/mockData/config.js
export const USE_MOCK_DATA = false; // 改为 false
```

### 方法二：环境变量切换
1. 在项目根目录创建 `.env.local` 文件
2. 添加以下内容：
```
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:3000/api
```

## 测试用的登录凭据

### 假数据模式
- **普通用户**: zhangsan@example.com / 123456
- **管理员**: admin@example.com / admin123

### 真实API模式
- 使用您后端数据库中的真实用户凭据

## 已实现的功能

### 用户功能
- ✅ 登录/注册
- ✅ 用户资料管理
- ✅ 问卷浏览和答题
- ✅ 收藏功能
- ✅ 答题记录
- ✅ 成就系统

### 管理员功能
- ✅ 用户管理
- ✅ 问卷管理
- ✅ 统计面板
- ✅ 系统监控

## 文件结构
```
src/
├── api/                 # API接口文件（支持自动切换）
├── mockData/           # 假数据文件
│   ├── config.js       # 切换配置
│   ├── users.js        # 用户假数据
│   ├── surveys.js      # 问卷假数据
│   └── admin.js        # 管理员假数据
└── ...
```

## 注意事项

1. **切换后需要重启开发服务器**
2. **确保后端服务器在正确端口运行**
3. **检查API接口格式是否与后端一致**
4. **如有数据格式差异，需要调整相应的组件代码**