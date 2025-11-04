# 答题详情显示和评论功能修复

## 修复日期
2025年11月4日

## 问题描述

### 问题1: 答题详情显示"未作答"
在个人中心的"已填写问卷"页面，点击"查看详情"后，所有答案都显示为"未作答"。

**原因分析：**
- 新代码使用 `answer.text` 字段显示答案
- 但现有数据库中的答案只有 `answer` 字段，没有 `text` 字段
- 需要向后兼容旧数据

### 问题2: 提交评论失败 404 错误
在测评报告页面提交评论时报错：
```
GET http://localhost:3002/surveys/undefined 404 (Not Found)
Error: Request failed with status code 404
```

**原因分析：**
- `reportData.value.surveyId` 为 undefined
- 从个人中心跳转到结果页时，没有传递 `surveyId` 参数
- `loadReportData` 函数中的降级逻辑获取的旧数据可能缺少 `surveyId`

## 解决方案

### 修复1: 兼容显示答案文本 (`AnsweredPage.vue`)

#### 1.1 优化 `formatAnswerValue` 函数
```javascript
const formatAnswerValue = (value) => {
  // 如果没有值，返回"未作答"
  if (!value) return "未作答";
  
  // 如果是数组，用顿号连接
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join("、") : "未作答";
  }
  
  // 返回字符串值
  return value;
};
```

#### 1.2 多字段降级显示
```vue
<!-- 优先使用 text，其次 answerText，最后降级到 answer -->
<span class="answer-value">
  {{ formatAnswerValue(answer.text || answer.answerText || answer.answer) }}
</span>
```

### 修复2: 传递 surveyId 参数

#### 2.1 修改 `viewResult` 函数
```javascript
const viewResult = (answer) => {
  // 跳转时带上 surveyId 查询参数
  router.push({
    path: `/surveys/result/${answer.id}`,
    query: {
      surveyId: answer.surveyId
    }
  });
};
```

#### 2.2 修改 `goToComment` 函数
```javascript
const goToComment = (answer) => {
  if (!answer || !answer.id) {
    ElMessage.warning('答题记录不存在');
    return;
  }
  detailDialogVisible.value = false;
  router.push({
    path: `/surveys/result/${answer.id}`,
    query: {
      surveyId: answer.surveyId  // 带上 surveyId
    }
  });
};
```

### 修复3: 动态生成答案文本 (`user.js`)

在 `getUserAnsweredSurveysApi` 中，为没有 `text` 字段的旧数据动态生成文本：

```javascript
// 处理答案数据，确保有 text 字段用于显示
let processedAnswers = userAnswer?.answers || [];
if (processedAnswers.length > 0 && survey.questionList) {
  processedAnswers = processedAnswers.map(ans => {
    // 如果已经有 text 字段，直接使用
    if (ans.text) return ans;
    
    // 否则根据 questionList 生成 text
    const question = survey.questionList.find(q => q.id == ans.questionId);
    if (!question) return ans;
    
    let text = ans.answer;
    
    // 为单选题和多选题生成文本
    if (question.type === 'single' && question.options) {
      const option = question.options.find(opt => opt.id === ans.answer);
      text = option ? option.text : ans.answer;
    } else if (question.type === 'multiple' && Array.isArray(ans.answer) && question.options) {
      text = ans.answer.map(answerId => {
        const option = question.options.find(opt => opt.id === answerId);
        return option ? option.text : answerId;
      });
    }
    
    return {
      ...ans,
      text: text,
      question: question.title || question.content
    };
  });
}
```

## 数据兼容性

### 新数据格式（有 text 字段）
```json
{
  "questionId": 1,
  "answer": "often",
  "answerIds": "often",
  "answerText": "经常",
  "text": "经常",
  "question": "您最近的心情如何？"
}
```

### 旧数据格式（无 text 字段）
```json
{
  "questionId": 1,
  "answer": "经常"
}
```

**处理策略：**
1. 优先显示 `text` 字段
2. 其次显示 `answerText` 字段
3. 如果都没有，动态从 `questionList` 生成
4. 最后降级到显示原始 `answer` 值

## 测试步骤

1. ✅ 查看旧的答题记录，确认能正确显示答案文本
2. ✅ 提交新问卷，确认答案包含 `text` 字段
3. ✅ 从个人中心点击"查看结果"，确认能跳转到报告页
4. ✅ 在报告页提交评论，确认不再报 404 错误
5. ✅ 测试单选、多选、文本、评分等各类题型的显示

## 影响范围

- ✅ `src/api/user.js` - 答题记录查询 API
- ✅ `src/views/frontend/user/components/questionnaires/AnsweredPage.vue` - 答题详情页
- ✅ `src/views/frontend/survey/ResultPage.vue` - 无需修改，已支持从 query 获取 surveyId

## 注意事项

- 新提交的答案会自动包含 `text` 字段（由 `submitSurveyApi` 生成）
- 旧数据会在查询时动态生成 `text` 字段（不修改数据库）
- 所有跳转到结果页的地方都应该传递 `surveyId` 参数
- `formatAnswerValue` 函数已增强空值处理
