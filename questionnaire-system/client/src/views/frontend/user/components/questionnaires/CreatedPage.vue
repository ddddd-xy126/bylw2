<template>
  <div class="created-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-info">
        <h2>我创建的问卷</h2>
        <p>管理您创建的所有问卷，包括草稿、待审核和已发布的问卷</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createNewSurvey">
          <el-icon><Plus /></el-icon>
          创建新问卷
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-section">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon draft">
              <el-icon><EditPen /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ draftCount }}</div>
              <div class="stat-label">草稿</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ pendingCount }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ rejectedCount }}</div>
              <div class="stat-label">已退回</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon published">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ publishedCount }}</div>
              <div class="stat-label">已发布</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
            v-model="filterStatus"
            placeholder="问卷状态"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部状态" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="待审核" value="pending" />
            <el-option label="已退回" value="rejected" />
            <el-option label="已发布" value="published" />
          </el-select>
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
        class="survey-item"
        :class="[
          { 'status-draft': survey.status === 'draft' },
          { 'status-pending': survey.status === 'pending' },
          { 'status-rejected': survey.status === 'rejected' },
          { 'status-published': survey.status === 'published' }
        ]"
      >
        <div class="survey-main">
          <div class="survey-icon" :class="`icon-${survey.status}`">
            <el-icon size="24">
              <EditPen v-if="survey.status === 'draft'" />
              <Clock v-else-if="survey.status === 'pending'" />
              <CircleClose v-else-if="survey.status === 'rejected'" />
              <CircleCheck v-else-if="survey.status === 'published'" />
              <Document v-else />
            </el-icon>
          </div>
          
          <div class="survey-info">
            <div class="survey-header">
              <h3 class="survey-title">{{ survey.title }}</h3>
              <div class="survey-badges">
                <el-tag size="small" type="primary">{{ survey.category }}</el-tag>
                <el-tag size="small" :type="getStatusTagType(survey.status)">
                  {{ getStatusText(survey.status) }}
                </el-tag>
              </div>
            </div>
            
            <!-- 退回原因提示 -->
            <el-alert
              v-if="survey.status === 'rejected' && survey.rejectedReason"
              type="error"
              :closable="false"
              class="rejected-alert"
            >
              <template #title>
                <div class="rejected-reason">
                  <strong>退回原因：</strong>{{ survey.rejectedReason }}
                </div>
              </template>
            </el-alert>
            
            <div class="survey-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                创建时间：{{ formatDate(survey.createdAt) }}
              </span>
              <span class="meta-item">
                <el-icon><Edit /></el-icon>
                更新时间：{{ formatDate(survey.updatedAt) }}
              </span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                题目数：{{ survey.questions }}题
              </span>
              <span class="meta-item" v-if="survey.status === 'published'">
                <el-icon><User /></el-icon>
                参与人数：{{ survey.participantCount }}人
              </span>
              <span class="meta-item" v-if="survey.status === 'published' && survey.averageRating > 0">
                <el-icon><Star /></el-icon>
                评分：{{ survey.averageRating }}分 ({{ survey.ratingCount }}人评价)
              </span>
            </div>
            
            <div class="survey-description">
              {{ survey.description }}
            </div>
          </div>
        </div>

        <div class="survey-actions">
          <!-- 草稿状态 -->
          <template v-if="survey.status === 'draft'">
            <el-button type="primary" size="default" @click="editSurvey(survey.id)">
              <el-icon><Edit /></el-icon>
              继续编辑
            </el-button>
            <el-button type="success" size="default" @click="publishSurvey(survey.id)">
              <el-icon><Upload /></el-icon>
              提交审核
            </el-button>
          </template>
          
          <!-- 退回状态 -->
          <template v-else-if="survey.status === 'rejected'">
            <el-button type="primary" @click="editSurvey(survey.id)">
              <el-icon><Edit /></el-icon>
              修改后重新提交
            </el-button>
          </template>
          
          <!-- 待审核状态 -->
          <template v-else-if="survey.status === 'pending'">
            <el-button type="warning" disabled>
              <el-icon><Clock /></el-icon>
              审核中
            </el-button>
            <el-button @click="editSurvey(survey.id)">
              <el-icon><Edit /></el-icon>
              查看
            </el-button>
          </template>
          
          <!-- 已发布状态 -->
          <template v-else-if="survey.status === 'published'">
            <el-button type="success" @click="viewSurvey(survey.id)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
          </template>

          <el-dropdown @command="handleMoreAction">
            <el-button type="other">
              更多 <el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="{ action: 'edit', data: survey }"
                  v-if="survey.status === 'pending'"
                >
                  编辑问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'share', data: survey }"
                  v-if="survey.status === 'published'"
                >
                  分享问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'copy', data: survey }"
                >
                  复制问卷
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', data: survey }"
                  divided
                  class="danger-item"
                >
                  删除问卷
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && filteredSurveys.length === 0" 
        description="暂无创建的问卷"
        class="empty-state"
      >
        <el-button type="primary" @click="createNewSurvey">
          创建第一个问卷
        </el-button>
      </el-empty>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper" v-if="totalCount > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalCount"
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
  Plus,
  Search,
  Refresh,
  EditPen,
  Clock,
  CircleCheck,
  CircleClose,
  Document,
  Calendar,
  Edit,
  User,
  Upload,
  View,
  TrendCharts,
  ArrowDown,
  WarningFilled,
  Delete,
  Star,
} from "@element-plus/icons-vue";

