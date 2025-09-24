<template>
  <div class="custom-create">
    <!-- 头部区域 -->
    <div class="header-section">
      <div class="header-content">
        <el-button @click="goBack" type="text" size="large" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h1>自定义创建问卷</h1>
        <p>从零开始设计您的问卷，完全自定义问题类型、逻辑和样式</p>
      </div>
    </div>

    <!-- 问卷基本信息 -->
    <div class="basic-info-section">
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>问卷基本信息</span>
            <el-tag type="info" size="small">必填</el-tag>
          </div>
        </template>
        
        <el-form :model="questionnaireForm" :rules="formRules" ref="formRef" label-width="120px">
          <el-form-item label="问卷标题" prop="title">
            <el-input
              v-model="questionnaireForm.title"
              placeholder="请输入问卷标题"
              size="large"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="问卷描述" prop="description">
            <el-input
              v-model="questionnaireForm.description"
              type="textarea"
              placeholder="请描述问卷的目的、内容简介等"
              :rows="3"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="问卷分类" prop="category">
                <el-select
                  v-model="questionnaireForm.category"
                  placeholder="请选择分类"
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="category in categories"
                    :key="category.value"
                    :label="category.label"
                    :value="category.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预估时长" prop="duration">
                <el-input-number
                  v-model="questionnaireForm.duration"
                  :min="1"
                  :max="120"
                  size="large"
                  style="width: 100%"
                />
                <span class="input-suffix">分钟</span>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="问卷标签">
            <div class="tags-input">
              <el-tag
                v-for="tag in questionnaireForm.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="tagInputVisible"
                ref="tagInputRef"
                v-model="tagInputValue"
                size="small"
                @keyup.enter="handleTagInputConfirm"
                @blur="handleTagInputConfirm"
                class="tag-input"
              />
              <el-button
                v-else
                size="small"
                @click="showTagInput"
                class="add-tag-btn"
              >
                + 添加标签
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 问题设计区域 -->
    <div class="questions-section">
      <el-card class="questions-card">
        <template #header>
          <div class="card-header">
            <span>问题设计</span>
            <div class="header-actions">
              <el-dropdown @command="handleAddQuestion" trigger="click">
                <el-button type="primary" size="small">
                  <el-icon><Plus /></el-icon>
                  添加问题
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="single">
                      <el-icon><Select /></el-icon>
                      单选题
                    </el-dropdown-item>
                    <el-dropdown-item command="multiple">
                      <el-icon><Finished /></el-icon>
                      多选题
                    </el-dropdown-item>
                    <el-dropdown-item command="text">
                      <el-icon><Edit /></el-icon>
                      文本题
                    </el-dropdown-item>
                    <el-dropdown-item command="rating">
                      <el-icon><Star /></el-icon>
                      评分题
                    </el-dropdown-item>
                    <el-dropdown-item command="likert">
                      <el-icon><DataLine /></el-icon>
                      量表题
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div v-if="questions.length === 0" class="empty-questions">
          <el-empty description="暂无问题，点击上方按钮添加问题">
            <el-button type="primary" @click="handleAddQuestion('single')">
              添加第一个问题
            </el-button>
          </el-empty>
        </div>

        <div v-else class="questions-list">
          <draggable
            v-model="questions"
            item-key="id"
            handle=".drag-handle"
            @end="onQuestionReorder"
          >
            <template #item="{ element: question, index }">
              <div class="question-item" :class="{ 'active': activeQuestionId === question.id }">
                <div class="question-header">
                  <div class="question-info">
                    <span class="drag-handle">
                      <el-icon><Sort /></el-icon>
                    </span>
                    <span class="question-number">{{ index + 1 }}.</span>
                    <span class="question-type-badge">{{ getQuestionTypeText(question.type) }}</span>
                  </div>
                  <div class="question-actions">
                    <el-button
                      size="small"
                      type="text"
                      @click="editQuestion(question)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="small"
                      type="text"
                      @click="copyQuestion(question)"
                    >
                      复制
                    </el-button>
                    <el-button
                      size="small"
                      type="text"
                      @click="deleteQuestion(question.id)"
                      class="danger-btn"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div class="question-content" @click="editQuestion(question)">
                  <div class="question-title">
                    {{ question.title || '未设置问题标题' }}
                    <span v-if="question.required" class="required-mark">*</span>
                  </div>
                  <div class="question-preview">
                    <!-- 单选题预览 -->
                    <div v-if="question.type === 'single'" class="options-preview">
                      <div
                        v-for="(option, optIndex) in question.options"
                        :key="optIndex"
                        class="option-item"
                      >
                        <el-radio :model-value="false">{{ option.text || `选项${optIndex + 1}` }}</el-radio>
                      </div>
                      <div v-if="!question.options?.length" class="no-options">
                        未设置选项
                      </div>
                    </div>
                    
                    <!-- 多选题预览 -->
                    <div v-else-if="question.type === 'multiple'" class="options-preview">
                      <div
                        v-for="(option, optIndex) in question.options"
                        :key="optIndex"
                        class="option-item"
                      >
                        <el-checkbox :model-value="false">{{ option.text || `选项${optIndex + 1}` }}</el-checkbox>
                      </div>
                      <div v-if="!question.options?.length" class="no-options">
                        未设置选项
                      </div>
                    </div>
                    
                    <!-- 文本题预览 -->
                    <div v-else-if="question.type === 'text'" class="text-preview">
                      <el-input
                        :type="question.textType || 'text'"
                        :placeholder="question.placeholder || '请输入...'"
                        readonly
                      />
                    </div>
                    
                    <!-- 评分题预览 -->
                    <div v-else-if="question.type === 'rating'" class="rating-preview">
                      <el-rate
                        :model-value="0"
                        :max="question.maxRating || 5"
                        disabled
                      />
                    </div>
                    
                    <!-- 量表题预览 -->
                    <div v-else-if="question.type === 'likert'" class="likert-preview">
                      <div class="likert-options">
                        <span v-for="(option, optIndex) in getLikertOptions(question)"
                              :key="optIndex"
                              class="likert-option">
                          <el-radio :model-value="false">{{ option }}</el-radio>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </el-card>
    </div>

    <!-- 问卷设置 -->
    <div class="settings-section">
      <el-card class="settings-card">
        <template #header>
          <div class="card-header">
            <span>问卷设置</span>
          </div>
        </template>
        
        <el-form :model="settingsForm" label-width="140px">
          <el-form-item label="提交后显示">
            <el-radio-group v-model="settingsForm.submitAction">
              <el-radio label="message">显示感谢信息</el-radio>
              <el-radio label="redirect">跳转到指定页面</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item v-if="settingsForm.submitAction === 'message'" label="感谢信息">
            <el-input
              v-model="settingsForm.thankMessage"
              type="textarea"
              :rows="2"
              placeholder="感谢您的参与！"
            />
          </el-form-item>
          
          <el-form-item v-if="settingsForm.submitAction === 'redirect'" label="跳转链接">
            <el-input
              v-model="settingsForm.redirectUrl"
              placeholder="https://..."
            />
          </el-form-item>
          
          <el-form-item label="允许多次提交">
            <el-switch v-model="settingsForm.allowMultiple" />
          </el-form-item>
          
          <el-form-item label="显示进度条">
            <el-switch v-model="settingsForm.showProgress" />
          </el-form-item>
          
          <el-form-item label="问题随机排序">
            <el-switch v-model="settingsForm.randomOrder" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div class="footer-actions">
      <div class="actions-content">
        <div class="actions-left">
          <el-button @click="previewQuestionnaire">
            <el-icon><View /></el-icon>
            预览问卷
          </el-button>
          <el-button @click="saveAsDraft">
            <el-icon><DocumentCopy /></el-icon>
            保存草稿
          </el-button>
        </div>
        <div class="actions-right">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" @click="publishQuestionnaire">
            <el-icon><Promotion /></el-icon>
            发布问卷
          </el-button>
        </div>
      </div>
    </div>

    <!-- 问题编辑对话框 -->
    <el-dialog
      v-model="questionDialogVisible"
      :title="editingQuestion ? '编辑问题' : '添加问题'"
      width="800px"
      class="question-dialog"
    >
      <QuestionEditor
        v-if="questionDialogVisible"
        :question="editingQuestion"
        @save="saveQuestion"
        @cancel="cancelEditQuestion"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft,
  Plus,
  ArrowDown,
  Select,
  Finished,
  Edit,
  Star,
  DataLine,
  Sort,
  View,
  DocumentCopy,
  Promotion
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import QuestionEditor from '@/components/create/QuestionEditor.vue'

