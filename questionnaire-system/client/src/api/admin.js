import request from "./index";

// 系统管理
export const healthCheckApi = () => request.get("/health");
export const seedAdminApi = (data) => request.post("/admin/seed-admin", data);

// 用户管理
export const getAllUsersApi = () => request.get("/admin/users");
export const createUserApi = (data) => request.post("/admin/users", data);
export const deleteUserApi = (id) => request.delete(`/admin/users/${id}`);
export const banUserApi = (id) => request.post(`/admin/users/${id}/ban`);
export const unbanUserApi = (id) => request.post(`/admin/users/${id}/unban`);

// 问卷管理
export const createAdminSurveyApi = (data) =>
  request.post("/admin/surveys", data);
export const deleteAdminSurveyApi = (id) =>
  request.delete(`/admin/surveys/${id}`);

// 题目管理
export const listQuestionsApi = () => request.get("/admin/questions");
export const createQuestionApi = (data) =>
  request.post("/admin/questions", data);
export const deleteQuestionApi = (id) =>
  request.delete(`/admin/questions/${id}`);

// Dashboard 相关API
export const getDashboardStatsApi = () => request.get("/admin/stats");
export const getRecentSurveysApi = (limit = 5) =>
  request.get(`/admin/surveys/recent?limit=${limit}`);
export const getRecentUsersApi = (limit = 5) =>
  request.get(`/admin/users/recent?limit=${limit}`);
export const getSystemStatusApi = () => request.get("/admin/system/status");
export const getActivityDataApi = () =>
  request.get("/admin/analytics/activity");
export const getCategoryDistributionApi = () =>
  request.get("/admin/analytics/categories");

// 用户管理扩展
export const getUsersApi = (params = {}) =>
  request.get("/admin/users", { params });
export const getUserDetailApi = (id) => request.get(`/admin/users/${id}`);
export const updateUserApi = (id, data) =>
  request.put(`/admin/users/${id}`, data);
export const resetPasswordApi = (id) =>
  request.post(`/admin/users/${id}/reset-password`);

// 问卷管理扩展
export const getSurveysApi = (params = {}) =>
  request.get("/admin/surveys", { params });
export const getSurveyDetailApi = (id) => request.get(`/admin/surveys/${id}`);
export const updateSurveyStatusApi = (id, status) =>
  request.put(`/admin/surveys/${id}/status`, { status });
export const copySurveyApi = (id) => request.post(`/admin/surveys/${id}/copy`);
export const getCategoriesApi = () => request.get("/admin/categories");
