import apiClient from "./index.js";

// 认证相关
export const loginApi = async (data) => {
  // 查找用户
  const users = await apiClient.get("/users");
  const user = users.find(
    (u) =>
      (u.username === data.username || u.email === data.username) &&
      u.password === data.password
  );

  if (!user) {
    throw new Error("用户名或密码错误");
  }

  return {
    token: `mock-jwt-token-${user.id}`,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      level: user.level,
    },
  };
};

export const registerApi = async (data) => {
  // 检查用户名是否已存在
  const users = await apiClient.get("/users");
  const existingUser = users.find(
    (u) => u.username === data.username || u.email === data.email
  );

  if (existingUser) {
    throw new Error("用户名或邮箱已存在");
  }

  // 创建新用户
  const newUser = {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    phone: data.phone || "",
    avatar: "/avatars/default.jpg",
    role: "user",
    banned: false,
    isActive: true,
    points: 0,
    level: 1,
    bio: "",
    city: "",
    gender: "",
    age: 0,
    profession: "",
    joinedDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: "",
    password: data.password,
    completedSurveys: [], // 已完成的问卷ID数组
    tags: [], // 用户兴趣标签
  };

  const createdUser = await apiClient.post("/users", newUser);

  return {
    token: `mock-jwt-token-${createdUser.id}`,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      nickname: createdUser.nickname,
      email: createdUser.email,
      avatar: createdUser.avatar,
      role: createdUser.role,
      points: createdUser.points,
      level: createdUser.level,
    },
  };
};

export const profileApi = async (userId) => {
  const user = await apiClient.get(`/users/${userId}`);
  return user;
};

// 收藏相关
export const getFavoritesApi = async (userId) => {
  const response = await apiClient.get(`/favorites?userId=${userId}`);

  // 处理后端返回的数据结构
  let favorites = response;
  if (response && typeof response === "object" && response.success) {
    favorites = response.data || [];
  }

  if (!Array.isArray(favorites)) {
    favorites = [];
  }

  // 将后端返回的数据格式化，确保包含questionnaireId字段以兼容前端代码
  const favoriteSurveys = favorites
    .filter((fav) => fav.surveyId || (fav.survey && fav.survey.id))
    .map((fav) => {
      // 后端返回的数据已经包含了survey对象（通过include关联查询）
      const surveyData = fav.survey || {};
      const surveyId = fav.surveyId || surveyData.id;

      return {
        id: fav.id, // 收藏记录的ID
        surveyId: surveyId,
        questionnaireId: surveyId, // 添加questionnaireId以兼容前端代码
        createdAt: fav.createdAt, // 收藏时间
        ...surveyData, // 包含问卷的详细信息
      };
    })
    .filter((item) => item.surveyId); // 过滤掉没有surveyId的记录

  return favoriteSurveys;
};

export const addFavoriteApi = async (userId, surveyId) => {
  const newFavorite = {
    userId: parseInt(userId),
    surveyId: parseInt(surveyId),
    createdAt: new Date().toISOString(),
  };

  // 调用收藏接口 - 后端会自动处理收藏数增加和积分奖励
  const favorite = await apiClient.post("/favorites", newFavorite);
  return { success: true, message: "收藏成功", pointsEarned: 3 };
};

export const removeFavoriteApi = async (userId, surveyId) => {
  const favorites = await apiClient.get(
    `/favorites?userId=${userId}&surveyId=${surveyId}`
  );
  if (favorites.length > 0) {
    await apiClient.delete(`/favorites/${favorites[0].id}`);

    // 更新问卷的收藏数
    try {
      const survey = await apiClient.get(`/surveys/${surveyId}`);
      if (survey && survey.favoriteCount > 0) {
        await apiClient.patch(`/surveys/${surveyId}`, {
          favoriteCount: survey.favoriteCount - 1,
        });
      }
    } catch (error) {
      console.error("更新收藏数失败:", error);
    }
  }
  return { success: true, message: "取消收藏成功" };
};

