<template>
  <div class="custom-create">
    <!-- 头部区域 - 移除返回按钮 -->
    <div class="header-section">
      <div class="header-content">
        <h1>
          {{ isEditMode ? '编辑问卷' : '创建问卷' }}
        </h1>
        <p v-if="!isEditMode">
          管理员创建的问卷将直接发布，无需审核
        </p>
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
            <el-input v-model="questionnaireForm.title" placeholder="请输入问卷标题" size="large" maxlength="100"
              show-word-limit />
          </el-form-item>

          <el-form-item label="问卷描述" prop="description">
            <el-input v-model="questionnaireForm.description" type="textarea" placeholder="请描述问卷的目的、内容简介等" :rows="3"
              maxlength="500" show-word-limit />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="问卷分类" prop="category">
                <el-select v-model="questionnaireForm.category" placeholder="请选择分类" size="large" style="width: 100%">
                  <el-option v-for="category in categories" :key="category.value" :label="category.label"
                    :value="category.value" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="预估时长" prop="duration">
                <el-input-number v-model="questionnaireForm.duration" :min="1" :max="120" size="large"
                  style="width: 100%" />
                <span class="input-suffix">分钟</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="问卷标签">
            <div class="tags-input">
              <el-tag v-for="tag in questionnaireForm.tags" :key="tag" closable @close="removeTag(tag)"
                class="tag-item">
                {{ tag }}
              </el-tag>
              <el-input v-if="tagInputVisible" ref="tagInputRef" v-model="tagInputValue" size="small"
                @keyup.enter="handleTagInputConfirm" @blur="handleTagInputConfirm" class="tag-input" />
              <el-button v-else size="small" @click="showTagInput" class="add-tag-btn">
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
            <span>问题设计 ({{ questions.length }})</span>
            <div class="header-actions">
              <el-dropdown @command="handleAddQuestion" trigger="click">
                <el-button type="primary" size="small">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  添加问题
                  <el-icon class="el-icon--right">
                    <ArrowDown />
                  </el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="single">
                      <el-icon><Select /></el-icon>
                      单选题
                    </el-dropdown-item>
                    <el-dropdown-item command="multiple">
                      <el-icon>
                        <Finished />
                      </el-icon>
                      多选题
                    </el-dropdown-item>
                    <el-dropdown-item command="text">
                      <el-icon>
                        <Edit />
                      </el-icon>
                      文本题
                    </el-dropdown-item>
                    <el-dropdown-item command="rating">
                      <el-icon>
                        <Star />
                      </el-icon>
                      评分题
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </template>

        <div v-if="questions.length === 0" class="empty-questions">
          <el-empty description="暂无问题，点击上方按钮添加问题">
            <el-button type="primary" size="large" @click="handleAddQuestion('single')">
              <el-icon>
                <Plus />
              </el-icon>
              添加第一个问题
            </el-button>
          </el-empty>
        </div>

        <div v-else class="questions-list">
          <!-- 直接显示问题列表 -->
          <div v-for="(question, index) in questions" :key="question.id" class="question-item"
            :class="{ 'active': activeQuestionId === question.id }">
            <div class="question-header">
              <div class="question-info">
                <span class="drag-handle">
                  <el-icon>
                    <Sort />
                  </el-icon>
                </span>
                <span class="question-number">{{ index + 1 }}.</span>
                <span class="question-type-badge">{{ getQuestionTypeText(question.type) }}</span>
              </div>
              <div class="question-actions">
                <el-checkbox :model-value="question.required" @change="toggleQuestionRequired(question.id)"
                  size="small">
                  必填
                </el-checkbox>
                <el-button size="small" type="text" @click="copyQuestion(question)">
                  复制
                </el-button>
                <el-button size="small" type="text" @click="deleteQuestion(question.id)" class="danger-btn">
                  删除
                </el-button>
              </div>
            </div>

            <div class="question-content">
              <!-- 可编辑的问题标题 -->
              <div class="question-title-editor">
                <el-input :model-value="question.title" @input="updateQuestionTitle(question.id, $event)"
                  placeholder="请输入问题标题" size="large" maxlength="200" show-word-limit />
                <span v-if="question.required" class="required-mark">*</span>
              </div>

              <!-- 可编辑的问题描述 -->
              <div class="question-description-editor" style="margin-top: 8px;">
                <el-input :model-value="question.description" @input="updateQuestionDescription(question.id, $event)"
                  placeholder="问题描述（可选）" type="textarea" :rows="2" maxlength="500" show-word-limit />
              </div>

              <!-- 选择题选项编辑 -->
              <div v-if="question.type === 'single' || question.type === 'multiple'" class="options-editor"
                style="margin-top: 12px;">
                <div class="options-header">
                  <span>选项设置</span>
                  <el-button size="small" @click="addOption(question.id)">
                    <el-icon>
                      <Plus />
                    </el-icon>
                    添加选项
                  </el-button>
                </div>
                <div class="options-list">
                  <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-editor-item">
                    <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <el-input :model-value="option.text" @input="updateOptionText(question.id, optIndex, $event)"
                      :placeholder="`选项${optIndex + 1}`" size="small" />
                    <el-button size="small" type="text" @click="removeOption(question.id, optIndex)"
                      :disabled="question.options.length <= 2" class="danger-btn">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 跳转逻辑配置 -->
                <div class="logic-config" style="margin-top: 12px;">
                  <div class="logic-header">
                    <el-checkbox :model-value="question.enableLogic" @change="toggleQuestionLogic(question.id)"
                      size="small">
                      启用跳转逻辑
                    </el-checkbox>
                    <el-tooltip content="根据用户选择的选项跳转到不同题目。注意：如果用户的答案不匹配任何跳转规则，问卷将直接结束。" placement="top">
                      <el-icon style="margin-left: 4px; color: #909399;">
                        <QuestionFilled />
                      </el-icon>
                    </el-tooltip>
                  </div>

                  <el-alert v-if="question.enableLogic" title="跳转逻辑说明" type="info" :closable="false"
                    style="margin-top: 8px; font-size: 12px;">
                    当启用跳转逻辑后，如果用户的答案不匹配任何跳转规则，问卷将直接结束（不会继续显示后续题目）。请确保为所有可能的答案设置跳转规则，或者明确希望某些答案直接结束问卷。
                  </el-alert>

                  <div v-if="question.enableLogic" class="logic-rules"
                    style="margin-top: 8px; padding: 12px; background: #f5f7fa; border-radius: 4px;">
                    <div v-for="(rule, ruleIndex) in (question.logicRules || [])" :key="ruleIndex"
                      class="logic-rule-item" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="font-size: 12px; color: #606266;">当选择</span>
                      <el-select :model-value="rule.optionId"
                        @change="updateLogicRuleOption(question.id, ruleIndex, $event)" size="small"
                        style="width: 150px;" placeholder="选择选项">
                        <el-option v-for="(opt, optIdx) in question.options" :key="optIdx"
                          :label="`${String.fromCharCode(65 + optIdx)}. ${opt.text}`" :value="opt.id" />
                      </el-select>
                      <span style="font-size: 12px; color: #606266;">时，跳转到第</span>
                      <el-input-number :model-value="rule.targetQuestion"
                        @change="updateLogicRuleTarget(question.id, ruleIndex, $event)" :min="1" :max="questions.length"
                        size="small" style="width: 100px;" />
                      <span style="font-size: 12px; color: #606266;">题</span>
                      <el-button size="small" type="text" @click="removeLogicRule(question.id, ruleIndex)"
                        class="danger-btn">
                        <el-icon>
                          <Delete />
                        </el-icon>
                      </el-button>
                    </div>
                    <el-button size="small" @click="addLogicRule(question.id)" style="width: 100%;">
                      <el-icon>
                        <Plus />
                      </el-icon>
                      添加跳转规则
                    </el-button>
                  </div>
                </div>
              </div>

              <!-- 文本题设置 -->
              <div v-else-if="question.type === 'text'" class="text-settings" style="margin-top: 12px;">
                <el-input :model-value="question.placeholder" @input="(val) => question.placeholder = val"
                  placeholder="设置占位符文本" size="small" style="margin-bottom: 8px;" />
                <div class="text-demo">
                  <el-input :type="question.textType || 'text'" :placeholder="question.placeholder || '请输入...'" readonly
                    size="small" />
                </div>
              </div>

              <!-- 评分题预览 -->
              <div v-else-if="question.type === 'rating'" class="rating-preview" style="margin-top: 12px;">
                <div class="rating-demo">
                  <el-rate :model-value="0" :max="question.maxRating || 5" disabled show-score />
                </div>
              </div>
            </div>
          </div>
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
            <el-input v-model="settingsForm.thankMessage" type="textarea" :rows="2" placeholder="感谢您的参与！您的回答已经成功提交。" />
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

    <!-- 底部操作栏 - 移除取消按钮 -->
    <div class="footer-actions">
      <el-button @click="saveAsDraft">
        <el-icon>
          <DocumentCopy />
        </el-icon>
        保存草稿
      </el-button>
      <el-button type="primary" @click="publishQuestionnaire">
        <el-icon>
          <Promotion />
        </el-icon>
        {{ isEditMode ? '更新问卷' : '发布问卷' }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
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
  Promotion,
  Delete,
  QuestionFilled
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 检查是否为编辑模式
const isEditMode = ref(false)
const isTemplateMode = ref(false)
const currentQuestionnaireId = ref(null)
const currentTemplateId = ref(null)
const originalQuestionnaireData = ref(null) // 保存原始问卷数据

// 自动保存相关
const autoSaveTimer = ref(null)
const lastSavedData = ref(null)

onMounted(() => {
  // 检查模式
  if (route.path.includes('/edit/')) {
    isEditMode.value = true
    currentQuestionnaireId.value = route.params.id
    loadQuestionnaireForEdit(route.params.id)
  } else if (route.path.includes('/template/')) {
    isTemplateMode.value = true
    currentTemplateId.value = route.params.id
    loadTemplate(route.params.id)
  } else {
    // 检查是否有本地草稿
    checkLocalDraft()
  }

  // 启动自动保存
  startAutoSave()

  // 监听页面刷新/关闭事件
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 检查本地草稿
const checkLocalDraft = async () => {
  const localData = loadFromLocalStorage()
  if (localData && (localData.title || localData.questions?.length > 0)) {
    try {
      await ElMessageBox.confirm(
        '检测到有未保存的草稿，是否继续编辑？',
        '恢复草稿',
        {
          confirmButtonText: '继续编辑',
          cancelButtonText: '新建问卷',
          type: 'info'
        }
      )
      loadQuestionnaireData(localData)
    } catch {
      clearLocalStorage()
    }
  }
}

// 加载模板
const loadTemplate = async (templateId) => {
  try {
    // 模拟模板数据 - 实际项目中应该从API获取
    const templates = {
      1: {
        title: '员工满意度调查',
        description: '全面了解员工对工作环境、薪酬福利、职业发展等方面的满意度',
        category: 'enterprise',
        duration: 15,
        tags: ['员工', '满意度', '企业管理'],
        questions: [
          {
            id: 1,
            type: 'single',
            title: '您的工作部门是？',
            required: true,
            options: [
              { text: '技术部' },
              { text: '市场部' },
              { text: '人事部' },
              { text: '财务部' },
              { text: '其他' }
            ]
          },
          {
            id: 2,
            type: 'rating',
            title: '您对当前工作内容的满意度',
            required: true,
            maxRating: 5,
            ratingStyle: 'star'
          }
        ]
      },
      2: {
        title: '产品用户体验调研',
        description: '收集用户对产品功能、界面设计、使用体验的反馈和建议',
        category: 'product',
        duration: 12,
        tags: ['用户体验', '产品', '反馈'],
        questions: [
          {
            id: 1,
            type: 'single',
            title: '您的年龄段是？',
            required: true,
            options: [
              { text: '18-25岁' },
              { text: '26-35岁' },
              { text: '36-45岁' },
              { text: '46岁以上' }
            ]
          },
          {
            id: 2,
            type: 'multiple',
            title: '您最喜欢的功能有哪些？',
            required: false,
            options: [
              { text: '界面设计' },
              { text: '功能丰富' },
              { text: '响应速度' },
              { text: '用户体验' }
            ]
          }
        ]
      }
    }

    const templateData = templates[templateId]
    if (templateData) {
      loadQuestionnaireData(templateData)
      ElMessage.success(`已加载模板：${templateData.title}`)
    } else {
      throw new Error('模板不存在')
    }
  } catch (error) {
    console.error('加载模板失败:', error)
    ElMessage.error('加载模板失败：' + error.message)
    router.push('/create')
  }
}

onBeforeUnmount(() => {
  // 清理定时器和事件监听
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value)
  }
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// 自动保存功能
const startAutoSave = () => {
  autoSaveTimer.value = setInterval(() => {
    const currentData = buildQuestionnaireData('draft')
    const dataStr = JSON.stringify(currentData)

    // 只有数据发生变化时才保存
    if (dataStr !== lastSavedData.value) {
      saveToLocalStorage(currentData)
      lastSavedData.value = dataStr
    }
  }, 30000) // 每30秒自动保存一次
}

// 本地存储管理
const saveToLocalStorage = (data) => {
  try {
    const key = isEditMode.value
      ? `edit_questionnaire_${currentQuestionnaireId.value}`
      : 'new_questionnaire_draft'
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('本地保存失败:', error)
  }
}

const loadFromLocalStorage = () => {
  try {
    const key = isEditMode.value
      ? `edit_questionnaire_${currentQuestionnaireId.value}`
      : 'new_questionnaire_draft'
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('从本地存储加载失败:', error)
    return null
  }
}

const clearLocalStorage = () => {
  try {
    const key = isEditMode.value
      ? `edit_questionnaire_${currentQuestionnaireId.value}`
      : 'new_questionnaire_draft'
    localStorage.removeItem(key)
  } catch (error) {
    console.error('清理本地存储失败:', error)
  }
}

// 编辑模式：加载现有问卷数据
const loadQuestionnaireForEdit = async (id) => {
  try {
    console.log('[编辑模式] 开始加载问卷，ID:', id)

    // 首先尝试从本地存储加载（可能有未保存的编辑）
    const localData = loadFromLocalStorage()
    console.log('[编辑模式] 本地存储数据:', localData)

    if (localData) {
      const shouldLoadLocal = await ElMessageBox.confirm(
        '检测到有未保存的编辑内容，是否继续编辑？',
        '恢复编辑',
        {
          confirmButtonText: '继续编辑',
          cancelButtonText: '重新开始',
          type: 'info'
        }
      ).catch(() => false)

      if (shouldLoadLocal) {
        console.log('[编辑模式] 用户选择加载本地数据')
        loadQuestionnaireData(localData)
        return
      } else {
        console.log('[编辑模式] 用户选择清除本地数据')
        clearLocalStorage()
      }
    }

    // 从服务器加载问卷数据
    console.log('[编辑模式] 从服务器加载数据...')
    const response = await fetch(`http://localhost:3002/surveys/${id}`)
    console.log('[编辑模式] 服务器响应状态:', response.status)

    if (!response.ok) {
      throw new Error('问卷不存在或加载失败')
    }

    const questionnaireData = await response.json()
    console.log('[编辑模式] 服务器返回的数据:', questionnaireData)

    // 保存原始数据
    originalQuestionnaireData.value = questionnaireData
    loadQuestionnaireData(questionnaireData)

    console.log('[编辑模式] 数据加载完成')
  } catch (error) {
    console.error('[编辑模式] 加载问卷失败:', error)
    ElMessage.error('加载问卷失败：' + error.message)
    router.push('/create')
  }
}

// 将问卷数据加载到表单
const loadQuestionnaireData = (data) => {
  console.log('[加载数据] 开始加载问卷数据:', data)

  // 加载基本信息
  questionnaireForm.title = data.title || ''
  questionnaireForm.description = data.description || ''
  questionnaireForm.category = data.category || ''
  questionnaireForm.duration = data.duration || 10
  questionnaireForm.tags = data.tags || []

  console.log('[加载数据] 基本信息已加载:', {
    title: questionnaireForm.title,
    description: questionnaireForm.description,
    category: questionnaireForm.category,
    duration: questionnaireForm.duration,
    tags: questionnaireForm.tags
  })

  // 加载问题 - 支持 questions 和 questionList 两种字段名
  const questionData = data.questionList || data.questions || []
  console.log('[加载数据] 原始问题数据:', questionData)
  console.log('[加载数据] 问题数据类型:', Array.isArray(questionData) ? '数组' : typeof questionData)

  // 确保问题数据是数组
  questions.value = Array.isArray(questionData) ? questionData : []

  console.log('[加载数据] 加载后的问题列表:', questions.value)
  console.log('[加载数据] 问题数量:', questions.value.length)

  // 加载设置
  if (data.settings) {
    Object.assign(settingsForm, data.settings)
    console.log('[加载数据] 设置已加载:', settingsForm)
  }

  console.log('[加载数据] 数据加载完成，当前编辑模式:', isEditMode.value)
}

// 页面离开前检查
const handleBeforeUnload = (event) => {
  if (hasUnsavedChanges()) {
    event.preventDefault()
    event.returnValue = '您有未保存的更改，确定要离开吗？'
  }
}

// 响应式数据
const formRef = ref(null)
const tagInputRef = ref(null)
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
const activeQuestionId = ref(null)

// 问卷设置
const settingsForm = reactive({
  thankMessage: '感谢您的参与！您的回答已经成功提交。',
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

const hasUnsavedChanges = () => {
  return questionnaireForm.title || questionnaireForm.description || questions.value.length > 0
}

// 添加问题的统一处理函数
const handleAddQuestion = (type) => {
  console.log('Adding question of type:', type)

  if (!type) {
    ElMessage.warning('请选择问题类型')
    return
  }

  const questionTypes = {
    'single': {
      type: 'single',
      title: '新的单选题',
      description: '',
      required: false,
      options: [
        { id: 'opt1', text: '选项1' },
        { id: 'opt2', text: '选项2' }
      ],
      allowOther: false
    },
    'multiple': {
      type: 'multiple',
      title: '新的多选题',
      description: '',
      required: false,
      options: [
        { id: 'opt1', text: '选项1' },
        { id: 'opt2', text: '选项2' },
        { id: 'opt3', text: '选项3' }
      ],
      allowOther: false,
      randomOrder: false
    },
    'text': {
      type: 'text',
      title: '新的文本题',
      description: '',
      required: false,
      textType: 'text',
      placeholder: '请输入...',
      minLength: null,
      maxLength: 500
    },
    'rating': {
      type: 'rating',
      title: '新的评分题',
      description: '',
      required: false,
      minRating: 1,
      maxRating: 5,
      ratingStyle: 'star',
      ratingLabels: { low: '很差', high: '很好' }
    }
  }

  const questionTemplate = questionTypes[type]

  if (!questionTemplate) {
    ElMessage.error('未知的问题类型')
    return
  }

  const newQuestion = {
    ...questionTemplate,
    id: Date.now() + Math.random() // 确保唯一ID
  }

  questions.value.push(newQuestion)
  activeQuestionId.value = newQuestion.id

  ElMessage.success(`已添加${getQuestionTypeText(type)}`)

  console.log('Question added:', newQuestion)
  console.log('Total questions:', questions.value.length)
}

// 添加预设的示例问题（保留但简化）
// 添加预设的示例问题（保留但简化）
const addSampleQuestions = () => {
  const sampleQuestions = [
    {
      id: Date.now() + 1,
      type: 'single',
      title: '您的性别是？',
      description: '',
      required: true,
      options: [
        { id: 'male', text: '男' },
        { id: 'female', text: '女' },
        { id: 'other', text: '其他' }
      ],
      allowOther: false
    },
    {
      id: Date.now() + 2,
      type: 'multiple',
      title: '您平时喜欢的运动有哪些？',
      description: '可以选择多个选项',
      required: false,
      options: [
        { id: 'run', text: '跑步' },
        { id: 'swim', text: '游泳' },
        { id: 'gym', text: '健身' },
        { id: 'yoga', text: '瑜伽' },
        { id: 'basketball', text: '篮球' }
      ],
      allowOther: true,
      randomOrder: false
    },
    {
      id: Date.now() + 3,
      type: 'text',
      title: '请描述您对我们产品的建议',
      description: '您的意见对我们很重要',
      required: false,
      textType: 'textarea',
      placeholder: '请输入您的建议...',
      minLength: null,
      maxLength: 500
    },
    {
      id: Date.now() + 4,
      type: 'rating',
      title: '请对我们的服务进行评分',
      description: '',
      required: true,
      minRating: 1,
      maxRating: 5,
      ratingStyle: 'star',
      ratingLabels: { low: '很差', high: '很好' }
    }
  ]

  questions.value = [...sampleQuestions]
  ElMessage.success('已添加示例问题')
}

// 删除旧的 addSimpleQuestion 函数（已被 handleAddQuestion 替代）

// 直接编辑问题标题
const updateQuestionTitle = (questionId, newTitle) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    question.title = newTitle
  }
}

// 直接编辑问题描述
const updateQuestionDescription = (questionId, newDescription) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    question.description = newDescription
  }
}

// 切换问题必填状态
const toggleQuestionRequired = (questionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    question.required = !question.required
  }
}

