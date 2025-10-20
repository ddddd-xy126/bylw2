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
    creatorId: data.userId || 1, // 从当前用户获取
    authorId: data.userId || 1,
    author: data.authorName || '匿名用户',
    status: data.status || "draft",
    responses: 0,
    participants: 0,
    participantCount: 0,
    rating: 0,
    thumbnail: data.thumbnail || '/images/default.jpg',
    questions: (data.questions || []).length,
    questionList: data.questions || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await apiClient.post('/surveys', newQuestionnaire);
};

// 更新问卷
export const updateQuestionnaire = async (id, data) => {
  const updatedData = {
    ...data,
    questions: (data.questions || data.questionList || []).length,
    questionList: data.questions || data.questionList || [],
    updatedAt: new Date().toISOString()
  };
  
  return await apiClient.patch(`/surveys/${id}`, updatedData);
};

export const getQuestionnaireById = async (id) => {
  try {
    return await apiClient.get(`/surveys/${id}`);
  } catch (error) {
    throw new Error("问卷不存在");
  }
};
