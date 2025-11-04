/**
 * 测试新数据结构的示例代码
 * 在浏览器控制台运行
 */

// 1. 测试获取问卷评论
async function testGetComments(surveyId) {
  const response = await fetch(`http://localhost:3002/surveys/${surveyId}`);
  const survey = await response.json();
  
  console.log('问卷标题:', survey.title);
  console.log('答案数量:', survey.answers?.length || 0);
  
  const comments = survey.answers
    ?.filter(a => a.comment)
    .map(a => ({
      用户: a.username || a.userId,
      评分: a.comment.rating,
      内容: a.comment.content
    }));
  
  console.table(comments);
}

// 2. 测试答案数据结构
async function testAnswerStructure(surveyId) {
  const response = await fetch(`http://localhost:3002/surveys/${surveyId}`);
  const survey = await response.json();
  
  if (survey.answers && survey.answers.length > 0) {
    const firstAnswer = survey.answers[0];
    console.log('答案结构示例:');
    console.log({
      用户ID: firstAnswer.userId,
      提交时间: firstAnswer.submittedAt,
      答题详情: firstAnswer.answers.map(a => ({
        问题: a.question,
        答案ID: a.answerIds || a.answer,
        答案文本: a.answerText || a.answer
      })),
      评论: firstAnswer.comment
    });
  }
}

// 3. 测试统计数据
async function testStats() {
  const response = await fetch('http://localhost:3002/surveys');
  const surveys = await response.json();
  
  const stats = surveys.map(s => ({
    ID: s.id,
    标题: s.title,
    答案数: s.answers?.length || 0,
    评论数: s.answers?.filter(a => a.comment).length || 0,
    平均评分: s.averageRating || 0
  }));
  
  console.table(stats);
}

// 使用示例：
// testGetComments(3);  // 查看问卷3的评论
// testAnswerStructure(3);  // 查看问卷3的答案结构
// testStats();  // 查看所有问卷统计
