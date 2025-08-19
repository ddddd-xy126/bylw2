import request from "./index";

export function listSurveys() {
  return request.get("/questionnaire");
}

export function getSurveyDetail(id) {
  return request.get(`/questionnaire/${id}`);
}
