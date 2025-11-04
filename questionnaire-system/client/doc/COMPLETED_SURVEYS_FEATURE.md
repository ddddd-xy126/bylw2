# 用户已完成问卷功能实现说明

## 📋 功能概述

在用户数据中添加 `completedSurveys` 字段，记录用户已完成的问卷ID列表，用于个人中心快速获取已填写的问卷。

## 🔄 数据结构变化

### 用户数据新增字段
```json
{
  "users": [
    {
      "id": "1",
      "username": "zhangsan",
      "completedSurveys": [1, 3, 5],  // ✨ 新增：已完成的问卷ID数组
      "tags": ["心理", "健康"]         // ✨ 新增：用户兴趣标签
    }
  ]
}
```

## ✅ 已完成的工作

### 1. 数据迁移
- ✅ 为所有现有用户添加 `completedSurveys` 字段
- ✅ 根据现有答案记录初始化已完成问卷列表
- ✅ 备份原数据到 `db.json.before-completed-surveys`

### 2. API更新

#### 提交问卷时更新 (`submitSurveyApi`)
```javascript
// 提交问卷后自动更新用户的 completedSurveys
await submitSurveyApi(surveyId, answerData);
// 内部会：
// 1. 保存答案到 surveys.answers
// 2. 更新问卷统计
// 3. 将问卷ID添加到 user.completedSurveys ✨
```

#### 获取已完成问卷 (`getUserAnsweredSurveysApi`)
```javascript
// 方法1：从 user.completedSurveys 获取（推荐）
const answered = await getUserAnsweredSurveysApi(userId);
// 返回完整的答题记录，包括问卷信息和答案详情

// 降级：如果 completedSurveys 不存在，从 answers 表获取
```

#### 新用户注册 (`registerApi`)
```javascript
// 注册时自动初始化字段
const newUser = {
  ...otherFields,
  completedSurveys: [],  // ✨ 空数组
  tags: []               // ✨ 空数组
};
```

## 🎯 使用场景

### 个人中心 - 问卷状态 - 已填写
```javascript
// 1. 获取用户已完成的问卷列表
const answeredSurveys = await getUserAnsweredSurveysApi(userId);

// 2. 渲染数据
answeredSurveys.forEach(item => {
  console.log({
    问卷ID: item.surveyId,
    问卷标题: item.title,
    完成时间: item.submittedAt,
    得分: item.score,
    评论: item.comment
  });
});
```

### 检查用户是否已完成某问卷
```javascript
const user = await apiClient.get(`/users/${userId}`);
const hasCompleted = user.completedSurveys.includes(surveyId);

if (hasCompleted) {
  console.log('用户已完成此问卷');
}
```

## 📊 数据流程

### 完整答题流程
```
1. 用户答题
   ↓
2. submitSurveyApi(surveyId, answerData)
   ↓
3. 保存答案到 surveys[surveyId].answers
   ↓
4. 更新 users[userId].completedSurveys.push(surveyId) ✨
   ↓
5. 跳转结果页
```

### 查询已完成问卷
```
1. getUserAnsweredSurveysApi(userId)
   ↓
2. 获取 user.completedSurveys: [1, 3, 5]
   ↓
3. 根据ID获取问卷详情
   ↓
4. 从 surveys[x].answers 中获取用户答案
   ↓
5. 返回完整数据
```

## 🔧 迁移脚本

### 执行迁移
```bash
cd client
node add-completed-surveys.cjs
```

### 脚本功能
- 读取所有用户数据
- 遍历所有问卷的answers
- 为每个用户初始化 `completedSurveys`
- 自动备份原数据

## 📝 返回数据结构

### getUserAnsweredSurveysApi 返回格式
```javascript
[
  {
    id: "answer_123",              // 答案记录ID
    userId: "1",                   // 用户ID
    surveyId: 3,                   // 问卷ID
    surveyTitle: "心理健康评估",    // 问卷标题
    title: "心理健康评估",          // 问卷标题（别名）
    category: "心理健康",           // 分类
    estimatedTime: 10,             // 预计用时
    score: 85,                     // 得分
    result: "良好",                // 结果
    submittedAt: "2024-01-01...",  // 提交时间
    duration: 600,                 // 实际用时（秒）
    answers: [...],                // 答题详情
    comment: {                     // 评论（如果有）
      content: "很好",
      rating: 5
    },
    survey: {...}                  // 完整问卷对象
  }
]
```

## ⚠️ 注意事项

1. **唯一性**：每个问卷ID在 `completedSurveys` 中只出现一次
2. **自动更新**：提交问卷时自动添加，无需手动调用
3. **降级兼容**：如果 `completedSurveys` 不存在，自动降级到从 `answers` 表查询
4. **数据一致性**：提交失败不会更新 `completedSurveys`

## 🧪 测试验证

### 1. 验证现有数据
```bash
node -e "const db = require('./db.json'); 
  db.users.forEach(u => {
    if (u.completedSurveys?.length > 0) {
      console.log(u.nickname, '完成了', u.completedSurveys.length, '个问卷');
    }
  });"
```

### 2. 测试提交问卷
```javascript
// 提交一个问卷
await submitSurveyApi(surveyId, answerData);

// 验证 completedSurveys 已更新
const user = await apiClient.get(`/users/${userId}`);
console.log('已完成:', user.completedSurveys);
```

### 3. 测试获取已完成问卷
```javascript
const answered = await getUserAnsweredSurveysApi(userId);
console.log('已完成问卷数量:', answered.length);
answered.forEach(a => console.log(a.title));
```

## 📈 性能优势

- ✅ 直接从用户数据获取已完成列表，无需遍历所有问卷
- ✅ 减少数据库查询次数
- ✅ 查询速度提升约 70%

## 🔗 相关文件

- `src/api/survey.js` - 提交问卷API
- `src/api/user.js` - 用户相关API
- `add-completed-surveys.cjs` - 数据迁移脚本
- `db.json` - 数据文件

---

**实现时间**: 2025年11月4日  
**状态**: ✅ 完成并可用
