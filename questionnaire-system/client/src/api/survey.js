import apiClient from "./index.js";

// 问卷列表和详情
export async function listSurveys() {
  // 设置较大的limit以获取所有问卷,前端自行分页
  const surveys = await apiClient.get("/surveys?limit=5000");
  return surveys;
}

// 获取模板列表
export async function getTemplatesApi() {
  const templates = await apiClient.get("/surveys?isTemplate=true");
  return templates;
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
      order: q.order !== undefined ? q.order : index + 1,
    }));
    // 保持 questionList 不变，供 CustomCreatePage 使用
  } else {
    // 如果没有问题列表，使用默认题目
    const defaultQuestions = [
      {
        id: 1,
        type: "single",
        title: "您最喜欢的颜色是什么？",
        description: "请选择一个您最喜欢的颜色",
        options: [
          { id: "red", text: "红色" },
          { id: "blue", text: "蓝色" },
          { id: "green", text: "绿色" },
          { id: "yellow", text: "黄色" },
        ],
        required: true,
        order: 1,
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
          { id: "running", text: "跑步" },
        ],
        required: false,
        order: 2,
      },
      {
        id: 3,
        type: "rating",
        title: "请为我们的服务打分",
        description: "您对我们服务的整体满意度",
        maxRating: 5,
        required: true,
        order: 3,
      },
      {
        id: 4,
        type: "text",
        title: "您还有什么建议或意见吗？",
        description: "请在此处输入您的建议",
        required: false,
        order: 4,
      },
    ];
    survey.questions = defaultQuestions;
    survey.questionList = defaultQuestions; // 同时设置 questionList
  }

  // 添加一些额外的统计信息
  survey.isFavorite = false;
  survey.estimatedTime =
    survey.duration || Math.ceil(survey.questions.length * 1.5);
  survey.averageRating = survey.averageRating || 4.5;

  return survey;
}

// 答题相关
export async function submitSurveyApi(id, data) {
  try {
    // 处理答案数据，确保有 text 字段
    const answersWithText = data.answers.map((answer) => {
      return {
        questionId: answer.questionId,
        answer: answer.answer,
        text: answer.text || answer.answer,
        question: answer.question || "",
      };
    });

    // 调用后端API提交答案
    const response = await apiClient.post("/answers", {
      surveyId: parseInt(id),
      answers: answersWithText,
      duration: data.duration || 0,
      score: Math.floor(Math.random() * 40) + 60, // 60-100分
      result: "良好",
    });

    // 后端返回格式: { answer, pointsEarned }
    const { answer, pointsEarned } = response;

    return {
      answerId: answer.id,
      surveyId: answer.surveyId,
      score: answer.score,
      result: answer.result,
      analysis: "根据您的回答，我们为您生成了个性化的分析报告...",
      pointsEarned: pointsEarned || 0,
      isFirstSurvey: false,
    };
  } catch (error) {
    console.error("提交答案失败:", error);
    throw error;
  }
}

// 评论相关
export async function getSurveyCommentsApi(id) {
  try {
    // 使用后端API获取评论
    const response = await apiClient.get(`/comments/survey/${id}`);
    const comments = response.comments || [];

    // 处理数据结构,将user对象展平
    const commentsList = comments.map((comment) => ({
      id: comment.id,
      surveyId: parseInt(id),
      userId: comment.userId,
      username:
        comment.user?.nickname ||
        comment.user?.username ||
        comment.username ||
        "匿名用户",
      avatar: comment.user?.avatar || comment.avatar || "",
      content: comment.content,
      rating: comment.rating || 5,
      createdAt: comment.createdAt,
    }));

    return {
      list: commentsList,
      total: response.total || commentsList.length,
    };
  } catch (error) {
    console.error("获取评论失败:", error);
    return {
      list: [],
      total: 0,
    };
  }
}

export async function createCommentApi(id, data) {
  try {
    // 使用后端API创建评论
    const response = await apiClient.post(`/comments/survey/${id}`, {
      content: data.content,
      rating: data.rating || 5,
    });

    // 后端返回 {success: true, message: '', data: comment}
    // axios拦截器已经解包了data字段
    return response;
  } catch (error) {
    console.error("创建评论失败:", error);
    throw error;
  }
}

export async function updateCommentApi(surveyId, userId, data) {
  try {
    // 使用后端API更新评论
    if (!data.commentId) {
      throw new Error("评论ID不能为空");
    }

    const response = await apiClient.put(`/comments/${data.commentId}`, {
      content: data.content,
      rating: data.rating,
    });

    return response;
  } catch (error) {
    console.error("更新评论失败:", error);
    throw error;
  }
}

export async function deleteCommentApi(surveyId, userId, commentId) {
  try {
    // 使用后端评论API删除
    if (!commentId) {
      throw new Error("评论ID不能为空");
    }

    await apiClient.delete(`/comments/${commentId}`);
    return { success: true };
  } catch (error) {
    console.error("删除评论失败:", error);
    throw error;
  }
}

