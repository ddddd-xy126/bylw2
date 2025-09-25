# 问卷系统模拟数据统一管理文档

## 概述
本文档描述了问卷系统前台后台模拟数据的统一管理方案，实现数据互通和统一写入操作。

## 数据架构设计

### 1. 数据存储结构
```
mockData/
├── index.js           # 主入口文件，统一导出
├── config.js          # 全局配置
├── database.js        # 模拟数据库，统一数据管理
├── entities/          # 数据实体
│   ├── users.js       # 用户数据
│   ├── surveys.js     # 问卷数据
│   ├── questions.js   # 题目数据
│   ├── answers.js     # 答题记录
│   ├── comments.js    # 评论数据
│   ├── categories.js  # 分类数据
│   ├── admin.js       # 管理员数据
│   ├── forum.js       # 论坛数据
│   └── statistics.js  # 统计数据
├── api/               # 模拟API层
│   ├── index.js       # API入口
│   ├── userApi.js     # 用户API
│   ├── surveyApi.js   # 问卷API
│   ├── adminApi.js    # 管理员API
│   └── forumApi.js    # 论坛API
└── utils/             # 工具函数
    ├── helpers.js     # 辅助函数
    ├── validators.js  # 数据验证
    └── generators.js  # 数据生成器
```

### 2. 数据流向
```
前台组件 ←→ API层 ←→ 模拟数据库 ←→ 数据实体
后台组件 ←→ API层 ←→ 模拟数据库 ←→ 数据实体
```

## 核心功能特性

### 1. 数据互通性
- **统一数据源**：前台后台共享同一份数据
- **实时同步**：数据修改后立即在前后台生效
- **状态管理**：通过Pinia store统一管理数据状态

### 2. 数据持久化
- **本地存储**：使用localStorage模拟数据持久化
- **数据备份**：支持数据导出和导入
- **版本控制**：记录数据变更历史

### 3. 数据验证
- **类型检查**：确保数据类型正确性
- **约束验证**：检查数据完整性和业务规则
- **错误处理**：提供详细的错误信息

## 数据实体详细说明

