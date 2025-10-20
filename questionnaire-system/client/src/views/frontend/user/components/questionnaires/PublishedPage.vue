<template>
  <div class="published-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>已发布问卷</h2>
        <p>管理您已发布的问卷，查看数据统计和收集效果</p>
      </div>
      <div class="header-stats">
        <el-statistic title="已发布数量" :value="publishedSurveys.length" />
        <el-statistic title="累计回答" :value="totalAnswers" />
      </div>
    </div>

    <!-- 数据概览 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card success-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24" color="#67C23A"><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalViews }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card info-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24" color="#409EFF"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalParticipants }}</div>
              <div class="stat-label">参与人数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card warning-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24" color="#E6A23C"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ averageCompletion }}%</div>
              <div class="stat-label">平均完成率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card primary-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="24" color="#F56C6C"><Star /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ averageRating.toFixed(1) }}</div>
              <div class="stat-label">平均评分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-row :gutter="16">
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
        <el-col :span="5">
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
        <el-col :span="5">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            @change="handleSort"
          >
            <el-option label="发布时间" value="publishedAt" />
            <el-option label="回答数量" value="answerCount" />
            <el-option label="浏览量" value="views" />
            <el-option label="评分" value="rating" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始"
            end-placeholder="结束"
            size="default"
            format="MM-DD"
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
        class="survey-item published-item"
      >
        <div class="survey-main">
          <div class="survey-icon">
            <el-icon size="24" color="#67C23A"><CircleCheck /></el-icon>
          </div>
          
          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ survey.category }}</el-tag>
                <el-tag size="small" type="success">已发布</el-tag>
                <el-tag 
                  v-if="survey.isHot" 
                  size="small" 
                  type="danger" 
                  effect="dark"
                >
                  热门
                </el-tag>
              </div>
            </div>
            
            <div class="survey-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                发布时间：{{ formatDate(survey.publishedAt) }}
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
                浏览量：{{ survey.views }}
              </span>
            </div>
            
            <div class="survey-description">
              {{ survey.description }}
            </div>

            <!-- 数据统计 -->
            <div class="survey-stats">
              <div class="stats-row">
                <div class="stat-item">
                  <span class="stat-label">回答数</span>
                  <span class="stat-value highlight-success">{{ survey.answerCount }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">完成率</span>
                  <span class="stat-value highlight-info">{{ survey.completionRate }}%</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">平均分</span>
                  <el-rate
                    v-model="survey.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="{value}"
                    size="small"
                  />
                </div>
                <div class="stat-item">
                  <span class="stat-label">收藏数</span>
                  <span class="stat-value">{{ survey.favoriteCount }}</span>
                </div>
              </div>
            </div>

            <!-- 状态提醒 -->
            <div class="survey-alerts" v-if="survey.needsAttention">
              <el-alert
                v-if="survey.answerCount === 0"
                title="暂无人回答，建议检查问卷设置或推广方式"
                type="warning"
                size="small"
                :closable="false"
                show-icon
              />
              <el-alert
                v-if="survey.completionRate < 50"
                title="完成率较低，建议优化问卷内容或减少题目数量"
                type="info"
                size="small"
                :closable="false"
                show-icon
              />
            </div>
          </div>
        </div>

        <div class="survey-actions">
          <el-button @click="viewResults(survey.id)">
            <el-icon><DataAnalysis /></el-icon>
            查看数据
          </el-button>
          <el-button @click="shareSurvey(survey)">
            <el-icon><Share /></el-icon>
            分享
          </el-button>
          <el-dropdown @command="handleMoreAction">
            <el-button type="info">
              更多 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="{ action: 'edit', data: survey }"
                >
                  编辑问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'copy', data: survey }"
                >
                  复制问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'export', data: survey }"
                  divided
                >
                  导出数据
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'settings', data: survey }"
                >
                  问卷设置
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'close', data: survey }"
                  divided
                >
                  <span style="color: #F56C6C">停止收集</span>
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', data: survey }"
                >
                  <span style="color: #F56C6C">删除问卷</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && filteredSurveys.length === 0" 
        description="暂无已发布的问卷"
        class="empty-state"
      >
        <el-button type="primary" @click="goToCreated">
          创建新问卷
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="publishedSurveys.length > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="publishedSurveys.length"
        layout="prev, pager, next, jumper, total"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 分享对话框 -->
    <el-dialog v-model="shareDialogVisible" title="分享问卷" width="500px">
      <div class="share-content">
        <div class="share-item">
          <label>问卷链接：</label>
          <el-input 
            v-model="shareUrl" 
            readonly
            @click="selectText"
          >
            <template #append>
              <el-button @click="copyLink">复制</el-button>
            </template>
          </el-input>
        </div>
        
        <div class="share-item">
          <label>二维码：</label>
          <div class="qr-code">
            <el-image
              :src="qrCodeUrl"
              alt="问卷二维码"
              style="width: 120px; height: 120px;"
            />
          </div>
        </div>

        <div class="share-item">
          <label>社交分享：</label>
          <div class="social-share">
            <el-button @click="shareToWeChat">微信</el-button>
            <el-button @click="shareToQQ">QQ</el-button>
            <el-button @click="shareToWeibo">微博</el-button>
          </div>
        </div>
      </div>
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
  CircleCheck,
  User,
  TrendCharts,
  Star,
  Calendar,
  Document,
  Timer,
  View,
  DataAnalysis,
  Share,
  ArrowDown,
} from "@element-plus/icons-vue";