import { useUserStore } from "@/store/user";
import { useListFilter } from "@/hooks/useListFilter";
import apiClient from "@/api/index";
import { 
  getUserSurveysApi, 
  updateSurveyApi, 
  createSurveyApi, 
  getCategoriesApi,
  publishSurveyApi
} from "@/api/survey";

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(false);
const surveys = ref([]);
const categories = ref([]);
const filterStatus = ref("");

// 使用 useListFilter 处理搜索/分类/分页（status 单独保留）
const sourceForFilter = computed(() => {
  return surveys.value.filter(s => !filterStatus.value || s.status === filterStatus.value);
});

const {
  searchKeyword,
  filterCategory,
  dateRange,
  currentPage,
  pageSize,
  filteredList: filteredSurveys,
  totalItems: totalCount,
  handleSearch,
  handleFilter,
  handlePageChange,
} = useListFilter({ sourceList: sourceForFilter, searchFields: ["title"] });

// 计算属性
const draftCount = computed(() => surveys.value.filter(s => s.status === 'draft').length);
const pendingCount = computed(() => surveys.value.filter(s => s.status === 'pending').length);
const rejectedCount = computed(() => surveys.value.filter(s => s.status === 'rejected').length);
const publishedCount = computed(() => surveys.value.filter(s => s.status === 'published').length);

// 方法
const loadCategories = async () => {
  try {
    categories.value = await getCategoriesApi();
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

const loadCreatedSurveys = async () => {
  loading.value = true;
  try {
    const userId = userStore.profile?.id;
    if (!userId) {
      ElMessage.error("请先登录");
      surveys.value = [];
      return;
    }
    
    // 使用 API 获取当前用户创建的所有问卷
    const userSurveys = await getUserSurveysApi(userId);
    
    // 格式化数据
    surveys.value = userSurveys.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      status: q.status,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
      questions: q.questions || (q.questionList || []).length,
      participantCount: q.participantCount || 0,
      shareCount: q.shareCount || 0,
      rejectedReason: q.rejectedReason || '',
      rejectedAt: q.rejectedAt || null,
      averageRating: q.averageRating || 0,
      ratingCount: q.ratingCount || 0
    }));
  } catch (error) {
    console.error('加载问卷失败:', error);
    ElMessage.error("加载问卷失败：" + error.message);
    surveys.value = [];
  } finally {
    loading.value = false;
  }
};

// handleSearch/handleFilter/handlePageChange 来自 useListFilter

const refreshData = () => {
  loadCreatedSurveys();
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("zh-CN");
};

const getStatusText = (status) => {
  const statusMap = {
    draft: "草稿",
    pending: "待审核",
    rejected: "已退回",
    published: "已发布"
  };
  return statusMap[status] || "未知";
};

const getStatusTagType = (status) => {
  const typeMap = {
    draft: "info",
    pending: "warning",
    rejected: "danger",
    published: "success"
  };
  return typeMap[status] || "info";
};

const createNewSurvey = () => {
  router.push("/create");
};

const editSurvey = (id) => {
  router.push(`/create/edit/${id}`);
};

const viewSurvey = (id) => {
  router.push(`/surveys/${id}`);
};


const publishSurvey = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要提交此问卷进行审核吗？提交后将无法修改。',
      '确认提交',
      {
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 使用发布API获取积分奖励
    const result = await publishSurveyApi(id);
    
    // 更新用户积分
    if (result.pointsEarned) {
      const currentProfile = userStore.profile;
      if (currentProfile) {
        currentProfile.points = (currentProfile.points || 0) + result.pointsEarned;
        userStore.setProfile(currentProfile);
      }
      ElMessage.success(`问卷已提交审核！获得 ${result.pointsEarned} 积分`);
    } else {
      ElMessage.success("问卷已提交审核");
    }
    
    await loadCreatedSurveys();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布问卷失败:', error);
      ElMessage.error("提交失败");
    }
  }
};