### 1. 用户数据 (users.js)
```javascript
{
  id: number,           // 用户ID
  username: string,     // 用户名
  nickname: string,     // 昵称
  email: string,        // 邮箱
  phone: string,        // 手机号
  avatar: string,       // 头像URL
  role: string,         // 角色：user/admin
  status: string,       // 状态：active/inactive/banned
  points: number,       // 积分
  level: number,        // 等级
  profile: object,      // 详细资料
  preferences: object,  // 偏好设置
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

### 2. 问卷数据 (surveys.js)
```javascript
{
  id: number,           // 问卷ID
  title: string,        // 标题
  description: string,  // 描述
  categoryId: number,   // 分类ID
  authorId: number,     // 作者ID
  status: string,       // 状态：draft/published/archived
  questions: array,     // 问题列表
  settings: object,     // 问卷设置
  statistics: object,   // 统计信息
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

### 3. 答题记录 (answers.js)
```javascript
{
  id: number,           // 记录ID
  userId: number,       // 用户ID
  surveyId: number,     // 问卷ID
  answers: array,       // 答案数据
  score: number,        // 得分
  result: object,       // 结果分析
  duration: number,     // 答题时长
  submittedAt: string   // 提交时间
}
```

### 4. 论坛数据 (forum.js)
```javascript
{
  id: number,           // 帖子ID
  title: string,        // 标题
  content: string,      // 内容
  authorId: number,     // 作者ID
  category: string,     // 分类
  tags: array,          // 标签
  status: string,       // 状态
  views: number,        // 浏览数
  likes: number,        // 点赞数
  replies: array,       // 回复列表
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

## API接口设计

### 1. 统一响应格式
```javascript
{
  success: boolean,     // 是否成功
  data: any,           // 数据内容
  message: string,     // 消息
  code: number,        // 状态码
  timestamp: string    // 时间戳
}
```

### 2. 分页响应格式
```javascript
{
  success: true,
  data: {
    list: array,       // 数据列表
    total: number,     // 总数
    page: number,      // 当前页
    pageSize: number,  // 每页数量
    totalPages: number // 总页数
  }
}
```

### 3. 核心API列表

#### 用户相关
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

#### 问卷相关
- `GET /api/surveys` - 获取问卷列表
- `GET /api/surveys/:id` - 获取问卷详情
- `POST /api/surveys` - 创建问卷
- `PUT /api/surveys/:id` - 更新问卷
- `DELETE /api/surveys/:id` - 删除问卷

#### 答题相关
- `POST /api/surveys/:id/submit` - 提交答案
- `GET /api/answers/user/:userId` - 获取用户答题记录
- `GET /api/answers/survey/:surveyId` - 获取问卷答题统计

#### 论坛相关
- `GET /api/forum/posts` - 获取帖子列表
- `POST /api/forum/posts` - 发布帖子
- `GET /api/forum/posts/:id` - 获取帖子详情
- `POST /api/forum/posts/:id/reply` - 回复帖子

## 使用示例

### 1. 基础使用
```javascript
import { mockDatabase } from '@/mockData/database'
import { userApi } from '@/mockData/api'

// 获取用户列表
const users = await userApi.getUsers({ page: 1, pageSize: 10 })

// 创建新用户
const newUser = await userApi.createUser({
  username: 'newuser',
  email: 'newuser@example.com'
})
```

### 2. 数据监听
```javascript
import { mockDatabase } from '@/mockData/database'

// 监听用户数据变化
mockDatabase.on('users:updated', (user) => {
  console.log('用户数据更新:', user)
})
```

### 3. 数据验证
```javascript
import { validateUser } from '@/mockData/utils/validators'

const userData = { username: 'test', email: 'invalid-email' }
const validation = validateUser(userData)

if (!validation.valid) {
  console.log('验证失败:', validation.errors)
}
```

## 后端集成准备

### 1. 数据结构对齐
- 确保模拟数据结构与后端API保持一致
- 使用TypeScript定义数据接口
- 建立数据迁移脚本

### 2. API接口标准化
- 统一请求响应格式
- 错误处理机制
- 认证授权流程

### 3. 数据迁移方案
```javascript
// 数据导出
export const exportMockData = () => {
  return {
    users: mockDatabase.getAll('users'),
    surveys: mockDatabase.getAll('surveys'),
    answers: mockDatabase.getAll('answers'),
    // ... 其他数据
  }
}

// 数据导入到后端
export const importToBackend = async (data) => {
  for (const [table, records] of Object.entries(data)) {
    await backendApi.importData(table, records)
  }
}
```

## 开发指南

### 1. 添加新的数据实体
1. 在 `entities/` 目录创建新文件
2. 定义数据结构和默认数据
3. 在 `database.js` 中注册新实体
4. 创建对应的API接口

### 2. 修改现有数据
1. 更新对应的实体文件
2. 运行数据迁移脚本
3. 更新相关API接口
4. 测试前后台功能

### 3. 调试技巧
- 使用浏览器开发者工具查看localStorage
- 启用API调用日志
- 使用数据验证功能检查数据完整性

## 配置选项

### 1. 全局配置 (config.js)
```javascript
export const MOCK_CONFIG = {
  USE_MOCK_DATA: true,        // 是否使用模拟数据
  ENABLE_PERSISTENCE: true,   // 是否启用数据持久化
  API_DELAY: 500,            // 模拟API延迟
  DEBUG_MODE: true,          // 调试模式
  AUTO_BACKUP: true,         // 自动备份
  BACKUP_INTERVAL: 3600000   // 备份间隔(毫秒)
}
```

### 2. 环境切换
```javascript
// 开发环境
process.env.NODE_ENV === 'development' && (MOCK_CONFIG.USE_MOCK_DATA = true)

// 生产环境
process.env.NODE_ENV === 'production' && (MOCK_CONFIG.USE_MOCK_DATA = false)
```

## 性能优化

### 1. 数据缓存
- 实现内存缓存机制
- 支持缓存失效策略
- 优化大数据集的处理

### 2. 懒加载
- 按需加载数据实体
- 分页加载大数据集
- 虚拟滚动优化

### 3. 索引优化
- 为常用查询字段建立索引
- 优化搜索和过滤性能
- 支持复合查询

## 注意事项

1. **数据一致性**：确保前后台看到的是同一份数据
2. **内存管理**：避免内存泄漏，定期清理无用数据
3. **错误处理**：提供友好的错误提示和恢复机制
4. **安全考虑**：模拟数据中不包含真实敏感信息
5. **版本兼容**：保持向后兼容性，提供数据迁移工具

## 总结

通过统一的模拟数据管理系统，我们实现了：
- 前后台数据完全互通
- 统一的数据操作接口
- 完整的数据验证机制
- 便于后续真实后端的集成
- 高效的开发和测试体验

这套系统为项目的后续开发和维护提供了坚实的基础。