// 添加选项
const addOption = (questionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && (question.type === 'single' || question.type === 'multiple')) {
    const optionIndex = question.options.length + 1
    const newOption = {
      id: `opt${optionIndex}_${Date.now()}`,
      text: `选项${optionIndex}`
    }
    question.options.push(newOption)
    ElMessage.success('已添加选项')
  }
}

// 删除选项
const removeOption = (questionId, optionIndex) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && question.options && question.options.length > 2) {
    question.options.splice(optionIndex, 1)
  } else {
    ElMessage.warning('至少需要保留2个选项')
  }
}

// 更新选项文本
const updateOptionText = (questionId, optionIndex, newText) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && question.options && question.options[optionIndex]) {
    question.options[optionIndex].text = newText
  }
}

// 切换跳转逻辑
const toggleQuestionLogic = (questionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    question.enableLogic = !question.enableLogic
    if (question.enableLogic && !question.logicRules) {
      question.logicRules = []
    }
  }
}

// 添加跳转规则
const addLogicRule = (questionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question) {
    if (!question.logicRules) {
      question.logicRules = []
    }
    question.logicRules.push({
      optionId: question.options[0]?.id || '',
      targetQuestion: questions.value.findIndex(q => q.id === questionId) + 2
    })
    ElMessage.success('已添加跳转规则')
  }
}