import { 
  getUserSurveysApi, 
  updateSurveyApi,
  deleteSurveyApi 
} from "@/api/survey";
import { useUserStore } from "@/store/user";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const publishedSurveys = ref([]);
const searchKeyword = ref("");
const filterCategory = ref("");
const sortBy = ref("publishedAt");
const dateRange = ref([]);
const currentPage = ref(1);
const pageSize = ref(10);

// 分享相关
const shareDialogVisible = ref(false);
const shareUrl = ref("");
const qrCodeUrl = ref("");
const currentSurvey = ref(null);

// 计算属性
const totalAnswers = computed(() => {
  return publishedSurveys.value.reduce((sum, survey) => sum + survey.answerCount, 0);
});

const totalViews = computed(() => {
  return publishedSurveys.value.reduce((sum, survey) => sum + survey.views, 0);
});

const totalParticipants = computed(() => {
  return publishedSurveys.value.reduce((sum, survey) => sum + survey.participantCount, 0);
});

const averageCompletion = computed(() => {
  if (publishedSurveys.value.length === 0) return 0;
  const total = publishedSurveys.value.reduce((sum, survey) => sum + survey.completionRate, 0);
  return Math.round(total / publishedSurveys.value.length);
});

const averageRating = computed(() => {
  if (publishedSurveys.value.length === 0) return 0;
  const total = publishedSurveys.value.reduce((sum, survey) => sum + survey.rating, 0);
  return total / publishedSurveys.value.length;
});

const filteredSurveys = computed(() => {
  let result = [...publishedSurveys.value];

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
      const date = survey.publishedAt.split("T")[0];
      return date >= start && date <= end;
    });
  }

  // 排序
  result.sort((a, b) => {
    switch (sortBy.value) {
      case "answerCount":
        return b.answerCount - a.answerCount;
      case "views":
        return b.views - a.views;
      case "rating":
        return b.rating - a.rating;
      case "publishedAt":
      default:
        return new Date(b.publishedAt) - new Date(a.publishedAt);
    }
  });

  // 分页
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return result.slice(startIndex, startIndex + pageSize.value);
});