export async function getUserCommentApi(surveyId, userId) {
  try {
    // 使用后端API获取该问卷的所有评论,然后筛选出该用户的评论
    const response = await apiClient.get(`/comments/survey/${surveyId}`);
    const allComments = response.comments || [];

    // 筛选出该用户的评论
    const userComments = allComments.filter((c) => c.userId == userId);

    // 处理数据结构
    return userComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      username:
        comment.user?.nickname ||
        comment.user?.username ||
        comment.username ||
        "匿名用户",
      avatar: comment.user?.avatar || comment.avatar || "",
      content: comment.content,
      rating: comment.rating || 5,
      createdAt: comment.createdAt,
    }));
  } catch (error) {
    console.error("获取用户评论失败:", error);
    return [];
  }
}

// 获取问卷的所有评论
export async function getAllCommentsApi(surveyId) {
  try {
    // 使用后端API获取评论
    const response = await apiClient.get(`/comments/survey/${surveyId}`);
    const comments = response.comments || [];

    // 处理数据结构,将user对象展平
    return comments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      username:
        comment.user?.nickname ||
        comment.user?.username ||
        comment.username ||
        "匿名用户",
      avatar: comment.user?.avatar || comment.avatar || "",
      content: comment.content,
      rating: comment.rating || 5,
      createdAt: comment.createdAt,
    }));
  } catch (error) {
    console.error("获取所有评论失败:", error);
    return [];
  }
}

export async function getUserAnswerApi(surveyId, userId) {
  try {
    // 使用后端API获取用户在某个问卷的答案
    const answer = await apiClient.get(`/answers/survey/${surveyId}`);

    if (!answer) {
      return null;
    }

    // 获取问卷信息以补充答案数据
    const survey = await apiClient.get(`/surveys/${surveyId}`);

    // 增强答案数据，添加问卷信息
    return {
      id: answer.id,
      userId: answer.userId,
      surveyId: parseInt(surveyId),
      surveyTitle: survey.title,
      category: survey.category,
      score: answer.score,
      result: answer.result,
      duration: answer.duration,
      submittedAt: answer.submittedAt,
      answers: answer.answers || [],
      totalQuestions: survey.questionList?.length || 0,
      resultDescription: "感谢您完成本次问卷！",
    };
  } catch (error) {
    console.error("获取用户答案失败:", error);
    return null;
  }
}

// 分类
export async function getCategoriesApi() {
  const categories = await apiClient.get("/categories");
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
    averageRating: 0,
    participantCount: 0,
    questionList: data.questionList || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const survey = await apiClient.post("/surveys", newSurvey);

  // 创建问卷奖励50积分
  if (data.authorId) {
    try {
      const user = await apiClient.get(`/users/${data.authorId}`);
      await apiClient.patch(`/users/${data.authorId}`, {
        points: (user.points || 0) + 50,
      });
      survey.pointsEarned = 50;
    } catch (error) {
      console.error("更新创建问卷积分失败:", error);
    }
  }

  return survey;
}

export async function updateSurveyApi(id, data) {
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const survey = await apiClient.patch(`/surveys/${id}`, updatedData);
  return survey;
}

export async function publishSurveyApi(id) {
  // 获取问卷信息
  const currentSurvey = await apiClient.get(`/surveys/${id}`);

  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "pending",
    updatedAt: new Date().toISOString(),
  });

  // 发布问卷奖励30积分
  if (currentSurvey.authorId) {
    try {
      const user = await apiClient.get(`/users/${currentSurvey.authorId}`);
      await apiClient.patch(`/users/${currentSurvey.authorId}`, {
        points: (user.points || 0) + 30,
      });
      survey.pointsEarned = 30;
    } catch (error) {
      console.error("更新发布问卷积分失败:", error);
    }
  }

  return survey;
}

export async function approveSurveyApi(id) {
  // 获取问卷信息
  const currentSurvey = await apiClient.get(`/surveys/${id}`);

  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "published",
    updatedAt: new Date().toISOString(),
  });

  // 问卷审核通过奖励20积分
  if (currentSurvey.authorId) {
    try {
      const user = await apiClient.get(`/users/${currentSurvey.authorId}`);
      await apiClient.patch(`/users/${currentSurvey.authorId}`, {
        points: (user.points || 0) + 20,
      });
      survey.pointsEarned = 20;
    } catch (error) {
      console.error("更新审核通过积分失败:", error);
    }
  }

  return survey;
}

export async function deleteSurveyApi(id) {
  await apiClient.delete(`/surveys/${id}`);
  return { success: true };
}

// 回收站相关
export async function getRecycleBinApi() {
  const recycleBin = await apiClient.get("/recycleBin");
  return recycleBin;
}

export async function addToRecycleBinApi(data) {
  const recycleBinItem = await apiClient.post("/recycleBin", data);
  return recycleBinItem;
}

export async function restoreFromRecycleBinApi(id) {
  await apiClient.delete(`/recycleBin/${id}`);
  return { success: true };
}

export async function deleteFromRecycleBinApi(id) {
  await apiClient.delete(`/recycleBin/${id}`);
  return { success: true };
}
