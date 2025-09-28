import apiClient from "./index";

// 问卷管理
export const listQuestionnaires = async (params) => {
  let url = '/surveys';
  let queryParams = [];
  
  // 根据参数构建查询
  if (params?.status) {
    queryParams.push(`status=${params.status}`);
  }
  if (params?.search) {
    queryParams.push(`q=${params.search}`);
  }
  
  if (queryParams.length > 0) {
    url += '?' + queryParams.join('&');
  }
  
  const surveys = await apiClient.get(url);
  
  return {
    list: surveys,
    total: surveys.length,
    page: params?.page || 1,
    pageSize: params?.pageSize || 10
  };
};

export const createQuestionnaire = async (data) => {
  const newQuestionnaire = {
    ...data,
    creatorId: 1, // 从当前用户获取
    status: "draft",
    responses: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await apiClient.post('/surveys', newQuestionnaire);
};

export const getQuestionnaireById = async (id) => {
  try {
    return await apiClient.get(`/surveys/${id}`);
  } catch (error) {
    throw new Error("问卷不存在");
  }
};
