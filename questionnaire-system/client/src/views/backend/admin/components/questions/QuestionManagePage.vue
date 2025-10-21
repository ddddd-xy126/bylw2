<template>
  <div class="question-management-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>题目管理</h1>
        <p>管理问卷题目库，创建和编辑题目模板</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog">
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
          </el-button-group>
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </div>
    </el-card>

    <!-- 题目列表 -->
    <el-card class="list-card" shadow="never">
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
              <div class="title-text" @click="previewQuestion(row)">{{ row.title }}</div>
              <div class="title-tags">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeText(row.type) }}
                </el-tag>
                <el-tag type="info" size="small">{{ getCategoryText(row.category) }}</el-tag>
                <el-tag v-if="row.required" type="danger" size="small">必填</el-tag>
                <el-tag v-if="row.isTemplate" type="success" size="small">模板</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="options" label="选项/配置" width="200">
          <template #default="{row}">
            <div v-if="row.options && row.options.length" class="options-preview">
              <span v-for="(opt, idx) in row.options.slice(0, 3)" :key="idx" class="option-tag">
                {{ opt.text }}
              </span>
              <span v-if="row.options.length > 3" class="more-tag">+{{ row.options.length - 3 }}</span>
            </div>
            <span v-else-if="row.type === 'text'" class="text-preview">
              {{ row.minLength || 0 }}-{{ row.maxLength || '不限' }}字
            </span>
            <span v-else-if="row.type === 'rating'" class="rating-preview">
              评分 (1-{{ row.maxRating || 5 }})
            </span>
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

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{row}">
            <el-button type="text" size="small" @click="previewQuestion(row)">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button type="text" size="small" @click="editQuestion(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="text" size="small" @click="copyQuestion(row)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button type="text" size="small" @click="deleteQuestion(row.id)" class="danger-btn">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!paginatedList.length && !loading" description="暂无题目数据">
        <el-button type="primary" @click="showCreateDialog">创建第一个题目</el-button>
      </el-empty>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
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
            <el-tag v-if="currentQuestion.required" type="danger">必填</el-tag>
          </div>
          <div class="preview-description" v-if="currentQuestion.description">
            <p>{{ currentQuestion.description }}</p>
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
              :placeholder="`请输入您的答案 (${currentQuestion.minLength || 0}-${currentQuestion.maxLength || '不限'}字)`"
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

    <!-- 创建/编辑题目对话框 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="isEditing ? '编辑题目' : '创建题目'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form :model="questionForm" :rules="questionRules" ref="questionFormRef" label-width="120px">
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-form-item label="题目类型" prop="type">
          <el-select v-model="questionForm.type" placeholder="请选择题目类型" @change="handleTypeChange">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="填空题" value="text" />
            <el-option label="评分题" value="rating" />
          </el-select>
        </el-form-item>

        <el-form-item label="题目内容" prop="title">
          <el-input
            v-model="questionForm.title"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>

        <el-form-item label="题目分类" prop="category">
          <el-select v-model="questionForm.category" placeholder="请选择分类">
            <el-option label="满意度" value="satisfaction" />
            <el-option label="基本信息" value="basic" />
            <el-option label="偏好调查" value="preference" />
            <el-option label="行为分析" value="behavior" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否必填">
          <el-switch v-model="questionForm.required" />
        </el-form-item>

        <!-- 选项配置 (单选/多选) -->
        <template v-if="questionForm.type === 'single' || questionForm.type === 'multiple'">
          <el-divider content-position="left">选项配置</el-divider>
          
          <el-form-item label="题目选项">
            <div class="options-container">
              <div 
                v-for="(option, index) in questionForm.options" 
                :key="index"
                class="option-item"
              >
                <el-input 
                  v-model="option.text" 
                  placeholder="请输入选项内容"
                  style="flex: 1;"
                />
                <el-button 
                  type="danger" 
                  :icon="Delete" 
                  circle
                  @click="removeOption(index)"
                  :disabled="questionForm.options.length <= 2"
                />
              </div>
              <el-button type="primary" @click="addOption" style="width: 100%;">
                <el-icon><Plus /></el-icon>
                添加选项
              </el-button>
            </div>
          </el-form-item>
        </template>

        <!-- 评分题配置 -->
        <template v-if="questionForm.type === 'rating'">
          <el-divider content-position="left">评分配置</el-divider>
          
          <el-form-item label="最高分值">
            <el-input-number v-model="questionForm.maxRating" :min="1" :max="10" />
          </el-form-item>
        </template>

        <!-- 填空题配置 -->
        <template v-if="questionForm.type === 'text'">
          <el-divider content-position="left">填空配置</el-divider>
          
          <el-form-item label="最小字数">
            <el-input-number v-model="questionForm.minLength" :min="0" />
          </el-form-item>

          <el-form-item label="最大字数">
            <el-input-number v-model="questionForm.maxLength" :min="0" />
          </el-form-item>
        </template>

        <!-- 其他设置 -->
        <el-divider content-position="left">其他设置</el-divider>
        
        <el-form-item label="设为模板">
          <el-switch v-model="questionForm.isTemplate" />
          <span class="form-tip">模板题目可以被其他问卷快速引用</span>
        </el-form-item>

        <el-form-item label="题目标签">
          <el-input v-model="questionForm.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>

        <el-form-item label="题目说明">
          <el-input
            v-model="questionForm.description"
            type="textarea"
            :rows="2"
            placeholder="题目的补充说明(可选)"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="questionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitQuestion" :loading="submitLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Upload,
  Search,
  Delete,
  View,
  Edit,
  CopyDocument
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const searchKeyword = ref('')
const filterType = ref('')
const filterCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedItems = ref([])
const previewDialogVisible = ref(false)
const questionDialogVisible = ref(false)
const isEditing = ref(false)
const currentQuestion = ref(null)
const questionFormRef = ref(null)

