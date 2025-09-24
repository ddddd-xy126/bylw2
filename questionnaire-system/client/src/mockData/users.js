// 用户相关的假数据
export const mockUsers = [
  {
    id: 1,
    username: "user1",
    nickname: "张三",
    email: "zhangsan@example.com",
    phone: "13888888888",
    avatar: "/avatars/user1.jpg",
    role: "user",
    status: "active",
    points: 150,
    level: 2,
    bio: "热爱学习的心理学爱好者",
    completedSurveys: 8,
    favorites: [1, 3, 7],
    joinedDate: "2024-01-15",
    createdAt: "2024-01-15T08:00:00Z",
    lastLoginAt: "2024-01-20T10:30:00Z"
  },
  {
    id: 2,
    username: "user2",
    nickname: "李四",
    email: "lisi@example.com",
    phone: "13899999999",
    avatar: "/avatars/user2.jpg",
    role: "user",
    status: "active",
    points: 300,
    level: 3,
    bio: "职场新人，专注于职业发展",
    completedSurveys: 15,
    favorites: [2, 6, 10],
    joinedDate: "2024-01-10",
    createdAt: "2024-01-10T08:00:00Z",
    lastLoginAt: "2024-01-21T09:15:00Z"
  },
  {
    id: 3,
    username: "admin",
    nickname: "管理员",
    email: "admin@example.com",
    phone: "13800000000",
    avatar: "/avatars/admin.jpg",
    role: "admin",
    status: "active",
    points: 1000,
    level: 5,
    bio: "系统管理员",
    completedSurveys: 50,
    favorites: [],
    joinedDate: "2024-01-01",
    createdAt: "2024-01-01T08:00:00Z",
    lastLoginAt: "2024-01-21T11:00:00Z"
  },
  {
    id: 4,
    username: "wangprof",
    nickname: "王教授",
    email: "wangprof@example.com",
    phone: "13777777777",
    avatar: "/avatars/prof1.jpg",
    role: "expert",
    status: "active",
    points: 850,
    level: 4,
    bio: "教育心理学专家，专注学习方法研究",
    completedSurveys: 35,
    favorites: [2, 5, 9],
    joinedDate: "2024-01-05",
    createdAt: "2024-01-05T08:00:00Z",
    lastLoginAt: "2024-01-21T14:20:00Z"
  },
  {
    id: 5,
    username: "zhangjob",
    nickname: "张规划师",
    email: "zhangjob@example.com",
    phone: "13666666666",
    avatar: "/avatars/career1.jpg",
    role: "expert",
    status: "active",
    points: 720,
    level: 4,
    bio: "职业规划专家，帮助他人找到职业方向",
    completedSurveys: 28,
    favorites: [3, 6, 10],
    joinedDate: "2024-01-03",
    createdAt: "2024-01-03T08:00:00Z",
    lastLoginAt: "2024-01-21T16:45:00Z"
  },
  {
    id: 6,
    username: "chenmedic",
    nickname: "陈医师",
    email: "chenmedic@example.com",
    phone: "13555555555",
    avatar: "/avatars/doctor1.jpg",
    role: "expert",
    status: "active",
    points: 950,
    level: 5,
    bio: "心理健康专家，专业压力管理指导",
    completedSurveys: 42,
    favorites: [1, 4, 8],
    joinedDate: "2024-01-02",
    createdAt: "2024-01-02T08:00:00Z",
    lastLoginAt: "2024-01-21T10:15:00Z"
  },
  {
    id: 7,
    username: "studentxiao",
    nickname: "小明",
    email: "xiaoming@example.com",
    phone: "13444444444",
    avatar: "/avatars/student1.jpg",
    role: "user",
    status: "active",
    points: 80,
    level: 1,
    bio: "大学生，对心理学很感兴趣",
    completedSurveys: 3,
    favorites: [1, 2],
    joinedDate: "2024-01-18",
    createdAt: "2024-01-18T08:00:00Z",
    lastLoginAt: "2024-01-21T08:30:00Z"
  },
  {
    id: 8,
    username: "workerliu",
    nickname: "刘职员",
    email: "liuworker@example.com",
    phone: "13333333333",
    avatar: "/avatars/worker1.jpg",
    role: "user",
    status: "active",
    points: 420,
    level: 3,
    bio: "公司职员，希望提升工作效率",
    completedSurveys: 22,
    favorites: [6, 10, 11],
    joinedDate: "2024-01-08",
    createdAt: "2024-01-08T08:00:00Z",
    lastLoginAt: "2024-01-21T12:45:00Z"
  },
  {
    id: 9,
    username: "teacherhu",
    nickname: "胡老师",
    email: "huteacher@example.com",
    phone: "13222222222",
    avatar: "/avatars/teacher1.jpg",
    role: "user",
    status: "active",
    points: 380,
    level: 3,
    bio: "中学教师，关注学生心理健康",
    completedSurveys: 19,
    favorites: [1, 2, 8],
    joinedDate: "2024-01-12",
    createdAt: "2024-01-12T08:00:00Z",
    lastLoginAt: "2024-01-21T15:20:00Z"
  },
  {
    id: 10,
    username: "parentwang",
    nickname: "王妈妈",
    email: "wangmom@example.com",
    phone: "13111111111",
    avatar: "/avatars/parent1.jpg",
    role: "user",
    status: "active",
    points: 180,
    level: 2,
    bio: "全职妈妈，关注家庭教育",
    completedSurveys: 9,
    favorites: [2, 7, 12],
    joinedDate: "2024-01-16",
    createdAt: "2024-01-16T08:00:00Z",
    lastLoginAt: "2024-01-21T11:30:00Z"
  }
];

