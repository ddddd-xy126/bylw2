import request from "./index";

// 问卷管理
export const listQuestionnaires = (params) =>
  request.get("/questionnaire", { params });
export const createQuestionnaire = (data) =>
  request.post("/questionnaire", data);
export const getQuestionnaireById = (id) => request.get(`/questionnaire/${id}`);