// 删除跳转规则
const removeLogicRule = (questionId, ruleIndex) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && question.logicRules) {
    question.logicRules.splice(ruleIndex, 1)
    ElMessage.success('已删除跳转规则')
  }
}

// 更新跳转规则选项
const updateLogicRuleOption = (questionId, ruleIndex, optionId) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && question.logicRules && question.logicRules[ruleIndex]) {
    question.logicRules[ruleIndex].optionId = optionId
  }
}

// 更新跳转规则目标
const updateLogicRuleTarget = (questionId, ruleIndex, target) => {
  const question = questions.value.find(q => q.id === questionId)
  if (question && question.logicRules && question.logicRules[ruleIndex]) {
    question.logicRules[ruleIndex].targetQuestion = target
  }
}

const copyQuestion = (question) => {
  // 深拷贝问题对象
  const copiedQuestion = JSON.parse(JSON.stringify(question))

  // 更新 ID 和标题
  copiedQuestion.id = Date.now() + Math.random()
  copiedQuestion.title = question.title + ' (副本)'

  // 如果有选项，也更新选项的 ID
  if (copiedQuestion.options && Array.isArray(copiedQuestion.options)) {
    copiedQuestion.options = copiedQuestion.options.map((opt, index) => ({
      ...opt,
      id: `opt${index + 1}_${Date.now()}_${Math.random()}`
    }))
  }

  questions.value.push(copiedQuestion)
  activeQuestionId.value = copiedQuestion.id
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
const saveAsDraft = async () => {
  if (!validateBasicInfo()) return

  try {
    const questionnaireData = buildQuestionnaireData('draft')

    if (isEditMode.value && currentQuestionnaireId.value) {
      // 编辑模式：更新现有问卷
      const response = await fetch(`http://localhost:3002/surveys/${currentQuestionnaireId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData)
      })
      
      if (!response.ok) throw new Error('保存失败')
      ElMessage.success('草稿更新成功')
    } else {
      // 创建模式：创建新问卷
      const response = await fetch('http://localhost:3002/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData)
      })
      
      if (!response.ok) throw new Error('保存失败')
      ElMessage.success('草稿保存成功')
    }

    // 清除本地存储
    clearLocalStorage()

    // 返回管理页面
    router.push('/admin/questionnaires/list')
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('保存失败：' + error.message)
  }
}

const publishQuestionnaire = async () => {
  if (!validateForm()) return

  try {
    // 管理员创建的问卷直接发布，无需审核
    await ElMessageBox.confirm(
      isEditMode.value 
        ? '确定要更新此问卷吗？更新后将立即生效。'
        : '确定要发布此问卷吗？发布后将立即上线。',
      isEditMode.value ? '确认更新' : '确认发布',
      {
        confirmButtonText: isEditMode.value ? '确定更新' : '确定发布',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 管理员创建的问卷状态直接设为 published
    const questionnaireData = buildQuestionnaireData('published')

    if (isEditMode.value && currentQuestionnaireId.value) {
      // 编辑模式：直接更新到 db.json
      const response = await fetch(`http://localhost:3002/surveys/${currentQuestionnaireId.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData)
      })
      
      if (!response.ok) throw new Error('更新失败')
      
      ElMessage.success('问卷更新成功！')

      // 记录管理员操作
      const { recordAdminActivity } = await import('@/api/admin')
      await recordAdminActivity({
        adminId: userStore.profile.id,
        adminName: userStore.profile.nickname || userStore.profile.username,
        title: '编辑问卷',
        description: `编辑了问卷"${questionnaireData.title}"`,
        type: 'questionnaire_edit'
      })
    } else {
      // 创建模式：直接保存到 db.json
      const response = await fetch('http://localhost:3002/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionnaireData)
      })
      
      if (!response.ok) throw new Error('发布失败')
      
      ElMessage.success('问卷发布成功！')

      // 记录管理员操作
      const { recordAdminActivity } = await import('@/api/admin')
      await recordAdminActivity({
        adminId: userStore.profile.id,
        adminName: userStore.profile.nickname || userStore.profile.username,
        title: '创建问卷',
        description: `创建了新问卷"${questionnaireData.title}"`,
        type: 'questionnaire_create'
      })
    }

    // 清除本地草稿
    clearLocalStorage()

    // 返回管理页面
    router.push('/admin/questionnaires/list')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败：' + error.message)
    }
  }
}

