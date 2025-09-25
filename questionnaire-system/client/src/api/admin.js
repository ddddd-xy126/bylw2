import { 
  mockAdminStats,
  mockRecentSurveys,
  mockRecentUsers,
  mockSystemStatus,
  mockActivityData,
  mockCategoryDistribution,
  mockQuestions,
  mockAdminSurveys,
  mockHealthCheck,
  mockUsers,
  mockCategories,
  mockApiResponse 
} from "@/mockData";

// 系统管理
export const healthCheckApi = async () => {
  return mockApiResponse(mockHealthCheck);
};

export const seedAdminApi = async (data) => {
  return mockApiResponse({ 
    success: true, 
    message: "管理员账户创建成功",
    admin: {
      username: data.username,
      role: "admin",
      createdAt: new Date().toISOString()
    }
  });
};

// 用户管理
export const getAllUsersApi = async () => {
  return mockApiResponse({
    list: mockUsers,
    total: mockUsers.length
  });
};

export const createUserApi = async (data) => {
  const newUser = {
    id: Date.now(),
    ...data,
    avatar: "/avatars/default.jpg",
    status: "active",
    points: 0,
    level: 1,
    createdAt: new Date().toISOString()
  };
  
  return mockApiResponse(newUser);
};

export const deleteUserApi = async (id) => {
  return mockApiResponse({ success: true, message: "用户删除成功" });
};

export const banUserApi = async (id) => {
  return mockApiResponse({ success: true, message: "用户已被禁用" });
};

export const unbanUserApi = async (id) => {
  return mockApiResponse({ success: true, message: "用户已被启用" });
};

