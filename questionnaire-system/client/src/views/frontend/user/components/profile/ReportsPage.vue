<template>
  <div class="reports-page">
    <el-card>
      <template #header>
        <div class="header">
          <h2>个人分析报告</h2>
          <el-button type="primary" @click="loadReports" :icon="Refresh">
            刷新
          </el-button>
        </div>
      </template>

      <div v-loading="loading">
        <!-- 报告列表 -->
        <div v-if="reports.length > 0" class="reports-list">
          <el-timeline>
            <el-timeline-item
              v-for="report in reports"
              :key="report.id"
              :timestamp="formatDateTime(report.createdAt)"
              placement="top"
              :type="getStatusType(report.status)"
              :icon="getStatusIcon(report.status)"
            >
              <el-card shadow="hover" class="report-item">
                <div class="report-header">
                  <div class="report-info">
                    <h3>{{ report.title }}</h3>
                    <div class="report-meta">
                      <el-tag
                        :type="getStatusTagType(report.status)"
                        size="small"
                      >
                        {{ getStatusText(report.status) }}
                      </el-tag>
                      <span class="survey-title">{{ report.surveyTitle }}</span>
                      <el-tag
                        v-if="report.category"
                        type="info"
                        size="small"
                        effect="plain"
                      >
                        {{ report.category }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="report-actions">
                    <el-button
                      v-if="report.status === 'completed'"
                      type="primary"
                      size="small"
                      :icon="View"
                      @click="viewReport(report)"
                    >
                      查看
                    </el-button>
                    <el-button
                      v-if="report.status === 'completed'"
                      type="success"
                      size="small"
                      :icon="Download"
                      @click="downloadReport(report.id)"
                    >
                      下载
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      @click="deleteReport(report.id)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                <div
                  v-if="report.status === 'completed' && report.generatedAt"
                  class="report-footer"
                >
                  <span class="generated-time">
                    <el-icon><Clock /></el-icon>
                    生成于：{{ formatDateTime(report.generatedAt) }}
                  </span>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadReports"
              @current-change="loadReports"
            />
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无分析报告">
          <template #description>
            <p>完成问卷后，在结果页面生成AI分析报告，报告将保存在这里</p>
          </template>
          <el-button type="primary" @click="$router.push('/home')">
            去答题
          </el-button>
        </el-empty>
      </div>
    </el-card>

    <!-- 查看报告对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="分析报告详情"
      width="80%"
      :close-on-click-modal="false"
      :append-to-body="true"
      :z-index="3000"
      class="report-dialog"
    >
      <div v-if="currentReport" class="report-content">
        <div class="report-detail-header">
          <h2>{{ currentReport.title }}</h2>
          <div class="report-detail-meta">
            <el-tag type="primary">{{ currentReport.surveyTitle }}</el-tag>
            <el-tag v-if="currentReport.category" type="info">
              {{ currentReport.category }}
            </el-tag>
            <span class="time">
              生成于：{{ formatDateTime(currentReport.generatedAt) }}
            </span>
          </div>
        </div>
        <el-divider />
        <div class="report-detail-content">
          <div
            class="content-text"
            v-html="formatContent(currentReport.content)"
          ></div>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button
          type="success"
          :icon="Download"
          @click="downloadReport(currentReport.id)"
        >
          下载报告
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Refresh,
  View,
  Download,
  Delete,
  Clock,
  CircleCheck,
  Loading,
  CircleClose,
} from "@element-plus/icons-vue";
import {
  getUserReportsApi,
  downloadReportApi,
  deleteReportApi,
} from "@/api/report";

const loading = ref(false);
const reports = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const viewDialogVisible = ref(false);
const currentReport = ref(null);

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return "未知时间";
  return new Date(date).toLocaleString("zh-CN");
};

