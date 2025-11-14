import apiClient from "./index";

export async function login(data) {
  // 查找用户 - 支持用户名或邮箱登录
  const users = await apiClient.get('/users');
  const loginField = data.email || data.username;
  
  // 先查找用户（不考虑密码和封禁状态）
  const foundUser = users.find(u => 
    u.username === loginField || u.email === loginField
  );
  
  // 检查用户是否存在
  if (!foundUser) {
    throw new Error("用户名或密码错误");
  }
  
  // 检查密码是否正确
  if (foundUser.password !== data.password) {
    throw new Error("用户名或密码错误");
  }
  
  // 检查用户是否被封禁
  if (foundUser.banned) {
    throw new Error("您的账号已被封禁，如有异议请联系管理员");
  }
  
  // 返回完整的用户信息
  return {
    token: `mock-jwt-token-${foundUser.id}`,
    user: foundUser  // 返回完整的用户对象,包含所有字段
  };
}

export async function register(data) {
  // 检查用户名和邮箱是否已存在
  const users = await apiClient.get('/users');
  const existingUser = users.find(u => 
    u.username === data.username || u.email === data.email
  );
  
  if (existingUser) {
    throw new Error("用户名或邮箱已存在");
  }
  
  // 创建新用户
  const newUser = {
    username: data.username,
    nickname: data.nickname || data.username,
    email: data.email,
    phone: data.phone || '',
    password: data.password,
    avatar: "/avatars/default.jpg",
    role: "user",
    banned: false,
    isActive: true,
    points: 0,
    level: 1,
    bio: '',
    city: '',
    gender: '',
    age: 0,
    profession: '',
    joinedDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    lastLoginIp: '',
    // 积分系统相关字段
    continuousLoginDays: 0,
    unlockedBadges: [],
    completedSurveys: [],
    tags: []
  };
  
  const createdUser = await apiClient.post('/users', newUser);
  
  // 返回完整的用户信息
  return {
    token: `mock-jwt-token-${createdUser.id}`,
    user: createdUser  // 返回完整的用户对象
  };
}

export async function getProfile(userId) {
  const user = await apiClient.get(`/users/${userId}`);
  return user;
}

// 重置密码
export async function resetPassword(data) {
  // 查找用户
  const users = await apiClient.get('/users');
  const user = users.find(u => u.email === data.email);
  
  if (!user) {
    throw new Error("该邮箱未注册");
  }
  
  // 更新用户密码
  await apiClient.patch(`/users/${user.id}`, {
    password: data.password,
    updatedAt: new Date().toISOString()
  });
  
  return { success: true, message: "密码重置成功" };
}
