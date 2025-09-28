import apiClient from './index.js';

// 系统管理
export const healthCheckApi = async () => {
  const status = await apiClient.get('/systemStatus');
  return status;
};

export const seedAdminApi = async (data) => {
  const newAdmin = {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    password: data.password,
    role: "admin",
    banned: false,
    isActive: true,
    points: 0,
    level: 1,
    avatar: "/avatars/admin.jpg",
    createdAt: new Date().toISOString()
  };
  
  const admin = await apiClient.post('/users', newAdmin);
  
  return { 
    success: true, 
    message: "管理员账户创建成功",
    admin: {
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt
    }
  };
};

// 用户管理
export const getAllUsersApi = async () => {
  const users = await apiClient.get('/users');
  return {
    list: users,
    total: users.length
  };
};

export const createUserApi = async (data) => {
  const newUser = {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    phone: data.phone || '',
    password: data.password,
    avatar: "/avatars/default.jpg",
    role: data.role || "user",
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
    lastLoginIp: ''
  };
  
  const user = await apiClient.post('/users', newUser);
  return user;
};

export const deleteUserApi = async (id) => {
  await apiClient.delete(`/users/${id}`);
  return { success: true, message: "用户删除成功" };
};

export const banUserApi = async (id) => {
  const user = await apiClient.get(`/users/${id}`);
  await apiClient.put(`/users/${id}`, { ...user, banned: true, isActive: false });
  return { success: true, message: "用户已被禁用" };
};

export const unbanUserApi = async (id) => {
  const user = await apiClient.get(`/users/${id}`);
  await apiClient.put(`/users/${id}`, { ...user, banned: false, isActive: true });
  return { success: true, message: "用户已被启用" };
};

