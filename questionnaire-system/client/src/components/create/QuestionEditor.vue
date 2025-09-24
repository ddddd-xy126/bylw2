<template>
  <div class="question-editor">
    <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
      <!-- 问题基本信息 -->
      <el-form-item label="问题类型">
        <el-select v-model="form.type" @change="onTypeChange" disabled>
          <el-option label="单选题" value="single" />
          <el-option label="多选题" value="multiple" />
          <el-option label="文本题" value="text" />
          <el-option label="评分题" value="rating" />
          <el-option label="量表题" value="likert" />
        </el-select>
      </el-form-item>

      <el-form-item label="问题标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入问题标题"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="问题描述" v-if="form.description !== undefined">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="问题的详细描述（可选）"
          :rows="2"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item>
        <el-checkbox v-model="form.required">必填项</el-checkbox>
      </el-form-item>

      <!-- 选择题选项 -->
      <div v-if="form.type === 'single' || form.type === 'multiple'" class="options-section">
        <div class="section-header">
          <span class="section-title">选项设置</span>
          <el-button size="small" @click="addOption">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </div>

        <div class="options-list">
          <div
            v-for="(option, index) in form.options"
            :key="index"
            class="option-item"
          >
            <div class="option-prefix">
              <span class="option-label">{{ getOptionLabel(index) }}</span>
            </div>
            <el-input
              v-model="option.text"
              :placeholder="`选项${index + 1}`"
              class="option-input"
            />
            <div class="option-actions">
              <el-button
                size="small"
                type="text"
                @click="moveOptionUp(index)"
                :disabled="index === 0"
              >
                <el-icon><ArrowUp /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="text"
                @click="moveOptionDown(index)"
                :disabled="index === form.options.length - 1"
              >
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="text"
                @click="removeOption(index)"
                :disabled="form.options.length <= 2"
                class="danger-btn"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <div class="option-settings">
          <el-checkbox v-if="form.type === 'single'" v-model="form.allowOther">
            允许填写其他选项
          </el-checkbox>
          <el-checkbox v-if="form.type === 'multiple'" v-model="form.allowOther">
            允许填写其他选项
          </el-checkbox>
          <el-checkbox v-if="form.type === 'multiple'" v-model="form.randomOrder">
            选项随机排序
          </el-checkbox>
        </div>
      </div>

      <!-- 文本题设置 -->
      <div v-if="form.type === 'text'" class="text-section">
        <div class="section-header">
          <span class="section-title">文本设置</span>
        </div>

        <el-form-item label="输入类型">
          <el-select v-model="form.textType">
            <el-option label="单行文本" value="text" />
            <el-option label="多行文本" value="textarea" />
            <el-option label="数字" value="number" />
            <el-option label="邮箱" value="email" />
            <el-option label="电话" value="tel" />
            <el-option label="网址" value="url" />
            <el-option label="日期" value="date" />
          </el-select>
        </el-form-item>

        <el-form-item label="占位符">
          <el-input
            v-model="form.placeholder"
            placeholder="请输入占位符文本"
          />
        </el-form-item>

        <el-form-item label="字符限制" v-if="form.textType === 'text' || form.textType === 'textarea'">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-input-number
                v-model="form.minLength"
                :min="0"
                placeholder="最小长度"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="form.maxLength"
                :min="form.minLength || 0"
                placeholder="最大长度"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>
      </div>

      <!-- 评分题设置 -->
      <div v-if="form.type === 'rating'" class="rating-section">
        <div class="section-header">
          <span class="section-title">评分设置</span>
        </div>

        <el-form-item label="评分范围">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-input-number
                v-model="form.minRating"
                :min="0"
                :max="form.maxRating - 1"
                placeholder="最小值"
                style="width: 100%"
              />
            </el-col>
            <el-col :span="12">
              <el-input-number
                v-model="form.maxRating"
                :min="form.minRating + 1"
                :max="10"
                placeholder="最大值"
                style="width: 100%"
              />
            </el-col>
          </el-row>
        </el-form-item>

        <el-form-item label="评分样式">
          <el-select v-model="form.ratingStyle">
            <el-option label="星星" value="star" />
            <el-option label="数字" value="number" />
            <el-option label="表情" value="emoji" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签设置">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-input
                v-model="form.ratingLabels.low"
                placeholder="低分标签"
              />
            </el-col>
            <el-col :span="12">
              <el-input
                v-model="form.ratingLabels.high"
                placeholder="高分标签"
              />
            </el-col>
          </el-row>
        </el-form-item>
      </div>

      <!-- 量表题设置 -->
      <div v-if="form.type === 'likert'" class="likert-section">
        <div class="section-header">
          <span class="section-title">量表设置</span>
        </div>

        <el-form-item label="量表类型">
          <el-select v-model="form.likertType">
            <el-option label="5点量表" value="5-point" />
            <el-option label="7点量表" value="7-point" />
            <el-option label="3点量表" value="3-point" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>

        <div v-if="form.likertType === 'custom'" class="custom-likert">
          <el-form-item label="自定义选项">
            <div class="likert-options">
              <div
                v-for="(option, index) in form.likertOptions"
                :key="index"
                class="likert-option-item"
              >
                <el-input
                  v-model="option.text"
                  :placeholder="`选项${index + 1}`"
                  class="likert-input"
                />
                <el-button
                  size="small"
                  type="text"
                  @click="removeLikertOption(index)"
                  :disabled="form.likertOptions.length <= 2"
                  class="danger-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button size="small" @click="addLikertOption">
              <el-icon><Plus /></el-icon>
              添加选项
            </el-button>
          </el-form-item>
        </div>

        <el-form-item label="显示方式">
          <el-radio-group v-model="form.likertDisplay">
            <el-radio label="horizontal">水平排列</el-radio>
            <el-radio label="vertical">垂直排列</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <div class="section-header">
          <span class="section-title">预览效果</span>
        </div>
        <div class="preview-content">
          <div class="preview-question">
            <div class="preview-title">
              {{ form.title || '问题标题' }}
              <span v-if="form.required" class="required-mark">*</span>
            </div>
            <div v-if="form.description" class="preview-description">
              {{ form.description }}
            </div>
            
            <!-- 预览内容 -->
            <div class="preview-body">
              <!-- 单选题预览 -->
              <el-radio-group v-if="form.type === 'single'" v-model="previewValue">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="preview-option"
                >
                  <el-radio :label="index">{{ option.text || `选项${index + 1}` }}</el-radio>
                </div>
                <div v-if="form.allowOther" class="preview-option">
                  <el-radio label="other">其他：</el-radio>
                  <el-input placeholder="请填写其他选项" size="small" style="width: 200px; margin-left: 8px;" />
                </div>
              </el-radio-group>

              <!-- 多选题预览 -->
              <el-checkbox-group v-else-if="form.type === 'multiple'" v-model="previewValues">
                <div
                  v-for="(option, index) in form.options"
                  :key="index"
                  class="preview-option"
                >
                  <el-checkbox :label="index">{{ option.text || `选项${index + 1}` }}</el-checkbox>
                </div>
                <div v-if="form.allowOther" class="preview-option">
                  <el-checkbox label="other">其他：</el-checkbox>
                  <el-input placeholder="请填写其他选项" size="small" style="width: 200px; margin-left: 8px;" />
                </div>
              </el-checkbox-group>

              <!-- 文本题预览 -->
              <el-input
                v-else-if="form.type === 'text'"
                :type="form.textType"
                :placeholder="form.placeholder"
                v-model="previewText"
                :rows="form.textType === 'textarea' ? 3 : undefined"
                :maxlength="form.maxLength"
                :show-word-limit="!!form.maxLength"
              />

              <!-- 评分题预览 -->
              <div v-else-if="form.type === 'rating'" class="preview-rating">
                <div class="rating-labels" v-if="form.ratingLabels.low || form.ratingLabels.high">
                  <span class="label-low">{{ form.ratingLabels.low }}</span>
                  <span class="label-high">{{ form.ratingLabels.high }}</span>
                </div>
                <el-rate
                  v-model="previewRating"
                  :max="form.maxRating"
                  show-score
                  text-color="#ff9900"
                />
              </div>

              <!-- 量表题预览 -->
              <el-radio-group
                v-else-if="form.type === 'likert'"
                v-model="previewLikert"
                :class="`likert-${form.likertDisplay}`"
              >
                <el-radio
                  v-for="(option, index) in getLikertOptions()"
                  :key="index"
                  :label="index"
                  class="likert-radio"
                >
                  {{ option }}
                </el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </el-form>

    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="save">保存</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Delete
} from '@element-plus/icons-vue'

