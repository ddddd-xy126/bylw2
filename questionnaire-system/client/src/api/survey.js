import { 
  mockSurveys, 
  mockSurveyDetail, 
  mockComments, 
  mockCategories, 
  mockSubmitResponse,
  mockApiResponse 
} from "@/mockData";

// 问卷列表和详情
export async function listSurveys() {
  return mockApiResponse(mockSurveys);
}

export async function getSurveyDetail(id) {
  const survey = mockSurveys.find(s => s.id == id);
  if (!survey) {
    throw new Error("问卷不存在");
  }
  
  // 返回详细信息（包含题目）
  if (id == 1) {
    return mockApiResponse(mockSurveyDetail);
  }
  
  // 为其他问卷生成基本的题目结构
  const detailWithQuestions = {
    ...survey,
    questions: [
      {
        id: 1,
        type: "single",
        title: "示例单选题",
        options: [
          { id: "a", text: "选项A" },
          { id: "b", text: "选项B" },
          { id: "c", text: "选项C" }
        ],
        required: true
      },
      {
        id: 2,
        type: "multiple",
        title: "示例多选题",
        options: [
          { id: "a", text: "选项A" },
          { id: "b", text: "选项B" },
          { id: "c", text: "选项C" }
        ],
        required: false
      }
    ],
    isFavorite: false
  };
  
  return mockApiResponse(detailWithQuestions);
}

// 答题相关
export async function submitSurveyApi(id, data) {
  // 模拟提交结果
  return mockApiResponse({
    answerId: Date.now(),
    score: Math.floor(Math.random() * 40) + 60, // 60-100分
    result: "良好",
    analysis: "根据您的回答，我们为您生成了个性化的分析报告..."
  });
}

// 评论相关
export async function getSurveyCommentsApi(id) {
  const comments = mockComments.filter(c => c.surveyId == id);
  return mockApiResponse({
    list: comments,
    total: comments.length
  });
}

export async function createCommentApi(id, data) {
  const newComment = {
    id: Date.now(),
    surveyId: parseInt(id),
    userId: 1,
    username: "张三",
    avatar: "/avatars/user1.jpg",
    content: data.content,
    rating: data.rating || 5,
    createdAt: new Date().toISOString()
  };
  
  return mockApiResponse(newComment);
}

// 分类
export async function getCategoriesApi() {
  return mockApiResponse(mockCategories);
}