// 题目列表
const questionList = ref([])

// 题目表单
const questionForm = reactive({
  id: null,
  type: 'single',
  title: '',
  category: '',
  required: false,
  options: [
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' }
  ],
  enableLogic: false,
  logicRules: [],
  maxRating: 5,
  minLength: 0,
  maxLength: 500,
  permission: 'all',
  minLevel: 1,
  isTemplate: false,
  tags: '',
  description: ''
})

// 表单验证规则
const questionRules = {
  type: [{ required: true, message: '请选择题目类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入题目内容', trigger: 'blur' }],
  category: [{ required: true, message: '请选择题目分类', trigger: 'change' }]
}

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
    rating: 'warning'
  }
  return typeMap[type] || 'info'
}

const getTypeText = (type) => {
  const typeMap = {
    single: '单选题',
    multiple: '多选题',
    text: '填空题',
    rating: '评分题'
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

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// 显示创建对话框
const showCreateDialog = () => {
  isEditing.value = false
  resetQuestionForm()
  questionDialogVisible.value = true
}

// 重置表单
const resetQuestionForm = () => {
  Object.assign(questionForm, {
    id: null,
    type: 'single',
    title: '',
    category: '',
    required: false,
    options: [
      { id: 'opt_1', text: '' },
      { id: 'opt_2', text: '' }
    ],
    maxRating: 5,
    minLength: 0,
    maxLength: 500,
    isTemplate: false,
    tags: '',
    description: ''
  })
}

// 题目类型改变
const handleTypeChange = (type) => {
  if (type === 'text' || type === 'rating') {
    questionForm.options = []
  } else if (!questionForm.options.length) {
    questionForm.options = [
      { id: 'opt_1', text: '' },
      { id: 'opt_2', text: '' }
    ]
  }
}

// 添加选项
const addOption = () => {
  const newId = `opt_${questionForm.options.length + 1}`
  questionForm.options.push({ id: newId, text: '' })
}

// 删除选项
const removeOption = (index) => {
  questionForm.options.splice(index, 1)
}

// 提交题目
const submitQuestion = async () => {
  if (!questionFormRef.value) return
  
  await questionFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const data = {
        ...questionForm,
        createdAt: questionForm.id ? questionForm.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: questionForm.usageCount || 0
      }
      
      if (isEditing.value) {
        // 更新题目
        const response = await fetch(`http://localhost:3002/questions/${questionForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) {
          throw new Error('更新题目失败')
        }
        
        ElMessage.success('题目已更新')
      } else {
        // 创建新题目
        const response = await fetch('http://localhost:3002/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) {
          throw new Error('创建题目失败')
        }
        
        ElMessage.success('题目已创建')
      }
      
      questionDialogVisible.value = false
      await loadQuestions()
    } catch (error) {
      ElMessage.error('操作失败：' + error.message)
    } finally {
      submitLoading.value = false
    }
  })
}

// 编辑题目
const editQuestion = (question) => {
  isEditing.value = true
  Object.assign(questionForm, {
    ...question,
    options: question.options || []
  })
  questionDialogVisible.value = true
}

// 预览题目
const previewQuestion = (question) => {
  currentQuestion.value = question
  previewDialogVisible.value = true
}

// 从预览编辑
const editFromPreview = () => {
  if (currentQuestion.value) {
    previewDialogVisible.value = false
    editQuestion(currentQuestion.value)
  }
}

// 复制题目
const copyQuestion = async (question) => {
  try {
    const newQuestion = {
      ...question,
      id: undefined,
      title: question.title + ' (副本)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    }
    
    const response = await fetch('http://localhost:3002/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuestion)
    })
    
    if (!response.ok) {
      throw new Error('复制失败')
    }
    
    ElMessage.success('题目已复制')
    await loadQuestions()
  } catch (error) {
    ElMessage.error('复制失败：' + error.message)
  }
}

// 删除题目
const deleteQuestion = async (id) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个题目吗？删除后将无法恢复。',
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const response = await fetch(`http://localhost:3002/questions/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      throw new Error('删除失败')
    }
    
    ElMessage.success('删除成功')
    await loadQuestions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 批量删除
const batchDelete = async () => {
  if (!selectedItems.value.length) {
    ElMessage.warning('请先选择要删除的题目')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定删除选中的 ${selectedItems.value.length} 个题目吗？`,
      '批量删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const promises = selectedItems.value.map(item => 
      fetch(`http://localhost:3002/questions/${item.id}`, { method: 'DELETE' })
    )
    await Promise.all(promises)
    
    ElMessage.success('批量删除成功')
    selectedItems.value = []
    await loadQuestions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量导入
const importQuestions = () => {
  ElMessage.info('批量导入功能待实现')
}

// 加载题目列表
const loadQuestions = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3002/questions?_sort=createdAt&_order=desc')
    if (!response.ok) {
      throw new Error('加载题目失败')
    }
    questionList.value = await response.json()
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
  gap: 16px;
}

.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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

/* 表格样式 */
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
  max-height: 600px;
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
  margin-bottom: 12px;
}

.preview-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.question-preview-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 表单样式 */
.options-container {
  width: 100%;
}

.option-item {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.form-tip {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-left,
  .filter-right {
    width: 100%;
  }
}
</style>