const handleMoreAction = async ({ action, data }) => {
  switch (action) {
    case "edit":
      router.push(`/questionnaires/edit/${data.id}`);
      break;

    case "share":
      navigator.clipboard.writeText(
        `${window.location.origin}/surveys/${data.id}`
      );
      
      // 分享问卷奖励5积分
      try {
        const user = await apiClient.get(`/users/${userStore.profile.id}`);
        await apiClient.patch(`/users/${userStore.profile.id}`, {
          points: (user.points || 0) + 5
        });
        
        // 更新本地用户积分
        const currentProfile = userStore.profile;
        if (currentProfile) {
          currentProfile.points = (currentProfile.points || 0) + 5;
          userStore.setProfile(currentProfile);
        }
        
        ElMessage.success("问卷链接已复制到剪贴板！获得 5 积分");
      } catch (error) {
        console.error('更新分享积分失败:', error);
        ElMessage.success("问卷链接已复制到剪贴板");
      }
      break;

    case "copy":
      try {
        // 使用 API 获取完整的问卷数据
        const surveyData = await getSurveyDetail(data.id);
        
        // 创建新的问卷副本
        const newSurveyData = {
          title: `${surveyData.title} - 副本`,
          description: surveyData.description,
          category: surveyData.category,
          categoryId: surveyData.categoryId,
          author: surveyData.author,
          authorId: userStore.profile?.id,
          questions: surveyData.questions?.length || 0,
          estimatedTime: surveyData.duration,
          difficulty: surveyData.difficulty,
          tags: surveyData.tags || [],
          thumbnail: surveyData.thumbnail,
          questionList: surveyData.questionList?.map(question => ({
            ...question,
            options: question.options?.map(option => ({
              ...option,
              selectedCount: 0
            }))
          })) || []
        };
        
        // 使用 API 创建新问卷
        await createSurveyApi(newSurveyData);
        
        ElMessage.success('问卷已复制为草稿，可以在草稿中查看');
        await loadCreatedSurveys();
      } catch (error) {
        console.error('复制问卷失败:', error);
        ElMessage.error('复制失败：' + error.message);
      }
      break;

    case "delete":
      try {
        await ElMessageBox.confirm(
          '确定要删除这个问卷吗？删除后将移至回收站，30天内可恢复。',
          '确认删除',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning'
          }
        );
        
        // 使用后端删除接口,后端会自动移到回收站
        await apiClient.delete(`/surveys/${data.id}`);
        
        ElMessage.success("问卷已移至回收站");
        await loadCreatedSurveys();
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除问卷失败:', error);
          ElMessage.error("删除失败：" + error.message);
        }
      }
      break;
  }
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadCreatedSurveys();
});
</script>

<style scoped lang="scss">
.created-page {
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

/* 统计卡片 */
.stats-section {
  margin-bottom: 20px;

  .el-col {
    @media (max-width: 768px) {
      margin-bottom: 16px;
    }
  }

  .stat-card {
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;

      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;

        &.draft {
          background: linear-gradient(135deg, #909399, #b1b3b8);
        }

        &.pending {
          background: linear-gradient(135deg, #E6A23C, #ebb563);
        }

        &.rejected {
          background: linear-gradient(135deg, #F56C6C, #f78989);
        }

        &.published {
          background: linear-gradient(135deg, #67C23A, #85ce61);
        }

        &.total {
          background: linear-gradient(135deg, var(--color-primary-light-3), #66b1ff);
        }
      }

      .stat-info {
        flex: 1;

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #303133;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #606266;
          margin-top: 4px;
        }
      }
    }
  }
}

/* 退回原因提示框 */
.rejected-alert {
  margin: 12px 0;

  .rejected-reason {
    line-height: 1.6;
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
    border-left: 4px solid transparent;
    gap: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 16px;
    }

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    &.status-draft {
      border-left-color: #909399;
    }

    &.status-pending {
      border-left-color: #E6A23C;
    }

    &.status-rejected {
      border-left-color: #F56C6C;
    }

    &.status-published {
      border-left-color: #67C23A;
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
        border-radius: 12px;
        flex-shrink: 0;
        background: var(--color-primary-light-5);

        .el-icon {
          color: var(--color-primary);
        }

        // 草稿状态 - 灰色
        &.icon-draft {
          background: #f4f4f5;
          .el-icon {
            color: #909399;
          }
        }

        // 待审核状态 - 橙色
        &.icon-pending {
          background: #fdf6ec;
          .el-icon {
            color: #E6A23C;
          }
        }

        // 已退回状态 - 红色
        &.icon-rejected {
          background: #fef0f0;
          .el-icon {
            color: #F56C6C;
          }
        }

        // 已发布状态 - 绿色
        &.icon-published {
          background: #f0f9ff;
          .el-icon {
            color: #67C23A;
          }
        }
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
            display: -webkit-box;
            -webkit-line-clamp: 1;
            line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
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

      .danger-item {
        color: #f56c6c;
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
</style>