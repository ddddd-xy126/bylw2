import axios from "axios";
import { useUserStore } from "@/store/user";
import router from "@/router";

// Express 后端 API
const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 120000, // 120秒超时,用于 AI 报告生成等耗时操作
});

instance.interceptors.request.use((config) => {
  const store = useUserStore();
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => {
    // 后端返回格式: { success, message, data }
    // 如果有 data 字段，返回 data，否则返回整个响应
    return res.data?.data !== undefined ? res.data.data : res.data;
  },
  (err) => {
    const message = err.response?.data?.message || err.message;

    // 401 未授权，清除 token 并跳转登录
    if (err.response?.status === 401) {
      const store = useUserStore();
      store.logout();
      router.push("/login");
    }

    // 403 无权限
    if (err.response?.status === 403) {
      router.push("/403");
    }

    return Promise.reject(new Error(message));
  }
);

// 添加便捷方法
const apiClient = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config),
};

export default apiClient;
