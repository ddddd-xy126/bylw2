import apiClient from "./index";

export async function login(data) {
  // 调用后端登录接口
  const response = await apiClient.post("/auth/login", {
    username: data.username || data.email,
    password: data.password,
  });

  // 后端返回格式: { token, user }
  return response;
}

export async function register(data) {
  // 调用后端注册接口
  const response = await apiClient.post("/auth/register", {
    username: data.username,
    email: data.email,
    password: data.password,
    nickname: data.nickname || data.username,
  });

  // 后端返回格式: { token, user }
  return response;
}

export async function getProfile(userId) {
  // 获取用户资料
  const user = await apiClient.get(`/users/profile/${userId}`);
  return user;
}

// 重置密码
export async function resetPassword(data) {
  // 这里需要后端实现重置密码功能
  // 暂时使用修改密码接口
  await apiClient.put("/users/password", {
    oldPassword: data.oldPassword,
    newPassword: data.password,
  });

  return { success: true, message: "密码重置成功" };
}
