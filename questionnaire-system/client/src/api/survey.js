import apiClient from "./index.js";

// 问卷列表和详情
export async function listSurveys() {
  const surveys = await apiClient.get("/surveys");
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
  }

  // 添加一些额外的统计信息
  survey.isFavorite = false;
  survey.estimatedTime =
    survey.duration || Math.ceil(survey.questions.length * 1.5);
  survey.averageRating = survey.rating || 4.5;

  return survey;
}

// 答题相关
export async function submitSurveyApi(id, data) {
  try {
    // 1. 获取问卷完整数据
    const survey = await apiClient.get(`/surveys/${id}`);

    // 2. 处理答案数据，确保有 text 字段
    const answersWithText = data.answers.map((answer) => {
      // 如果前端已经提供了 text 字段，直接使用
      if (answer.text !== undefined && answer.text !== null) {
        return {
          questionId: answer.questionId,
          answer: answer.answer,
          text: answer.text,
          question: answer.question || "",
        };
      }

      // 如果前端没有提供 text，从 questionList 中查找并生成
      const question = survey.questionList?.find(
        (q) => q.id == answer.questionId
      );
      if (!question) {
        return {
          questionId: answer.questionId,
          answer: answer.answer,
          text: answer.answer,
          question: answer.question || "",
        };
      }

      let text = answer.answer;

      if (question.type === "single") {
        const option = question.options?.find(
          (opt) => opt.id === answer.answer
        );
        text = option ? option.text : answer.answer;
      } else if (question.type === "multiple" && Array.isArray(answer.answer)) {
        const textArray = answer.answer.map((answerId) => {
          const option = question.options?.find((opt) => opt.id === answerId);
          return option ? option.text : answerId;
        });
        text = textArray;
      } else if (question.type === "rating") {
        text = answer.answer;
      } else {
        text = answer.answer;
      }

      return {
        questionId: answer.questionId,
        answer: answer.answer,
        text: text,
        question: answer.question || question.title || question.content || "",
      };
    });

    // 3. 创建答案记录
    const newAnswer = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId: data.userId || 1,
      surveyId: parseInt(id),
      surveyTitle: data.surveyTitle || survey.title || "问卷",
      score: Math.floor(Math.random() * 40) + 60, // 60-100分
      result: "良好",
      submittedAt: new Date().toISOString(),
      duration: data.duration || 300,
      answers: answersWithText,
      comment: null, // 评论稍后添加
    };

    // 4. 更新问卷的选项统计数据和答案列表
    const updatedQuestionList =
      survey.questionList?.map((question) => {
        const userAnswer = data.answers.find(
          (a) => a.questionId == question.id
        );

        if (userAnswer && question.options && Array.isArray(question.options)) {
          const updatedOptions = question.options.map((option) => {
            let newCount = option.selectedCount || 0;

            if (question.type === "single" && userAnswer.answer === option.id) {
              newCount++;
            } else if (
              question.type === "multiple" &&
              Array.isArray(userAnswer.answer) &&
              userAnswer.answer.includes(option.id)
            ) {
              newCount++;
            }

            return {
              ...option,
              selectedCount: newCount,
            };
          });

          return {
            ...question,
            options: updatedOptions,
          };
        }

        return question;
      }) || survey.questionList;

    // 5. 获取现有答案列表并添加新答案
    const currentAnswers = survey.answers || [];
    const updatedAnswers = [...currentAnswers, newAnswer];

    // 6. 更新问卷数据
    await apiClient.patch(`/surveys/${id}`, {
      questionList: updatedQuestionList,
      answers: updatedAnswers,
      participantCount: (survey.participantCount || 0) + 1,
      participants: (survey.participants || 0) + 1,
      answerCount: (survey.answerCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    });

    // 7. 更新用户的已完成问卷列表
    if (data.userId) {
      try {
        const user = await apiClient.get(`/users/${data.userId}`);
        const completedSurveys = user.completedSurveys || [];

        // 如果还没有这个问卷ID，添加进去
        if (!completedSurveys.includes(parseInt(id))) {
          await apiClient.patch(`/users/${data.userId}`, {
            completedSurveys: [...completedSurveys, parseInt(id)],
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("更新用户已完成问卷列表失败:", error);
        // 不影响答题提交
      }
    }

    return {
      answerId: newAnswer.id,
      score: newAnswer.score,
      result: newAnswer.result,
      analysis: "根据您的回答，我们为您生成了个性化的分析报告...",
    };
  } catch (error) {
    console.error("提交答案失败:", error);
    throw error;
  }
}

// 评论相关
export async function getSurveyCommentsApi(id) {
  try {
    // 从问卷的answers中获取所有评论
    const survey = await apiClient.get(`/surveys/${id}`);
    const answers = survey.answers || [];

    // 提取所有有评论的答案
    const comments = answers
      .filter((answer) => answer.comment && answer.comment.content)
      .map((answer) => ({
        id: answer.id,
        surveyId: parseInt(id),
        userId: answer.userId,
        username: answer.username || "匿名用户",
        avatar: answer.userAvatar || "",
        content: answer.comment.content,
        rating: answer.comment.rating || 5,
        createdAt: answer.comment.createdAt || answer.submittedAt,
      }));

    return {
      list: comments,
      total: comments.length,
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
    // 获取问卷数据
    const survey = await apiClient.get(`/surveys/${id}`);
    const answers = survey.answers || [];

    // 查找该用户的答案记录
    const answerIndex = answers.findIndex((a) => a.userId == data.userId);

    if (answerIndex === -1) {
      throw new Error("请先完成问卷答题后再评论");
    }

    // 创建新评论
    const newComment = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      userId: data.userId,
      username: data.username,
      avatar: data.avatar,
      content: data.content,
      rating: data.rating || 5,
      createdAt: new Date().toISOString(),
    };

    // 更新该答案的评论信息（改为数组）
    const updatedAnswers = [...answers];
    const existingComments = updatedAnswers[answerIndex].comments || [];

    updatedAnswers[answerIndex] = {
      ...updatedAnswers[answerIndex],
      username: data.username,
      userAvatar: data.avatar,
      comments: [...existingComments, newComment],
      // 保留旧的 comment 字段用于兼容（存储最新评论）
      comment: {
        content: data.content,
        rating: data.rating || 5,
        createdAt: newComment.createdAt,
      },
    };

    // 更新问卷数据
    await apiClient.patch(`/surveys/${id}`, {
      answers: updatedAnswers,
      updatedAt: new Date().toISOString(),
    });

    // 重新计算平均评分和评分数量
    const allRatings = updatedAnswers
      .filter((a) => a.comment && a.comment.rating)
      .map((a) => a.comment.rating);

    if (allRatings.length > 0) {
      const averageRating = (
        allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      ).toFixed(1);
      await apiClient.patch(`/surveys/${id}`, {
        averageRating: parseFloat(averageRating),
        ratingCount: allRatings.length,
      });
    }

    return newComment;
  } catch (error) {
    console.error("创建评论失败:", error);
    throw error;
  }
}

export async function updateCommentApi(surveyId, userId, data) {
  try {
    // 获取问卷数据
    const survey = await apiClient.get(`/surveys/${surveyId}`);
    const answers = survey.answers || [];

    // 查找该用户的答案记录
    const answerIndex = answers.findIndex((a) => a.userId == userId);

    if (answerIndex === -1) {
      throw new Error("未找到答案记录");
    }

    // 更新评论
    const updatedAnswers = [...answers];
    updatedAnswers[answerIndex] = {
      ...updatedAnswers[answerIndex],
      comment: {
        ...updatedAnswers[answerIndex].comment,
        content: data.content,
        rating: data.rating,
        updatedAt: new Date().toISOString(),
      },
    };

    // 更新问卷数据
    await apiClient.patch(`/surveys/${surveyId}`, {
      answers: updatedAnswers,
      updatedAt: new Date().toISOString(),
    });

    // 重新计算平均评分
    const allRatings = updatedAnswers
      .filter((a) => a.comment && a.comment.rating)
      .map((a) => a.comment.rating);

    if (allRatings.length > 0) {
      const averageRating = (
        allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      ).toFixed(1);
      await apiClient.patch(`/surveys/${surveyId}`, {
        averageRating: parseFloat(averageRating),
        ratingCount: allRatings.length,
      });
    }

    return updatedAnswers[answerIndex];
  } catch (error) {
    console.error("更新评论失败:", error);
    throw error;
  }
}

export async function deleteCommentApi(surveyId, userId, commentId = null) {
  try {
    // 获取问卷数据
    const survey = await apiClient.get(`/surveys/${surveyId}`);
    const answers = survey.answers || [];

    // 查找该用户的答案记录
    const answerIndex = answers.findIndex((a) => a.userId == userId);

    if (answerIndex === -1) {
      throw new Error("未找到答案记录");
    }

    const updatedAnswers = [...answers];

    if (commentId) {
      // 删除指定的评论
      const comments = updatedAnswers[answerIndex].comments || [];
      const filteredComments = comments.filter((c) => c.id !== commentId);

      updatedAnswers[answerIndex] = {
        ...updatedAnswers[answerIndex],
        comments: filteredComments,
        // 更新 comment 字段为最新的评论（兼容性）
        comment:
          filteredComments.length > 0
            ? {
                content: filteredComments[filteredComments.length - 1].content,
                rating: filteredComments[filteredComments.length - 1].rating,
                createdAt:
                  filteredComments[filteredComments.length - 1].createdAt,
              }
            : null,
      };
    } else {
      // 删除所有评论（兼容旧API）
      updatedAnswers[answerIndex] = {
        ...updatedAnswers[answerIndex],
        comments: [],
        comment: null,
      };
    }

    // 更新问卷数据
    await apiClient.patch(`/surveys/${surveyId}`, {
      answers: updatedAnswers,
      updatedAt: new Date().toISOString(),
    });

    // 重新计算平均评分
    const allRatings = updatedAnswers
      .filter((a) => a.comment && a.comment.rating)
      .map((a) => a.comment.rating);

    const averageRating =
      allRatings.length > 0
        ? (
            allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
          ).toFixed(1)
        : 0;

    await apiClient.patch(`/surveys/${surveyId}`, {
      averageRating: parseFloat(averageRating),
      ratingCount: allRatings.length,
    });

    return { success: true };
  } catch (error) {
    console.error("删除评论失败:", error);
    throw error;
  }
}

export async function getUserCommentApi(surveyId, userId) {
  try {
    // 获取问卷数据
    const survey = await apiClient.get(`/surveys/${surveyId}`);
    const answers = survey.answers || [];

    // 查找该用户的答案记录
    const userAnswer = answers.find((a) => a.userId == userId);

    if (!userAnswer) {
      return [];
    }

    // 返回评论数组（新结构）
    if (userAnswer.comments && Array.isArray(userAnswer.comments)) {
      return userAnswer.comments;
    }

    // 兼容旧的单个评论结构
    if (userAnswer.comment) {
      return [
        {
          id: userAnswer.id,
          userId: userAnswer.userId,
          username: userAnswer.username,
          avatar: userAnswer.userAvatar,
          content: userAnswer.comment.content,
          rating: userAnswer.comment.rating,
          createdAt: userAnswer.comment.createdAt,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error("获取用户评论失败:", error);
    return [];
  }
}

export async function getUserAnswerApi(surveyId, userId) {
  try {
    // 获取问卷数据
    const survey = await apiClient.get(`/surveys/${surveyId}`);
    const answers = survey.answers || [];

    // 查找该用户的答案记录
    const userAnswer = answers.find((a) => a.userId == userId);

    return userAnswer || null;
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
    rating: 0,
    participants: 0,
    participantCount: 0,
    questionList: data.questionList || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const survey = await apiClient.post("/surveys", newSurvey);
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
  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "pending",
    updatedAt: new Date().toISOString(),
  });
  return survey;
}

export async function approveSurveyApi(id) {
  const survey = await apiClient.patch(`/surveys/${id}`, {
    status: "published",
    updatedAt: new Date().toISOString(),
  });
  return survey;
}

export async function deleteSurveyApi(id) {
  await apiClient.delete(`/surveys/${id}`);
  return { success: true };
}
