import { mockQuestionnaires, mockApiResponse } from "@/mockData";

// 问卷管理
export const listQuestionnaires = async (params) => {
  let filteredQuestionnaires = [...mockQuestionnaires];
  
  // 根据参数过滤
  if (params?.status) {
    filteredQuestionnaires = filteredQuestionnaires.filter(q => q.status === params.status);
  }
  if (params?.search) {
    filteredQuestionnaires = filteredQuestionnaires.filter(q => 
      q.title.includes(params.search) || q.description.includes(params.search)
    );
  }
  
  return mockApiResponse({
    list: filteredQuestionnaires,
    total: filteredQuestionnaires.length,
    page: params?.page || 1,
    pageSize: params?.pageSize || 10
  });
};

export const createQuestionnaire = async (data) => {
  const newQuestionnaire = {
    id: Date.now(),
    ...data,
    creator: "当前用户",
    creatorId: 1,
    status: "draft",
    responses: 0,
    createdAt: new Date().toISOString()
  };
  
  return mockApiResponse(newQuestionnaire);
};

export const getQuestionnaireById = async (id) => {
  const questionnaire = mockQuestionnaires.find(q => q.id == id);
  if (!questionnaire) {
    throw new Error("问卷不存在");
  }
  return mockApiResponse(questionnaire);
};
