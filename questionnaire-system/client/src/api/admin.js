import apiClient from "./index.js";

// 系统管理
export const healthCheckApi = async () => {
  const status = await apiClient.get("/systemStatus");
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
    createdAt: new Date().toISOString(),
  };

  const admin = await apiClient.post("/users", newAdmin);

  return {
    success: true,
    message: "管理员账户创建成功",
    admin: {
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
    },
  };
};

// 用户管理
export const getAllUsersApi = async () => {
  const response = await apiClient.get("/admin/users");
  return {
    list: response.data || [],
    total: response.pagination?.total || 0,
  };
};

export const createUserApi = async (data) => {
  // 注册新用户通过 auth API
  const response = await apiClient.post("/auth/register", {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    password: data.password,
  });
  return response.data.user;
};

export const deleteUserApi = async (id) => {
  await apiClient.delete(`/admin/users/${id}`);
  return { success: true, message: "用户删除成功" };
};

export const banUserApi = async (id) => {
  const response = await apiClient.put(`/admin/users/${id}/ban`);
  return response;
};

export const unbanUserApi = async (id) => {
  const response = await apiClient.put(`/admin/users/${id}/unban`);
  return response;
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
    updatedAt: new Date().toISOString(),
  };

  const survey = await apiClient.post("/surveys", newSurvey);
  return survey;
};

export const deleteAdminSurveyApi = async (id) => {
  await apiClient.delete(`/surveys/${id}`);
  return { success: true, message: "问卷删除成功" };
};

// Dashboard 相关API
export const getDashboardStatsApi = async () => {
  const response = await apiClient.get("/admin/dashboard/stats");
  return response.data || {};
};

export const getRecentSurveysApi = async (limit = 5) => {
  const surveys = await apiClient.get(
    `/surveys?_sort=createdAt&_order=desc&_limit=${limit}`
  );
  return {
    list: surveys,
    total: surveys.length,
  };
};

export const getRecentUsersApi = async (limit = 5) => {
  const users = await apiClient.get(
    `/users?_sort=createdAt&_order=desc&_limit=${limit}`
  );
  return {
    list: users,
    total: users.length,
  };
};

export const getSystemStatusApi = async () => {
  const status = await apiClient.get("/systemStatus");
  return status;
};

export const getActivityDataApi = async () => {
  const data = await apiClient.get("/activityData");
  return {
    list: data,
    total: data.length,
  };
};

export const getCategoryDistributionApi = async () => {
  const categories = await apiClient.get("/categories");
  return {
    list: categories,
    total: categories.length,
  };
};

// 用户管理扩展
export const getUsersApi = async (params = {}) => {
  let url = "/users";
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
    url += "?" + queryParams.join("&");
  }

  const users = await apiClient.get(url);

  return {
    list: users,
    total: users.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
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
    apiClient.get(`/favorites?userId=${id}`),
  ]);

  // 增强用户详情数据
  const enhancedUser = {
    ...user,
    stats: {
      totalAnswers: answers.length,
      totalFavorites: favorites.length,
      totalPoints: user.points || 0,
    },
  };

  return enhancedUser;
};

export const updateUserApi = async (id, data) => {
  const updatedUser = await apiClient.put(`/users/${id}`, {
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "用户信息更新成功",
    user: updatedUser,
  };
};

export const resetPasswordApi = async (id) => {
  const response = await apiClient.put(`/admin/users/${id}/reset-password`);
  return response;
};

// 问卷管理扩展
export const getSurveysApi = async (params = {}) => {
  let url = "/surveys";
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
    url += "?" + queryParams.join("&");
  }

  const surveys = await apiClient.get(url);

  return {
    list: surveys,
    total: surveys.length,
    page: params.page || 1,
    pageSize: params.pageSize || 10,
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
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "问卷状态更新成功",
    survey: updatedSurvey,
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
    updatedAt: new Date().toISOString(),
  };

  const newSurvey = await apiClient.post("/surveys", copiedSurvey);
  return newSurvey;
};

export const getCategoriesApi = async () => {
  const categories = await apiClient.get("/categories");
  return {
    list: categories,
    total: categories.length,
  };
};

// 管理员个人资料相关API
export const getAdminProfileApi = async () => {
  // 获取管理员用户信息
  const users = await apiClient.get("/users?role=admin");
  const adminProfile = users.find((user) => user.username === "admin");

  if (!adminProfile) {
    throw new Error("管理员账户不存在");
  }

  return adminProfile;
};

