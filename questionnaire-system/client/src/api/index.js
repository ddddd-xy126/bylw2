import axios from "axios";
import { useUserStore } from "@/store/user";

const instance = axios.create({ 
  baseURL: "http://localhost:3002",
  timeout: 10000 
});

instance.interceptors.request.use((config) => {
  const store = useUserStore();
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message;
    return Promise.reject(new Error(message));
  }
);

// 添加便捷方法
const apiClient = {
  get: (url, config) => instance.get(url, config),
  post: (url, data, config) => instance.post(url, data, config),
  put: (url, data, config) => instance.put(url, data, config),
  patch: (url, data, config) => instance.patch(url, data, config),
  delete: (url, config) => instance.delete(url, config)
};

export default apiClient;
