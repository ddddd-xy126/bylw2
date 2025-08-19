import request from "./index";

export const listQuestionnaires = (params) =>
  request.get("/questionnaire", { params });
export const createQuestionnaire = (data) =>
  request.post("/questionnaire", data);
