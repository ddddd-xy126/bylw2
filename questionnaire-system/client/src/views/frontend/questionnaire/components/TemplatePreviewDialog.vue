<template>
  <el-dialog 
    v-model="visible" 
    :title="template?.title" 
    width="80%" 
    class="preview-dialog"
    :modal="true"
    :close-on-click-modal="true"
    :append-to-body="true"
    @close="handleClose"
  >
    <div v-if="template" class="template-preview">
      <div class="preview-info">
        <div class="info-row">
          <span class="info-label">分类：</span>
          <span>{{ template.category }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">问题数：</span>
          <span>{{ template.questions }}题</span>
        </div>
        <div class="info-row">
          <span class="info-label">预计时长：</span>
          <span>{{ template.duration }}分钟</span>
        </div>
        <div class="info-row">
          <span class="info-label">评分：</span>
          <el-rate :model-value="template.rating" disabled size="small" />
          <span>{{ template.rating }}分</span>
        </div>
      </div>

      <div class="preview-sections">
        <div class="preview-section">
          <h4>问题列表</h4>
          <div v-for="(question, qIndex) in (template.questionList || [])" :key="qIndex" class="preview-question">
            <div class="question-header">
              <span class="question-number">{{ qIndex + 1 }}.</span>
              <span class="question-title">{{ question.title }}</span>
              <span v-if="question.required" class="required-mark">*</span>
            </div>
            <div class="question-type">{{ getQuestionTypeText(question.type) }}</div>
          </div>
          <div v-if="!template.questionList || template.questionList.length === 0" class="no-questions">
            暂无问题
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleUse">
        使用此模板
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  template: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'use'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleUse = () => {
  if (props.template) {
    emit('use', props.template)
    handleClose()
  }
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
</script>

<style scoped lang="scss">
.preview-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .template-preview {
    max-height: 60vh;
    overflow-y: auto;
  }

  .preview-info {
    background: #f8f9fa;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        color: #333;
        min-width: 80px;
      }
    }
  }

  .preview-sections {
    display: flex;
    flex-direction: column;

    .preview-section {
      margin-bottom: 24px;

      h4 {
        font-size: 1.125rem;
        font-weight: 600;
        color: #333;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e5e7eb;
      }
    }

    .preview-question {
      background: #f9fafb;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 12px;

      .question-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .question-number {
          font-weight: 600;
          color: var(--color-primary-light-3);
        }

        .question-title {
          flex: 1;
          font-weight: 500;
          color: #333;
        }

        .required-mark {
          color: #f56c6c;
          font-weight: 600;
        }
      }

      .question-type {
        font-size: 0.875rem;
        color: #888;
      }
    }

    .no-questions {
      text-align: center;
      color: #999;
      font-style: italic;
      padding: 20px;
    }
  }
}
</style>
