<template>
  <div class="question-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>题目管理</h1>
        <p>管理问卷题目库，创建和编辑题目模板</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="createQuestion">
          <el-icon><Plus /></el-icon>
          创建题目
        </el-button>
        <el-button @click="importQuestions">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <el-statistic title="题目总数" :value="totalQuestions" />
      </el-card>
      <el-card class="stat-card">
        <el-statistic title="分类数量" :value="totalCategories" />
      </el-card>
      <el-card class="stat-card">
        <el-statistic title="使用中" :value="activeQuestions" />
      </el-card>
      <el-card class="stat-card">
        <el-statistic title="模板数量" :value="templateCount" />
      </el-card>
    </div>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索题目内容"
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="filterType" placeholder="题目类型" style="width: 140px" @change="handleFilter">
            <el-option label="全部类型" value="" />
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="text" />
            <el-option label="评分题" value="rating" />
            <el-option label="矩阵题" value="matrix" />
          </el-select>

          <el-select v-model="filterCategory" placeholder="题目分类" style="width: 140px" @change="handleFilter">
            <el-option label="全部分类" value="" />
            <el-option label="满意度" value="satisfaction" />
            <el-option label="基本信息" value="basic" />
            <el-option label="偏好调查" value="preference" />
            <el-option label="行为分析" value="behavior" />
            <el-option label="其他" value="other" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-button-group>
            <el-button @click="batchDelete" :disabled="!selectedItems.length">
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button @click="batchExport" :disabled="!selectedItems.length">
              <el-icon><Download /></el-icon>
              批量导出
            </el-button>
          </el-button-group>
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </div>
    </el-card>

    <!-- 题目列表 -->
    <el-card class="list-card" shadow="never">
      <div class="list-header">
        <div class="list-info">
          <span>共 {{ total }} 个题目</span>
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
        <div class="question-grid">
          <div 
            v-for="question in paginatedList"
            :key="question.id"
            class="question-card"
            @click="viewQuestion(question.id)"
          >
            <div class="card-header">
              <div class="card-badges">
                <el-tag 
                  :type="getTypeTagType(question.type)" 
                  size="small"
                >
                  {{ getTypeText(question.type) }}
                </el-tag>
                <el-tag 
                  type="info" 
                  size="small"
                >
                  {{ getCategoryText(question.category) }}
                </el-tag>
              </div>
              <div class="card-actions">
                <el-dropdown @command="(command) => handleAction(command, question)">
                  <el-button type="text" size="small">
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="preview">预览</el-dropdown-item>
                      <el-dropdown-item command="copy">复制</el-dropdown-item>
                      <el-dropdown-item command="template">保存为模板</el-dropdown-item>
                      <el-dropdown-item divided command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <div class="card-content">
              <h3 class="question-title">{{ question.title }}</h3>
              <div class="question-preview" v-if="question.options && question.options.length">
                <div class="option-preview">
                  <span v-for="(option, index) in question.options.slice(0, 3)" :key="index" class="option-item">
                    {{ option.text }}
                  </span>
                  <span v-if="question.options.length > 3" class="more-options">
                    +{{ question.options.length - 3 }} 更多
                  </span>
                </div>
              </div>
              <div v-else-if="question.type === 'text'" class="question-preview">
                <el-input placeholder="文本输入框预览" disabled size="small" />
              </div>
              <div v-else-if="question.type === 'rating'" class="question-preview">
                <el-rate disabled :max="question.maxRating || 5" />
              </div>
            </div>

            <div class="card-footer">
              <div class="card-stats">
                <span class="stat-item">
                  <el-icon><View /></el-icon>
                  {{ question.usageCount || 0 }}
                </span>
                <span class="stat-item" v-if="question.isTemplate">
                  <el-icon><Star /></el-icon>
                  模板
                </span>
              </div>
              <div class="card-meta">
                <span class="meta-date">{{ formatDate(question.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="!paginatedList.length && !loading" description="暂无题目数据">
          <el-button type="primary" @click="createQuestion">创建第一个题目</el-button>
        </el-empty>
      </div>

      <!-- 表格视图 -->
      <div v-if="viewMode === 'table'" class="table-view">
        <el-table 
          :data="paginatedList" 
          v-loading="loading"
          @selection-change="handleSelectionChange"
          row-key="id"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="title" label="题目内容" min-width="250">
            <template #default="{row}">
              <div class="title-cell">
                <span class="title-text" @click="viewQuestion(row.id)">{{ row.title }}</span>
                <div class="title-tags">
                  <el-tag :type="getTypeTagType(row.type)" size="small">
                    {{ getTypeText(row.type) }}
                  </el-tag>
                  <el-tag type="info" size="small">{{ getCategoryText(row.category) }}</el-tag>
                  <el-tag v-if="row.isTemplate" type="warning" size="small">模板</el-tag>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="options" label="选项预览" width="200">
            <template #default="{row}">
              <div v-if="row.options && row.options.length" class="options-preview">
                <span v-for="(option, index) in row.options.slice(0, 2)" :key="index" class="option-tag">
                  {{ option.text }}
                </span>
                <span v-if="row.options.length > 2" class="more-tag">
                  +{{ row.options.length - 2 }}
                </span>
              </div>
              <span v-else-if="row.type === 'text'" class="text-preview">文本输入</span>
              <span v-else-if="row.type === 'rating'" class="rating-preview">评分 (1-{{ row.maxRating || 5 }})</span>
            </template>
          </el-table-column>

          <el-table-column prop="usageCount" label="使用次数" width="100">
            <template #default="{row}">
              <el-tag type="info" size="small">{{ row.usageCount || 0 }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{row}">
              {{ formatDateTime(row.createdAt) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{row}">
              <el-button type="text" size="small" @click="editQuestion(row.id)">
                编辑
              </el-button>
              <el-button type="text" size="small" @click="previewQuestion(row)">
                预览
              </el-button>
              <el-button type="text" size="small" @click="copyQuestion(row.id)">
                复制
              </el-button>
              <el-button type="text" size="small" @click="deleteQuestion(row.id)" class="danger-btn">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 48, 96]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 题目预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="题目预览"
      width="600px"
    >
      <div v-if="currentQuestion" class="preview-content">
        <div class="preview-header">
          <h3>{{ currentQuestion.title }}</h3>
          <div class="preview-badges">
            <el-tag :type="getTypeTagType(currentQuestion.type)">
              {{ getTypeText(currentQuestion.type) }}
            </el-tag>
            <el-tag type="info">{{ getCategoryText(currentQuestion.category) }}</el-tag>
          </div>
        </div>
        
        <div class="preview-question">
          <!-- 单选题预览 -->
          <div v-if="currentQuestion.type === 'single'" class="question-preview-content">
            <el-radio-group disabled>
              <el-radio 
                v-for="option in currentQuestion.options" 
                :key="option.id"
                :label="option.id"
              >
                {{ option.text }}
              </el-radio>
            </el-radio-group>
          </div>
          
          <!-- 多选题预览 -->
          <div v-else-if="currentQuestion.type === 'multiple'" class="question-preview-content">
            <el-checkbox-group disabled>
              <el-checkbox 
                v-for="option in currentQuestion.options" 
                :key="option.id"
                :label="option.id"
              >
                {{ option.text }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
          
          <!-- 文本题预览 -->
          <div v-else-if="currentQuestion.type === 'text'" class="question-preview-content">
            <el-input 
              type="textarea" 
              :rows="3"
              disabled 
              placeholder="请输入您的答案"
            />
          </div>
          
          <!-- 评分题预览 -->
          <div v-else-if="currentQuestion.type === 'rating'" class="question-preview-content">
            <el-rate disabled :max="currentQuestion.maxRating || 5" />
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="previewDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="editFromPreview">
            编辑题目
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Search,
  Delete,
  Download,
  Grid,
  List,
  MoreFilled,
  View,
  Star
} from '@element-plus/icons-vue'
import { listQuestionsApi, createQuestionApi, deleteQuestionApi } from '@/api/admin'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterCategory = ref('')
const viewMode = ref('card')
const currentPage = ref(1)
const pageSize = ref(24)
const selectedItems = ref([])
const previewDialogVisible = ref(false)
const currentQuestion = ref(null)

// 从 json-server 获取的题目列表
const questionList = ref([])

// 计算属性
const filteredList = computed(() => {
  let list = questionList.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      (item.options && item.options.some(opt => opt.text && opt.text.toLowerCase().includes(keyword)))
    )
  }

  if (filterType.value) {
    list = list.filter(item => item.type === filterType.value)
  }

  if (filterCategory.value) {
    list = list.filter(item => item.category === filterCategory.value)
  }

  return list
})

const total = computed(() => filteredList.value.length)
const totalQuestions = computed(() => questionList.value.length)
const totalCategories = computed(() => {
  const categories = new Set(questionList.value.map(q => q.category))
  return categories.size
})
const activeQuestions = computed(() => questionList.value.filter(q => q.usageCount && q.usageCount > 0).length)
const templateCount = computed(() => questionList.value.filter(q => q.isTemplate).length)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredList.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchKeyword.value = ''
  filterType.value = ''
  filterCategory.value = ''
  currentPage.value = 1
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

const handleSelectionChange = (val) => {
  selectedItems.value = val
}

const getTypeTagType = (type) => {
  const typeMap = {
    single: 'primary',
    multiple: 'success',
    text: 'info',
    rating: 'warning',
    matrix: 'danger'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    text: '填空题',
    rating: '评分题',
    matrix: '矩阵题'
  }
  return typeMap[type] || '未知'
}

const getCategoryText = (category) => {
  const categoryMap = {
    satisfaction: '满意度',
    basic: '基本信息',
    preference: '偏好调查',
    behavior: '行为分析',
    other: '其他'
  }
  return categoryMap[category] || '其他'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const createQuestion = () => {
  ElMessage.info('创建题目功能待实现')
}

const importQuestions = () => {
  ElMessage.info('批量导入功能待实现')
}

const viewQuestion = (id) => {
  const question = questionList.value.find(q => q.id === id)
  if (question) {
    previewQuestion(question)
  }
}

const editQuestion = (id) => {
  ElMessage.info(`编辑题目 ${id}`)
}

const previewQuestion = (question) => {
  currentQuestion.value = question
  previewDialogVisible.value = true
}

const copyQuestion = (id) => {
  ElMessage.success(`题目 ${id} 已复制`)
}

const deleteQuestion = (id) => {
  ElMessageBox.confirm(
    '确定要删除这个题目吗？删除后将无法恢复。',
    '确认删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    const index = questionList.value.findIndex(item => item.id === id)
    if (index > -1) {
      questionList.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const editFromPreview = () => {
  if (currentQuestion.value) {
    editQuestion(currentQuestion.value.id)
    previewDialogVisible.value = false
  }
}

const handleAction = (command, question) => {
  switch (command) {
    case 'edit':
      editQuestion(question.id)
      break
    case 'preview':
      previewQuestion(question)
      break
    case 'copy':
      copyQuestion(question.id)
      break
    case 'template':
      ElMessage.info(`题目 ${question.id} 已保存为模板`)
      question.isTemplate = true
      break
    case 'delete':
      deleteQuestion(question.id)
      break
  }
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定删除选中的 ${selectedItems.value.length} 个题目吗？`,
    '批量删除',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    selectedItems.value.forEach(item => {
      const index = questionList.value.findIndex(q => q.id === item.id)
      if (index > -1) {
        questionList.value.splice(index, 1)
      }
    })
    selectedItems.value = []
    ElMessage.success('批量删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const batchExport = () => {
  ElMessage.success(`已导出 ${selectedItems.value.length} 个题目`)
}

// 加载题目列表
const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await listQuestionsApi()
    questionList.value = response.list || response || []
  } catch (error) {
    ElMessage.error('加载题目列表失败：' + error.message)
    questionList.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQuestions()
})
</script>

<style scoped>
.question-management-page {
  padding: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a202c;
}

.header-content p {
  margin: 0;
  color: #718096;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 筛选卡片 */
.filter-card {
  margin-bottom: 24px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 列表卡片 */
.list-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
}

.list-info {
  color: #666;
  font-size: 14px;
}

/* 卡片视图 */
.question-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.question-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.question-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-badges {
  display: flex;
  gap: 8px;
}

.card-content {
  margin-bottom: 16px;
}

.question-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.4;
}

.question-preview {
  margin-top: 12px;
}

.option-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.option-item {
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.more-options {
  background: #e6f7ff;
  color: #1890ff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.meta-date {
  font-size: 12px;
  color: #999;
}

/* 表格视图 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.title-text {
  font-weight: 500;
  color: #409eff;
  cursor: pointer;
  line-height: 1.4;
}

.title-text:hover {
  text-decoration: underline;
}

.title-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.options-preview {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.option-tag {
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #666;
}

.more-tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.text-preview,
.rating-preview {
  font-size: 12px;
  color: #999;
}

.danger-btn {
  color: #f56c6c !important;
}

.danger-btn:hover {
  background-color: rgba(245, 108, 108, 0.1);
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 预览对话框 */
.preview-content {
  max-height: 500px;
  overflow-y: auto;
}

.preview-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.preview-header h3 {
  margin: 0 0 12px 0;
  color: #1a202c;
  font-size: 18px;
}

.preview-badges {
  display: flex;
  gap: 8px;
}

.question-preview-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .question-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
