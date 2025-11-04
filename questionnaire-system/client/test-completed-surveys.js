/**
 * 测试用户已完成问卷功能
 * 在浏览器控制台运行
 */

// 1. 测试获取用户已完成的问卷
async function testGetCompletedSurveys(userId) {
  console.log('=== 测试获取用户已完成问卷 ===');
  console.log('用户ID:', userId);
  
  // 获取用户信息
  const userRes = await fetch(`http://localhost:3002/users/${userId}`);
  const user = await userRes.json();
  console.log('用户:', user.nickname);
  console.log('已完成问卷ID:', user.completedSurveys);
  
  // 获取详细的答题记录
  const completedIds = user.completedSurveys || [];
  const surveysRes = await fetch('http://localhost:3002/surveys');
  const surveys = await surveysRes.json();
  
  const details = completedIds.map(surveyId => {
    const survey = surveys.find(s => s.id == surveyId);
    if (!survey) return null;
    
    const userAnswer = survey.answers?.find(a => a.userId == userId);
    return {
      问卷ID: surveyId,
      问卷标题: survey.title,
      完成时间: userAnswer?.submittedAt,
      得分: userAnswer?.score,
      有评论: !!userAnswer?.comment
    };
  }).filter(d => d);
  
  console.table(details);
  return details;
}

// 2. 模拟提交问卷（测试自动更新 completedSurveys）
async function testSubmitSurvey(userId, surveyId) {
  console.log('=== 测试提交问卷 ===');
  console.log('用户ID:', userId, '问卷ID:', surveyId);
  
  // 检查提交前的状态
  const beforeRes = await fetch(`http://localhost:3002/users/${userId}`);
  const beforeUser = await beforeRes.json();
  console.log('提交前 completedSurveys:', beforeUser.completedSurveys);
  
  // 提交问卷（需要通过应用的API，这里只是示例）
  console.log('提示：实际提交需要通过应用的 submitSurveyApi');
  
  // 手动模拟更新（仅用于测试）
  const completedSurveys = beforeUser.completedSurveys || [];
  if (!completedSurveys.includes(parseInt(surveyId))) {
    completedSurveys.push(parseInt(surveyId));
    
    const updateRes = await fetch(`http://localhost:3002/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completedSurveys })
    });
    
    const afterUser = await updateRes.json();
    console.log('提交后 completedSurveys:', afterUser.completedSurveys);
    console.log('✅ 成功添加问卷ID:', surveyId);
  } else {
    console.log('⚠️ 用户已完成过此问卷');
  }
}

// 3. 测试查询所有用户的已完成问卷统计
async function testAllUsersStats() {
  console.log('=== 所有用户已完成问卷统计 ===');
  
  const res = await fetch('http://localhost:3002/users');
  const users = await res.json();
  
  const stats = users.map(u => ({
    ID: u.id,
    用户: u.nickname,
    已完成: u.completedSurveys?.length || 0,
    问卷IDs: u.completedSurveys || []
  })).filter(s => s.已完成 > 0);
  
  console.table(stats);
  return stats;
}

// 4. 测试数据一致性（检查 completedSurveys 和实际答案是否匹配）
async function testDataConsistency() {
  console.log('=== 测试数据一致性 ===');
  
  const usersRes = await fetch('http://localhost:3002/users');
  const users = await usersRes.json();
  
  const surveysRes = await fetch('http://localhost:3002/surveys');
  const surveys = await surveysRes.json();
  
  users.forEach(user => {
    const completedIds = user.completedSurveys || [];
    
    // 从问卷的answers中找到该用户的答案
    const actualAnswers = [];
    surveys.forEach(survey => {
      if (survey.answers) {
        const hasAnswer = survey.answers.some(a => a.userId == user.id);
        if (hasAnswer) {
          actualAnswers.push(parseInt(survey.id));
        }
      }
    });
    
    const missing = actualAnswers.filter(id => !completedIds.includes(id));
    const extra = completedIds.filter(id => !actualAnswers.includes(id));
    
    if (missing.length > 0 || extra.length > 0) {
      console.warn(`❌ 用户 ${user.nickname} 数据不一致:`);
      if (missing.length > 0) {
        console.warn('  缺少的问卷ID:', missing);
      }
      if (extra.length > 0) {
        console.warn('  多余的问卷ID:', extra);
      }
    } else if (completedIds.length > 0) {
      console.log(`✅ 用户 ${user.nickname} 数据一致 (${completedIds.length}个问卷)`);
    }
  });
}

// 使用示例：
console.log('可用的测试函数:');
console.log('1. testGetCompletedSurveys(userId) - 获取用户已完成问卷');
console.log('2. testSubmitSurvey(userId, surveyId) - 模拟提交问卷');
console.log('3. testAllUsersStats() - 查看所有用户统计');
console.log('4. testDataConsistency() - 检查数据一致性');
console.log('\n示例: testGetCompletedSurveys("4")');
