import { 
  mockAuthResponse, 
  mockUserProfile, 
  mockUserAnswers, 
  mockUserAchievements, 
  mockUserReports,
  mockSurveys,
  mockApiResponse 
} from "@/mockData";

// 用户收藏的问卷ID列表
let userFavorites = [1, 3];

// 认证相关
export const loginApi = async (data) => {
  // 模拟登录验证
  if (data.username === "admin" && data.password === "admin123") {
    return mockApiResponse({
      token: "mock-jwt-token-admin",
      user: { ...mockUserProfile, id: 3, username: "admin", nickname: "管理员", role: "admin" }
    });
  } else if (data.username === "user1" && data.password === "123456") {
    return mockApiResponse(mockAuthResponse);
  } else {
    throw new Error("用户名或密码错误");
  }
};

export const registerApi = async (data) => {
  // 模拟注册
  if (data.username === "existuser") {
    throw new Error("用户名已存在");
  }
  return mockApiResponse({
    token: "mock-jwt-token-new-user",
    user: {
      id: Date.now(),
      username: data.username,
      nickname: data.nickname || data.username,
      email: data.email,
      phone: data.phone,
      avatar: "/avatars/default.jpg",
      role: "user",
      status: "active",
      points: 0,
      level: 1,
      createdAt: new Date().toISOString()
    }
  });
};

export const profileApi = async () => {
  return mockApiResponse(mockUserProfile);
};

// 收藏相关
export const getFavoritesApi = async () => {
  const favoriteSurveys = mockSurveys.filter(survey => userFavorites.includes(survey.id));
  return mockApiResponse(favoriteSurveys.map(survey => ({ questionnaireId: survey.id, ...survey })));
};

export const addFavoriteApi = async (surveyId) => {
  if (!userFavorites.includes(parseInt(surveyId))) {
    userFavorites.push(parseInt(surveyId));
  }
  return mockApiResponse({ success: true, message: "收藏成功" });
};

export const removeFavoriteApi = async (surveyId) => {
  userFavorites = userFavorites.filter(id => id !== parseInt(surveyId));
  return mockApiResponse({ success: true, message: "取消收藏成功" });
};

// 用户记录
export const getUserAnswersApi = async () => {
  return mockApiResponse({
    list: mockUserAnswers,
    total: mockUserAnswers.length
  });
};

export const getUserAchievementsApi = async () => {
  return mockApiResponse({
    list: mockUserAchievements,
    total: mockUserAchievements.length
  });
};

export const getUserReportsApi = async () => {
  return mockApiResponse({
    list: mockUserReports,
    total: mockUserReports.length
  });
};

export const getAnswerDetailApi = async (answerId) => {
  const answer = mockUserAnswers.find(a => a.id == answerId);
  if (!answer) {
    throw new Error("答题记录不存在");
  }
  return mockApiResponse(answer);
};

export const deleteAnswerApi = async (answerId) => {
  return mockApiResponse({ success: true, message: "删除成功" });
};
