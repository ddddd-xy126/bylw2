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
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问卷标题"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterCategory"
            placeholder="问卷分类"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部分类" value="" />
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
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
      </el-row>
    </el-card>

    <!-- 问卷列表 -->
    <div class="survey-list" v-loading="loading">
      <div
        v-for="answer in filteredAnswers"
        :key="answer.id"
        class="survey-item"
      >
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
                <el-tag size="small" type="primary">{{
                  answer.category
                }}</el-tag>
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
          <el-button type="success" @click="viewResult(answer)">
            <el-icon>
              <View />
            </el-icon>
            查看结果
          </el-button>
          <el-dropdown @command="handleMoreAction">
            <el-button type="other">
              更多 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="{ action: 'retake', data: answer }"
                  :disabled="!answer.survey"
                >
                  重新答题
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'favorite', data: answer }"
                >
                  收藏问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', data: answer }"
                  divided
                >
                  <span style="color: #f56c6c">删除记录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredAnswers.length === 0"
        description="暂无已填写的问卷"
        class="empty-state"
      >
        <el-button type="primary" @click="goToSurveys"> 去答题 </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalAnswered > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalAnswered"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Document,
  Calendar,
  Star,
  Clock,
  User,
  View,
  RefreshRight,
  Delete,
  ArrowDown,
} from "@element-plus/icons-vue";

import {
  getUserAnsweredSurveysApi,
  addFavoriteApi,
  moveAnsweredToRecycleApi,
} from "@/api/user";
import { getCategoriesApi } from "@/api/survey";
import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const answeredSurveys = ref([]);
const categories = ref([]);

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

// 方法
const loadCategories = async () => {
  try {
    categories.value = await getCategoriesApi();
  } catch (error) {
    console.error("加载分类失败:", error);
  }
};

const loadAnsweredSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      return;
    }

    const data = await getUserAnsweredSurveysApi(userId);
    answeredSurveys.value = data.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
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

const viewResult = (answer) => {
  // 跳转到结果页，带上 surveyId 参数
  router.push({
    path: `/surveys/result/${answer.id}`,
    query: {
      surveyId: answer.surveyId,
    },
  });
};

const retakeSurvey = (surveyId) => {
  router.push(`/surveys/${surveyId}`);
};

const goToSurveys = () => {
  router.push("/");
};

// 处理更多操作菜单
const handleMoreAction = async ({ action, data }) => {
  if (action === "retake") {
    retakeSurvey(data.surveyId);
  } else if (action === "favorite") {
    await handleFavorite(data);
  } else if (action === "delete") {
    await handleDelete(data);
  }
};

// 删除答题记录
const handleDelete = async (answer) => {
  try {
    // 弹出确认框
    await ElMessageBox.confirm(
      "确定要删除此答题记录吗？删除后该记录会移入回收站，可在回收站恢复。",
      "确认删除",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 调用 API：先保存到 recycleBin 再删除 answers
    await moveAnsweredToRecycleApi(answer.id, answer);

    // 从本地数组移除
    answeredSurveys.value = answeredSurveys.value.filter(
      (a) => a.id !== answer.id
    );

    ElMessage.success("已删除并移入回收站");
  } catch (err) {
    // 当取消确认时，Element Plus 会抛出一个对象，我们不显示错误
    if (err && (err === "cancel" || err.type === "cancel")) return;
    ElMessage.error("删除失败：" + (err.message || err));
  }
};

// 收藏问卷
const handleFavorite = async (answer) => {
  try {
    await addFavoriteApi(userStore.profile?.id, answer.surveyId);
    ElMessage.success("收藏成功");
  } catch (error) {
    ElMessage.error("收藏失败：" + error.message);
  }
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadAnsweredSurveys();
});
</script>

<style scoped lang="scss">
.answered-page {
  padding: var(--spacing-lg);
  min-height: 100vh;
  color: var(--text-primary);
  transition: background var(--transition-base);

  // ============ 页面头部 ============
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(
      135deg,
      var(--color-primary-light-5) 0%,
      white 100%
    );
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(37, 146, 52, 0.1);
    border: 1px solid var(--color-primary-light-5);

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
    }

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

      @media (max-width: 768px) {
        text-align: left;
        width: 100%;
      }
    }
  }

  // ============ 筛选卡片 ============
  .filter-card {
    background: var(--color-white);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    .el-input,
    .el-select,
    .el-date-editor {
      width: 100%;
    }

    .el-input__wrapper,
    .el-select__wrapper,
    .el-range-editor {
      border-color: var(--border-light);
      transition: var(--transition-base);

      &:hover,
      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px rgba(37, 146, 52, 0.15);
      }
    }
  }

  // ============ 问卷列表 ============
  .survey-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);

    .survey-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-white);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-base);
      padding: var(--spacing-md) var(--spacing-lg);
      transition: transform var(--transition-base),
        box-shadow var(--transition-base);
      border-left: 4px solid #67c23a;
      gap: 20px;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .survey-main {
        display: flex;
        align-items: center;
        flex: 1;

        .survey-icon {
          background: var(--bg-primary-medium);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: var(--spacing-md);
        }

        .survey-info {
          flex: 1;

          .survey-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-xs);

            .survey-title {
              font-size: var(--font-size-lg);
              font-weight: var(--font-weight-semibold);
              color: var(--text-primary);
            }

            .survey-badges {
              display: flex;
              gap: var(--spacing-xs);

              .el-tag {
                border-radius: var(--radius-sm);
                font-size: var(--font-size-sm);
              }
            }
          }

          .survey-meta {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm);
            color: var(--text-secondary);
            font-size: var(--font-size-sm);
            margin-bottom: var(--spacing-xs);

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;

              .el-icon {
                font-size: 14px;
                color: var(--color-primary);
              }
            }
          }

          .survey-result {
            font-size: var(--font-size-base);
            background: var(--bg-primary-light);
            border-left: 4px solid var(--color-primary);
            padding: var(--spacing-sm) var(--spacing-md);
            border-radius: var(--radius-sm);
            color: var(--text-primary);

            .result-label {
              font-weight: var(--font-weight-semibold);
              color: var(--color-primary-dark-1);
              margin-right: var(--spacing-xs);
            }

            .result-text {
              color: var(--text-secondary);
            }
          }
        }
      }

      // ============ 操作按钮组 ============
      .survey-actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex-shrink: 0;
        min-width: 120px;

        .el-button,
        :deep(.el-dropdown) {
          width: 100%;
        }

        :deep(.el-dropdown .el-button) {
          width: 100%;
        }

        .el-button + .el-button {
          margin-left: 0;
        }

        @media (max-width: 768px) {
          width: 100%;
          justify-content: center;
        }

        @media (max-width: 480px) {
          flex-direction: column;
          width: 100%;
        }
      }
    }

    // ============ 空状态 ============
    .empty-state {
      margin-top: var(--spacing-2xl);

      .el-empty__description {
        color: var(--text-secondary);
        font-size: var(--font-size-base);
      }

      .el-button {
        margin-top: var(--spacing-md);
        background: var(--color-primary);
        border-color: var(--color-primary);

        &:hover {
          background: var(--color-primary-light-2);
        }
      }
    }
  }

  // ============ 分页 ============
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: var(--spacing-xl);
    padding-bottom: var(--spacing-xl);

    .el-pagination {
      --el-pagination-hover-color: var(--color-primary);
      --el-pagination-button-bg-color: var(--bg-secondary);
    }
  }

  // ============ 响应式 ============
  @media (max-width: 1024px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-md);
    }

    .survey-item {
      flex-direction: column;
      align-items: flex-start;
    }
  }
}
</style>
