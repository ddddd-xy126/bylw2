# 答案文本存储优化

## 修改日期
2025年11月4日

## 修改内容

### 问题描述
之前在 `surveys[].answers[].answers[]` 中只存储了用户选择的选项 ID（如 `answer: "option1"`），没有存储选项的文本内容。这导致如果问卷的选项被修改后，历史答案无法正确显示。

### 解决方案

#### 1. 修改提交答案时的数据处理 (`src/api/survey.js`)

在 `submitSurveyApi` 函数中，处理答案数据时添加了以下字段：

```javascript
{
  questionId: 1,
  answer: "option1",           // 原始答案（选项ID或用户输入）
  answerIds: "option1",        // 选项ID（保留用于统计）
  answerText: "选项文本",      // 选项对应的文本
  text: "选项文本",            // 用于直接显示的文本
  question: "问题标题"         // 问题文本
}
```

**处理逻辑：**
- **单选题**: 查找对应选项的 `text` 字段
- **多选题**: 将选项ID数组映射为文本数组
- **文本题/评分题**: 直接使用用户输入的值

#### 2. 修改答题详情显示 (`AnsweredPage.vue`)

将显示字段从 `answer.answer` 改为 `answer.text`：

```vue
<!-- 修改前 -->
<span class="answer-value">{{ formatAnswerValue(answer.answer) }}</span>

<!-- 修改后 -->
<span class="answer-value">{{ formatAnswerValue(answer.text) }}</span>
```

## 数据结构示例

### 单选题答案
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

### 多选题答案
```json
{
  "questionId": 2,
  "answer": ["basketball", "swimming"],
  "answerIds": ["basketball", "swimming"],
  "answerText": ["篮球", "游泳"],
  "text": ["篮球", "游泳"],
  "question": "您喜欢的运动有哪些？"
}
```

### 文本题答案
```json
{
  "questionId": 3,
  "answer": "我觉得这个问卷很好",
  "answerIds": "我觉得这个问卷很好",
  "answerText": "我觉得这个问卷很好",
  "text": "我觉得这个问卷很好",
  "question": "您还有什么建议吗？"
}
```

## 优势

1. **数据完整性**: 即使问卷选项被修改，历史答案仍能正确显示
2. **查询效率**: 显示答案时无需再次查询问卷的 questionList
3. **向后兼容**: 保留了 `answer` 和 `answerIds` 字段，确保旧数据仍能使用
4. **统一显示**: 所有类型的题目都使用 `text` 字段统一显示

## 相关文件

- `src/api/survey.js` - 答案提交逻辑
- `src/views/frontend/user/components/questionnaires/AnsweredPage.vue` - 答题详情页
- `db.json` - 数据存储

## 测试建议

1. 提交新的问卷答案，检查 `db.json` 中是否正确保存了 `text` 字段
2. 在"已填写问卷"页面点击"查看详情"，验证答案是否正确显示
3. 修改问卷的选项文本，确认历史答案仍显示原来的选项文本
4. 测试单选、多选、文本、评分等不同类型题目的答案显示