// 构建问卷数据
const buildQuestionnaireData = (status = 'draft') => {
  const userId = userStore.profile?.id || 1
  const userName = userStore.profile?.nickname || userStore.profile?.username || '匿名用户'

  // 格式化问题列表
  const formattedQuestions = questions.value.map((q, index) => ({
    ...q,
    order: index + 1
  }))

  const baseData = {
    title: questionnaireForm.title,
    description: questionnaireForm.description,
    category: questionnaireForm.category,
    duration: questionnaireForm.duration,
    tags: questionnaireForm.tags,
    // 保存问题数量
    questions: formattedQuestions.length,
    // 保存问题详情列表
    questionList: formattedQuestions,
    settings: {
      ...settingsForm
    },
    status: status,
    updatedAt: new Date().toISOString()
  }

  // 如果是编辑模式，保留原始数据的某些字段
  if (isEditMode.value && originalQuestionnaireData.value) {
    return {
      ...originalQuestionnaireData.value, // 保留所有原始字段
      ...baseData,                        // 覆盖更新的字段
      id: currentQuestionnaireId.value || originalQuestionnaireData.value.id,
      userId: originalQuestionnaireData.value.userId || originalQuestionnaireData.value.authorId || userId,
      authorId: originalQuestionnaireData.value.authorId || originalQuestionnaireData.value.userId || userId,
      authorName: originalQuestionnaireData.value.authorName || originalQuestionnaireData.value.author || userName,
      author: originalQuestionnaireData.value.author || originalQuestionnaireData.value.authorName || userName,
      createdAt: originalQuestionnaireData.value.createdAt, // 保留创建时间
      participants: originalQuestionnaireData.value.participants || originalQuestionnaireData.value.participantCount || 0,
      participantCount: originalQuestionnaireData.value.participantCount || originalQuestionnaireData.value.participants || 0
    }
  }

  // 新建模式
  return {
    ...baseData,
    id: currentQuestionnaireId.value || Date.now(),
    createdAt: new Date().toISOString(),
    userId: userId,
    authorId: userId,
    authorName: userName,
    author: userName,
    // 初始化参与人数
    participants: 0,
    participantCount: 0
  }
}

