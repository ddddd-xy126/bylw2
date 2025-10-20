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
            v-model="filterCategory"
            placeholder="问卷分类"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部分类" value="" />
            <el-option label="心理健康" value="心理健康" />
            <el-option label="教育" value="教育" />
            <el-option label="职业发展" value="职业发展" />
            <el-option label="产品" value="产品" />
            <el-option label="企业" value="企业" />
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
          <el-dropdown @command="handleMoreAction">
            <el-button type="info">
              更多 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="{ action: 'copy', data: survey }"
                >
                  复制问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'contact', data: survey }"
                  divided
                >
                  联系管理员
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
    <div class="pagination-wrapper" v-if="pendingSurveys.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="pendingSurveys.length"
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
  ArrowDown,
} from "@element-plus/icons-vue";

import { 
  getUserSurveysApi, 
  updateSurveyApi 
} from "@/api/survey";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const pendingSurveys = ref([]);
const searchKeyword = ref("");
const filterCategory = ref("");
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

// 计算属性
const filteredSurveys = computed(() => {
  let result = pendingSurveys.value;

  // 关键词搜索
  if (searchKeyword.value) {
    result = result.filter((survey) =>
      survey.title.includes(searchKeyword.value)
    );
  }

  // 分类筛选
  if (filterCategory.value) {
    result = result.filter((survey) => survey.category === filterCategory.value);
  }

  // 日期筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value;
    result = result.filter((survey) => {
      const date = survey.updatedAt.split("T")[0];
      return date >= start && date <= end;
    });
  }

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

// 方法
const loadPendingSurveys = async () => {
  loading.value = true;
  try {
    // 从localStorage加载待审核问卷
    const allQuestionnaires = JSON.parse(localStorage.getItem('all_questionnaires') || '[]');
    const userId = userStore.profile?.id || 1;
    
    // 筛选出当前用户的待审核问卷
    const userPendingSurveys = allQuestionnaires.filter(q => 
      q.userId === userId && q.status === 'pending'
    );
    
    pendingSurveys.value = userPendingSurveys;
    console.log('Loaded pending surveys:', userPendingSurveys);
  } catch (error) {
    console.error('加载待审核问卷失败:', error);
    ElMessage.error("加载待审核问卷失败：" + error.message);
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
    
    await updateSurveyApi(id, { status: 'draft' });
    ElMessage.success("问卷已撤回到草稿状态");
    loadPendingSurveys();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error("撤回失败：" + error.message);
    }
  }
};

const goToCreated = () => {
  router.push("/profile/questionnaires/created");
};

const handleMoreAction = async ({ action, data }) => {
  switch (action) {
    case "copy":
      ElMessage.info("复制功能开发中...");
      break;

    case "contact":
      ElMessage.info("如有疑问，请联系管理员邮箱：admin@example.com");
      break;
  }
};

// 生命周期
onMounted(() => {
  loadPendingSurveys();
});
</script>

<style scoped>
.pending-page {
  padding: 20px;
}

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
}

.header-info h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.header-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-stats {
  text-align: right;
}

/* 流程卡片 */
.process-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.process-card h3 {
  margin: 0;
  color: #303133;
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
}

.survey-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.survey-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.pending-item {
  border-left: 4px solid #E6A23C;
}

.survey-main {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  flex: 1;
}

.survey-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #fdf6ec;
  border-radius: 12px;
  flex-shrink: 0;
}

.survey-info {
  flex: 1;
}

.survey-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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

.survey-meta {
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
  color: #606266;
}

.survey-description {
  color: #909399;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
}

/* 审核进度 */
.review-progress {
  background: #fdf6ec;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #f5dab1;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-weight: 600;
  color: #E6A23C;
  font-size: 14px;
}

.progress-status {
  color: #606266;
  font-size: 12px;
}

.survey-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
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

/* 须知卡片 */
.notice-card {
  margin-top: 20px;
  border-radius: 12px;
}

.notice-card h3 {
  margin: 0;
  color: #303133;
}

.notice-content .el-alert {
  margin-bottom: 12px;
}

.notice-content .el-alert:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .pending-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
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

@media (max-width: 480px) {
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
</style>