// 格式化内容：将\n转换为<br>，处理Markdown样式
const formatContent = (content) => {
  if (!content) return "";

  return (
    String(content)
      // 先转义HTML特殊字符
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // 处理Markdown加粗 **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // 处理换行
      .replace(/\n/g, "<br>")
      // 处理多个空格
      .replace(/  /g, "&nbsp;&nbsp;")
  );
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    generating: "primary",
    completed: "success",
    failed: "danger",
  };
  return typeMap[status] || "info";
};

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    generating: Loading,
    completed: CircleCheck,
    failed: CircleClose,
  };
  return iconMap[status] || Clock;
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    generating: "warning",
    completed: "success",
    failed: "danger",
  };
  return typeMap[status] || "info";
};

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    generating: "生成中",
    completed: "已完成",
    failed: "生成失败",
  };
  return textMap[status] || "未知";
};

// 加载报告列表
const loadReports = async () => {
  loading.value = true;
  try {
    const response = await getUserReportsApi({
      page: currentPage.value,
      limit: pageSize.value,
    });

    console.log("📥 API 响应:", response);

    // axios 拦截器会自动提取 res.data.data
    // 所以 response 直接就是 { reports, total, page, limit, totalPages }
    reports.value = response.reports || [];
    total.value = response.total || 0;

    console.log("📊 加载的报告数量:", reports.value.length);
  } catch (error) {
    console.error("加载报告列表失败:", error);
    ElMessage.error("加载报告列表失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

// 查看报告
const viewReport = (report) => {
  // 解析 JSON 格式的 content
  let processedReport = { ...report };
  try {
    const contentObj = JSON.parse(report.content);
    // 如果 content 是 JSON 对象且有 output 字段,使用 output
    if (contentObj.output) {
      processedReport.content = contentObj.output;
    }
  } catch (e) {
    // 如果不是 JSON,保持原样
    console.log("报告内容不是 JSON 格式,直接显示");
  }
  currentReport.value = processedReport;
  viewDialogVisible.value = true;
};

// 下载报告
const downloadReport = async (reportId) => {
  try {
    await downloadReportApi(reportId);
    ElMessage.success("报告下载成功");
  } catch (error) {
    console.error("下载报告失败:", error);
    ElMessage.error("下载报告失败：" + error.message);
  }
};

// 删除报告
const deleteReport = async (reportId) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除此报告吗？删除后不可恢复。",
      "确认删除",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    await deleteReportApi(reportId);
    ElMessage.success("报告已删除");
    loadReports();
  } catch (err) {
    if (err && (err === "cancel" || err.type === "cancel")) return;
    ElMessage.error("删除失败：" + (err.message || err));
  }
};

onMounted(() => {
  loadReports();
});
</script>

<style lang="scss" scoped>
.reports-page {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .reports-list {
    .report-item {
      margin-bottom: 16px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;

        .report-info {
          flex: 1;

          h3 {
            margin: 0 0 12px 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          .report-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;

            .survey-title {
              font-size: 14px;
              color: #606266;
            }
          }
        }

        .report-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      .report-footer {
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid #ebeef5;

        .generated-time {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #909399;

          .el-icon {
            font-size: 14px;
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      margin-top: 32px;
    }
  }

  .report-content {
    .report-detail-header {
      h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }

      .report-detail-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;

        .time {
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .report-detail-content {
      max-height: 60vh;
      overflow-y: auto;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      overflow-x: hidden !important;
      max-width: 100%;
      box-sizing: border-box;

      .content-text {
        margin: 0;
        font-family: "Microsoft YaHei", "PingFang SC", "Helvetica Neue",
          sans-serif;
        font-size: 15px;
        line-height: 1.8;
        color: #303133;
        word-wrap: break-word;
        word-break: break-all;
        max-width: 100%;

        // 加粗样式
        strong {
          font-weight: 600;
          color: #409eff;
        }
      }
    }
  }
}

// 全局样式：强制对话框不溢出
:deep(.report-dialog) {
  .el-dialog__body {
    overflow-x: hidden !important;
    max-width: 100%;
  }

  .report-content {
    overflow-x: hidden !important;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 768px) {
  .reports-page {
    .report-item {
      .report-header {
        flex-direction: column;

        .report-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    }
  }
}
</style>
