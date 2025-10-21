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
  // 确保 questionList 是数组
  let questionList = [];
  if (Array.isArray(data.questionList)) {
    questionList = data.questionList;
  } else if (Array.isArray(data.questions) && typeof data.questions[0] === 'object') {
    // 如果 questions 是对象数组，则它实际上是问题列表
    questionList = data.questions;
  }
  
  const newQuestionnaire = {
    ...data,
    creatorId: data.userId || 1,
    authorId: data.userId || 1,
    author: data.authorName || data.author || '匿名用户',
    status: data.status || "draft",
    responses: 0,
    participants: 0,
    participantCount: 0,
    rating: 0,
    thumbnail: data.thumbnail || '/images/default.jpg',
    questions: questionList.length,      // 问题数量
    questionList: questionList,           // 问题详情列表
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return await apiClient.post('/surveys', newQuestionnaire);
};

// 更新问卷
export const updateQuestionnaire = async (id, data) => {
  // 确保 questionList 是数组
  let questionList = [];
  if (Array.isArray(data.questionList)) {
    questionList = data.questionList;
  } else if (Array.isArray(data.questions) && typeof data.questions[0] === 'object') {
    // 如果 questions 是对象数组，则它实际上是问题列表
    questionList = data.questions;
  }
  
  const updatedData = {
    ...data,
    questions: questionList.length, // 问题数量
    questionList: questionList,      // 问题详情列表
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
