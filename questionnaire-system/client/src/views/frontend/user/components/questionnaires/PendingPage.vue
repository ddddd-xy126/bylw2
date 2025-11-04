<template>
  <div class="pending-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>待审核问卷</h2>
        <p>查看您提交审核的问卷状态，等待管理员审核通过后即可发布</p>
      </div>
      <div class="header-stats">
        <el-statistic title="待审核数量" :value="pendingSurveys.length" />
      </div>
    </div>

    <!-- 审核流程说明 -->
    <el-card class="process-card" shadow="never">
      <template #header>
        <h3>审核流程</h3>
      </template>
      <el-steps :active="2" align-center>
        <el-step title="创建问卷" description="编辑并完善问卷内容" />
        <el-step title="提交审核" description="提交给管理员审核" />
        <el-step title="等待审核" description="管理员审核问卷内容" />
        <el-step title="审核通过" description="问卷正式发布" />
      </el-steps>
    </el-card>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="6">
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
          <el-button type="primary" @click="refreshData">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 问卷列表 -->
    <div class="survey-list" v-loading="loading">
      <div
        v-for="survey in filteredSurveys"
        :key="survey.id"
        class="survey-item pending-item"
      >
        <div class="survey-main">
          <div class="survey-icon">
            <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
          </div>
          
          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ survey.category }}</el-tag>
                <el-tag size="small" type="warning">待审核</el-tag>
              </div>
            </div>
            
            <div class="survey-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                提交时间：{{ formatDate(survey.updatedAt) }}
              </span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                题目数：{{ survey.questions }}题
              </span>
              <span class="meta-item">
                <el-icon><Timer /></el-icon>
                预计用时：{{ survey.duration }}分钟
              </span>
              <span class="meta-item">
                <el-icon><View /></el-icon>
                等待审核：{{ getWaitingDays(survey.updatedAt) }}天
              </span>
            </div>
            
            <div class="survey-description">
              {{ survey.description }}
            </div>

            <!-- 审核进度 -->
            <div class="review-progress">
              <div class="progress-info">
                <span class="progress-label">审核进度</span>
                <span class="progress-status">等待管理员审核中...</span>
              </div>
              <el-progress 
                :percentage="50" 
                status="warning" 
                :stroke-width="6"
                :show-text="false"
              />
            </div>
          </div>
        </div>

        <div class="survey-actions">
          <el-button @click="viewSurvey(survey.id)">
            <el-icon><View /></el-icon>
            预览
          </el-button>
          <el-button @click="withdrawSurvey(survey.id)">
            <el-icon><RefreshLeft /></el-icon>
            撤回
          </el-button>
          <el-button @click="contactAdmin(survey)">
            <el-icon><ChatDotRound /></el-icon>
            联系管理员
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && filteredSurveys.length === 0" 
        description="暂无待审核的问卷"
        class="empty-state"
      >
        <el-button type="primary" @click="goToCreated">
          查看我的问卷
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalItems > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 审核须知 -->
    <el-card class="notice-card" shadow="never">
      <template #header>
        <h3>审核须知</h3>
      </template>
      <div class="notice-content">
        <el-alert
          title="审核时间"
          description="一般情况下，管理员会在1-3个工作日内完成审核，请耐心等待。"
          type="info"
          :closable="false"
          show-icon
        />
        <br>
        <el-alert
          title="审核标准"
          description="问卷内容应当健康积极，题目表达清晰，选项设置合理，符合平台规范。"
          type="warning"
          :closable="false"
          show-icon
        />
        <br>
        <el-alert
          title="审核结果"
          description="审核通过后问卷将自动发布，审核不通过会退回到草稿状态并提供修改建议。"
          type="success"
          :closable="false"
          show-icon
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Clock,
  Calendar,
  Document,
  Timer,
  View,
  RefreshLeft,
  ChatDotRound,
} from "@element-plus/icons-vue";

import { 
  getUserSurveysApi, 
  updateSurveyApi,
  getCategoriesApi
} from "@/api/survey";
import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const pendingSurveys = ref([]);
const categories = ref([]);

