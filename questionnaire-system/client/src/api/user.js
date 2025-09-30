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
    password: data.password
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
  return { success: true, message: "收藏成功" };
};

export const removeFavoriteApi = async (userId, surveyId) => {
  const favorites = await apiClient.get(`/favorites?userId=${userId}&surveyId=${surveyId}`);
  if (favorites.length > 0) {
    await apiClient.delete(`/favorites/${favorites[0].id}`);
  }
  return { success: true, message: "取消收藏成功" };
};

// 获取用户答题记录
export const getUserAnsweredSurveysApi = async (userId) => {
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