// 方法
const loadPublishedSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      return;
    }
    
    const data = await getUserSurveysApi(userId, 'published');
    // 为每个问卷添加统计数据和标记
    publishedSurveys.value = data.map(survey => ({
      ...survey,
      answerCount: Math.floor(Math.random() * 500) + 10,
      views: Math.floor(Math.random() * 2000) + 50,
      participantCount: Math.floor(Math.random() * 300) + 8,
      completionRate: Math.floor(Math.random() * 40) + 60,
      rating: Math.random() * 2 + 3,
      favoriteCount: Math.floor(Math.random() * 50),
      isHot: Math.random() > 0.7,
      needsAttention: Math.random() > 0.6
    }));
  } catch (error) {
    ElMessage.error("加载已发布问卷失败：" + error.message);
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

const handleSort = () => {
  currentPage.value = 1;
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const refreshData = () => {
  loadPublishedSurveys();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const viewResults = (id) => {
  router.push(`/surveys/${id}/results`);
};

const shareSurvey = (survey) => {
  currentSurvey.value = survey;
  shareUrl.value = `${window.location.origin}/surveys/${survey.id}`;
  qrCodeUrl.value = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shareUrl.value)}`;
  shareDialogVisible.value = true;
};

const selectText = (event) => {
  event.target.select();
};

const copyLink = () => {
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    ElMessage.success("链接已复制到剪贴板");
  });
};

const shareToWeChat = () => {
  ElMessage.info("请使用微信扫描二维码分享");
};

const shareToQQ = () => {
  const url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(currentSurvey.value.title)}`;
  window.open(url, '_blank');
};

const shareToWeibo = () => {
  const url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(currentSurvey.value.title)}`;
  window.open(url, '_blank');
};

const goToCreated = () => {
  router.push("/profile/questionnaires/created");
};

const handleMoreAction = async ({ action, data }) => {
  switch (action) {
    case "edit":
      router.push(`/questionnaires/edit/${data.id}`);
      break;

    case "copy":
      ElMessage.info("复制功能开发中...");
      break;

    case "export":
      ElMessage.info("数据导出功能开发中...");
      break;

    case "settings":
      ElMessage.info("问卷设置功能开发中...");
      break;

    case "close":
      try {
        await ElMessageBox.confirm(
          '确定要停止收集这个问卷的回答吗？停止后用户将无法继续填写。',
          '确认停止收集',
          {
            confirmButtonText: '确定停止',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        await updateSurveyApi(data.id, { status: 'closed' });
        ElMessage.success("已停止收集问卷回答");
        loadPublishedSurveys();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error("操作失败：" + error.message);
        }
      }
      break;

    case "delete":
      try {
        await ElMessageBox.confirm(
          '确定要删除这个问卷吗？删除后所有数据将无法恢复！',
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'error'
          }
        );
        
        await deleteSurveyApi(data.id);
        ElMessage.success("问卷已删除");
        loadPublishedSurveys();
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error("删除失败：" + error.message);
        }
      }
      break;
  }
};

// 生命周期
onMounted(() => {
  loadPublishedSurveys();
});
</script>

<style scoped>
.published-page {
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
  display: flex;
  gap: 40px;
  text-align: center;
}

/* 统计卡片 */
.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.success-card {
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  color: white;
}

.info-card {
  background: linear-gradient(135deg, #409EFF 0%, #66b1ff 100%);
  color: white;
}

.warning-card {
  background: linear-gradient(135deg, #E6A23C 0%, #ebb563 100%);
  color: white;
}

.primary-card {
  background: linear-gradient(135deg, #F56C6C 0%, #f78989 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
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

.published-item {
  border-left: 4px solid #67C23A;
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
  background: #f0f9ff;
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

/* 数据统计 */
.survey-stats {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.stats-row {
  display: flex;
  gap: 24px;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.highlight-success {
  color: #67C23A;
}

.highlight-info {
  color: #409EFF;
}

/* 状态提醒 */
.survey-alerts {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 分享对话框 */
.share-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.share-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-item label {
  font-weight: 600;
  color: #303133;
}

.qr-code {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
}

.social-share {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards .el-col {
    margin-bottom: 16px;
  }
  
  .stats-row {
    flex-wrap: wrap;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .published-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-stats {
    gap: 20px;
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
  
  .stats-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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
  
  .header-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>