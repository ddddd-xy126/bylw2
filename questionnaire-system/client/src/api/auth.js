import { mockAuthResponse, mockUserProfile, mockApiResponse, mockApiError } from "@/mockData";
import { USE_MOCK_DATA } from "@/mockData/config";
import request from "./index";

// 真实API调用函数
const realLogin = (data) => request.post("/user/login", data);
const realRegister = (data) => request.post("/user/register", data);
const realGetProfile = () => request.get("/user/profile");

export async function login(data) {
  if (!USE_MOCK_DATA) {
    return await realLogin(data);
  }
  // 模拟登录验证 - 支持email或username字段
  const loginField = data.email || data.username;
  
  if (loginField === "admin@example.com" && data.password === "admin123") {
    return await mockApiResponse({
      token: "mock-jwt-token-admin",
      user: { ...mockUserProfile, id: 3, username: "admin", nickname: "管理员", email: "admin@example.com", role: "admin" }
    });
  } else if (loginField === "zhangsan@example.com" && data.password === "123456") {
    return await mockApiResponse(mockAuthResponse);
  } else if (loginField === "user1" && data.password === "123456") {
    return await mockApiResponse(mockAuthResponse);
  } else if (loginField === "admin" && data.password === "admin123") {
    return await mockApiResponse({
      token: "mock-jwt-token-admin",
      user: { ...mockUserProfile, id: 3, username: "admin", nickname: "管理员", email: "admin@example.com", role: "admin" }
    });
  } else {
    throw new Error("用户名或密码错误");
  }
}

export async function register(data) {
  if (!USE_MOCK_DATA) {
    return await realRegister(data);
  }
  
  // 模拟注册
  if (data.username === "existuser") {
    throw new Error("用户名已存在");
  }
  return await mockApiResponse({
    token: "mock-jwt-token-new-user",
    user: {
      id: Date.now(),
      username: data.username,
      nickname: data.nickname || data.username,
      email: data.email,
      phone: data.phone,
      avatar: "/avatars/default.jpg",
      role: "user",
      status: "active",
      points: 0,
      level: 1,
      createdAt: new Date().toISOString()
    }
  });
}

export async function getProfile() {
  if (!USE_MOCK_DATA) {
    return await realGetProfile();
  }
  
  return await mockApiResponse(mockUserProfile);
}
