import request from "./index";

// 问卷列表和详情
export function listSurveys() {
  return request.get("/surveys");
}

export function getSurveyDetail(id) {
  return request.get(`/surveys/${id}`);
}

// 答题相关
export function submitSurveyApi(id, data) {
  return request.post(`/surveys/${id}/submit`, data);
}

// 评论相关
export function getSurveyCommentsApi(id) {
  return request.get(`/surveys/${id}/comments`);
}

export function createCommentApi(id, data) {
  return request.post(`/surveys/${id}/comments`, data);
}

// 分类
export function getCategoriesApi() {
  return request.get("/categories");
}
