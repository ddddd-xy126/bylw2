// 管理员相关的假数据
export const mockAdminStats = {
  totalUsers: 1250,
  totalSurveys: 45,
  totalAnswers: 8950,
  activeUsers: 320,
  todayRegistrations: 15,
  todaySubmissions: 89,
  monthlyGrowth: {
    users: 12.5,
    surveys: 8.3,
    answers: 18.7
  }
};

export const mockRecentSurveys = [
  {
    id: 1,
    title: "心理健康评估问卷",
    author: "心理学专家",
    participants: 1250,
    status: "published",
    createdAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 2,
    title: "学习方式偏好调查",
    author: "教育专家", 
    participants: 890,
    status: "published",
    createdAt: "2024-01-08T09:00:00Z"
  },
  {
    id: 3,
    title: "职业兴趣测试",
    author: "职业规划师",
    participants: 2150,
    status: "published",
    createdAt: "2024-01-05T11:00:00Z"
  }
];

export const mockRecentUsers = [
  {
    id: 1,
    username: "newuser1",
    nickname: "新用户1",
    email: "newuser1@example.com",
    status: "active",
    createdAt: "2024-01-21T08:30:00Z"
  },
  {
    id: 2,
    username: "newuser2", 
    nickname: "新用户2",
    email: "newuser2@example.com",
    status: "active",
    createdAt: "2024-01-21T09:15:00Z"
  },
  {
    id: 3,
    username: "newuser3",
    nickname: "新用户3",
    email: "newuser3@example.com",
    status: "pending",
    createdAt: "2024-01-21T10:00:00Z"
  }
];

export const mockSystemStatus = {
  serverStatus: "healthy",
  databaseStatus: "healthy",
  memoryUsage: 68.5,
  cpuUsage: 34.2,
  diskUsage: 42.8,
  uptime: "15 天 8 小时 23 分钟",
  lastBackup: "2024-01-21T02:00:00Z"
};

export const mockActivityData = [
  { date: "2024-01-15", users: 45, surveys: 3, answers: 120 },
  { date: "2024-01-16", users: 52, surveys: 5, answers: 145 },
  { date: "2024-01-17", users: 38, surveys: 2, answers: 98 },
  { date: "2024-01-18", users: 61, surveys: 4, answers: 167 },
  { date: "2024-01-19", users: 49, surveys: 3, answers: 134 },
  { date: "2024-01-20", users: 58, surveys: 6, answers: 189 },
  { date: "2024-01-21", users: 42, surveys: 2, answers: 112 }
];

export const mockCategoryDistribution = [
  { name: "心理健康", value: 15, percentage: 29.4 },
  { name: "学习能力", value: 12, percentage: 23.5 },
  { name: "职业发展", value: 8, percentage: 15.7 },
  { name: "生活方式", value: 10, percentage: 19.6 },
  { name: "兴趣爱好", value: 6, percentage: 11.8 }
];

export const mockQuestions = [
  {
    id: 1,
    type: "single",
    title: "您的年龄段是？",
    options: [
      { id: "a", text: "18-25岁" },
      { id: "b", text: "26-35岁" },
      { id: "c", text: "36-45岁" },
      { id: "d", text: "46岁以上" }
    ],
    category: "基础信息",
    usageCount: 25,
    createdAt: "2024-01-10T08:00:00Z"
  },
  {
    id: 2,
    type: "multiple",
    title: "您使用过哪些学习工具？",
    options: [
      { id: "a", text: "在线课程平台" },
      { id: "b", text: "学习APP" },
      { id: "c", text: "电子书" },
      { id: "d", text: "视频教程" }
    ],
    category: "学习工具",
    usageCount: 18,
    createdAt: "2024-01-12T10:30:00Z"
  }
];

export const mockAdminSurveys = [
  {
    id: 1,
    title: "心理健康评估问卷",
    description: "评估用户心理健康状况",
    category: "心理健康",
    status: "published",
    author: "心理学专家",
    questions: 15,
    participants: 1250,
    avgRating: 4.5,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "学习方式偏好调查", 
    description: "了解用户学习偏好",
    category: "学习能力",
    status: "published",
    author: "教育专家",
    questions: 20,
    participants: 890,
    avgRating: 4.2,
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-12T14:20:00Z"
  }
];

export const mockHealthCheck = {
  status: "healthy",
  timestamp: new Date().toISOString(),
  services: {
    database: "healthy",
    redis: "healthy",
    storage: "healthy"
  }
};