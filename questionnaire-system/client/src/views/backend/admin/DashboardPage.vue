<template>
  <div class="admin-dashboard">
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
            <el-button
              type="primary"
              size="large"
              class="quick-btn"
              @click="$router.push('/admin/questionnaires/list')"
            >
              <el-icon><DocumentAdd /></el-icon>
              问卷管理
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button
              type="success"
              size="large"
              class="quick-btn"
              @click="$router.push('/admin/users')"
            >
              <el-icon><UserFilled /></el-icon>
              人员管理
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button
              type="warning"
              size="large"
              class="quick-btn"
              @click="$router.push('/admin/questionnaires/pending')"
            >
              <el-icon><Clock /></el-icon>
              待审核问卷
            </el-button>
          </el-col>

          <el-col :span="6">
            <el-button
              type="info"
              size="large"
              class="quick-btn"
              @click="$router.push('/admin/profile')"
            >
              <el-icon><User /></el-icon>
              个人资料
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
                <el-icon size="40" color="#67d474d5">
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
                  <Clock />
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-number">
                  {{ dashboardData.pendingSurveys || 0 }}
                </div>
                <div class="stats-label">待审核问卷</div>
                <div class="stats-trend">
                  <span class="trend-info"> 需要处理 </span>
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
                <span>用户增长趋势(最近7天)</span>
                <el-button type="text" @click="refreshCharts">刷新</el-button>
              </div>
            </template>

            <div class="chart-container" v-loading="chartsLoading">
              <div class="trend-chart">
                <div
                  v-for="(count, index) in userGrowthData"
                  :key="index"
                  class="trend-bar"
                >
                  <div class="bar-value">{{ count }}</div>
                  <div
                    class="bar-fill"
                    :style="{
                      height:
                        getBarHeight(count, Math.max(...userGrowthData)) + '%',
                    }"
                  ></div>
                  <div class="bar-label">{{ getDayLabel(index) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>问卷增长趋势(最近7天)</span>
                <el-button type="text" @click="refreshCharts">刷新</el-button>
              </div>
            </template>

            <div class="chart-container" v-loading="chartsLoading">
              <div class="trend-chart">
                <div
                  v-for="(count, index) in surveyGrowthData"
                  :key="index"
                  class="trend-bar"
                >
                  <div class="bar-value">{{ count }}</div>
                  <div
                    class="bar-fill"
                    :style="{
                      height:
                        getBarHeight(count, Math.max(...surveyGrowthData)) +
                        '%',
                    }"
                  ></div>
                  <div class="bar-label">{{ getDayLabel(index) }}</div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 管理员操作记录 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card class="recent-card">
            <template #header>
              <div class="card-header">
                <span>最近操作记录</span>
                <el-button type="text" @click="loadAdminActions">
                  刷新
                </el-button>
              </div>
            </template>

            <div class="action-timeline" v-loading="loading">
              <el-timeline>
                <el-timeline-item
                  v-for="action in adminActions"
                  :key="action.id"
                  :timestamp="formatDateTime(action.timestamp)"
                  :type="getActionType(action.type)"
                >
                  <div class="action-content">
                    <div class="action-title">
                      <span class="admin-name">{{ action.adminName }}</span> -
                      {{ action.title }}
                    </div>
                    <div class="action-desc">{{ action.description }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>

              <el-empty
                v-if="!adminActions.length"
                description="暂无操作记录"
              />
            </div>
          </el-card>
        </el-col>

        <el-col :span="12">
          <el-card class="recent-card">
            <template #header>
              <div class="card-header">
                <span>热门问卷排行</span>
                <el-button type="text" @click="loadHotSurveys">
                  刷新
                </el-button>
              </div>
            </template>

            <div class="hot-surveys-list" v-loading="loading">
              <div
                v-for="(survey, index) in hotSurveys"
                :key="survey.id"
                class="hot-survey-item"
              >
                <div class="rank-badge" :class="'rank-' + (index + 1)">
                  {{ index + 1 }}
                </div>
                <div class="survey-info">
                  <div class="survey-title">{{ survey.title }}</div>
                  <div class="survey-stats">
                    <el-tag size="small" type="success"
                      >参与: {{ survey.participants || 0 }}</el-tag
                    >
                    <el-tag size="small" type="warning"
                      >评分: {{ Number(survey.rating || 0).toFixed(1) }}</el-tag
                    >
                  </div>
                </div>
              </div>

              <el-empty v-if="!hotSurveys.length" description="暂无热门问卷" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  DocumentAdd,
  UserFilled,
  Document,
  Clock,
  User,
  Edit,
  TrendCharts,
} from "@element-plus/icons-vue";

import {
  getAdminActivitiesApi,
  getAllUsersApi,
  getSurveysApi,
  getDashboardStatsApi,
} from "@/api/admin";

const router = useRouter();

// 响应式数据
const loading = ref(false);
const chartsLoading = ref(false);
const dashboardData = reactive({
  totalSurveys: 0,
  totalUsers: 0,
  totalAnswers: 0,
  pendingSurveys: 0,
  totalAnnouncements: 0,
  completionRate: 0,
  surveyTrend: 0,
  userTrend: 0,
  answerTrend: 0,
  completionTrend: 0,
});

const adminActions = ref([]);
const hotSurveys = ref([]);
const userGrowthData = ref([0, 0, 0, 0, 0, 0, 0]);
const surveyGrowthData = ref([0, 0, 0, 0, 0, 0, 0]);
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
    // 使用后端统计API获取总体数据
    const statsData = await getDashboardStatsApi();

    console.log("Dashboard stats data:", statsData);

    // 更新总体统计
    dashboardData.totalUsers = statsData.total?.users || 0;
    dashboardData.totalSurveys = statsData.total?.surveys || 0;
    dashboardData.totalAnswers = statsData.total?.answers || 0;
    dashboardData.pendingSurveys = statsData.total?.pendingSurveys || 0;
    dashboardData.totalAnnouncements = statsData.total?.comments || 0; // 暂时用评论数，后续可以添加公告统计

    // 计算完成率(已发布的问卷/总问卷)
    dashboardData.completionRate =
      dashboardData.totalSurveys > 0
        ? ((dashboardData.totalSurveys - dashboardData.pendingSurveys) /
            dashboardData.totalSurveys) *
          100
        : 0;

    // 获取用户和问卷列表用于计算增长趋势
    const [usersResult, surveysResult] = await Promise.all([
      getAllUsersApi(),
      getSurveysApi({}),
    ]);

    const users = usersResult.list;
    const surveys = surveysResult.list;

    // 计算7天增长趋势
    calculateGrowthTrends(users, surveys);

    // 加载管理员操作记录和热门问卷
    loadAdminActions();
    loadHotSurveys();

    systemStatus.lastUpdate = new Date();
  } catch (error) {
    console.error("加载数据失败:", error);
    ElMessage.error("加载仪表板数据失败");
  } finally {
    loading.value = false;
  }
};

