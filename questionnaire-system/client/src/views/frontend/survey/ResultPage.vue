<template>
  <div class="survey-result-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-page-header @back="handleGoBack">
        <template #content>
          <div class="header-content">
            <h2>测评报告</h2>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
              >
              <el-breadcrumb-item>测评报告</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </template>
      </el-page-header>
    </div>

    <div class="result-container" v-loading="loading">
      <!-- 报告内容区域 -->
      <el-card class="report-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-info">
              <h3>{{ reportData.surveyTitle || "问卷标题" }}</h3>
              <p>{{ reportData.category || "问卷分类" }}</p>
            </div>
            <div class="header-actions">
              <el-button
                type="success"
                :icon="Document"
                @click="generateReport"
                :loading="generatingReport"
                :disabled="reportStatus === 'generating'"
              >
                {{ reportButtonText }}
              </el-button>
              <el-button
                v-if="reportId && reportStatus === 'completed'"
                type="primary"
                :icon="View"
                @click="viewReportInProfile"
              >
                查看报告
              </el-button>
              <el-button
                v-if="reportId && reportStatus === 'completed'"
                type="success"
                :icon="Download"
                @click="downloadReport"
              >
                下载报告
              </el-button>
            </div>
          </div>
        </template>

        <!-- 报告概览 -->
        <div class="report-overview">
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#67C23A"><CircleCheck /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">完成时间</div>
                  <div class="item-value">
                    {{ formatDateTime(reportData.submittedAt) }}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#409EFF"><Timer /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">答题用时</div>
                  <div class="item-value">
                    {{ formatDuration(reportData.duration) }}
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#E6A23C"><TrophyBase /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">测评得分</div>
                  <div class="item-value score">
                    {{ reportData.score || 0 }} 分
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="overview-item">
                <div class="item-icon">
                  <el-icon color="#F56C6C"><Document /></el-icon>
                </div>
                <div class="item-content">
                  <div class="item-label">题目数量</div>
                  <div class="item-value">
                    {{ reportData.totalQuestions || 0 }} 题
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 评估结果 -->
        <div class="evaluation-result" v-if="reportData.result">
          <el-divider content-position="left">
            <el-icon><Medal /></el-icon>
            <span style="margin-left: 8px">评估结果</span>
          </el-divider>
          <div class="result-content">
            <el-alert
              :title="reportData.result"
              type="success"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>{{ reportData.resultDescription || "恭喜您完成测评！" }}</p>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 答题详情预览 -->
        <div
          class="answer-preview"
          v-if="reportData.answers && reportData.answers.length > 0"
        >
          <el-divider content-position="left">
            <el-icon><List /></el-icon>
            <span style="margin-left: 8px">答题详情</span>
          </el-divider>
          <div class="answers-grid">
            <div
              v-for="(answer, index) in reportData.answers"
              :key="index"
              class="answer-card"
            >
              <div class="answer-header">
                <span class="question-num">Q{{ index + 1 }}</span>
                <span class="question-text">{{
                  answer.question || "题目"
                }}</span>
              </div>
              <div class="answer-body">
                <el-icon><Check /></el-icon>
                <span>{{ formatAnswer(answer) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 评价区域 -->
      <el-card class="rating-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>
              <el-icon><ChatDotRound /></el-icon>
              <span style="margin-left: 8px">我的评论</span>
            </h3>
            <el-tag v-if="myComments.length > 0" type="success" size="small">
              {{ myComments.length }} 条评论
            </el-tag>
          </div>
        </template>

        <!-- 已有评论列表 -->
        <div v-if="myComments.length > 0" class="comments-list">
          <div
            v-for="comment in myComments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-header">
              <div class="comment-meta">
                <el-rate
                  :model-value="comment.rating"
                  disabled
                  show-score
                  :size="20"
                />
                <span class="comment-time">{{
                  formatDateTime(comment.createdAt)
                }}</span>
              </div>
              <el-button
                type="danger"
                size="small"
                text
                @click="deleteComment(comment.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
            <div class="comment-content">
              <p>{{ comment.content }}</p>
            </div>
          </div>
        </div>

        <!-- 添加新评论表单 -->
        <div class="add-comment-form">
          <el-divider v-if="myComments.length > 0" content-position="left">
            <span style="font-size: 14px; color: #909399">添加新评论</span>
          </el-divider>

          <el-form label-width="80px">
            <el-form-item label="评分" required>
              <div class="rating-input">
                <el-rate
                  v-model="ratingForm.rating"
                  :size="32"
                  show-text
                  :texts="['极差', '失望', '一般', '满意', '惊喜']"
                />
              </div>
            </el-form-item>
            <el-form-item label="评论" required>
              <el-input
                v-model="ratingForm.content"
                type="textarea"
                :rows="4"
                placeholder="分享您对这个问卷的看法... (至少10个字)"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="submitComment"
                :loading="submitting"
                :disabled="!canSubmit"
                size="large"
              >
                <el-icon v-if="!submitting"><ChatLineRound /></el-icon>
                发表评论
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Download,
  CircleCheck,
  Timer,
  TrophyBase,
  Document,
  Medal,
  List,
  Check,
  ChatDotRound,
  Edit,
  Delete,
  ChatLineRound,
  View,
} from "@element-plus/icons-vue";
import { useUserStore } from "@/store/user";
import {
  createCommentApi,
  updateCommentApi,
  deleteCommentApi,
  getUserCommentApi,
  getUserAnswerApi,
} from "@/api/survey";
import {
  generateReportApi,
  getReportStatusApi,
  downloadReportApi,
} from "@/api/report";
import apiClient from "@/api/index";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const reportData = ref({});
const myComments = ref([]); // 改为数组
const submitting = ref(false);
const generatingReport = ref(false);
const reportId = ref(null);
const reportStatus = ref(null); // 'generating', 'completed', 'failed'
const reportCheckInterval = ref(null);

const ratingForm = ref({
  rating: 5,
  content: "",
});

// 计算属性
const canSubmit = computed(() => {
  return ratingForm.value.content.trim().length > 0;
});

const reportButtonText = computed(() => {
  if (reportStatus.value === "generating") {
    return "报告生成中...";
  } else if (reportStatus.value === "completed") {
    return "报告已生成";
  } else if (reportStatus.value === "failed") {
    return "重新生成报告";
  }
  return "生成AI分析报告";
});

// 方法
const handleGoBack = () => {
  router.back();
};

const formatDateTime = (date) => {
  if (!date) return "未知时间";
  return new Date(date).toLocaleString("zh-CN");
};

const formatDuration = (duration) => {
  if (!duration) return "0分0秒";
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}分${seconds}秒`;
};

const formatAnswer = (answerObj) => {
  // answerObj 是整个答案对象，包含 answer, text, question 等字段

  // 优先使用 text 字段（新数据结构）
  if (answerObj.text !== undefined && answerObj.text !== null) {
    if (Array.isArray(answerObj.text)) {
      return answerObj.text.join("、");
    }
    return String(answerObj.text);
  }

  // 兼容旧数据：使用 answer 字段
  const answer = answerObj.answer;
  if (answer === undefined || answer === null || answer === "") {
    return "未作答";
  }

  if (Array.isArray(answer)) {
    return answer.join("、");
  }

  return String(answer);
};

const downloadReport = async () => {
  if (!reportId.value) {
    ElMessage.warning("暂无可下载的报告");
    return;
  }

  try {
    await downloadReportApi(reportId.value);
    ElMessage.success("报告下载成功");
  } catch (error) {
    console.error("下载报告失败:", error);
    ElMessage.error("下载报告失败：" + error.message);
  }
};

// 跳转到个人中心查看报告
const viewReportInProfile = () => {
  router.push("/user/profile/reports");
};

// 生成报告
const generateReport = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录后再生成报告");
    router.push(`/login?redirect=/survey/result/${route.params.id}`);
    return;
  }

  if (!reportData.value.surveyId || !reportData.value.answers) {
    ElMessage.error("缺少问卷数据");
    return;
  }

  generatingReport.value = true;
  try {
    console.log("🔄 开始生成报告");
    console.log("📋 问卷信息:", {
      surveyId: reportData.value.surveyId,
      surveyTitle: reportData.value.surveyTitle,
      category: reportData.value.category,
    });
    console.log("📝 答案数据:", reportData.value.answers);

    const response = await generateReportApi(
      reportData.value.surveyId,
      reportData.value.surveyTitle,
      reportData.value.answers,
      reportData.value.category
    );

    console.log("📥 报告生成响应:", response);

    if (response.success) {
      reportId.value = response.data.reportId;
      reportStatus.value = response.data.status;

      if (response.data.status === "completed") {
        ElMessage({
          type: "success",
          message: "报告生成成功！可在个人中心-分析报告页面查看",
          duration: 5000,
          showClose: true,
        });
        console.log("✅ 报告内容长度:", response.data.content?.length);
        console.log(
          "📄 报告内容预览:",
          response.data.content?.substring(0, 200)
        );
      } else if (response.data.status === "generating") {
        ElMessage.info("报告正在生成中，请稍候...");
        // 开始轮询检查报告状态
        startReportStatusCheck();
      }
    }
  } catch (error) {
    console.error("❌ 生成报告失败:", error);
    ElMessage.error("生成报告失败：" + error.message);
  } finally {
    generatingReport.value = false;
  }
};

// 开始检查报告状态
const startReportStatusCheck = () => {
  if (reportCheckInterval.value) {
    clearInterval(reportCheckInterval.value);
  }

  reportCheckInterval.value = setInterval(async () => {
    try {
      const response = await getReportStatusApi(reportId.value);
      if (response.success) {
        reportStatus.value = response.data.status;

        if (response.data.status === "completed") {
          clearInterval(reportCheckInterval.value);
          reportCheckInterval.value = null;
          ElMessage.success("报告生成完成！您可以下载查看了");
        } else if (response.data.status === "failed") {
          clearInterval(reportCheckInterval.value);
          reportCheckInterval.value = null;
          ElMessage.error("报告生成失败，请重试");
        }
      }
    } catch (error) {
      console.error("检查报告状态失败:", error);
    }
  }, 3000); // 每3秒检查一次
};

// 提交评论
const submitComment = async () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录后再发表评论");
    router.push(`/login?redirect=/survey/result/${route.params.id}`);
    return;
  }

  if (!ratingForm.value.content.trim()) {
    ElMessage.warning("请填写评论内容");
    return;
  }

  if (ratingForm.value.content.trim().length < 10) {
    ElMessage.warning("评论内容至少需要10个字");
    return;
  }

  submitting.value = true;
  try {
    // 优先从reportData获取，其次从URL参数获取
    let surveyId = reportData.value.surveyId || route.query.surveyId;

    if (!surveyId) {
      console.error("surveyId不存在，reportData:", reportData.value);
      console.error("route.query:", route.query);
      throw new Error("问卷ID不存在，请重新进入结果页面");
    }

    // 确保surveyId是数字类型
    surveyId = parseInt(surveyId);

    // 使用后端API创建评论
    const commentData = {
      content: ratingForm.value.content,
      rating: ratingForm.value.rating,
    };

    const newComment = await apiClient.post(
      `/comments/survey/${surveyId}`,
      commentData
    );

    myComments.value.push(newComment);

    ElMessage.success("评论发表成功");

    // 清空表单
    ratingForm.value = {
      rating: 5,
      content: "",
    };
  } catch (error) {
    console.error("提交评论失败:", error);
    ElMessage.error("操作失败：" + error.message);
  } finally {
    submitting.value = false;
  }
};

// 删除评论
const deleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm(
      "确定要删除此评论吗？删除后不可恢复。",
      "确认删除",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 使用后端API删除评论
    await apiClient.delete(`/comments/${commentId}`);

    // 从列表中移除
    myComments.value = myComments.value.filter((c) => c.id !== commentId);
    ElMessage.success("评论已删除");
  } catch (err) {
    if (err && (err === "cancel" || err.type === "cancel")) return;
    ElMessage.error("删除失败：" + (err.message || err));
  }
};

// 加载报告数据
const loadReportData = async () => {
  loading.value = true;
  try {
    // 优先从URL参数获取surveyId和userId
    let surveyId = route.query.surveyId;
    let userId = userStore.profile?.id || userStore.userId;

    if (surveyId && userId) {
      // 从问卷的answers中获取用户的答题记录
      const userAnswer = await getUserAnswerApi(surveyId, userId);
      if (userAnswer) {
        reportData.value = userAnswer;
        // 确保surveyId被设置
        reportData.value.surveyId = parseInt(surveyId);
        await loadMyComments();
        loading.value = false;
        return;
      }
    }

    // 兼容旧的answerId方式（从独立的answers表查询）
    // 注意：新版本已不再使用独立的answers表，数据存储在survey的answers数组中
    // 这里作为降级方案保留
    const answerId = route.params.id;
    try {
      const data = await apiClient.get(`/answers/${answerId}`);
      reportData.value = data;
      // 尝试从答案数据中提取surveyId
      if (data.surveyId) {
        reportData.value.surveyId = data.surveyId;
      }
    } catch (error) {
      throw new Error("报告不存在");
    }

    // 加载用户的评论
    await loadMyComments();
  } catch (error) {
    console.error("加载报告失败:", error);
    ElMessage.error("加载报告失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

// 加载我的评论
const loadMyComments = async () => {
  try {
    // 优先从reportData获取，其次从URL参数获取
    let surveyId = reportData.value.surveyId || route.query.surveyId;

    if (!surveyId) {
      console.warn("loadMyComments: surveyId不存在");
      return;
    }

    surveyId = parseInt(surveyId);

    // 使用后端API获取评论
    const response = await apiClient.get(`/comments/survey/${surveyId}`);
    const allComments = response.comments || [];

    // 筛选出当前用户的评论
    const userId = userStore.profile?.id || userStore.userId;
    if (userId) {
      myComments.value = allComments.filter((c) => c.userId == userId);
    }
  } catch (error) {
    console.error("加载评论失败:", error);
  }
};

// 生命周期
onMounted(() => {
  loadReportData();
});

// 组件卸载时清理定时器
onBeforeUnmount(() => {
  if (reportCheckInterval.value) {
    clearInterval(reportCheckInterval.value);
  }
});
</script>

<style lang="scss" scoped>
.survey-result-page {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 20px;

  .page-header {
    background: linear-gradient(
      135deg,
      var(--color-primary-light-3) 0%,
      var(--color-primary) 100%
    );
    padding: var(--spacing-lg) var(--spacing-xl);
    margin-bottom: 24px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);

    :deep(.el-page-header) {
      .el-page-header__back {
        color: var(--text-inverse);
        font-weight: var(--font-weight-semibold);
        transition: all var(--transition-base);

        &:hover {
          color: var(--color-primary-dark-4);
          transform: translateX(-4px);
        }

        .el-icon {
          font-size: var(--font-size-lg);
        }
      }

      .el-page-header__content {
        color: var(--text-inverse);
      }
    }

    .header-content {
      h2 {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: 700;
        color: var(--text-inverse);
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .el-breadcrumb {
        :deep(.el-breadcrumb__separator) {
          color: rgba(255, 255, 255, 0.7);
        }

        :deep(.el-breadcrumb__inner) {
          color: rgba(255, 255, 255, 0.9);
          font-weight: var(--font-weight-medium);
          transition: color var(--transition-base);

          &:hover {
            color: var(--text-inverse);
          }

          &.is-link:hover {
            color: var(--color-primary-dark-4);
          }
        }
      }
    }
  }

  .result-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-info {
        h3 {
          margin: 0 0 4px 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: #909399;
        }
      }
    }

    .report-card {
      border-radius: 12px;

      .report-overview {
        margin-bottom: 24px;

        .overview-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.3s;

          &:hover {
            background: #f0f2f5;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .item-icon {
            font-size: 32px;
          }

          .item-content {
            flex: 1;

            .item-label {
              font-size: 13px;
              color: #909399;
              margin-bottom: 4px;
            }

            .item-value {
              font-size: 20px;
              font-weight: 600;
              color: #303133;

              &.score {
                color: #e6a23c;
                font-size: 24px;
              }
            }
          }
        }
      }

      .evaluation-result {
        margin: 24px 0;

        .result-content {
          .el-alert {
            border-radius: 8px;

            p {
              margin: 8px 0 0 0;
              line-height: 1.6;
            }
          }
        }
      }

      .answer-preview {
        margin: var(--spacing-lg) 0;

        .answers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);

          .answer-card {
            padding: var(--spacing-md);
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border-radius: var(--radius-md);
            border-left: 4px solid var(--color-primary);
            box-shadow: var(--shadow-sm);
            transition: all var(--transition-base);

            &:hover {
              box-shadow: var(--shadow-md);
              transform: translateY(-2px);
              border-left-color: var(--color-primary-light-2);
            }

            .answer-header {
              display: flex;
              align-items: flex-start;
              gap: var(--spacing-sm);
              margin-bottom: var(--spacing-base);

              .question-num {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 32px;
                height: 32px;
                background: linear-gradient(
                  135deg,
                  var(--color-primary-light-2) 0%,
                  var(--color-primary) 100%
                );
                color: var(--text-inverse);
                border-radius: var(--radius-sm);
                font-size: var(--font-size-sm);
                font-weight: var(--font-weight-semibold);
                flex-shrink: 0;
                box-shadow: var(--shadow-sm);
              }

              .question-text {
                flex: 1;
                font-size: var(--font-size-base);
                font-weight: var(--font-weight-medium);
                color: var(--text-primary);
                line-height: 1.6;
              }
            }

            .answer-body {
              display: flex;
              align-items: flex-start;
              gap: var(--spacing-sm);
              padding: var(--spacing-base);
              background: var(--bg-primary);
              border-radius: var(--radius-sm);
              font-size: var(--font-size-sm);
              color: var(--text-primary-1);
              line-height: 1.6;
              border: 1px solid var(--border-light);

              .el-icon {
                color: var(--color-success);
                flex-shrink: 0;
                margin-top: 2px;
              }

              span {
                flex: 1;
                word-break: break-word;
              }
            }
          }
        }
      }
    }

    .rating-card {
      border-radius: var(--radius-lg);

      .comments-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);

        .comment-item {
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-light);
          transition: all var(--transition-base);

          &:hover {
            box-shadow: var(--shadow-sm);
            border-color: var(--color-primary-light-3);
          }

          .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-sm);

            .comment-meta {
              display: flex;
              align-items: center;
              gap: var(--spacing-md);

              .comment-time {
                font-size: var(--font-size-sm);
                color: var(--text-tertiary);
              }
            }
          }

          .comment-content {
            p {
              margin: 0;
              padding: var(--spacing-sm) var(--spacing-md);
              background: var(--bg-primary);
              border-radius: var(--radius-sm);
              color: var(--text-primary);
              line-height: 1.6;
              font-size: var(--font-size-sm);
            }
          }
        }
      }

      .add-comment-form {
        .rating-input {
          display: flex;
          align-items: center;
        }

        .el-textarea {
          :deep(.el-textarea__inner) {
            border-radius: var(--radius-md);
            transition: all var(--transition-fast);

            &:focus {
              border-color: var(--color-primary);
              box-shadow: 0 0 0 2px var(--bg-primary-light);
            }
          }
        }

        .el-button {
          border-radius: var(--radius-sm);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .survey-result-page {
    padding: 12px;

    .result-container {
      .report-overview {
        .el-row {
          .el-col {
            margin-bottom: 12px;
          }
        }
      }

      .answers-grid {
        grid-template-columns: 1fr !important;
      }
    }
  }
}
</style>