export const mockUserProfile = {
  id: 1,
  username: "user1",
  nickname: "张三",
  email: "zhangsan@example.com",
  phone: "13888888888",
  avatar: "/avatars/user1.jpg",
  role: "user",
  status: "active",
  points: 150,
  level: 2,
  createdAt: "2024-01-15T08:00:00Z",
  lastLoginAt: "2024-01-20T10:30:00Z"
};

export const mockAuthResponse = {
  token: "mock-jwt-token-12345",
  user: mockUserProfile
};

export const mockUserAnswers = [
  {
    id: 1,
    surveyId: 1,
    surveyTitle: "心理健康评估问卷",
    score: 85,
    result: "良好",
    submittedAt: "2024-01-20T10:30:00Z",
    answers: [
      { questionId: 1, answer: "经常" },
      { questionId: 2, answer: "偶尔" },
      { questionId: 3, answer: "很少" }
    ]
  },
  {
    id: 2,
    surveyId: 2,
    surveyTitle: "学习方式偏好调查",
    score: 72,
    result: "视觉学习者",
    submittedAt: "2024-01-19T14:20:00Z",
    answers: [
      { questionId: 4, answer: "图表和图像" },
      { questionId: 5, answer: "阅读材料" }
    ]
  }
];

export const mockUserAchievements = [
  {
    id: 1,
    title: "初次答题",
    description: "完成第一份问卷",
    icon: "🏆",
    unlockedAt: "2024-01-15T08:30:00Z"
  },
  {
    id: 2,
    title: "勤奋学习者",
    description: "完成10份问卷",
    icon: "📚",
    unlockedAt: "2024-01-18T16:45:00Z"
  }
];

export const mockUserReports = [
  {
    id: 1,
    title: "个人学习能力分析报告",
    type: "learning_ability",
    generatedAt: "2024-01-20T15:00:00Z",
    content: {
      summary: "您展现出了较强的逻辑思维能力和学习适应性...",
      scores: {
        logic: 85,
        memory: 78,
        creativity: 92
      },
      suggestions: [
        "建议多进行创意性思维训练",
        "可以尝试更多样化的学习方法"
      ]
    }
  }
];