// 保存问卷到服务器
const validateBasicInfo = () => {
  if (!questionnaireForm.title.trim()) {
    ElMessage.error('请输入问卷标题')
    return false
  }
  return true
}

const validateForm = () => {
  console.log('Validating form...')
  console.log('Basic info valid:', validateBasicInfo())
  console.log('Questions count:', questions.value.length)
  console.log('Questions data:', questions.value)

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
    console.log(`Validating question ${i + 1}:`, question)

    if (!question.title || !question.title.trim()) {
      ElMessage.error(`第${i + 1}个问题的标题不能为空`)
      return false
    }

    if ((question.type === 'single' || question.type === 'multiple') &&
      (!question.options || question.options.length < 2)) {
      ElMessage.error(`第${i + 1}个问题至少需要2个选项`)
      return false
    }

    // 验证选项内容
    if (question.type === 'single' || question.type === 'multiple') {
      const validOptions = question.options.filter(opt =>
        opt && opt.text && opt.text.trim()
      )
      if (validOptions.length < 2) {
        ElMessage.error(`第${i + 1}个问题至少需要2个有效选项`)
        return false
      }
    }
  }

  console.log('Form validation passed!')
  return true
}
</script>

<style scoped lang="scss">
.custom-create {
  min-height: 100vh;
  padding: 30px 285px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.header-section {
  margin-bottom: 32px;

  .header-content {
    position: relative;

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      text-align: center;
      margin-bottom: 12px;
    }

    p {
      font-size: 1.125rem;
      color: #666;
      text-align: center;
      margin: 0;
    }
  }
}

