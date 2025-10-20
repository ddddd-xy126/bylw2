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
  
  // 使用questionList作为questions，确保每个问题都有order字段
  if (survey.questionList && survey.questionList.length > 0) {
    survey.questions = survey.questionList.map((q, index) => ({
      ...q,
      order: q.order !== undefined ? q.order : index + 1
    }));
  } else {
    // 如果没有问题列表，使用默认题目
    survey.questions = [
      {
        id: 1,
        type: "single",
        title: "您最喜欢的颜色是什么？",
        description: "请选择一个您最喜欢的颜色",
        options: [
          { id: "red", text: "红色" },
          { id: "blue", text: "蓝色" },
          { id: "green", text: "绿色" },
          { id: "yellow", text: "黄色" }
        ],
        required: true,
        order: 1
      },
      {
        id: 2,
        type: "multiple",
        title: "您喜欢的运动有哪些？",
        description: "可以选择多个选项",
        options: [
          { id: "basketball", text: "篮球" },
          { id: "football", text: "足球" },
          { id: "tennis", text: "网球" },
          { id: "swimming", text: "游泳" },
          { id: "running", text: "跑步" }
        ],
        required: false,
        order: 2
      },
      {
        id: 3,
        type: "rating",
        title: "请为我们的服务打分",
        description: "您对我们服务的整体满意度",
        maxRating: 5,
        required: true,
        order: 3
      },
      {
        id: 4,
        type: "text",
        title: "您还有什么建议或意见吗？",
        description: "请在此处输入您的建议",
        required: false,
        order: 4
      }
    ];
  }
  
  // 添加一些额外的统计信息
  survey.isFavorite = false;
  survey.estimatedTime = survey.duration || Math.ceil(survey.questions.length * 1.5);
  survey.averageRating = survey.rating || 4.5;
  
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

// 问卷状态管理
export async function getUserSurveysApi(userId, status = null) {
  let url = `/surveys?authorId=${userId}`;
  if (status) {
    url += `&status=${status}`;
  }
  const surveys = await apiClient.get(url);
  return surveys.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function createSurveyApi(data) {
  const newSurvey = {
    title: data.title,
    description: data.description,
    category: data.category,
    categoryId: data.categoryId || 1,
    author: data.author || "用户",
    authorId: data.authorId,
    questions: data.questions?.length || 0,
    duration: data.estimatedTime || 5,
    difficulty: data.difficulty || "简单",
    status: "draft", // 新创建的问卷为草稿状态
    tags: data.tags || [],
    thumbnail: data.thumbnail || "/images/default.jpg",
    rating: 0,
    participants: 0,
    participantCount: 0,
    questionList: data.questionList || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const survey = await apiClient.post('/surveys', newSurvey);
  return survey;
}

export async function updateSurveyApi(id, data) {
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString()
  };
  
  const survey = await apiClient.patch(`/surveys/${id}`, updatedData);
  return survey;
}

export async function publishSurveyApi(id) {
  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "pending",
    updatedAt: new Date().toISOString()
  });
  return survey;
}

export async function approveSurveyApi(id) {
  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "published",
    updatedAt: new Date().toISOString()
  });
  return survey;
}

export async function deleteSurveyApi(id) {
  await apiClient.delete(`/surveys/${id}`);
  return { success: true };
}
