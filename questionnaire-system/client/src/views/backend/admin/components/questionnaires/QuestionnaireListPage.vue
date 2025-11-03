<template>
  <div class="questionnaire-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>问卷列表</h1>
        <p>管理所有系统中的问卷</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createQuestionnaire">
          <el-icon><Plus /></el-icon>
          创建问卷
        </el-button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问卷标题或描述"
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="filter-right">
          <el-select v-model="filterStatus" placeholder="状态筛选" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已停止" value="stopped" />
          </el-select>
          
          <el-select v-model="filterCategory" placeholder="分类筛选" style="width: 140px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option 
              v-for="cat in categories" 
              :key="cat.slug" 
              :label="cat.name" 
              :value="cat.slug" 
            />
          </el-select>

          <el-button @click="resetFilters">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 问卷列表 -->
    <el-card class="list-card" shadow="never">
      <div class="list-header">
        <div class="list-info">
          <span>共 {{ total }} 个问卷</span>
        </div>
        <div class="list-actions">
          <el-button-group>
            <el-button 
              :type="viewMode === 'card' ? 'primary' : ''" 
              @click="viewMode = 'card'"
              size="small"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button 
              :type="viewMode === 'table' ? 'primary' : ''" 
              @click="viewMode = 'table'"
              size="small"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 卡片视图 -->
      <div v-if="viewMode === 'card'" class="card-view" v-loading="loading">
        <div class="questionnaire-grid">
          <div 
            v-for="questionnaire in paginatedList"
            :key="questionnaire.id"
            class="questionnaire-card"
          >
            <div class="card-header">
              <div class="card-status">
                <el-tag 
                  :type="getStatusType(questionnaire.status)" 
                  size="small"
                >
                  {{ getStatusText(questionnaire.status) }}
                </el-tag>
              </div>
              <div class="card-actions">
                <el-dropdown @command="(command) => handleAction(command, questionnaire)">
                  <el-button type="text" size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="copy">复制</el-dropdown-item>
                      <el-dropdown-item command="statistics">统计</el-dropdown-item>
                      <el-dropdown-item command="offline" v-if="questionnaire.status === 'published'">下架</el-dropdown-item>
                      <el-dropdown-item command="online" v-if="questionnaire.status === 'stopped'">上架</el-dropdown-item>
                      <el-dropdown-item divided command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="card-content">
              <h3 class="card-title">{{ questionnaire.title }}</h3>
              <p class="card-description">{{ questionnaire.description || '暂无描述' }}</p>
            </div>

            <div class="card-footer">
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ questionnaire.participants || questionnaire.participantCount || 0 }}
                </span>
                <span class="stat-item">
                  <el-icon><EditPen /></el-icon>
                  {{ questionnaire.responseCount || questionnaire.responses || 0 }}
                </span>
              </div>
              <div class="card-meta">
                <span class="meta-date">{{ formatDate(questionnaire.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!paginatedList.length && !loading" description="暂无问卷数据">
          <el-button type="primary" @click="createQuestionnaire">创建第一个问卷</el-button>
        </el-empty>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <el-table 
          :data="paginatedList" 
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="title" label="标题" min-width="200">
            <template #default="{row}">
              <div class="title-cell">
                <span class="title-text" @click="viewQuestionnaire(row.id)">{{ row.title }}</span>
                <span class="title-description">{{ row.description }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100">
            <template #default="{row}">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="category" label="分类" width="120">
            <template #default="{row}">
              <el-tag type="info" size="small">{{ row.category || '未分类' }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="participants" label="参与人数" width="100">
            <template #default="{row}">
              {{ row.participants || row.participantCount || 0 }}
            </template>
          </el-table-column>
          
          <el-table-column prop="responseCount" label="回答数" width="100">
            <template #default="{row}">
              {{ row.responseCount || row.responses || 0 }}
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{row}">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{row}">
              <div class="table-actions">
                <el-button type="primary" size="small" @click="editQuestionnaire(row.id)">
                  编辑
                </el-button>
                <el-button type="info" size="small" @click="viewStatistics(row.id)">
                  统计
                </el-button>
                <el-button type="success" size="small" @click="copyQuestionnaire(row.id)">
                  复制
                </el-button>
                <el-button 
                  v-if="row.status === 'published'" 
                  type="warning" 
                  size="small" 
                  @click="offlineQuestionnaire(row.id)"
                >
                  下架
                </el-button>
                <el-button 
                  v-if="row.status === 'stopped'" 
                  type="success" 
                  size="small" 
                  @click="onlineQuestionnaire(row.id)"
                >
                  上架
                </el-button>
                <el-button type="danger" size="small" @click="deleteQuestionnaire(row.id)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="filteredTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 统计弹窗 -->
    <el-dialog
      v-model="statisticsDialogVisible"
      title="问卷统计"
      width="800px"
      :destroy-on-close="true"
    >
      <div v-loading="loadingStatistics" class="statistics-content">
        <el-row :gutter="20" class="stats-overview">
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-label">总参与人数</div>
              <div class="stat-value">{{ currentStats.participants || 0 }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-label">平均评分</div>
              <div class="stat-value">{{ (currentStats.rating || 0).toFixed(1) }}</div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stat-card">
              <div class="stat-label">完成率</div>
              <div class="stat-value">{{ ((currentStats.responses / currentStats.participants * 100) || 0).toFixed(0) }}%</div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="stats-details">
          <h4>详细信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="问卷标题">{{ currentStats.title }}</el-descriptions-item>
            <el-descriptions-item label="问卷状态">
              <el-tag :type="getStatusType(currentStats.status)">
                {{ getStatusText(currentStats.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ formatDateTime(currentStats.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(currentStats.updatedAt) }}</el-descriptions-item>
            <el-descriptions-item label="问题数量">{{ currentStats.questions?.length || 0 }}</el-descriptions-item>
            <el-descriptions-item label="预估时长">{{ currentStats.duration || 0 }} 分钟</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <template #footer>
        <el-button @click="statisticsDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useListFilter } from '@/hooks/useListFilter'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  Grid,
  List,
  MoreFilled,
  View,
  EditPen
} from '@element-plus/icons-vue'
import { getSurveysApi, deleteAdminSurveyApi, updateSurveyStatusApi, recordAdminActivity } from '@/api/admin'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const filterStatus = ref('')
const filterCategory = ref('')
const viewMode = ref('card')
const selectedItems = ref([])
const statisticsDialogVisible = ref(false)
const loadingStatistics = ref(false)
const currentStats = ref({})
const categories = ref([])

// 从 json-server 获取的问卷列表
const questionnaireList = ref([])

// 计算属性
// 构造传入 hooks 的源数据（先按 status/category 预过滤）
const sourceForFilter = computed(() => {
  let list = questionnaireList.value
  if (filterStatus.value) list = list.filter(item => item.status === filterStatus.value)
  if (filterCategory.value) list = list.filter(item => item.category === filterCategory.value)
  return list
})

const {
  searchKeyword,
  currentPage,
  pageSize,
  filteredList: paginatedList,
  filteredTotal,
  handleSearch,
  handleFilter,
  handlePageChange
} = useListFilter({ 
  sourceList: sourceForFilter, 
  searchFields: ['title', 'description'],
  initialPageSize: 12  // 默认每页12条
})

const total = computed(() => filteredTotal)

// 方法
// handleSearch / handleFilter 来自 useListFilter

const resetFilters = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterCategory.value = ''
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

// 使用 hook 提供的 handlePageChange

const handleSelectionChange = (val) => {
  selectedItems.value = val
}

const getStatusType = (status) => {
  const statusMap = {
    draft: 'info',
    pending: 'warning',
    published: 'success',
    stopped: 'danger',
    active: 'success'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    draft: '草稿',
    pending: '待审核',
    published: '已发布',
    stopped: '已停止',
    active: '进行中'
  }
  return statusMap[status] || '未知'
}

const getCategoryText = (category) => {
  const categoryMap = {
    satisfaction: '满意度调查',
    market: '市场调研',
    feedback: '产品反馈',
    academic: '学术研究'
  }
  return categoryMap[category] || '其他'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const createQuestionnaire = () => {
  // 跳转到管理员专用的创建页面
  router.push('/admin/questionnaires/create')
}

const editQuestionnaire = (id) => {
  // 跳转到管理员专用的编辑页面
  router.push(`/admin/questionnaires/edit/${id}`)
}

const viewStatistics = async (id) => {
  // 显示统计弹窗而不是跳转
  try {
    statisticsDialogVisible.value = true
    loadingStatistics.value = true
    
    // 从 db.json 获取问卷详情
    const response = await fetch(`http://localhost:3002/surveys/${id}`)
    const survey = await response.json()
    
    currentStats.value = survey
  } catch (error) {
    ElMessage.error('获取统计数据失败：' + error.message)
  } finally {
    loadingStatistics.value = false
  }
}

const showStatisticsDialog = viewStatistics

const copyQuestionnaire = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要复制这个问卷吗？复制后将创建一个新的草稿问卷。',
      '确认复制',
      {
        confirmButtonText: '复制',
        cancelButtonText: '取消',
        type: 'info',
      }
    )
    
    // 获取原问卷数据
    const response = await fetch(`http://localhost:3002/surveys/${id}`)
    const originalSurvey = await response.json()
    
    // 创建新问卷(复制数据)
    const newSurvey = {
      ...originalSurvey,
      id: Date.now(), // 新ID
      title: `${originalSurvey.title} (复制)`,
      status: 'published', // 管理员复制的问卷直接发布
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participants: 0,
      responses: 0,
      responseCount: 0
    }
    
    // 保存新问卷
    await fetch('http://localhost:3002/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSurvey)
    })
    
    // 记录管理员操作
    await recordAdminActivity({
      adminId: userStore.profile.id,
      adminName: userStore.profile.nickname || userStore.profile.username,
      title: '复制问卷',
      description: `复制了问卷"${originalSurvey.title}"`,
      type: 'questionnaire_copy'
    })
    
    ElMessage.success('问卷复制成功')
    await loadQuestionnaires()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('复制失败：' + error.message)
    }
  }
}

const offlineQuestionnaire = async (id) => {
  ElMessageBox.confirm(
    '确定要下架这个问卷吗？下架后用户将无法访问。',
    '确认下架',
    {
      confirmButtonText: '下架',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await updateSurveyStatusApi(id, 'stopped')
      ElMessage.success('下架成功')
      // 重新加载数据
      await loadQuestionnaires()
    } catch (error) {
      ElMessage.error('下架失败：' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消下架')
  })
}

const onlineQuestionnaire = async (id) => {
  ElMessageBox.confirm(
    '确定要重新上架这个问卷吗？上架后用户可以正常访问。',
    '确认上架',
    {
      confirmButtonText: '上架',
      cancelButtonText: '取消',
      type: 'success',
    }
  ).then(async () => {
    try {
      await updateSurveyStatusApi(id, 'published')
      ElMessage.success('上架成功')
      // 重新加载数据
      await loadQuestionnaires()
    } catch (error) {
      ElMessage.error('上架失败：' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消上架')
  })
}

const deleteQuestionnaire = async (id) => {
  ElMessageBox.confirm(
    '确定要删除这个问卷吗？删除后将无法恢复。',
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      // 先获取问卷信息用于记录
      const response = await fetch(`http://localhost:3002/surveys/${id}`)
      const survey = await response.json()
      
      await deleteAdminSurveyApi(id)
      
      // 记录管理员操作
      await recordAdminActivity({
        adminId: userStore.profile.id,
        adminName: userStore.profile.nickname || userStore.profile.username,
        title: '删除问卷',
        description: `删除了问卷"${survey.title}"`,
        type: 'questionnaire_delete'
      })
      
      ElMessage.success('删除成功')
      // 重新加载数据
      await loadQuestionnaires()
    } catch (error) {
      ElMessage.error('删除失败：' + error.message)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleAction = (command, questionnaire) => {
  switch (command) {
    case 'edit':
      editQuestionnaire(questionnaire.id)
      break
    case 'preview':
      // 删除预览功能
      break
    case 'copy':
      copyQuestionnaire(questionnaire.id)
      break
    case 'statistics':
      viewStatistics(questionnaire.id)
      break
    case 'offline':
      offlineQuestionnaire(questionnaire.id)
      break
    case 'online':
      onlineQuestionnaire(questionnaire.id)
      break
    case 'delete':
      deleteQuestionnaire(questionnaire.id)
      break
  }
}

// 加载问卷列表
const loadQuestionnaires = async () => {
  loading.value = true
  try {
    const response = await getSurveysApi()
    let list = response.list || response || []
    
    // 按创建时间倒序排列
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    questionnaireList.value = list
  } catch (error) {
    ElMessage.error('加载问卷列表失败：' + error.message)
    questionnaireList.value = []
  } finally {
    loading.value = false
  }
}

// 加载分类列表
const loadCategories = async () => {
  try {
    const response = await fetch('http://localhost:3002/categories')
    categories.value = await response.json()
  } catch (error) {
    console.error('加载分类失败:', error)
    categories.value = []
  }
}

onMounted(() => {
  // 从 json-server 加载数据
  loadQuestionnaires()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.questionnaire-list-page {
  padding: 0;

  /* 页面头部 */
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    .header-content {
      h1 { margin: 0 0 8px 0; font-size: 28px; font-weight: 600; color: #1a202c; }
      p { margin: 0; color: #718096; font-size: 16px; }
    }
  }

  /* 筛选卡片 */
  .filter-card {
    margin-bottom: 24px;
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

    .filter-content { display: flex; justify-content: space-between; align-items: center; }
    .filter-right { display: flex; gap: 12px; align-items: center; }
  }

  /* 列表卡片 */
  .list-card { border-radius: 12px; border: none; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); }

  .list-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 16px 0; border-bottom: 1px solid #f0f0f0;

    .list-info { color: #666; font-size: 14px; }
  }

  /* 表格操作按钮竖排显示 */
  .table-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;

    .el-button {
      width: 100%;
      margin: 0;
    }

    .el-button--small {
      padding: 5px 12px;
      font-size: 12px;
    }
  }

  /* 统计弹窗样式 */
  .statistics-content {
    .stats-overview {
      margin-bottom: 24px;

      .stat-card {
        text-align: center;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: #fff;

        .stat-label {
          font-size: 14px;
          margin-bottom: 8px;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
        }
      }
    }

    .stats-details {
      h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        color: #333;
      }
    }
  }

  :deep(.el-col:nth-child(2) .stat-card) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  :deep(.el-col:nth-child(3) .stat-card) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  /* 卡片视图 */
  .questionnaire-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px; }

  .questionnaire-card {
    border: 1px solid #e8e8e8; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; background: #fff;

    &:hover { border-color: var(--color-primary-light-3); box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15); transform: translateY(-2px); }

    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-content { margin-bottom: 16px; }

    .card-title { margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1a202c; line-height: 1.4; }
    .card-description { margin: 0; font-size: 14px; color: #666; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; }
    .card-stats { display: flex; gap: 16px; }
    .stat-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #666; }
    .meta-date { font-size: 12px; color: #999; }
  }

  /* 表格视图 */
  .title-cell { display: flex; flex-direction: column; gap: 4px; }
  .title-text { font-weight: 500; color: var(--color-primary-light-3); cursor: pointer; &:hover { text-decoration: underline; } }
  .title-description { font-size: 12px; color: #999; line-height: 1.4; }

  .success-btn { color: #67c23a !important; &:hover { background-color: rgba(103, 194, 58, 0.1); } }
  .warning-btn { color: #e6a23c !important; &:hover { background-color: rgba(230, 162, 60, 0.1); } }
  .danger-btn { color: #f56c6c !important; &:hover { background-color: rgba(245, 108, 108, 0.1); } }

  /* 分页 */
  .pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #f0f0f0; }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    .filter-content { flex-direction: column; gap: 16px; align-items: stretch; }
    .filter-right { justify-content: flex-start; flex-wrap: wrap; }
    .questionnaire-grid { grid-template-columns: 1fr; }
    .list-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
}
</style>