// 导出所有假数据
export * from './users.js';
export * from './surveys.js';
export * from './admin.js';

// 工具函数：模拟API延迟
export const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 工具函数：模拟API响应
export const mockApiResponse = async (data, delay = 500) => {
  await mockDelay(delay);
  return data;
};

// 工具函数：模拟API错误
export const mockApiError = async (message = "操作失败", delay = 500) => {
  await mockDelay(delay);
  throw new Error(message);
};