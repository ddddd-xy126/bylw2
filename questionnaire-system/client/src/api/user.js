import apiClient from './index.js';

// 认证相关
export const loginApi = async (data) => {
  // 查找用户
  const users = await apiClient.get('/users');
  const user = users.find(u => 
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
      level: user.level
    }
  };
};

export const registerApi = async (data) => {
  // 检查用户名是否已存在
  const users = await apiClient.get('/users');
  const existingUser = users.find(u => u.username === data.username || u.email === data.email);
  
  if (existingUser) {
    throw new Error("用户名或邮箱已存在");
  }
  
  // 创建新用户
  const newUser = {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    phone: data.phone || '',
    avatar: "/avatars/default.jpg",
    role: "user",
    banned: false,
    isActive: true,
    points: 0,
    level: 1,
    bio: '',
    city: '',
    gender: '',
    age: 0,
    profession: '',
    joinedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '',
    password: data.password,
    completedSurveys: [],  // 已完成的问卷ID数组
    tags: []  // 用户兴趣标签
  };
  
  const createdUser = await apiClient.post('/users', newUser);
  
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
      level: createdUser.level
    }
  };
};

export const profileApi = async (userId) => {
  const user = await apiClient.get(`/users/${userId}`);
  return user;
};

// 收藏相关
export const getFavoritesApi = async (userId) => {
  const favorites = await apiClient.get(`/favorites?userId=${userId}`);
  const surveys = await apiClient.get('/surveys');
  
  const favoriteSurveys = favorites
    .filter(fav => fav.surveyId) // 过滤掉surveyId为null的记录
    .map(fav => {
      const survey = surveys.find(s => s.id == fav.surveyId);
      if (!survey) return null;
      return { 
        id: fav.id, // 收藏记录的ID
        surveyId: survey.id,
        questionnaireId: survey.id, 
        createdAt: fav.createdAt, // 收藏时间
        ...survey 
      };
    })
    .filter(item => item !== null); // 过滤掉找不到的问卷
  
  return favoriteSurveys;
};

export const addFavoriteApi = async (userId, surveyId) => {
  const newFavorite = {
    userId: parseInt(userId),
    surveyId: parseInt(surveyId),
    createdAt: new Date().toISOString()
  };
  
  const favorite = await apiClient.post('/favorites', newFavorite);
  
  // 更新问卷的收藏数
  try {
    const survey = await apiClient.get(`/surveys/${surveyId}`);
    if (survey) {
      await apiClient.patch(`/surveys/${surveyId}`, {
        favoriteCount: (survey.favoriteCount || 0) + 1
      });
    }
  } catch (error) {
    console.error('更新收藏数失败:', error);
  }
  
  return { success: true, message: "收藏成功" };
};

export const removeFavoriteApi = async (userId, surveyId) => {
  const favorites = await apiClient.get(`/favorites?userId=${userId}&surveyId=${surveyId}`);
  if (favorites.length > 0) {
    await apiClient.delete(`/favorites/${favorites[0].id}`);
    
    // 更新问卷的收藏数
    try {
      const survey = await apiClient.get(`/surveys/${surveyId}`);
      if (survey && survey.favoriteCount > 0) {
        await apiClient.patch(`/surveys/${surveyId}`, {
          favoriteCount: survey.favoriteCount - 1
        });
      }
    } catch (error) {
      console.error('更新收藏数失败:', error);
    }
  }
  return { success: true, message: "取消收藏成功" };
};

// 获取用户答题记录
export const getUserAnsweredSurveysApi = async (userId) => {
  // 方法1：从用户的completedSurveys字段获取（推荐）
  try {
    const user = await apiClient.get(`/users/${userId}`);
    const completedSurveyIds = user.completedSurveys || [];
    
    if (completedSurveyIds.length === 0) {
      return [];
    }
    
    // 获取所有问卷
    const surveys = await apiClient.get('/surveys');
    
    // 根据已完成的问卷ID获取问卷详情和答案
    const answeredSurveys = completedSurveyIds.map(surveyId => {
      const survey = surveys.find(s => s.id == surveyId);
      if (!survey) return null;
      
      // 从问卷的answers中找到该用户的答案
      const userAnswer = survey.answers?.find(a => a.userId == userId);
      
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
      
      return {
        id: userAnswer?.id || `${userId}_${surveyId}`,
        userId: userId,
        surveyId: surveyId,
        surveyTitle: survey.title,
        title: survey.title,
        category: survey.category,
        estimatedTime: survey.estimatedTime || survey.duration || 5,
        score: userAnswer?.score || 0,
        result: userAnswer?.result || '未评分',
        submittedAt: userAnswer?.submittedAt || new Date().toISOString(),
        duration: userAnswer?.duration || 0,
        answers: processedAnswers,
        comment: userAnswer?.comment || null,
        survey: survey
      };
    }).filter(item => item !== null);
    
    return answeredSurveys;
  } catch (error) {
    console.error('获取用户答题记录失败:', error);
    // 降级：使用旧方法从独立的answers表获取
    return getUserAnsweredSurveysFromAnswersTable(userId);
  }
};

// 降级方法：从独立的answers表获取（兼容旧数据）
const getUserAnsweredSurveysFromAnswersTable = async (userId) => {
  const answers = await apiClient.get(`/answers?userId=${userId}`);
  const surveys = await apiClient.get('/surveys');
  
  // 合并答题记录和问卷信息
  const answeredSurveys = answers.map(answer => {
    const survey = surveys.find(s => s.id == answer.surveyId);
    return {
      ...answer,
      survey: survey || null,
      title: answer.surveyTitle || (survey ? survey.title : '未知问卷'),
      category: survey ? survey.category : '未知分类',
      estimatedTime: survey ? survey.estimatedTime : 0
    };
  });
  
  return answeredSurveys;
};

// 将答题记录移动到回收站（先保存到 recycleBin，然后删除 answers 中的原记录）
export const moveAnsweredToRecycleApi = async (answerId, answerData) => {
  // 1) 将记录复制到 recycleBin（添加 deletedAt）
  const recycleItem = {
    ...answerData,
    originalId: answerId,
    deletedAt: new Date().toISOString()
  };

  await apiClient.post('/recycleBin', recycleItem);

  // 2) 删除 answers 中的原记录
  await apiClient.delete(`/answers/${answerId}`);

  return { success: true };
};

// 用户成就和报告记录（保留必要功能）
export const getUserAchievementsApi = async (userId) => {
  const achievements = await apiClient.get(`/achievements?userId=${userId}`);
  return {
    list: achievements,
    total: achievements.length
  };
};

export const getUserReportsApi = async (userId) => {
  const reports = await apiClient.get(`/reports?userId=${userId}`);
  return {
    list: reports,
    total: reports.length
  };
};

// 更新用户信息
export const updateProfileApi = async (userId, userData) => {
  const updatedUser = await apiClient.patch(`/users/${userId}`, userData);
  return updatedUser;
};