// 问卷管理
export const createAdminSurveyApi = async (data) => {
  const newSurvey = {
    id: Date.now(),
    ...data,
    author: "管理员",
    authorId: 3,
    participants: 0,
    rating: 0,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return mockApiResponse(newSurvey);
};

export const deleteAdminSurveyApi = async (id) => {
  return mockApiResponse({ success: true, message: "问卷删除成功" });
};

// 题目管理
export const listQuestionsApi = async () => {
  return mockApiResponse({
    list: mockQuestions,
    total: mockQuestions.length
  });
};

export const createQuestionApi = async (data) => {
  const newQuestion = {
    id: Date.now(),
    ...data,
    usageCount: 0,
    createdAt: new Date().toISOString()
  };
  
  return mockApiResponse(newQuestion);
};

export const deleteQuestionApi = async (id) => {
  return mockApiResponse({ success: true, message: "题目删除成功" });
};

// Dashboard 相关API
export const getDashboardStatsApi = async () => {
  return mockApiResponse(mockAdminStats);
};

export const getRecentSurveysApi = async (limit = 5) => {
  const surveys = mockRecentSurveys.slice(0, limit);
  return mockApiResponse({
    list: surveys,
    total: surveys.length
  });
};

export const getRecentUsersApi = async (limit = 5) => {
  const users = mockRecentUsers.slice(0, limit);
  return mockApiResponse({
    list: users,
    total: users.length
  });
};

export const getSystemStatusApi = async () => {
  return mockApiResponse(mockSystemStatus);
};

export const getActivityDataApi = async () => {
  return mockApiResponse({
    list: mockActivityData,
    total: mockActivityData.length
  });
};

export const getCategoryDistributionApi = async () => {
  return mockApiResponse({
    list: mockCategoryDistribution,
    total: mockCategoryDistribution.length
  });
};

// 用户管理扩展
export const getUsersApi = async (params = {}) => {
  let filteredUsers = [...mockUsers];
  
  if (params.status) {
    filteredUsers = filteredUsers.filter(user => user.status === params.status);
  }
  if (params.search) {
    filteredUsers = filteredUsers.filter(user => 
      user.username.includes(params.search) || 
      user.nickname.includes(params.search) ||
      user.email.includes(params.search)
    );
  }
  
  return mockApiResponse({
    list: filteredUsers,
    total: filteredUsers.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10
  });
};

export const getUserDetailApi = async (id) => {
  const user = mockUsers.find(u => u.id == id);
  if (!user) {
    throw new Error("用户不存在");
  }
  
  // 增强用户详情数据
  const enhancedUser = {
    ...user,
    stats: user.stats || {
      totalAnswers: user._count?.answers || 0,
      totalFavorites: user._count?.favorites || 0,
      totalPoints: user.points || 0
    }
  };
  
  return mockApiResponse(enhancedUser);
};

export const updateUserApi = async (id, data) => {
  return mockApiResponse({ 
    success: true, 
    message: "用户信息更新成功",
    user: { id: parseInt(id), ...data, updatedAt: new Date().toISOString() }
  });
};

export const resetPasswordApi = async (id) => {
  return mockApiResponse({ 
    success: true, 
    message: "密码重置成功",
    newPassword: "123456"
  });
};

// 问卷管理扩展
export const getSurveysApi = async (params = {}) => {
  let filteredSurveys = [...mockAdminSurveys];
  
  if (params.status) {
    filteredSurveys = filteredSurveys.filter(survey => survey.status === params.status);
  }
  if (params.category) {
    filteredSurveys = filteredSurveys.filter(survey => survey.category === params.category);
  }
  if (params.search) {
    filteredSurveys = filteredSurveys.filter(survey => 
      survey.title.includes(params.search) || 
      survey.description.includes(params.search)
    );
  }
  
  return mockApiResponse({
    list: filteredSurveys,
    total: filteredSurveys.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10
  });
};

export const getSurveyDetailApi = async (id) => {
  const survey = mockAdminSurveys.find(s => s.id == id);
  if (!survey) {
    throw new Error("问卷不存在");
  }
  return mockApiResponse(survey);
};

export const updateSurveyStatusApi = async (id, status) => {
  return mockApiResponse({ 
    success: true, 
    message: "问卷状态更新成功",
    survey: { id: parseInt(id), status, updatedAt: new Date().toISOString() }
  });
};

export const copySurveyApi = async (id) => {
  const originalSurvey = mockAdminSurveys.find(s => s.id == id);
  if (!originalSurvey) {
    throw new Error("原始问卷不存在");
  }
  
  const copiedSurvey = {
    ...originalSurvey,
    id: Date.now(),
    title: `${originalSurvey.title} - 副本`,
    status: "draft",
    participants: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return mockApiResponse(copiedSurvey);
};

export const getCategoriesApi = async () => {
  return mockApiResponse({
    list: mockCategories,
    total: mockCategories.length
  });
};

// 管理员个人资料相关API
export const getAdminProfileApi = async () => {
  const adminProfile = {
    id: 3,
    username: 'admin',
    nickname: '系统管理员',
    email: 'admin@example.com',
    phone: '13800000000',
    department: 'tech',
    bio: '负责系统维护和用户管理，确保平台稳定运行。',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=admin',
    role: 'admin',
    createdAt: '2024-01-01T08:00:00Z',
    lastLoginAt: '2024-01-25T11:00:00Z',
    lastLoginIp: '192.168.1.1'
  };
  
  return mockApiResponse(adminProfile);
};

export const updateAdminProfileApi = async (data) => {
  return mockApiResponse({
    success: true,
    message: '个人资料更新成功',
    profile: {
      ...data,
      updatedAt: new Date().toISOString()
    }
  });
};

export const changeAdminPasswordApi = async (passwordData) => {
  // 模拟密码验证
  if (passwordData.currentPassword !== '123456') {
    throw new Error('当前密码不正确');
  }
  
  return mockApiResponse({
    success: true,
    message: '密码修改成功'
  });
};

export const updateAdminAvatarApi = async (avatarData) => {
  return mockApiResponse({
    success: true,
    message: '头像更新成功',
    avatar: avatarData.avatar
  });
};

export const getAdminStatsApi = async () => {
  const adminStats = {
    totalSurveys: 156,
    totalUsers: 1248,
    pendingReviews: 23,
    loginDays: 45,
    todayLogins: 89,
    monthlyActive: 892
  };
  
  return mockApiResponse(adminStats);
};

export const getAdminActivitiesApi = async (limit = 10) => {
  const activities = [
    {
      id: 1,
      title: '审核问卷',
      description: '审核通过了"用户满意度调查问卷"',
      type: 'review',
      timestamp: '2024-01-25T10:30:00Z'
    },
    {
      id: 2,
      title: '用户管理',
      description: '封禁了违规用户 "spam_user"',
      type: 'user_action',
      timestamp: '2024-01-25T09:15:00Z'
    },
    {
      id: 3,
      title: '系统维护',
      description: '更新了系统配置',
      type: 'system',
      timestamp: '2024-01-24T16:45:00Z'
    },
    {
      id: 4,
      title: '数据导出',
      description: '导出了用户数据报表',
      type: 'export',
      timestamp: '2024-01-24T14:20:00Z'
    },
    {
      id: 5,
      title: '问卷下架',
      description: '下架了过期的"市场调研问卷"',
      type: 'survey_action',
      timestamp: '2024-01-24T11:30:00Z'
    }
  ];
  
  return mockApiResponse({
    list: activities.slice(0, limit),
    total: activities.length
  });
};
