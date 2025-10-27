<template>
  <div class="preview-page">
    <div class="preview-header">
      <h1>问卷预览</h1>
      <p>这是您问卷的预览效果，实际发布后用户看到的就是这样</p>
      <el-button @click="closePreview">关闭预览</el-button>
    </div>
    
    <div class="preview-content" v-if="questionnaire">
      <div class="questionnaire-preview">
        <div class="questionnaire-header">
          <h2>{{ questionnaire.title }}</h2>
          <p class="description">{{ questionnaire.description }}</p>
          <div class="meta-info">
            <span>预计耗时：{{ questionnaire.duration }}分钟</span>
            <span>共{{ questionnaire.questions?.length || 0 }}个问题</span>
          </div>
        </div>
        
        <div class="questions-preview">
          <div
            v-for="(question, index) in questionnaire.questions"
            :key="question.id"
            class="question-preview-item"
          >
            <div class="question-title">
              {{ index + 1 }}. {{ question.title }}
              <span v-if="question.required" class="required">*</span>
            </div>
            
            <div class="question-content">
              <!-- 单选题 -->
              <el-radio-group v-if="question.type === 'single'" v-model="answers[question.id]">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item"
                >
                  <el-radio :label="optIndex">{{ option.text }}</el-radio>
                </div>
              </el-radio-group>
              
              <!-- 多选题 -->
              <el-checkbox-group v-else-if="question.type === 'multiple'" v-model="answers[question.id]">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item"
                >
                  <el-checkbox :label="optIndex">{{ option.text }}</el-checkbox>
                </div>
              </el-checkbox-group>
              
              <!-- 文本题 -->
              <el-input
                v-else-if="question.type === 'text'"
                v-model="answers[question.id]"
                :type="question.textType || 'text'"
                :placeholder="question.placeholder || '请输入...'"
                :rows="question.textType === 'textarea' ? 3 : undefined"
              />
              
              <!-- 评分题 -->
              <el-rate
                v-else-if="question.type === 'rating'"
                v-model="answers[question.id]"
                :max="question.maxRating || 5"
                show-score
              />
              
              <!-- 量表题 -->
              <el-radio-group v-else-if="question.type === 'likert'" v-model="answers[question.id]">
                <div class="likert-options">
                  <el-radio
                    v-for="(option, optIndex) in getLikertOptions(question)"
                    :key="optIndex"
                    :label="optIndex"
                    class="likert-option"
                  >
                    {{ option }}
                  </el-radio>
                </div>
              </el-radio-group>
            </div>
          </div>
        </div>
        
        <div class="preview-footer">
          <el-button type="primary" disabled>提交问卷（预览模式）</el-button>
          <p class="preview-note">这是预览模式，提交按钮不可用</p>
        </div>
      </div>
    </div>
    
    <div v-else class="no-data">
      <el-empty description="没有找到问卷数据" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const questionnaire = ref(null)
const answers = ref({})

onMounted(() => {
  // 从本地存储加载预览数据
  const previewData = localStorage.getItem('previewQuestionnaire')
  if (previewData) {
    questionnaire.value = JSON.parse(previewData)
    
    // 初始化答案对象
    questionnaire.value.questions?.forEach(question => {
      if (question.type === 'multiple') {
        answers.value[question.id] = []
      } else {
        answers.value[question.id] = null
      }
    })
  }
})

const getLikertOptions = (question) => {
  if (question.likertType === 'custom' && question.likertOptions) {
    return question.likertOptions.map(opt => opt.text || opt)
  }
  
  const likertMap = {
    '5-point': ['非常不同意', '不同意', '中立', '同意', '非常同意'],
    '7-point': ['极不同意', '很不同意', '不同意', '中立', '同意', '很同意', '极同意'],
    '3-point': ['不同意', '中立', '同意']
  }
  
  return likertMap[question.likertType] || likertMap['5-point']
}

const closePreview = () => {
  window.close()
}
</script>

<style lang="scss" scoped>
.preview-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;

  .preview-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h1 {
      margin: 0 0 8px 0;
      color: #333;
    }
    p {
      margin: 0 0 16px 0;
      color: #666;
    }
  }

  .preview-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    .questionnaire-preview {
      padding: 30px;

      .questionnaire-header {
        text-align: center;
        margin-bottom: 40px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;

        h2 {
          margin: 0 0 12px 0;
          font-size: 1.75rem;
          color: #333;
        }
        .description {
          margin: 0 0 16px 0;
          color: #666;
          line-height: 1.6;
        }
        .meta-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          font-size: 0.875rem;
          color: #888;
        }
      }

      .questions-preview {
        display: flex;
        flex-direction: column;
        gap: 30px;

        .question-preview-item {
          padding: 20px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .question-title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 16px;

            .required {
              color: #f56c6c;
              margin-left: 4px;
            }
          }

          .question-content {
            margin-left: 20px;

            .option-item {
              margin-bottom: 8px;
            }

            .likert-options {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 8px;

              .likert-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                font-size: 0.875rem;
              }
            }
          }
        }
      }

      .preview-footer {
        text-align: center;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e5e7eb;

        .preview-note {
          margin: 12px 0 0 0;
          font-size: 0.875rem;
          color: #888;
        }
      }
    }
  }

  .no-data {
    background: white;
    border-radius: 12px;
    padding: 40px;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .preview-content .questionnaire-preview {
      padding: 20px;
    }

    .preview-content .questionnaire-header .meta-info {
      flex-direction: column;
      gap: 8px;
    }

    .preview-content .likert-options {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>