.basic-info-section,
.questions-section,
.settings-section {
  margin-bottom: 32px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;

    .header-actions {
      display: flex;
      gap: 12px;
    }
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

    .tag-item {
      margin: 2px;
    }

    .tag-input {
      width: 120px;
    }

    .add-tag-btn {
      border-style: dashed;
    }
  }
}

.empty-questions {
  padding: 60px 0;
  text-align: center;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .question-item {
    border: 2px solid #f0f0f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover,
    &.active {
      border-color: var(--color-primary-light-3);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
    }

    .question-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .question-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .drag-handle {
          cursor: move;
          color: #999;
        }

        .question-number {
          font-weight: 600;
          color: var(--color-primary-light-3);
        }

        .question-type-badge {
          background: #f0f9ff;
          color: #0369a1;
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }
      }

      .question-actions {
        display: flex;
        gap: 8px;

        @media (max-width: 768px) {
          width: 100%;
          justify-content: space-around;
        }

        .danger-btn {
          color: #f56c6c;
        }
      }
    }

    .question-content {
      cursor: pointer;

      .question-title {
        font-size: 1.125rem;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;

        .required-mark {
          color: #f56c6c;
          margin-left: 4px;
        }
      }

      .question-preview {
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;

        .options-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .option-item {
            display: flex;
            align-items: center;
          }

          .no-options {
            color: #999;
            font-style: italic;
          }
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

          .likert-options {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 8px;

            .likert-option {
              display: flex;
              align-items: center;
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* 新增的编辑器样式 */
.question-title-editor {
  position: relative;

  .required-mark {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #f56c6c;
    font-weight: bold;
  }
}

.options-editor {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  background: #fafbfc;

  .options-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 600;
    color: #333;
  }

  .option-editor-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .option-label {
      min-width: 24px;
      font-weight: 600;
      color: #666;
    }
  }
}

.text-settings,
.rating-preview {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 12px;
  background: #fafbfc;

  .text-demo,
  .rating-demo {
    margin-top: 8px;
  }
}
</style>