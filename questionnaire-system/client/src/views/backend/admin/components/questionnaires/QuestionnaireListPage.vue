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
          
          <el-select v-model="filterCategory" placeholder="分类筛选" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="满意度调查" value="satisfaction" />
            <el-option label="市场调研" value="market" />
            <el-option label="产品反馈" value="feedback" />
            <el-option label="学术研究" value="academic" />
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
            @click="viewQuestionnaire(questionnaire.id)"
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
                      <el-dropdown-item command="preview">预览</el-dropdown-item>
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

          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{row}">
              <el-button type="text" size="small" @click="editQuestionnaire(row.id)">
                编辑
              </el-button>
              <el-button type="text" size="small" @click="previewQuestionnaire(row.id)">
                预览
              </el-button>
              <el-button type="text" size="small" @click="viewStatistics(row.id)">
                统计
              </el-button>
              <el-button 
                v-if="row.status === 'published'" 
                type="text" 
                size="small" 
                @click="offlineQuestionnaire(row.id)" 
                class="warning-btn"
              >
                下架
              </el-button>
              <el-button 
                v-if="row.status === 'stopped'" 
                type="text" 
                size="small" 
                @click="onlineQuestionnaire(row.id)" 
                class="success-btn"
              >
                上架
              </el-button>
              <el-button type="text" size="small" @click="deleteQuestionnaire(row.id)" class="danger-btn">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
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
import { getSurveysApi, deleteAdminSurveyApi, updateSurveyStatusApi } from '@/api/admin'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const filterStatus = ref('')
const filterCategory = ref('')
const viewMode = ref('card')
const selectedItems = ref([])

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
} = useListFilter({ sourceList: sourceForFilter, searchFields: ['title', 'description'] })

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
  ElMessage.info('创建问卷功能待实现')
  // router.push('/admin/questionnaires/create')
}

const viewQuestionnaire = (id) => {
  ElMessage.info(`查看问卷 ${id}`)
  // router.push(`/admin/questionnaires/${id}`)
}

const editQuestionnaire = (id) => {
  ElMessage.info(`编辑问卷 ${id}`)
  // router.push(`/admin/questionnaires/${id}/edit`)
}

const previewQuestionnaire = (id) => {
  ElMessage.info(`预览问卷 ${id}`)
}

const viewStatistics = (id) => {
  ElMessage.info(`查看统计 ${id}`)
  // router.push(`/admin/questionnaires/${id}/statistics`)
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
      await deleteAdminSurveyApi(id)
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
      previewQuestionnaire(questionnaire.id)
      break
    case 'copy':
      ElMessage.info(`复制问卷 ${questionnaire.id}`)
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
    questionnaireList.value = response.list || response || []
  } catch (error) {
    ElMessage.error('加载问卷列表失败：' + error.message)
    questionnaireList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 从 json-server 加载数据
  loadQuestionnaires()
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

  /* 卡片视图 */
  .questionnaire-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px; }

  .questionnaire-card {
    border: 1px solid #e8e8e8; border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.3s ease; background: #fff;

    &:hover { border-color: #409eff; box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15); transform: translateY(-2px); }

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
  .title-text { font-weight: 500; color: #409eff; cursor: pointer; &:hover { text-decoration: underline; } }
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