const router = useRouter()

// 响应式数据
const formRef = ref(null)
const tagInputRef = ref(null)
const questionDialogVisible = ref(false)
const editingQuestion = ref(null)
const activeQuestionId = ref(null)
const tagInputVisible = ref(false)
const tagInputValue = ref('')

// 问卷基本信息
const questionnaireForm = reactive({
  title: '',
  description: '',
  category: '',
  duration: 10,
  tags: []
})

// 问题列表
const questions = ref([])

// 问卷设置
const settingsForm = reactive({
  submitAction: 'message',
  thankMessage: '感谢您的参与！您的回答已经成功提交。',
  redirectUrl: '',
  allowMultiple: false,
  showProgress: true,
  randomOrder: false
})

// 分类数据
const categories = [
  { label: '企业管理', value: 'enterprise' },
  { label: '产品研发', value: 'product' },
  { label: '心理健康', value: 'psychology' },
  { label: '教育培训', value: 'education' },
  { label: '市场调研', value: 'market' },
  { label: '用户体验', value: 'ux' },
  { label: '学术研究', value: 'academic' },
  { label: '活动反馈', value: 'event' },
  { label: '其他', value: 'other' }
]

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入问卷标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问卷描述', trigger: 'blur' },
    { min: 10, max: 500, message: '描述长度在 10 到 500 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择问卷分类', trigger: 'change' }
  ],
  duration: [
    { required: true, message: '请设置预估时长', trigger: 'blur' }
  ]
}