// 问卷管理
export const createAdminSurveyApi = async (data) => {
  const newSurvey = {
    ...data,
    author: "管理员",
    authorId: 3,
    participants: 0,
    rating: 0,
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const survey = await apiClient.post('/surveys', newSurvey);
  return survey;
};

export const deleteAdminSurveyApi = async (id) => {
  await apiClient.delete(`/surveys/${id}`);
  return { success: true, message: "问卷删除成功" };
};

// 题目管理
export const listQuestionsApi = async () => {
  const questions = await apiClient.get('/questions');
  return {
    list: questions,
    total: questions.length
  };
};

export const createQuestionApi = async (data) => {
  const newQuestion = {
    ...data,
    usageCount: 0,
    createdAt: new Date().toISOString()
  };
  
  const question = await apiClient.post('/questions', newQuestion);
  return question;
};

export const deleteQuestionApi = async (id) => {
  await apiClient.delete(`/questions/${id}`);
  return { success: true, message: "题目删除成功" };
};

// Dashboard 相关API
export const getDashboardStatsApi = async () => {
  const stats = await apiClient.get('/adminStats');
  return stats;
};

export const getRecentSurveysApi = async (limit = 5) => {
  const surveys = await apiClient.get(`/surveys?_sort=createdAt&_order=desc&_limit=${limit}`);
  return {
    list: surveys,
    total: surveys.length
  };
};

export const getRecentUsersApi = async (limit = 5) => {
  const users = await apiClient.get(`/users?_sort=createdAt&_order=desc&_limit=${limit}`);
  return {
    list: users,
    total: users.length
  };
};

export const getSystemStatusApi = async () => {
  const status = await apiClient.get('/systemStatus');
  return status;
};

export const getActivityDataApi = async () => {
  const data = await apiClient.get('/activityData');
  return {
    list: data,
    total: data.length
  };
};

export const getCategoryDistributionApi = async () => {
  const categories = await apiClient.get('/categories');
  return {
    list: categories,
    total: categories.length
  };
};

// 用户管理扩展
export const getUsersApi = async (params = {}) => {
  let url = '/users';
  let queryParams = [];
  
  if (params.role) {
    queryParams.push(`role=${params.role}`);
  }
  if (params.search) {
    queryParams.push(`q=${params.search}`);
  }
  if (params.page && params.pageSize) {
    queryParams.push(`_page=${params.page}&_limit=${params.pageSize}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  const users = await apiClient.get(url);
  
  return {
    list: users,
    total: users.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10
  };
};

export const getUserDetailApi = async (id) => {
  const user = await apiClient.get(`/users/${id}`);
  if (!user) {
    throw new Error("用户不存在");
  }
  
  // 获取用户的统计数据
  const [answers, favorites] = await Promise.all([
    apiClient.get(`/answers?userId=${id}`),
    apiClient.get(`/favorites?userId=${id}`)
  ]);
  
  // 增强用户详情数据
  const enhancedUser = {
    ...user,
    stats: {
      totalAnswers: answers.length,
      totalFavorites: favorites.length,
      totalPoints: user.points || 0
    }
  };
  
  return enhancedUser;
};

export const updateUserApi = async (id, data) => {
  const updatedUser = await apiClient.put(`/users/${id}`, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  
  return { 
    success: true, 
    message: "用户信息更新成功",
    user: updatedUser
  };
};

export const resetPasswordApi = async (id) => {
  const user = await apiClient.get(`/users/${id}`);
  await apiClient.put(`/users/${id}`, {
    ...user,
    password: "123456",
    updatedAt: new Date().toISOString()
  });
  
  return { 
    success: true, 
    message: "密码重置成功",
    newPassword: "123456"
  };
};

// 问卷管理扩展
export const getSurveysApi = async (params = {}) => {
  let url = '/surveys';
  let queryParams = [];
  
  if (params.status) {
    queryParams.push(`status=${params.status}`);
  }
  if (params.categoryId) {
    queryParams.push(`categoryId=${params.categoryId}`);
  }
  if (params.search) {
    queryParams.push(`q=${params.search}`);
  }
  if (params.page && params.pageSize) {
    queryParams.push(`_page=${params.page}&_limit=${params.pageSize}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  const surveys = await apiClient.get(url);
  
  return {
    list: surveys,
    total: surveys.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10
  };
};

export const getSurveyDetailApi = async (id) => {
  const survey = await apiClient.get(`/surveys/${id}`);
  if (!survey) {
    throw new Error("问卷不存在");
  }
  return survey;
};

export const updateSurveyStatusApi = async (id, status) => {
  const survey = await apiClient.get(`/surveys/${id}`);
  const updatedSurvey = await apiClient.put(`/surveys/${id}`, {
    ...survey,
    status,
    updatedAt: new Date().toISOString()
  });
  
  return { 
    success: true, 
    message: "问卷状态更新成功",
    survey: updatedSurvey
  };
};

export const copySurveyApi = async (id) => {
  const originalSurvey = await apiClient.get(`/surveys/${id}`);
  if (!originalSurvey) {
    throw new Error("原始问卷不存在");
  }
  
  const copiedSurvey = {
    ...originalSurvey,
    id: undefined, // 让json-server自动生成ID
    title: `${originalSurvey.title} - 副本`,
    status: "draft",
    participants: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const newSurvey = await apiClient.post('/surveys', copiedSurvey);
  return newSurvey;
};

export const getCategoriesApi = async () => {
  const categories = await apiClient.get('/categories');
  return {
    list: categories,
    total: categories.length
  };
};

// 管理员个人资料相关API
export const getAdminProfileApi = async () => {
  // 获取管理员用户信息
  const users = await apiClient.get('/users?role=admin');
  const adminProfile = users.find(user => user.username === 'admin');
  
  if (!adminProfile) {
    throw new Error('管理员账户不存在');
  }
  
  return adminProfile;
};

export const updateAdminProfileApi = async (data) => {
  const users = await apiClient.get('/users?role=admin');
  const admin = users.find(user => user.username === 'admin');
  
  if (!admin) {
    throw new Error('管理员账户不存在');
  }
  
  const updatedAdmin = await apiClient.put(`/users/${admin.id}`, {
    ...admin,
    ...data,
    updatedAt: new Date().toISOString()
  });
  
  return {
    success: true,
    message: '个人资料更新成功',
    profile: updatedAdmin
  };
};

export const changeAdminPasswordApi = async (passwordData) => {
  const users = await apiClient.get('/users?role=admin');
  const admin = users.find(user => user.username === 'admin');
  
  if (!admin) {
    throw new Error('管理员账户不存在');
  }
  
  // 验证当前密码
  if (passwordData.currentPassword !== admin.password) {
    throw new Error('当前密码不正确');
  }
  
  // 更新密码
  await apiClient.put(`/users/${admin.id}`, {
    ...admin,
    password: passwordData.newPassword,
    updatedAt: new Date().toISOString()
  });
  
  return {
    success: true,
    message: '密码修改成功'
  };
};

export const updateAdminAvatarApi = async (avatarData) => {
  const users = await apiClient.get('/users?role=admin');
  const admin = users.find(user => user.username === 'admin');
  
  if (!admin) {
    throw new Error('管理员账户不存在');
  }
  
  await apiClient.put(`/users/${admin.id}`, {
    ...admin,
    avatar: avatarData.avatar,
    updatedAt: new Date().toISOString()
  });
  
  return {
    success: true,
    message: '头像更新成功',
    avatar: avatarData.avatar
  };
};

export const getAdminStatsApi = async () => {
  // 从adminStats获取统计数据
  const stats = await apiClient.get('/adminStats');
  return stats;
};

export const getAdminActivitiesApi = async (limit = 10) => {
  // 这里可以从日志表或活动记录表获取数据
  // 目前返回模拟数据，实际可以从数据库获取
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
  
  return {
    list: activities.slice(0, limit),
    total: activities.length
  };
};
