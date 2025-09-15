import request from "./index";

// 认证相关
export const loginApi = (data) => request.post("/user/login", data);
export const registerApi = (data) => request.post("/user/register", data);
export const profileApi = () => request.get("/user/profile");

// 收藏相关
export const getFavoritesApi = () => request.get("/user/favorites");
export const addFavoriteApi = (surveyId) =>
  request.post(`/user/favorites/${surveyId}`);
export const removeFavoriteApi = (surveyId) =>
  request.delete(`/user/favorites/${surveyId}`);

// 用户记录
export const getUserAnswersApi = () => request.get("/user/answers");
export const getUserAchievementsApi = () => request.get("/user/achievements");
export const getUserReportsApi = () => request.get("/user/reports");
export const getAnswerDetailApi = (answerId) =>
  request.get(`/user/answers/${answerId}`);
export const deleteAnswerApi = (answerId) =>
  request.delete(`/user/answers/${answerId}`);
