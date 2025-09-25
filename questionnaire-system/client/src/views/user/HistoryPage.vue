<template>
  <div class="history-page">
    <el-page-header content="答题历史" @back="$router.push('/user/profile')" />

    <div class="history-content">
      <!-- 筛选和搜索 -->
      <el-card class="filter-card">
        <el-row :gutter="16">
          <el-col :span="8">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索问卷标题"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>

          <el-col :span="6">
            <el-select
              v-model="filterStatus"
              placeholder="答题状态"
              clearable
              @change="handleFilter"
            >
              <el-option label="全部" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已中断" value="abandoned" />
            </el-select>
          </el-col>

          <el-col :span="6">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilter"
            />
          </el-col>

          <el-col :span="4">
            <el-button type="primary" @click="exportHistory">
              <el-icon><Download /></el-icon>
              导出记录
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 统计信息 -->
      <el-row :gutter="20" class="stats-section">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#409EFF"><Document /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ totalAnswers }}</div>
                <div class="stats-label">总答题数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#67C23A"><CircleCheck /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ completedCount }}</div>
                <div class="stats-label">已完成</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ avgScore }}</div>
                <div class="stats-label">平均得分</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <el-icon size="24" color="#F56C6C"><TrophyBase /></el-icon>
              <div class="stats-content">
                <div class="stats-number">{{ bestScore }}</div>
                <div class="stats-label">最高得分</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 历史记录列表 -->
      <el-card class="history-list-card">
        <div v-loading="loading" class="history-list">
          <div
            v-for="answer in filteredAnswers"
            :key="answer.id"
            class="history-item"
          >
            <div class="history-main">
              <div class="history-info">
                <div class="history-header">
                  <h3>{{ answer.questionnaire?.title || "未知问卷" }}</h3>
                  <el-tag :type="getStatusType(answer.status)" size="small">
                    {{ getStatusText(answer.status) }}
                  </el-tag>
                </div>

                <div class="history-meta">
                  <span class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    答题时间：{{ formatDate(answer.createdAt) }}
                  </span>

                  <span
                    class="meta-item"
                    v-if="answer.detail?.score !== undefined"
                  >
                    <el-icon><Star /></el-icon>
                    得分：{{ answer.detail.score }}分
                  </span>

                  <span class="meta-item" v-if="answer.detail?.duration">
                    <el-icon><Timer /></el-icon>
                    用时：{{ formatDuration(answer.detail.duration) }}
                  </span>

                  <span class="meta-item">
                    <el-icon><View /></el-icon>
                    问题数：{{ answer.questionnaire?.questions?.length || 0 }}题
                  </span>
                </div>

                <p class="history-desc">
                  {{ answer.questionnaire?.description || "暂无描述" }}
                </p>
              </div>

              <div class="history-actions">
                <el-button
                  v-if="answer.status === 'completed'"
                  type="primary"
                  @click="viewReport(answer.id)"
                >
                  查看报告
                </el-button>

                <el-button
                  v-if="answer.status === 'in_progress'"
                  type="warning"
                  @click="continueAnswer(answer)"
                >
                  继续答题
                </el-button>

                <el-button
                  type="success"
                  @click="retakeQuestionnaire(answer.questionnaireId)"
                >
                  重新答题
                </el-button>

                <el-dropdown @command="handleMoreAction">
                  <el-button type="info">
                    更多 <el-icon><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        :command="{ action: 'view', data: answer }"
                      >
                        查看详情
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{ action: 'share', data: answer }"
                        v-if="answer.status === 'completed'"
                      >
                        分享结果
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{
                          action: 'favorite',
                          data: answer.questionnaire,
                        }"
                        divided
                      >
                        收藏问卷
                      </el-dropdown-item>
                      <el-dropdown-item
                        :command="{ action: 'delete', data: answer }"
                        class="danger-item"
                      >
                        删除记录
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 答题进度条 -->
            <div
              v-if="answer.status === 'in_progress'"
              class="progress-section"
            >
              <div class="progress-info">
                <span>答题进度</span>
                <span
                  >{{ answer.detail?.currentQuestion || 0 }}/{{
                    answer.questionnaire?.questions?.length || 0
                  }}</span
                >
              </div>
              <el-progress
                :percentage="calculateProgress(answer)"
                :stroke-width="6"
                status="warning"
              />
            </div>
          </div>

          <el-empty
            v-if="!filteredAnswers.length && !loading"
            description="暂无答题记录"
            class="empty-state"
          />
        </div>
      </el-card>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > pageSize">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, jumper, total"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="答题详情"
      width="60%"
      :destroy-on-close="true"
    >
      <div v-if="selectedAnswer" class="answer-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="问卷标题">
            {{ selectedAnswer.questionnaire?.title }}
          </el-descriptions-item>
          <el-descriptions-item label="答题状态">
            <el-tag :type="getStatusType(selectedAnswer.status)">
              {{ getStatusText(selectedAnswer.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ formatDateTime(selectedAnswer.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ formatDateTime(selectedAnswer.updatedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="答题用时">
            {{ formatDuration(selectedAnswer.detail?.duration) }}
          </el-descriptions-item>
          <el-descriptions-item label="得分">
            {{ selectedAnswer.detail?.score || 0 }}分
          </el-descriptions-item>
        </el-descriptions>

        <div class="answers-section" v-if="selectedAnswer.detail?.answers">
          <h4>答题详情</h4>
          <div
            v-for="(answer, index) in selectedAnswer.detail.answers"
            :key="index"
            class="answer-item"
          >
            <div class="question-text">
              <strong>Q{{ index + 1 }}:</strong> {{ answer.question }}
            </div>
            <div class="answer-text">
              <strong>答案:</strong> {{ formatAnswer(answer) }}
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
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
  Download,
  Document,
  CircleCheck,
  Clock,
  TrophyBase,
  Calendar,
  Star,
  Timer,
  View,
  ArrowDown,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import {
  getUserAnswersApi,
  getAnswerDetailApi,
  deleteAnswerApi,
  addFavoriteApi,
} from "@/api/user";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const answers = ref([]);
const searchKeyword = ref("");
const filterStatus = ref("");
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const detailDialogVisible = ref(false);
const selectedAnswer = ref(null);

// 计算属性
const filteredAnswers = computed(() => {
  let result = answers.value;

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter((answer) =>
      answer.questionnaire?.title?.includes(searchKeyword.value)
    );
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter((answer) => answer.status === filterStatus.value);
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    result = result.filter((answer) => {
      const date = answer.createdAt.split("T")[0];
      return date >= start && date <= end;
    });
  }

  // 分页
  total.value = result.length;
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

const totalAnswers = computed(() => answers.value.length);

const completedCount = computed(
  () => answers.value.filter((a) => a.status === "completed").length
);

const avgScore = computed(() => {
  const completed = answers.value.filter(
    (a) => a.status === "completed" && a.detail?.score !== undefined
  );
  if (completed.length === 0) return 0;
  const sum = completed.reduce((acc, a) => acc + (a.detail.score || 0), 0);
  return Math.round(sum / completed.length);
});

const bestScore = computed(() => {
  const scores = answers.value
    .filter((a) => a.status === "completed" && a.detail?.score !== undefined)
    .map((a) => a.detail.score);
  return scores.length > 0 ? Math.max(...scores) : 0;
});

// 方法
const loadAnswers = async () => {
  loading.value = true;
  try {
    const data = await getUserAnswersApi();
    answers.value = data || [];
  } catch (error) {
    ElMessage.error("加载答题记录失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
};

const handleFilter = () => {
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const getStatusType = (status) => {
  const types = {
    completed: "success",
    in_progress: "warning",
    abandoned: "info",
  };
  return types[status] || "info";
};

const getStatusText = (status) => {
  const texts = {
    completed: "已完成",
    in_progress: "进行中",
    abandoned: "已中断",
  };
  return texts[status] || "未知";
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

const calculateProgress = (answer) => {
  if (
    !answer.detail?.currentQuestion ||
    !answer.questionnaire?.questions?.length
  ) {
    return 0;
  }
  return Math.round(
    (answer.detail.currentQuestion / answer.questionnaire.questions.length) *
      100
  );
};

const formatAnswer = (answer) => {
  if (Array.isArray(answer.value)) {
    return answer.value.join("、");
  }
  return answer.value || "未作答";
};

const viewReport = (answerId) => {
  router.push(`/user/reports/${answerId}`);
};

const continueAnswer = (answer) => {
  router.push(`/surveys/${answer.questionnaireId}?continue=${answer.id}`);
};

const retakeQuestionnaire = (questionnaireId) => {
  router.push(`/surveys/${questionnaireId}`);
};

const handleMoreAction = async ({ action, data }) => {
  switch (action) {
    case "view":
      try {
        const detail = await getAnswerDetailApi(data.id);
        selectedAnswer.value = { ...data, detail };
        detailDialogVisible.value = true;
      } catch (error) {
        ElMessage.error("获取详情失败：" + error.message);
      }
      break;

    case "share":
      // 分享功能
      navigator.clipboard.writeText(
        `我在问卷系统完成了"${data.questionnaire?.title}"，得分${data.detail?.score}分！`
      );
      ElMessage.success("结果已复制到剪贴板");
      break;

    case "favorite":
      try {
        await addFavoriteApi(data.id);
        ElMessage.success("收藏成功");
      } catch (error) {
        ElMessage.error("收藏失败：" + error.message);
      }
      break;

    case "delete":
      try {
        await ElMessageBox.confirm("确定删除这条答题记录吗？", "提示", {
          type: "warning",
        });
        await deleteAnswerApi(data.id);
        answers.value = answers.value.filter((a) => a.id !== data.id);
        ElMessage.success("删除成功");
      } catch (error) {
        if (error !== "cancel") {
          ElMessage.error("删除失败：" + error.message);
        }
      }
      break;
  }
};

const exportHistory = () => {
  // 导出功能
  const csvContent = answers.value
    .map((answer) =>
      [
        answer.questionnaire?.title || "未知问卷",
        getStatusText(answer.status),
        answer.detail?.score || 0,
        formatDate(answer.createdAt),
      ].join(",")
    )
    .join("\n");

  const header = "问卷标题,状态,得分,答题时间\n";
  const blob = new Blob([header + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "答题历史.csv";
  link.click();

  ElMessage.success("导出成功");
};

// 生命周期
onMounted(() => {
  loadAnswers();
});
</script>

<style scoped>
.history-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.history-content {
  margin-top: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.stats-section {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.stats-label {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.history-list-card {
  margin-bottom: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.history-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.history-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.history-info {
  flex: 1;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
}

.history-desc {
  margin: 0;
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

.history-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.progress-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.answer-detail {
  max-height: 60vh;
  overflow-y: auto;
}

.answers-section {
  margin-top: 20px;
}

.answers-section h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.answer-item {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
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

.danger-item {
  color: #f56c6c;
}

.empty-state {
  margin: 40px 0;
}

@media (max-width: 768px) {
  .history-page {
    padding: 16px;
  }

  .history-main {
    flex-direction: column;
    gap: 12px;
  }

  .history-actions {
    flex-direction: row;
    flex-wrap: wrap;
    min-width: auto;
  }

  .stats-section .el-col {
    margin-bottom: 12px;
  }
}
</style>