export const updateAdminProfileApi = async (data) => {
  const users = await apiClient.get("/users?role=admin");
  const admin = users.find((user) => user.username === "admin");

  if (!admin) {
    throw new Error("管理员账户不存在");
  }

  const updatedAdmin = await apiClient.put(`/users/${admin.id}`, {
    ...admin,
    ...data,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "个人资料更新成功",
    profile: updatedAdmin,
  };
};

export const changeAdminPasswordApi = async (passwordData) => {
  // 从 localStorage 获取当前登录用户信息
  const profileStr = localStorage.getItem("userProfile");
  if (!profileStr) {
    throw new Error("请先登录");
  }

  const currentUser = JSON.parse(profileStr);

  // 获取用户完整信息
  const user = await apiClient.get(`/users/${currentUser.id}`);

  if (!user) {
    throw new Error("用户不存在");
  }

  // 验证当前密码
  if (passwordData.currentPassword !== user.password) {
    throw new Error("当前密码不正确");
  }

  // 更新密码
  await apiClient.put(`/users/${user.id}`, {
    ...user,
    password: passwordData.newPassword,
    updatedAt: new Date().toISOString(),
  });

  return {
    success: true,
    message: "密码修改成功,请妥善保管新密码",
  };
};

export const updateAdminAvatarApi = async (avatarData, userId) => {
  try {
    if (!userId) {
      throw new Error("用户ID不能为空");
    }

    // 先获取数据库中的完整用户信息
    const existingUser = await apiClient.get(`/users/${userId}`);

    // 更新头像
    const updatedUser = await apiClient.put(`/users/${userId}`, {
      ...existingUser,
      avatar: avatarData.avatar,
      updatedAt: new Date().toISOString(),
    });

    // 记录管理员操作
    await recordAdminActivity({
      adminId: userId,
      adminName: existingUser.nickname || existingUser.username,
      title: "更换头像",
      description: "更新了个人头像",
      type: "avatar_update",
    });

    return {
      success: true,
      message: "头像更新成功",
      user: updatedUser,
    };
  } catch (error) {
    console.error("更新头像失败:", error);
    throw error;
  }
};

export const getAdminStatsApi = async () => {
  // 从adminStats获取统计数据
  const stats = await apiClient.get("/adminStats");
  return stats;
};

export const getAdminActivitiesApi = async (limit = 10, adminId = null) => {
  try {
    // 从后端 API 获取管理员活动记录
    let activities = await apiClient.get("/admin/activities");

    if (!Array.isArray(activities)) {
      console.warn("adminActivities 不是数组:", activities);
      return { list: [], total: 0 };
    }

    // 按时间倒序排列
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 如果指定了 adminId，则过滤该管理员的活动（转换为字符串比较）
    if (adminId) {
      const adminIdStr = String(adminId);
      activities = activities.filter(
        (act) => String(act.adminId) === adminIdStr
      );
      console.log(
        `过滤管理员 ${adminIdStr} 的活动，找到 ${activities.length} 条`
      );
    }

    return {
      list: limit ? activities.slice(0, limit) : activities,
      total: activities.length,
    };
  } catch (error) {
    console.error("获取管理员活动记录失败:", error);
    return { list: [], total: 0 };
  }
};

// 记录管理员操作
export const recordAdminActivity = async (activityData) => {
  try {
    // 生成唯一ID
    const activityId = `act_${Date.now()}`;

    const newActivity = {
      id: activityId,
      adminId: String(activityData.adminId), // 确保是字符串
      adminName: activityData.adminName,
      title: activityData.title,
      description: activityData.description,
      type: activityData.type,
      timestamp: new Date().toISOString(),
    };

    console.log("记录管理员操作:", newActivity);

    // 使用正确的API路径
    await apiClient.post("/admin/activities", newActivity);

    return {
      success: true,
      activity: newActivity,
    };
  } catch (error) {
    console.error("记录管理员操作失败:", error);
    return { success: false };
  }
};

// 公告管理API
export const getAnnouncementsApi = async (params = {}) => {
  let url = "/announcements";
  let queryParams = [];

  if (params.isActive !== undefined) {
    queryParams.push(`isActive=${params.isActive}`);
  }
  if (params.sort) {
    queryParams.push(`_sort=${params.sort}`);
  }
  if (params.order) {
    queryParams.push(`_order=${params.order}`);
  }

  if (queryParams.length > 0) {
    url += "?" + queryParams.join("&");
  }

  const announcements = await apiClient.get(url);
  return announcements;
};

export const getAnnouncementByIdApi = async (id) => {
  const announcement = await apiClient.get(`/announcements/${id}`);
  return announcement;
};

export const createAnnouncementApi = async (data) => {
  const newAnnouncement = {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const announcement = await apiClient.post(
    "/admin/announcements",
    newAnnouncement
  );
  return announcement;
};

export const updateAnnouncementApi = async (id, data) => {
  const updatedData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const announcement = await apiClient.put(
    `/admin/announcements/${id}`,
    updatedData
  );
  return announcement;
};

export const deleteAnnouncementApi = async (id) => {
  await apiClient.delete(`/admin/announcements/${id}`);
  return { success: true, message: "公告删除成功" };
};