const props = defineProps({
  question: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['save', 'cancel'])

const formRef = ref(null)
const previewValue = ref('')
const previewValues = ref([])
const previewText = ref('')
const previewRating = ref(0)
const previewLikert = ref('')

const form = reactive({
  type: 'single',
  title: '',
  description: '',
  required: false,
  options: [{ text: '' }, { text: '' }],
  allowOther: false,
  randomOrder: false,
  textType: 'text',
  placeholder: '请输入...',
  minLength: null,
  maxLength: null,
  minRating: 1,
  maxRating: 5,
  ratingStyle: 'star',
  ratingLabels: {
    low: '',
    high: ''
  },
  likertType: '5-point',
  likertOptions: [],
  likertDisplay: 'horizontal'
})

const rules = {
  title: [
    { required: true, message: '请输入问题标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ]
}

onMounted(() => {
  if (props.question) {
    Object.assign(form, props.question)
  }
  
  // 初始化默认选项
  if (!form.options && (form.type === 'single' || form.type === 'multiple')) {
    form.options = [{ text: '' }, { text: '' }]
  }
  
  if (form.type === 'likert' && form.likertType === 'custom' && !form.likertOptions) {
    form.likertOptions = [{ text: '' }, { text: '' }]
  }
})

// 监听类型变化
watch(() => form.type, (newType) => {
  onTypeChange(newType)
})

const onTypeChange = (type) => {
  // 重置相关字段
  if (type === 'single' || type === 'multiple') {
    if (!form.options || form.options.length === 0) {
      form.options = [{ text: '' }, { text: '' }]
    }
  } else if (type === 'text') {
    form.textType = 'text'
    form.placeholder = '请输入...'
  } else if (type === 'rating') {
    form.minRating = 1
    form.maxRating = 5
    form.ratingStyle = 'star'
    form.ratingLabels = { low: '', high: '' }
  } else if (type === 'likert') {
    form.likertType = '5-point'
    form.likertDisplay = 'horizontal'
  }
}

// 选项管理
const addOption = () => {
  form.options.push({ text: '' })
}

const removeOption = (index) => {
  if (form.options.length > 2) {
    form.options.splice(index, 1)
  }
}

const moveOptionUp = (index) => {
  if (index > 0) {
    const temp = form.options[index]
    form.options[index] = form.options[index - 1]
    form.options[index - 1] = temp
  }
}

const moveOptionDown = (index) => {
  if (index < form.options.length - 1) {
    const temp = form.options[index]
    form.options[index] = form.options[index + 1]
    form.options[index + 1] = temp
  }
}

const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) // A, B, C, D...
}

// 量表选项管理
const addLikertOption = () => {
  form.likertOptions.push({ text: '' })
}

const removeLikertOption = (index) => {
  if (form.likertOptions.length > 2) {
    form.likertOptions.splice(index, 1)
  }
}

const getLikertOptions = () => {
  if (form.likertType === 'custom') {
    return form.likertOptions.map(opt => opt.text || '选项')
  }
  
  const likertMap = {
    '5-point': ['非常不同意', '不同意', '中立', '同意', '非常同意'],
    '7-point': ['极不同意', '很不同意', '不同意', '中立', '同意', '很同意', '极同意'],
    '3-point': ['不同意', '中立', '同意']
  }
  
  return likertMap[form.likertType] || likertMap['5-point']
}

// 保存和取消
const save = async () => {
  try {
    await formRef.value.validate()
    
    // 验证选项
    if ((form.type === 'single' || form.type === 'multiple')) {
      const validOptions = form.options.filter(opt => opt.text.trim())
      if (validOptions.length < 2) {
        ElMessage.error('至少需要设置2个有效选项')
        return
      }
    }
    
    // 验证量表选项
    if (form.type === 'likert' && form.likertType === 'custom') {
      const validLikertOptions = form.likertOptions.filter(opt => opt.text.trim())
      if (validLikertOptions.length < 2) {
        ElMessage.error('至少需要设置2个有效的量表选项')
        return
      }
    }
    
    emit('save', { ...form })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const cancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.question-editor {
  max-height: 70vh;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-weight: 600;
  color: #333;
}

.options-section,
.text-section,
.rating-section,
.likert-section,
.preview-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-prefix {
  min-width: 24px;
  text-align: center;
}

.option-label {
  font-weight: 600;
  color: #666;
}

.option-input {
  flex: 1;
}

.option-actions {
  display: flex;
  gap: 4px;
}

.option-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.likert-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.likert-option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.likert-input {
  flex: 1;
}

.preview-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-question {
  max-width: 600px;
}

.preview-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.required-mark {
  color: #f56c6c;
  margin-left: 4px;
}

.preview-description {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 16px;
}

.preview-body {
  margin-top: 16px;
}

.preview-option {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.preview-rating {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #666;
}

.likert-horizontal {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.likert-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.likert-radio {
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  margin-top: 24px;
}

.danger-btn {
  color: #f56c6c;
}

.danger-btn:hover {
  color: #f78989;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .option-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .option-actions {
    justify-content: center;
  }
  
  .likert-horizontal {
    flex-direction: column;
    gap: 8px;
  }
}
</style>