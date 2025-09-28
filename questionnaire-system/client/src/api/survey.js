import apiClient from './index.js';

// 问卷列表和详情
export async function listSurveys() {
  const surveys = await apiClient.get('/surveys');
  return surveys;
}

export async function getSurveyDetail(id) {
  const survey = await apiClient.get(`/surveys/${id}`);
  if (!survey) {
    throw new Error("问卷不存在");
  }
  
  // 添加questions字段，如果没有则使用默认题目
  if (!survey.questionList || survey.questionList.length === 0) {
    survey.questions = [
      {
        id: 1,
        type: "single",
        title: "示例单选题",
        options: [
          { id: "a", text: "选项A" },
          { id: "b", text: "选项B" },
          { id: "c", text: "选项C" }
        ],
        required: true
      },
      {
        id: 2,
        type: "multiple",
        title: "示例多选题",
        options: [
          { id: "a", text: "选项A" },
          { id: "b", text: "选项B" },
          { id: "c", text: "选项C" }
        ],
        required: false
      }
    ];
  } else {
    survey.questions = survey.questionList;
  }
  
  survey.isFavorite = false;
  
  return survey;
}

// 答题相关
export async function submitSurveyApi(id, data) {
  const newAnswer = {
    userId: data.userId || 1,
    surveyId: parseInt(id),
    surveyTitle: data.surveyTitle || "问卷",
    score: Math.floor(Math.random() * 40) + 60, // 60-100分
    result: "良好",
    submittedAt: new Date().toISOString(),
    duration: data.duration || 300,
    answers: data.answers || []
  };
  
  const answer = await apiClient.post('/answers', newAnswer);
  
  return {
    answerId: answer.id,
    score: answer.score,
    result: answer.result,
    analysis: "根据您的回答，我们为您生成了个性化的分析报告..."
  };
}

// 评论相关
export async function getSurveyCommentsApi(id) {
  const comments = await apiClient.get(`/comments?surveyId=${id}`);
  return {
    list: comments,
    total: comments.length
  };
}

export async function createCommentApi(id, data) {
  const newComment = {
    surveyId: parseInt(id),
    userId: data.userId || 1,
    username: data.username || "匿名用户",
    avatar: data.avatar || "/avatars/default.jpg",
    content: data.content,
    rating: data.rating || 5,
    createdAt: new Date().toISOString()
  };
  
  const comment = await apiClient.post('/comments', newComment);
  return comment;
}

// 分类
export async function getCategoriesApi() {
  const categories = await apiClient.get('/categories');
  return categories;
}
