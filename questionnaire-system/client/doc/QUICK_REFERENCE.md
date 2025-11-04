# 📚 新数据结构快速参考

## 核心概念

### 数据存储位置
```
surveys (问卷)
  └─ answers[] (答案列表)
       ├─ userId (用户ID)
       ├─ answers[] (答题详情)
       │    ├─ answer (选项ID)
       │    ├─ answerText (选项文本) ✨ 新增
       │    └─ answerIds (用于统计) ✨ 新增
       └─ comment (评论) ✨ 新增
            ├─ content (内容)
            ├─ rating (评分)
            └─ createdAt (时间)
```

## API速查

### 答题
```javascript
submitSurveyApi(surveyId, data)
// 自动处理：选项ID → 选项文本
```

### 评论
```javascript
// 创建（需先答题）
createCommentApi(surveyId, {userId, username, content, rating})

// 更新
updateCommentApi(surveyId, userId, {content, rating})

// 删除
deleteCommentApi(surveyId, userId)

// 查询
getUserCommentApi(surveyId, userId)        // 单个用户
getSurveyCommentsApi(surveyId)             // 所有评论
```

### 答案
```javascript
getUserAnswerApi(surveyId, userId)  // 获取用户答案
```

## 自动功能

✅ 提交答案时自动添加选项文本
✅ 评论时自动更新平均评分
✅ 评论数量自动统计

## 常见问题

**Q: 为什么要保存选项文本？**
A: 避免选项修改后历史数据丢失文本

**Q: 评论保存在哪里？**
A: 保存在 `surveys[x].answers[y].comment`

**Q: 如何获取问卷的所有评论？**
A: 使用 `getSurveyCommentsApi(surveyId)`

**Q: 一个用户可以发多条评论吗？**
A: 不可以，每个用户每个问卷只能一条评论