// 获取用户答题记录
export const getUserAnsweredSurveysApi = async (userId) => {
  try {
    // 使用后端API获取用户的答题记录
    const answers = await apiClient.get(`/answers?userId=${userId}`);

    if (!answers || answers.length === 0) {
      return [];
    }

    // 获取所有问卷信息以补充数据
    const surveys = await apiClient.get("/surveys");

    // 合并答题记录和问卷信息
    const answeredSurveys = answers.map((answer) => {
      const survey = surveys.find((s) => s.id == answer.surveyId);

      return {
        id: answer.id,
        userId: answer.userId,
        surveyId: answer.surveyId,
        surveyTitle: answer.surveyTitle || (survey ? survey.title : "未知问卷"),
        title: answer.surveyTitle || (survey ? survey.title : "未知问卷"),
        category: survey ? survey.category : "未知分类",
        estimatedTime: survey
          ? survey.estimatedTime || survey.duration || 5
          : 5,
        score: answer.score || 0,
        result: answer.result || "未评分",
        submittedAt: answer.submittedAt,
        duration: answer.duration || 0,
        answers: answer.answers || [],
        survey: survey || null,
      };
    });

    return answeredSurveys;
  } catch (error) {
    console.error("获取用户答题记录失败:", error);
    throw error;
  }
};

// 将答题记录移动到回收站
export const moveAnsweredToRecycleApi = async (answerId, answerData) => {
  try {
    // 1) 将记录复制到 recycleBin（添加 deletedAt）
    const recycleItem = {
      ...answerData,
      originalId: answerId,
      deletedAt: new Date().toISOString(),
      type: "answer", // 标记类型为答题记录
    };

    await apiClient.post("/recycleBin", recycleItem);

    // 2) 从用户的 completedSurveys 中移除此问卷ID
    if (answerData.userId && answerData.surveyId) {
      try {
        const user = await apiClient.get(`/users/${answerData.userId}`);
        if (user.completedSurveys && Array.isArray(user.completedSurveys)) {
          const updatedCompletedSurveys = user.completedSurveys.filter(
            (id) => id != answerData.surveyId
          );
          await apiClient.patch(`/users/${answerData.userId}`, {
            completedSurveys: updatedCompletedSurveys,
          });
        }
      } catch (error) {
        console.error("更新用户completedSurveys失败:", error);
        // 即使更新用户失败，也继续执行
      }
    }

    // 3) 尝试从独立的 answers 表中删除记录（如果存在）, 兼容旧版本数据结构
    try {
      // 先查找是否存在独立的答题记录
      const answers = await apiClient.get(
        `/answers?userId=${answerData.userId}&surveyId=${answerData.surveyId}`
      );
      if (answers && answers.length > 0) {
        // 删除找到的答题记录
        for (const ans of answers) {
          await apiClient.delete(`/answers/${ans.id}`);
        }
      }
    } catch (error) {
      // 忽略错误，因为新版本的答题记录存储在用户的 completedSurveys 中
      console.log("未找到独立的答题记录，可能使用的是新版数据结构");
    }

    return { success: true };
  } catch (error) {
    console.error("移动到回收站失败:", error);
    throw error;
  }
};

// 用户成就和报告记录（保留必要功能）
export const getUserAchievementsApi = async (userId) => {
  const achievements = await apiClient.get(`/achievements?userId=${userId}`);
  return {
    list: achievements,
    total: achievements.length,
  };
};

export const getUserReportsApi = async (userId) => {
  const reports = await apiClient.get(`/reports?userId=${userId}`);
  return {
    list: reports,
    total: reports.length,
  };
};

// 更新用户信息
export const updateProfileApi = async (userId, userData) => {
  const updatedUser = await apiClient.patch(`/users/${userId}`, userData);
  return updatedUser;
};