// 方法
const goBack = () => {
  if (hasUnsavedChanges()) {
    ElMessageBox.confirm(
      '您有未保存的更改，确定要离开吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      router.go(-1)
    }).catch(() => {
      // 用户取消
    })
  } else {
    router.go(-1)
  }
}

const hasUnsavedChanges = () => {
  return questionnaireForm.title || questionnaireForm.description || questions.value.length > 0
}

const handleAddQuestion = (type) => {
  const newQuestion = {
    id: Date.now(),
    type: type,
    title: '',
    required: false,
    options: type === 'single' || type === 'multiple' ? [{ text: '' }, { text: '' }] : undefined,
    placeholder: type === 'text' ? '请输入...' : undefined,
    textType: type === 'text' ? 'text' : undefined,
    maxRating: type === 'rating' ? 5 : undefined,
    likertType: type === 'likert' ? '5-point' : undefined
  }
  
  editingQuestion.value = newQuestion
  questionDialogVisible.value = true
}

const editQuestion = (question) => {
  editingQuestion.value = { ...question }
  activeQuestionId.value = question.id
  questionDialogVisible.value = true
}

const saveQuestion = (questionData) => {
  if (editingQuestion.value.id) {
    // 编辑现有问题
    const index = questions.value.findIndex(q => q.id === editingQuestion.value.id)
    if (index !== -1) {
      questions.value[index] = { ...questionData, id: editingQuestion.value.id }
    }
  } else {
    // 添加新问题
    questions.value.push({ ...questionData, id: Date.now() })
  }
  
  questionDialogVisible.value = false
  editingQuestion.value = null
  activeQuestionId.value = null
  ElMessage.success('问题保存成功')
}

const cancelEditQuestion = () => {
  questionDialogVisible.value = false
  editingQuestion.value = null
  activeQuestionId.value = null
}

const copyQuestion = (question) => {
  const copiedQuestion = {
    ...question,
    id: Date.now(),
    title: question.title + ' (副本)'
  }
  questions.value.push(copiedQuestion)
  ElMessage.success('问题复制成功')
}

const deleteQuestion = (questionId) => {
  ElMessageBox.confirm(
    '确定要删除这个问题吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = questions.value.findIndex(q => q.id === questionId)
    if (index !== -1) {
      questions.value.splice(index, 1)
      ElMessage.success('问题删除成功')
    }
  }).catch(() => {
    // 用户取消
  })
}

const onQuestionReorder = () => {
  ElMessage.info('问题顺序已调整')
}

