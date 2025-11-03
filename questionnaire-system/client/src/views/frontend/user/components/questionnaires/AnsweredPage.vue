<template>
  <div class="answered-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>已填写问卷</h2>
        <p>查看您已完成的问卷答题记录，重新查看结果或再次答题</p>
      </div>
      <div class="header-stats">
        <el-statistic title="总答题数" :value="totalAnswered" />
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input v-model="searchKeyword" placeholder="搜索问卷标题" clearable @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterCategory" placeholder="问卷分类" clearable @change="handleFilter">
            <el-option label="全部分类" value="" />
            <el-option label="心理健康" value="心理健康" />
            <el-option label="教育" value="教育" />
            <el-option label="职业发展" value="职业发展" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" @change="handleFilter" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 问卷列表 -->
    <div class="survey-list" v-loading="loading">
      <div v-for="answer in filteredAnswers" :key="answer.id" class="survey-item">
        <div class="survey-main">
          <div class="survey-icon">
            <el-icon size="24" color="#67d474d5">
              <Document />
            </el-icon>
          </div>

          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ answer.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ answer.category }}</el-tag>
                <el-tag size="small" type="success">已完成</el-tag>
              </div>
            </div>

            <div class="survey-meta">
              <span class="meta-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                答题时间：{{ formatDate(answer.submittedAt) }}
              </span>
              <span class="meta-item" v-if="answer.score">
                <el-icon>
                  <Star />
                </el-icon>
                得分：{{ answer.score }}分
              </span>
              <span class="meta-item" v-if="answer.duration">
                <el-icon>
                  <Clock />
                </el-icon>
                用时：{{ formatDuration(answer.duration) }}
              </span>
              <span class="meta-item" v-if="answer.survey">
                <el-icon>
                  <User />
                </el-icon>
                {{ answer.survey.participantCount || 0 }}人参与
              </span>
            </div>

            <div class="survey-result" v-if="answer.result">
              <span class="result-label">结果：</span>
              <span class="result-text">{{ answer.result }}</span>
            </div>
          </div>
        </div>

        <div class="survey-actions">
          <el-button type="primary" @click="viewResult(answer)" :disabled="!answer.score">
            <el-icon>
              <View />
            </el-icon>
            查看结果
          </el-button>
          <el-button @click="retakeSurvey(answer.surveyId)" :disabled="!answer.survey">
            <el-icon>
              <RefreshRight />
            </el-icon>
            重新答题
          </el-button>
          <el-dropdown @command="handleMoreAction">
            <el-button type="info">
              更多 <el-icon>
                <ArrowDown />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'detail', data: answer }">
                  查看详情
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'share', data: answer }" v-if="answer.score">
                  分享结果
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'delete', data: answer }">
                  删除
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'favorite', data: answer }" divided>
                  收藏问卷
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && filteredAnswers.length === 0" description="暂无已填写的问卷" class="empty-state">
        <el-button type="primary" @click="goToSurveys">
          去答题
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalAnswered > pageSize">
      <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalAnswered"
        layout="prev, pager, next, jumper, total" @current-change="handlePageChange" />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailDialogVisible" 
      :append-to-body="true"
      :destroy-on-close="true"
      :z-index="3000"
      width="720px"
      class="answer-detail-dialog"
    >
      <template #header>
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="header-text">
            <h3>答题详情</h3>
            <p v-if="selectedAnswer">{{ selectedAnswer.title }}</p>
          </div>
        </div>
      </template>

      <div v-if="selectedAnswer" class="answer-detail">
        <!-- 基本信息卡片 -->
        <div class="detail-section">
          <h4 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            基本信息
          </h4>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="问卷标题" label-class-name="detail-label">
              {{ selectedAnswer.title }}
            </el-descriptions-item>
            <el-descriptions-item label="问卷分类" label-class-name="detail-label">
              <el-tag size="small" type="primary">{{ selectedAnswer.category }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="答题时间" label-class-name="detail-label">
              <span class="detail-value">
                <el-icon><Clock /></el-icon>
                {{ formatDateTime(selectedAnswer.submittedAt) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="答题用时" label-class-name="detail-label">
              <span class="detail-value">
                <el-icon><Timer /></el-icon>
                {{ formatDuration(selectedAnswer.duration) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="得分情况" label-class-name="detail-label">
              <el-tag :type="selectedAnswer.score >= 60 ? 'success' : 'warning'" size="default" effect="dark">
                {{ selectedAnswer.score || 0 }} 分
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="评估结果" label-class-name="detail-label">
              <span class="result-badge">{{ selectedAnswer.result || '无' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 答题记录卡片 -->
        <div class="detail-section" v-if="selectedAnswer.answers && selectedAnswer.answers.length > 0">
          <h4 class="section-title">
            <el-icon><Edit /></el-icon>
            答题记录
          </h4>
          <div class="answers-list">
            <div v-for="(answer, index) in selectedAnswer.answers" :key="index" class="answer-item-card">
              <div class="question-header">
                <span class="question-number">Q{{ index + 1 }}</span>
                <span class="question-text">{{ getQuestionText(answer) }}</span>
              </div>
              <div class="answer-content">
                <el-icon><Check /></el-icon>
                <span class="answer-value">{{ formatAnswerValue(answer.answer) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="no-answers">
          <el-empty description="暂无答题详情" :image-size="120" />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false" size="large">关闭</el-button>
          <el-button type="success" @click="goToComment(selectedAnswer)" size="large">
            <el-icon><ChatDotRound /></el-icon>
            去评论
          </el-button>
          <el-button type="primary" @click="viewResult(selectedAnswer)" size="large" v-if="selectedAnswer?.score">
            <el-icon><View /></el-icon>
            查看完整报告
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Document,
  Calendar,
  Star,
  Clock,
  User,
  View,
  RefreshRight,
  ArrowDown,
  InfoFilled,
  Edit,
  Check,
  Timer,
  ChatDotRound,
  Delete
} from "@element-plus/icons-vue";

import { getUserAnsweredSurveysApi, addFavoriteApi, moveAnsweredToRecycleApi } from "@/api/user";
import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const answeredSurveys = ref([]);

// 使用通用列表筛选 hooks（封装搜索/筛选/分页）
const {
  searchKeyword,
  filterCategory,
  dateRange,
  currentPage,
  pageSize,
  filteredList: filteredAnswers,
  totalItems: totalAnswered,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: answeredSurveys, searchFields: ["title"] });
// 详情对话框状态
const detailDialogVisible = ref(false);
const selectedAnswer = ref(null);

// 方法
const loadAnsweredSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      return;
    }

    const data = await getUserAnsweredSurveysApi(userId);
    answeredSurveys.value = data.sort((a, b) =>
      new Date(b.submittedAt) - new Date(a.submittedAt)
    );
  } catch (error) {
    ElMessage.error("加载已填写问卷失败：" + error.message);
  } finally {
    loading.value = false;
  }
};


const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatDateTime = (date) => {
  return new Date(date).toLocaleString("zh-CN");
};

const formatDuration = (duration) => {
  if (!duration) return "未知";
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}分${seconds}秒`;
};

const formatAnswerValue = (value) => {
  if (Array.isArray(value)) {
    return value.join("、");
  }
  return value || "未作答";
};

const getQuestionText = (answer) => {
  // 如果答案对象中有问题文本，直接使用
  if (answer.question) {
    return answer.question;
  }
  
  // 如果答案对象中有题目内容，使用题目内容
  if (answer.content) {
    return answer.content;
  }
  
  // 如果答案对象中有标题，使用标题
  if (answer.title) {
    return answer.title;
  }
  
  // 如果答案对象中有文本，使用文本
  if (answer.text) {
    return answer.text;
  }
  
  // 最后的兜底方案
  return answer.questionId ? `题目 ${answer.questionId}` : '题目';
};

const viewResult = (answer) => {
  router.push(`/surveys/result/${answer.id}`);
};

const retakeSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const goToSurveys = () => {
  router.push("/");
};

const handleMoreAction = async ({ action, data }) => {
  switch (action) {
    case "detail":
      selectedAnswer.value = data;
      detailDialogVisible.value = true;
      break;

    case "myComment":
      await loadMyComment(data);
      selectedAnswer.value = data;
      commentDialogVisible.value = true;
      break;

    case "share":
      // 分享功能
      navigator.clipboard.writeText(
        `我在问卷系统完成了"${data.title}"问卷，得分${data.score}分！`
      );
      ElMessage.success("结果已复制到剪贴板");
      break;

    case "favorite":
      try {
        await addFavoriteApi(userStore.profile?.id, data.surveyId);
        ElMessage.success("收藏成功");
      } catch (error) {
        ElMessage.error("收藏失败：" + error.message);
      }
      break;
      
    case "delete":
      try {
        // 弹出确认框
        await ElMessageBox.confirm(
          '确定要删除此答题记录吗？删除后该记录会移入回收站，可在回收站恢复。',
          '确认删除',
          {
            confirmButtonText: '删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );

        // 调用 API：先保存到 recycleBin 再删除 answers
        await moveAnsweredToRecycleApi(data.id, data);

        // 从本地数组移除
        answeredSurveys.value = answeredSurveys.value.filter(a => a.id !== data.id);

        ElMessage.success('已删除并移入回收站');
      } catch (err) {
        // 当取消确认时，Element Plus 会抛出一个对象，我们不显示错误
        if (err && (err === 'cancel' || err.type === 'cancel')) return;
        ElMessage.error('删除失败：' + (err.message || err));
      }
      break;
  }
};

// 跳转到评论页面（测评报告页）
const goToComment = (answer) => {
  if (!answer || !answer.id) {
    ElMessage.warning('答题记录不存在');
    return;
  }
  // 关闭详情对话框
  detailDialogVisible.value = false;
  // 跳转到测评报告页面
  router.push(`/surveys/result/${answer.id}`);
};

// 生命周期
onMounted(() => {
  loadAnsweredSurveys();
});
</script>

<style lang="scss" scoped>
.answered-page {
  padding: 20px;

  /* 页面头部 */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-info {
      h2 {
        margin: 0 0 8px 0;
        color: #303133;
        font-size: 24px;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }

    .header-stats {
      text-align: right;
    }
  }

  /* 筛选卡片 */
  .filter-card {
    margin-bottom: 20px;
    border-radius: 12px;
  }

  /* 问卷列表 */
  .survey-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 20px;

    .survey-item {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-2px);
      }

      .survey-main {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;

        .survey-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #f0f9ff;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .survey-info {
          flex: 1;

          .survey-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .survey-title {
              margin: 0;
              font-size: 18px;
              font-weight: 600;
              color: #303133;
            }

            .survey-badges {
              margin-right: 40px;
              display: flex;
              gap: 8px;
            }
          }

          .survey-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 8px;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 14px;
              color: #606266;
            }
          }

          .survey-result {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .result-label {
              color: #606266;
            }

            .result-text {
              color: #67c23a;
              font-weight: 600;
            }
          }
        }
      }

      .survey-actions {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }
    }
  }

  /* 空状态 */
  .empty-state {
    margin: 40px 0;
  }

  /* 分页 */
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }

  /* 详情弹窗 */
  .answer-detail {
    max-height: 60vh;
    overflow-y: auto;
  }

  .no-answers {
    padding: 40px 0;
    text-align: center;
  }

  .answers-section {
    margin-top: 20px;

    h4 {
      margin: 0 0 16px 0;
      color: #303133;
    }

    .answer-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .question-text {
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 1.5;
    }

    .answer-text {
      font-size: 14px;
      color: #666;
    }
  }
}

/* 答题详情弹窗样式 */
:deep(.answer-detail-dialog) {
  border-radius: 16px;
  overflow: hidden;

  .el-dialog__header {
    padding: 0;
    margin: 0;
  }

  .el-dialog__body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 16px 24px;
    border-top: 1px solid #f0f2f5;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  .header-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 24px;
  }

  .header-text {
    flex: 1;

    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.answer-detail {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;

      .el-icon {
        color: #667eea;
      }
    }
  }

  .detail-label {
    font-weight: 500;
    background: #f8f9fa !important;
  }

  .detail-value {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #606266;

    .el-icon {
      color: #909399;
    }
  }

  .result-badge {
    display: inline-block;
    padding: 4px 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
  }

  .answers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .answer-item-card {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 12px;
      border-left: 4px solid #667eea;
      transition: all 0.3s ease;

      &:hover {
        background: #f0f2f5;
        transform: translateX(4px);
      }

      .question-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        .question-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .question-text {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          color: #303133;
          line-height: 32px;
        }
      }

      .answer-content {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        background: white;
        border-radius: 8px;
        margin-left: 44px;

        .el-icon {
          color: #67C23A;
          font-size: 16px;
          flex-shrink: 0;
        }

        .answer-value {
          flex: 1;
          color: #606266;
          font-size: 14px;
          line-height: 1.6;
        }
      }
    }
  }

  .no-answers {
    padding: 60px 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  .el-button {
    border-radius: 8px;
    padding: 10px 24px;
    font-weight: 500;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .answered-page {
    padding: 16px;

    .page-header {
      flex-direction: column;
      gap: 16px;
      text-align: center;
    }

    .survey-item {
      flex-direction: column;
      gap: 16px;
    }

    .survey-main {
      width: 100%;
    }

    .survey-actions {
      width: 100%;
      justify-content: center;
    }

    .survey-meta {
      flex-direction: column;
      gap: 8px;
    }
  }
}

@media (max-width: 480px) {
  .answered-page {
    .survey-actions {
      flex-direction: column;
      width: 100%;
    }

    .survey-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }
}
</style>