// 使用 useListFilter 管理搜索/分类/日期/分页
const {
  searchKeyword,
  filterCategory,
  dateRange,
  currentPage,
  pageSize,
  filteredList: filteredSurveys,
  totalItems,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: pendingSurveys, searchFields: ["title"] });

// 计算属性
// filteredSurveys 由 useListFilter 返回

// 方法
const loadCategories = async () => {
  try {
    categories.value = await getCategoriesApi();
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

const loadPendingSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      pendingSurveys.value = [];
      return;
    }
    
    // 使用 API 获取当前用户的待审核问卷
    const allSurveys = await getUserSurveysApi(userId, 'pending');
    
    // 格式化数据
    pendingSurveys.value = allSurveys.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      questions: q.questions || (q.questionList || []).length,
      duration: q.duration || 10,
      participants: q.participantCount || q.participants || 0
    }));
    
    console.log('Loaded pending surveys:', allSurveys);
  } catch (error) {
    console.error('加载待审核问卷失败:', error);
    ElMessage.error("加载待审核问卷失败：" + error.message);
    pendingSurveys.value = [];
  } finally {
    loading.value = false;
  }
};

// handleSearch/handleFilter/handlePageChange 来自 useListFilter

const refreshData = () => {
  loadPendingSurveys();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const getWaitingDays = (submitDate) => {
  const days = Math.floor((Date.now() - new Date(submitDate)) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

const viewSurvey = (id) => {
  router.push(`/surveys/${id}`);
};

const withdrawSurvey = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要撤回这个问卷吗？撤回后将回到草稿状态，可以继续编辑。',
      '确认撤回',
      {
        confirmButtonText: '确定撤回',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 使用 API 更新问卷状态
    await updateSurveyApi(id, {
      status: 'draft',
      updatedAt: new Date().toISOString()
    });
    
    ElMessage.success("问卷已撤回到草稿状态");
    loadPendingSurveys();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('撤回失败:', error);
      ElMessage.error("撤回失败：" + error.message);
    }
  }
};

const goToCreated = () => {
  router.push("/profile/questionnaires/created");
};

// 联系管理员
const contactAdmin = (survey) => {
  ElMessageBox.alert(
    `如有疑问，请联系管理员邮箱：admin@example.com\n\n问卷名称：${survey.title}\n问卷ID：${survey.id}`,
    '联系管理员',
    {
      confirmButtonText: '确定',
      type: 'info'
    }
  );
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadPendingSurveys();
});
</script>

<style scoped lang="scss">
.pending-page {
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: linear-gradient(135deg, var(--color-primary-light-5) 0%, white 100%);
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

/* 流程卡片 */
.process-card {
  margin-bottom: 20px;
  border-radius: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0;
    color: #303133;
    font-size: 18px;
  }
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    gap: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
    }

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    &.pending-item {
      border-left: 4px solid #E6A23C;
    }

    .survey-main {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;

      @media (max-width: 768px) {
        width: 100%;
      }

      .survey-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: var(--color-primary-light-5);
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

          @media (max-width: 480px) {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .survey-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #303133;
          }

          .survey-badges {
            display: flex;
            gap: 8px;
          }
        }

        .survey-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 8px;

          @media (max-width: 768px) {
            flex-direction: column;
            gap: 8px;
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;
            color: #606266;
          }
        }

        .survey-description {
          color: #909399;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        /* 审核进度 */
        .review-progress {
          background: var(--color-success-bg);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--color-primary-light-4);

          .progress-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .progress-label {
              font-weight: 600;
              color: var(--color-primary);
              font-size: 14px;
            }

            .progress-status {
              color: var(--text-secondary);
              font-size: 12px;
            }
          }
        }
      }
    }

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
}

/* 空状态 */
.empty-state {
  margin: 40px 0;
  text-align: center;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 须知卡片 */
.notice-card {
  margin-top: 20px;
  border-radius: 12px;
  padding: 16px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0;
    color: #303133;
    font-size: 18px;
    margin-bottom: 16px;
  }

  .notice-content {
    .el-alert {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>