<template>
  <div class="pending-questionnaires-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1>待审核问卷</h1>
        <p>审核用户提交的问卷，确保内容质量</p>
      </div>
      <div class="header-stats">
        <el-statistic title="待审核" :value="pendingCount" />
      </div>
    </div>

    <!-- 筛选和操作 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-content">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索问卷标题或提交者"
            style="width: 300px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select v-model="filterPriority" placeholder="优先级" style="width: 120px" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-button-group>
            <el-button @click="batchApprove" :disabled="!selectedItems.length">
              <el-icon><Check /></el-icon>
              批量通过
            </el-button>
            <el-button @click="batchReject" :disabled="!selectedItems.length">
              <el-icon><Close /></el-icon>
              批量拒绝
            </el-button>
          </el-button-group>
        </div>
      </div>
    </el-card>

    <!-- 问卷列表 -->
    <el-card class="list-card" shadow="never">
      <div class="list-header">
        <div class="list-info">
          <span>共 {{ total }} 个待审核问卷</span>
        </div>
      </div>

      <el-table 
        :data="paginatedList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="title" label="问卷信息" min-width="250">
          <template #default="{row}">
            <div class="questionnaire-info">
              <div class="info-main">
                <h4 class="questionnaire-title">{{ row.title }}</h4>
                <p class="questionnaire-description">{{ row.description }}</p>
              </div>
              <div class="info-meta">
                <el-tag size="small" :type="getPriorityType(row.priority)">
                  {{ getPriorityText(row.priority) }}
                </el-tag>
                <el-tag size="small" type="info">{{ getCategoryText(row.category) }}</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="submitter" label="提交者" width="150">
          <template #default="{row}">
            <div class="submitter-info">
              <el-avatar :size="32" :src="row.submitterAvatar">
                {{ row.submitterName.charAt(0) }}
              </el-avatar>
              <div class="submitter-details">
                <div class="submitter-name">{{ row.submitterName }}</div>
                <div class="submitter-email">{{ row.submitterEmail }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="submittedAt" label="提交时间" width="180">
          <template #default="{row}">
            <div class="time-info">
              <div class="submit-time">{{ formatDateTime(row.submittedAt) }}</div>
              <div class="time-ago">{{ getTimeAgo(row.submittedAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="questionCount" label="题目数量" width="100">
          <template #default="{row}">
            <el-tag type="info" size="small">{{ row.questionCount }} 题</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="120">
          <template #default="{row}">
            <el-tag type="warning" size="small">
              <el-icon><Clock /></el-icon>
              待审核
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{row}">
            <div class="action-buttons">
              <el-button type="text" size="small" @click="previewQuestionnaire(row)">
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button type="text" size="small" @click="approveQuestionnaire(row)" class="success-btn">
                <el-icon><Check /></el-icon>
                通过
              </el-button>
              <el-button type="text" size="small" @click="rejectQuestionnaire(row)" class="danger-btn">
                <el-icon><Close /></el-icon>
                拒绝
              </el-button>
              <el-button type="text" size="small" @click="showReviewDialog(row)">
                <el-icon><ChatDotRound /></el-icon>
                评论
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 空状态 -->
      <el-empty v-if="!paginatedList.length && !loading" description="暂无待审核问卷">
        <p>所有问卷都已审核完成</p>
      </el-empty>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="问卷预览"
      width="800px"
      :before-close="closePreviewDialog"
    >
      <div v-if="currentQuestionnaire" class="preview-content">
        <div class="preview-header">
          <h2>{{ currentQuestionnaire.title }}</h2>
          <p>{{ currentQuestionnaire.description }}</p>
        </div>
        
        <div class="preview-questions">
          <div 
            v-for="(question, index) in currentQuestionnaire.questions" 
            :key="index"
            class="question-item"
          >
            <h4>{{ index + 1 }}. {{ question.title }}</h4>
            <div v-if="question.type === 'single'" class="question-options">
              <el-radio-group disabled>
                <el-radio 
                  v-for="option in question.options" 
                  :key="option.id"
                  :label="option.id"
                >
                  {{ option.text }}
                </el-radio>
              </el-radio-group>
            </div>
            <div v-else-if="question.type === 'multiple'" class="question-options">
              <el-checkbox-group disabled>
                <el-checkbox 
                  v-for="option in question.options" 
                  :key="option.id"
                  :label="option.id"
                >
                  {{ option.text }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <div v-else-if="question.type === 'text'" class="question-options">
              <el-input type="textarea" disabled placeholder="文本输入题" />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closePreviewDialog">关闭</el-button>
          <el-button type="success" @click="approveFromPreview">
            <el-icon><Check /></el-icon>
            通过审核
          </el-button>
          <el-button type="danger" @click="rejectFromPreview">
            <el-icon><Close /></el-icon>
            拒绝审核
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核评论对话框 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="审核评论"
      width="600px"
    >
      <el-form :model="reviewForm" label-width="100px" ref="reviewFormRef" :rules="reviewRules">
        <el-form-item label="审核结果" prop="result">
          <el-radio-group v-model="reviewForm.result">
            <el-radio label="approve">通过</el-radio>
            <el-radio label="reject">拒绝</el-radio>
            <el-radio label="request_changes">需要修改</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item 
          label="审核意见" 
          prop="comment"
          :rules="reviewForm.result === 'reject' ? [{ required: true, message: '拒绝审核必须填写原因', trigger: 'blur' }] : []"
        >
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            :placeholder="reviewForm.result === 'reject' ? '请填写拒绝原因，将发送给问卷提交者' : '请输入审核意见，将发送给问卷提交者'"
          />
          <div v-if="reviewForm.result === 'reject'" class="form-tip">
            <el-icon><WarningFilled /></el-icon>
            拒绝审核必须填写具体原因
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReview">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Check,
  Close,
  Clock,
  View,
  ChatDotRound,
  WarningFilled
} from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const searchKeyword = ref('')
const filterPriority = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const selectedItems = ref([])
const previewDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const currentQuestionnaire = ref(null)
const reviewFormRef = ref(null)

// 审核表单
const reviewForm = reactive({
  result: 'approve',
  comment: ''
})

// 假数据
const pendingList = ref([
  {
    id: 1,
    title: '员工工作环境满意度调查',
    description: '针对公司员工工作环境、福利待遇等方面的满意度调查',
    submitterName: '张小明',
    submitterEmail: 'zhangxm@example.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=张小明',
    submittedAt: '2024-01-15T14:30:00',
    priority: 'high',
    category: 'satisfaction',
    questionCount: 15,
    questions: [
      {
        title: '您对目前的工作环境满意吗？',
        type: 'single',
        options: [
          { id: 1, text: '非常满意' },
          { id: 2, text: '比较满意' },
          { id: 3, text: '一般' },
          { id: 4, text: '不太满意' },
          { id: 5, text: '非常不满意' }
        ]
      },
      {
        title: '您认为公司还需要改进哪些方面？（多选）',
        type: 'multiple',
        options: [
          { id: 1, text: '办公设备' },
          { id: 2, text: '工作氛围' },
          { id: 3, text: '薪资待遇' },
          { id: 4, text: '培训机会' },
          { id: 5, text: '其他' }
        ]
      },
      {
        title: '请留下您的建议和意见',
        type: 'text'
      }
    ]
  },
  {
    id: 2,
    title: '新产品用户体验调研',
    description: '收集用户对新产品功能和界面设计的反馈意见',
    submitterName: '李小红',
    submitterEmail: 'lixh@example.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=李小红',
    submittedAt: '2024-01-15T10:15:00',
    priority: 'medium',
    category: 'feedback',
    questionCount: 12,
    questions: [
      {
        title: '您使用新产品的频率如何？',
        type: 'single',
        options: [
          { id: 1, text: '每天使用' },
          { id: 2, text: '每周使用' },
          { id: 3, text: '偶尔使用' },
          { id: 4, text: '很少使用' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: '市场需求分析调查',
    description: '了解目标客户的需求偏好和购买意向',
    submitterName: '王大力',
    submitterEmail: 'wangdl@example.com',
    submitterAvatar: 'https://api.dicebear.com/7.x/initials/svg?seed=王大力',
    submittedAt: '2024-01-14T16:45:00',
    priority: 'low',
    category: 'market',
    questionCount: 20,
    questions: []
  }
])

// 计算属性
const filteredList = computed(() => {
  let list = pendingList.value

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.submitterName.toLowerCase().includes(keyword)
    )
  }

  if (filterPriority.value) {
    list = list.filter(item => item.priority === filterPriority.value)
  }

  return list
})

const total = computed(() => filteredList.value.length)
const pendingCount = computed(() => pendingList.value.length)

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

const getPriorityType = (priority) => {
  const priorityMap = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return priorityMap[priority] || 'info'
}

const getPriorityText = (priority) => {
  const priorityMap = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return priorityMap[priority] || '未知'
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

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getTimeAgo = (dateString) => {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now - past
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else {
    return '刚刚'
  }
}

const previewQuestionnaire = (questionnaire) => {
  currentQuestionnaire.value = questionnaire
  previewDialogVisible.value = true
}

const closePreviewDialog = () => {
  previewDialogVisible.value = false
  currentQuestionnaire.value = null
}

const approveQuestionnaire = (questionnaire) => {
  ElMessageBox.confirm(
    `确定通过问卷"${questionnaire.title}"的审核吗？`,
    '确认审核',
    {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    }
  ).then(() => {
    // 这里应该调用审核API
    ElMessage.success('审核通过')
    removeFromPendingList(questionnaire.id)
  }).catch(() => {
    ElMessage.info('已取消审核')
  })
}

const rejectQuestionnaire = (questionnaire) => {
  // 打开审核对话框，默认设置为拒绝
  currentQuestionnaire.value = questionnaire
  reviewForm.result = 'reject'
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

const approveFromPreview = () => {
  if (currentQuestionnaire.value) {
    approveQuestionnaire(currentQuestionnaire.value)
    closePreviewDialog()
  }
}

const rejectFromPreview = () => {
  if (currentQuestionnaire.value) {
    closePreviewDialog()
    // 延迟一点打开审核对话框，避免对话框冲突
    setTimeout(() => {
      rejectQuestionnaire(currentQuestionnaire.value)
    }, 100)
  }
}

const showReviewDialog = (questionnaire) => {
  currentQuestionnaire.value = questionnaire
  reviewForm.result = 'approve'
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

const submitReview = () => {
  // 验证表单
  if (reviewForm.result === 'reject' && !reviewForm.comment.trim()) {
    ElMessage.warning('拒绝审核必须填写原因')
    return
  }

  if (reviewForm.result !== 'approve' && !reviewForm.comment.trim()) {
    ElMessage.warning('请输入审核意见')
    return
  }

  // 这里应该调用审核API
  const actionText = reviewForm.result === 'approve' ? '审核通过' : 
                    reviewForm.result === 'reject' ? '审核拒绝' : '已要求修改'
  ElMessage.success(`${actionText}成功`)
  
  if (reviewForm.result === 'approve' || reviewForm.result === 'reject') {
    removeFromPendingList(currentQuestionnaire.value.id)
  }
  
  reviewDialogVisible.value = false
  currentQuestionnaire.value = null
}

const batchApprove = () => {
  ElMessageBox.confirm(
    `确定批量通过选中的 ${selectedItems.value.length} 个问卷吗？`,
    '批量审核',
    {
      confirmButtonText: '通过',
      cancelButtonText: '取消',
      type: 'success',
    }
  ).then(() => {
    // 这里应该调用批量审核API
    ElMessage.success(`已批量通过 ${selectedItems.value.length} 个问卷`)
    selectedItems.value.forEach(item => {
      removeFromPendingList(item.id)
    })
    selectedItems.value = []
  }).catch(() => {
    ElMessage.info('已取消批量审核')
  })
}

const batchReject = () => {
  ElMessageBox.confirm(
    `确定批量拒绝选中的 ${selectedItems.value.length} 个问卷吗？`,
    '批量审核',
    {
      confirmButtonText: '拒绝',
      cancelButtonText: '取消',
      type: 'error',
    }
  ).then(() => {
    // 这里应该调用批量审核API
    ElMessage.success(`已批量拒绝 ${selectedItems.value.length} 个问卷`)
    selectedItems.value.forEach(item => {
      removeFromPendingList(item.id)
    })
    selectedItems.value = []
  }).catch(() => {
    ElMessage.info('已取消批量审核')
  })
}

const removeFromPendingList = (id) => {
  const index = pendingList.value.findIndex(item => item.id === id)
  if (index > -1) {
    pendingList.value.splice(index, 1)
  }
}

onMounted(() => {
  loading.value = false
})
</script>

<style scoped>
.pending-questionnaires-page {
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

/* 问卷信息 */
.questionnaire-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.questionnaire-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  line-height: 1.4;
}

.questionnaire-description {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-meta {
  display: flex;
  gap: 8px;
}

/* 提交者信息 */
.submitter-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.submitter-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.submitter-name {
  font-size: 14px;
  font-weight: 500;
  color: #1a202c;
}

.submitter-email {
  font-size: 12px;
  color: #666;
}

/* 时间信息 */
.time-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.submit-time {
  font-size: 14px;
  color: #1a202c;
}

.time-ago {
  font-size: 12px;
  color: #666;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.success-btn {
  color: #67c23a !important;
}

.success-btn:hover {
  background-color: rgba(103, 194, 58, 0.1);
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
  max-height: 600px;
  overflow-y: auto;
}

.preview-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.preview-header h2 {
  margin: 0 0 8px 0;
  color: #1a202c;
}

.preview-header p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.preview-questions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.question-item h4 {
  margin: 0 0 12px 0;
  color: #1a202c;
  font-weight: 500;
}

.question-options {
  margin-left: 16px;
}

/* 表单提示 */
.form-tip {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  color: #e6a23c;
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
    gap: 16px;
    align-items: stretch;
  }

  .filter-left {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }

  .submitter-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>