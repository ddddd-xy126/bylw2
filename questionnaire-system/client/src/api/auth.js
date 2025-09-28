import apiClient from "./index";

export async function login(data) {
  // 查找用户 - 支持用户名或邮箱登录
  const users = await apiClient.get('/users');
  const loginField = data.email || data.username;
  
  const user = users.find(u => 
    (u.username === loginField || u.email === loginField) && 
    u.password === data.password &&
    !u.banned
  );
  
  if (!user) {
    throw new Error("用户名或密码错误");
  }
  
  return {
    token: `mock-jwt-token-${user.id}`,
    user: {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      points: user.points,
      level: user.level
    }
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
    lastLoginIp: ''
  };
  
  const createdUser = await apiClient.post('/users', newUser);
  
  return {
    token: `mock-jwt-token-${createdUser.id}`,
    user: {
      id: createdUser.id,
      username: createdUser.username,
      nickname: createdUser.nickname,
      email: createdUser.email,
      avatar: createdUser.avatar,
      role: createdUser.role,
      points: createdUser.points,
      level: createdUser.level
    }
  };
}

export async function getProfile(userId) {
  const user = await apiClient.get(`/users/${userId}`);
  return user;
}
