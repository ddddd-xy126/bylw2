import apiClient from "./index";

/**
 * 生成个人分析报告
 */
export const generateReportApi = async (
  surveyId,
  surveyTitle,
  answers,
  category
) => {
  const response = await apiClient.post("/reports/generate", {
    surveyId,
    surveyTitle,
    answers,
    category,
  });
  return response;
};

/**
 * 获取报告状态
 */
export const getReportStatusApi = async (reportId) => {
  const response = await apiClient.get(`/reports/${reportId}/status`);
  return response;
};

/**
 * 获取报告详情
 */
export const getReportApi = async (reportId) => {
  const response = await apiClient.get(`/reports/${reportId}`);
  return response;
};

/**
 * 获取用户所有报告列表
 */
export const getUserReportsApi = async (params = {}) => {
  const response = await apiClient.get("/reports", { params });
  return response;
};

/**
 * 下载报告
 */
export const downloadReportApi = async (reportId) => {
  // 直接使用完整 URL,避免 baseURL 未定义问题
  const baseURL = "http://localhost:3000/api";
  const response = await fetch(`${baseURL}/reports/${reportId}/download`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("下载失败");
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  let filename = `report_${Date.now()}.pdf`; // 默认为 PDF

  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename\*?=(['"]?)(.+)\1/);
    if (filenameMatch && filenameMatch[2]) {
      filename = decodeURIComponent(filenameMatch[2]);
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return { success: true };
};

/**
 * 删除报告
 */
export const deleteReportApi = async (reportId) => {
  const response = await apiClient.delete(`/reports/${reportId}`);
  return response;
};
