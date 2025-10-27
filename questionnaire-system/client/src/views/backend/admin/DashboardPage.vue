<template>
  <div class="admin-dashboard">
    <el-page-header content="管理后台" @back="$router.push('/')" />

    <div class="dashboard-content">
      <!-- 快捷操作 -->
      <el-card class="quick-actions-card">
        <template #header>
          <div class="card-header">
            <span>快捷操作</span>
          </div>
        </template>

        <el-row :gutter="16">
          <el-col :span="6">
            <el-button type="primary" size="large" class="quick-btn" @click="$router.push('/admin/surveys')">
              <el-icon>
                <Document />
              </el-icon>
              管理问卷
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button type="success" size="large" class="quick-btn" @click="$router.push('/admin/users')">
              <el-icon>
                <User />
              </el-icon>
              用户管理
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button type="warning" size="large" class="quick-btn" @click="$router.push('/admin/analytics')">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              数据分析
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button type="info" size="large" class="quick-btn" @click="$router.push('/admin/settings')">
              <el-icon>
                <Setting />
              </el-icon>
              系统设置
            </el-button>
          </el-col>
        </el-row>
      </el-card>

      <!-- 统计概览 -->
      <el-row :gutter="20" class="stats-overview">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <div class="stats-icon">
                <el-icon size="40" color="#409EFF">
                  <Document />
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">
                  {{ dashboardData.totalSurveys || 0 }}
                </div>
                <div class="stats-label">问卷总数</div>
                <div class="stats-trend">
                  <span :class="getTrendClass(dashboardData.surveyTrend)">
                    {{ formatTrend(dashboardData.surveyTrend) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <div class="stats-icon">
                <el-icon size="40" color="#67C23A">
                  <User />
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">
                  {{ dashboardData.totalUsers || 0 }}
                </div>
                <div class="stats-label">注册用户</div>
                <div class="stats-trend">
                  <span :class="getTrendClass(dashboardData.userTrend)">
                    {{ formatTrend(dashboardData.userTrend) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <div class="stats-icon">
                <el-icon size="40" color="#E6A23C">
                  <Edit />
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">
                  {{ dashboardData.totalAnswers || 0 }}
                </div>
                <div class="stats-label">答卷总数</div>
                <div class="stats-trend">
                  <span :class="getTrendClass(dashboardData.answerTrend)">
                    {{ formatTrend(dashboardData.answerTrend) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-item">
              <div class="stats-icon">
                <el-icon size="40" color="#F56C6C">
                  <TrendCharts />
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">
                  {{ (dashboardData.completionRate || 0).toFixed(1) }}%
                </div>
                <div class="stats-label">完成率</div>
                <div class="stats-trend">
                  <span :class="getTrendClass(dashboardData.completionTrend)">
                    {{ formatTrend(dashboardData.completionTrend) }}
                  </span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表区域 -->
      <el-row :gutter="20" class="charts-section">
        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>最近7天活跃度</span>
                <el-button type="text" @click="refreshCharts">刷新</el-button>
              </div>
            </template>

            <div id="activityChart" class="chart-container" v-loading="chartsLoading"></div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>问卷分类分布</span>
                <el-button type="text" @click="refreshCharts">刷新</el-button>
              </div>
            </template>

            <div id="categoryChart" class="chart-container" v-loading="chartsLoading"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 最新动态 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="recent-card">
            <template #header>
              <div class="card-header">
                <span>最新问卷</span>
                <el-button type="text" @click="$router.push('/admin/surveys')">
                  查看全部
                </el-button>
              </div>
            </template>

            <div class="recent-list" v-loading="loading">
              <div v-for="survey in recentSurveys" :key="survey.id" class="recent-item" @click="viewSurvey(survey.id)">
                <div class="item-content">
                  <h4>{{ survey.title }}</h4>
                  <p>{{ survey.description }}</p>
                  <div class="item-meta">
                    <el-tag size="small" :type="survey.status === 'active' ? 'success' : 'info'">
                      {{ survey.status === "active" ? "进行中" : "已停止" }}
                    </el-tag>
                    <span class="meta-date">{{
                      formatDate(survey.createdAt)
                    }}</span>
                  </div>
                </div>
              </div>

              <el-empty v-if="!recentSurveys.length" description="暂无问卷" />
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="recent-card">
            <template #header>
              <div class="card-header">
                <span>最新用户</span>
                <el-button type="text" @click="$router.push('/admin/users')">
                  查看全部
                </el-button>
              </div>
            </template>

            <div class="recent-list" v-loading="loading">
              <div v-for="user in recentUsers" :key="user.id" class="recent-item">
                <div class="item-content">
                  <div class="user-info">
                    <el-avatar :size="32">{{
                      user.username?.charAt(0)
                    }}</el-avatar>
                    <div class="user-details">
                      <h4>{{ user.username }}</h4>
                      <p>{{ user.email }}</p>
                    </div>
                  </div>
                  <div class="item-meta">
                    <el-tag size="small" :type="user.isActive ? 'success' : 'info'">
                      {{ user.isActive ? "活跃" : "未激活" }}
                    </el-tag>
                    <span class="meta-date">{{
                      formatDate(user.createdAt)
                    }}</span>
                  </div>
                </div>
              </div>

              <el-empty v-if="!recentUsers.length" description="暂无用户" />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 系统状态 -->
      <el-card class="system-status-card">
        <template #header>
          <div class="card-header">
            <span>系统状态</span>
            <el-tag :type="systemStatus.overall === 'healthy' ? 'success' : 'warning'">
              {{ systemStatus.overall === "healthy" ? "正常" : "警告" }}
            </el-tag>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">数据库连接</div>
              <el-tag :type="systemStatus.database ? 'success' : 'danger'">
                {{ systemStatus.database ? "正常" : "异常" }}
              </el-tag>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">Redis缓存</div>
              <el-tag :type="systemStatus.redis ? 'success' : 'danger'">
                {{ systemStatus.redis ? "正常" : "异常" }}
              </el-tag>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">文件系统</div>
              <el-tag :type="systemStatus.fileSystem ? 'success' : 'danger'">
                {{ systemStatus.fileSystem ? "正常" : "异常" }}
              </el-tag>
            </div>
          </el-col>

          <el-col :span="6">
            <div class="status-item">
              <div class="status-label">最后更新</div>
              <span class="status-time">{{
                formatTime(systemStatus.lastUpdate)
              }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  Document,
  User,
  DataAnalysis,
  Setting,
  Edit,
  TrendCharts,
} from "@element-plus/icons-vue";

import {
  getDashboardStatsApi,
  getRecentSurveysApi,
  getRecentUsersApi,
  getSystemStatusApi,
  getActivityDataApi,
  getCategoryDistributionApi,
} from "@/api/admin";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const chartsLoading = ref(false);
const dashboardData = reactive({
  totalSurveys: 0,
  totalUsers: 0,
  totalAnswers: 0,
  completionRate: 0,
  surveyTrend: 0,
  userTrend: 0,
  answerTrend: 0,
  completionTrend: 0,
});

const recentSurveys = ref([]);
const recentUsers = ref([]);
const systemStatus = reactive({
  overall: "healthy",
  database: true,
  redis: true,
  fileSystem: true,
  lastUpdate: new Date(),
});

let refreshTimer = null;

// 方法
const loadDashboardData = async () => {
  loading.value = true;
  try {
    const [stats, surveys, users, status] = await Promise.all([
      getDashboardStatsApi(),
      getRecentSurveysApi(5),
      getRecentUsersApi(5),
      getSystemStatusApi(),
    ]);

    // 更新统计数据
    Object.assign(dashboardData, stats);

    // 更新列表数据
    recentSurveys.value = surveys;
    recentUsers.value = users;

    // 更新系统状态
    Object.assign(systemStatus, status);
  } catch (error) {
    ElMessage.error("加载仪表板数据失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const loadCharts = async () => {
  chartsLoading.value = true;
  try {
    const [activityData, categoryData] = await Promise.all([
      getActivityDataApi(),
      getCategoryDistributionApi(),
    ]);

    // 这里应该使用 ECharts 或其他图表库来渲染图表
    renderActivityChart(activityData);
    renderCategoryChart(categoryData);
  } catch (error) {
    ElMessage.error("加载图表数据失败：" + error.message);
  } finally {
    chartsLoading.value = false;
  }
};

const renderActivityChart = (data) => {
  // 模拟图表渲染
  const chartElement = document.getElementById("activityChart");
  if (chartElement) {
    chartElement.innerHTML = `
      <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #666;">
        活跃度趋势图 (${data.length} 天数据)
      </div>
    `;
  }
};

const renderCategoryChart = (data) => {
  // 模拟图表渲染
  const chartElement = document.getElementById("categoryChart");
  if (chartElement) {
    chartElement.innerHTML = `
      <div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #666;">
        分类分布图 (${data.length} 个分类)
      </div>
    `;
  }
};

const refreshCharts = () => {
  loadCharts();
};

const getTrendClass = (trend) => {
  if (trend > 0) return "trend-up";
  if (trend < 0) return "trend-down";
  return "trend-stable";
};

const formatTrend = (trend) => {
  if (trend === 0) return "持平";
  const symbol = trend > 0 ? "+" : "";
  return `${symbol}${trend.toFixed(1)}%`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString("zh-CN");
};

const viewSurvey = (surveyId) => {
  router.push(`/survey/${surveyId}`);
};

// 定时刷新
const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    loadDashboardData();
  }, 60000); // 每分钟刷新一次
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

// 生命周期
onMounted(() => {
  loadDashboardData();
  loadCharts();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});
</script>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .dashboard-content {
    margin-top: 20px;
  }

  .quick-actions-card {
    margin-bottom: 20px;
  }

  .quick-btn {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stats-overview {
    margin-bottom: 20px;
  }

  .stats-card {
    height: 120px;
  }

  .stats-item {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 100%;
    padding: 16px;

    .stats-icon {
      flex-shrink: 0;
    }

    .stats-content {
      flex: 1;
    }

    .stats-number {
      font-size: 28px;
      font-weight: bold;
      color: #333;
      line-height: 1;
    }

    .stats-label {
      font-size: 14px;
      color: #666;
      margin: 4px 0;
    }

    .stats-trend {
      font-size: 12px;
    }
  }

  .trend-up {
    color: #67c23a;
  }

  .trend-down {
    color: #f56c6c;
  }

  .trend-stable {
    color: #909399;
  }

  .charts-section {
    margin-bottom: 20px;
  }

  .chart-card {
    height: 300px;
  }

  .chart-container {
    height: 200px;
    width: 100%;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .recent-card {
    height: 400px;
    margin-bottom: 20px;
  }

  .recent-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .recent-item {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }

    .item-content {
      h4 {
        margin: 0 0 4px 0;
        font-size: 14px;
        color: #333;
      }

      p {
        margin: 0 0 8px 0;
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }

      .item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .meta-date {
        font-size: 12px;
        color: #999;
      }
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .user-details {
    h4 {
      margin: 0 0 2px 0;
      font-size: 14px;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
  }

  .system-status-card {
    margin-bottom: 20px;
  }

  .status-item {
    text-align: center;
    padding: 16px;
  }

  .status-label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .status-time {
    font-size: 12px;
    color: #999;
  }

  @media (max-width: 1200px) {
    .charts-section .el-col {
      margin-bottom: 20px;
    }
  }

  @media (max-width: 768px) {
    padding: 16px;

    .stats-overview .el-col {
      margin-bottom: 12px;
    }

    .quick-actions-card .el-col {
      margin-bottom: 12px;
    }

    .stats-item {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
  }
}
</style>