const calculateGrowthTrends = (users, surveys) => {
  const today = new Date();
  const userCounts = [0, 0, 0, 0, 0, 0, 0];
  const surveyCounts = [0, 0, 0, 0, 0, 0, 0];

  // 统计最近7天的数据
  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (6 - i));
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    // 统计该天创建的用户
    userCounts[i] = users.filter((u) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= targetDate && createdAt < nextDate;
    }).length;

    // 统计该天创建的问卷
    surveyCounts[i] = surveys.filter((s) => {
      const createdAt = new Date(s.createdAt);
      return createdAt >= targetDate && createdAt < nextDate;
    }).length;
  }

  userGrowthData.value = userCounts;
  surveyGrowthData.value = surveyCounts;
};

const loadAdminActions = async () => {
  try {
    //  获取全量管理员操作记录
    const result = await getAdminActivitiesApi(20, null); // null 表示不过滤管理员ID，获取全量
    adminActions.value = result.list;
  } catch (error) {
    console.error("加载操作记录失败:", error);
  }
};

const loadHotSurveys = async () => {
  try {
    const result = await getSurveysApi({ status: "published" });
    const surveys = result.list;

    // 按参与人数和评分排序,取前10
    hotSurveys.value = surveys
      .filter((s) => s.status === "published")
      .sort((a, b) => {
        const scoreA = (a.participants || 0) * 0.6 + (a.rating || 0) * 0.4;
        const scoreB = (b.participants || 0) * 0.6 + (b.rating || 0) * 0.4;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  } catch (error) {
    console.error("加载热门问卷失败:", error);
  }
};

const loadCharts = async () => {
  chartsLoading.value = true;
  try {
    await loadDashboardData();
  } catch (error) {
    ElMessage.error("加载图表数据失败");
  } finally {
    chartsLoading.value = false;
  }
};

const refreshCharts = () => {
  loadCharts();
};

const getBarHeight = (value, max) => {
  if (max === 0) return 0;
  return (value / max) * 100;
};

const getDayLabel = (index) => {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() - (6 - index));
  return days[targetDate.getDay()];
};

const getActionType = (type) => {
  const typeMap = {
    create: "success",
    edit: "primary",
    delete: "danger",
    approve: "success",
    reject: "warning",
  };
  return typeMap[type] || "info";
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

const formatDateTime = (dateString) => {
  if (!dateString) return "未知时间";

  const date = new Date(dateString);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", dateString);
    return "无效时间";
  }

  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (hours < 1) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else {
    return date.toLocaleString("zh-CN");
  }
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

  .trend-info {
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
    padding: 20px 10px;
  }

  .trend-chart {
    display: flex;
    align-items: flex-end;
    justify-content: space-around;
    height: 100%;
    gap: 8px;
  }

  .trend-bar {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    position: relative;
  }

  .bar-value {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 600;
  }

  .bar-fill {
    width: 100%;
    background: linear-gradient(
      180deg,
      var(--color-primary) 0%,
      var(--color-primary-light-3) 100%
    );
    border-radius: 4px 4px 0 0;
    transition: height 0.3s ease;
    min-height: 4px;
  }

  .bar-label {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .action-timeline {
    max-height: 400px;
    overflow-y: auto;
    padding: 20px 0;
  }

  .action-content {
    .action-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .action-desc {
      font-size: 13px;
      color: #666;
    }
  }

  .hot-surveys-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px 0;
  }

  .hot-survey-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }

    .rank-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
      background: #f0f0f0;
      color: #666;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: #fff;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
        color: #fff;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32, #b8860b);
        color: #fff;
      }
    }

    .survey-info {
      flex: 1;
      min-width: 0;
    }

    .survey-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .survey-stats {
      display: flex;
      gap: 8px;
    }
  }

  .action-timeline {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 8px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background: #a8a8a8;
      }
    }

    .action-content {
      .action-title {
        font-weight: 500;
        margin-bottom: 4px;
        color: #333;

        .admin-name {
          color: #259234;
          font-weight: 600;
          margin-right: 4px;
        }
      }

      .action-desc {
        font-size: 14px;
        color: #666;
      }
    }
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

  .hot-surveys-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px 0;
  }

  .hot-survey-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #f8f9fa;
    }

    &:last-child {
      border-bottom: none;
    }

    .rank-badge {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
      background: #f0f0f0;
      color: #666;

      &.rank-1 {
        background: linear-gradient(135deg, #ffd700, #ffa500);
        color: #fff;
      }

      &.rank-2 {
        background: linear-gradient(135deg, #c0c0c0, #a8a8a8);
        color: #fff;
      }

      &.rank-3 {
        background: linear-gradient(135deg, #cd7f32, #b8860b);
        color: #fff;
      }
    }

    .survey-info {
      flex: 1;
      min-width: 0;
    }

    .survey-title {
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .survey-stats {
      display: flex;
      gap: 8px;
    }
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