const getQuestionTypeText = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'text': '文本题',
    'rating': '评分题',
    'likert': '量表题'
  }
  return typeMap[type] || '未知题型'
}

const getLikertOptions = (question) => {
  const likertMap = {
    '5-point': ['非常不同意', '不同意', '中立', '同意', '非常同意'],
    '7-point': ['极不同意', '很不同意', '不同意', '中立', '同意', '很同意', '极同意'],
    '3-point': ['不同意', '中立', '同意']
  }
  return likertMap[question.likertType] || likertMap['5-point']
}

// 标签管理
const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value.focus()
  })
}

const handleTagInputConfirm = () => {
  if (tagInputValue.value && !questionnaireForm.tags.includes(tagInputValue.value)) {
    questionnaireForm.tags.push(tagInputValue.value)
  }
  tagInputVisible.value = false
  tagInputValue.value = ''
}

const removeTag = (tag) => {
  const index = questionnaireForm.tags.indexOf(tag)
  if (index !== -1) {
    questionnaireForm.tags.splice(index, 1)
  }
}

// 问卷操作
const previewQuestionnaire = () => {
  if (!validateForm()) return
  
  ElMessage.info('预览功能开发中...')
}

const saveAsDraft = async () => {
  if (!validateBasicInfo()) return
  
  ElMessage.success('草稿保存成功')
}

const publishQuestionnaire = async () => {
  if (!validateForm()) return
  
  ElMessage.success('问卷发布成功！')
  router.push('/profile/creations')
}

const validateBasicInfo = () => {
  if (!questionnaireForm.title.trim()) {
    ElMessage.error('请输入问卷标题')
    return false
  }
  return true
}

const validateForm = () => {
  if (!validateBasicInfo()) return false
  
  if (!questionnaireForm.description.trim()) {
    ElMessage.error('请输入问卷描述')
    return false
  }
  
  if (!questionnaireForm.category) {
    ElMessage.error('请选择问卷分类')
    return false
  }
  
  if (questions.value.length === 0) {
    ElMessage.error('请至少添加一个问题')
    return false
  }
  
  // 验证问题
  for (let i = 0; i < questions.value.length; i++) {
    const question = questions.value[i]
    if (!question.title.trim()) {
      ElMessage.error(`第${i + 1}个问题的标题不能为空`)
      return false
    }
    
    if ((question.type === 'single' || question.type === 'multiple') && 
        (!question.options || question.options.length < 2)) {
      ElMessage.error(`第${i + 1}个问题至少需要2个选项`)
      return false
    }
  }
  
  return true
}
</script>

<style scoped>
.custom-create {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.header-section {
  margin-bottom: 32px;
}

.header-content {
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}

.header-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 12px;
}

.header-content p {
  font-size: 1.125rem;
  color: #666;
  text-align: center;
  margin: 0;
}

.basic-info-section,
.questions-section,
.settings-section {
  margin-bottom: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.input-suffix {
  margin-left: 8px;
  color: #666;
  font-size: 0.875rem;
}

.tags-input {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.tag-item {
  margin: 2px;
}

.tag-input {
  width: 120px;
}

.add-tag-btn {
  border-style: dashed;
}

.empty-questions {
  padding: 60px 0;
  text-align: center;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item {
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.question-item:hover,
.question-item.active {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: move;
  color: #999;
}

.question-number {
  font-weight: 600;
  color: #409eff;
}

.question-type-badge {
  background: #f0f9ff;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.question-actions {
  display: flex;
  gap: 8px;
}

.danger-btn {
  color: #f56c6c;
}

.question-content {
  cursor: pointer;
}

.question-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.question-preview {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.options-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
}

.no-options {
  color: #999;
  font-style: italic;
}

.text-preview {
  width: 100%;
}

.rating-preview {
  display: flex;
  align-items: center;
}

.likert-preview {
  width: 100%;
}

.likert-options {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.likert-option {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.footer-actions {
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 16px 0;
  margin: 32px -24px -24px;
  z-index: 10;
}

.actions-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.actions-left,
.actions-right {
  display: flex;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-create {
    padding: 16px;
  }
  
  .actions-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .actions-left,
  .actions-right {
    width: 100%;
    justify-content: center;
  }
  
  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .question-actions {
    width: 100%;
    justify-content: space-around;
  }
}
</style>