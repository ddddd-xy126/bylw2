<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="`${stats?.title} - 数据统计`" 
    width="800px"
    class="stats-dialog" 
    :append-to-body="true" 
    :destroy-on-close="true" 
    :z-index="3000"
  >
    <div class="stats-container" v-if="stats">
      <el-alert 
        title="数据说明" 
        description="以下数据展示了每个问题各选项的选择情况，包括选择次数和占比" 
        type="info" 
        :closable="false"
        style="margin-bottom: 20px" 
      />

      <div class="question-stats" v-for="(question, qIndex) in stats.questionList" :key="question.id">
        <div class="question-header">
          <h4>{{ qIndex + 1 }}. {{ question.title }}</h4>
          <el-tag size="small">{{ getQuestionTypeLabel(question.type) }}</el-tag>
        </div>

        <!-- 单选题/多选题 -->
        <div class="options-stats" v-if="question.type === 'single' || question.type === 'multiple'">
          <div v-if="question.options && question.options.length > 0">
            <div class="option-item" v-for="option in question.options" :key="option.id">
              <div class="option-info">
                <span class="option-text">{{ option.text }}</span>
                <div class="option-stats-numbers">
                  <span class="count">{{ option.selectedCount || 0 }}次</span>
                  <span class="percentage">{{ calculatePercentage(option.selectedCount, stats.participantCount) }}</span>
                </div>
              </div>
              <el-progress
                :percentage="parseFloat(calculatePercentage(option.selectedCount, stats.participantCount))"
                :stroke-width="12"
                :color="getProgressColor(parseFloat(calculatePercentage(option.selectedCount, stats.participantCount)))" 
              />
            </div>
          </div>
          <div v-else class="no-options">
            <el-empty description="暂无选项数据" :image-size="60" />
          </div>
        </div>

        <!-- 文本题 -->
        <div class="text-answers" v-else-if="question.type === 'text'">
          <div v-if="stats.answers && stats.answers.length > 0">
            <div class="text-answer-item" v-for="(answer, aIndex) in getTextAnswersForQuestion(question.id)" :key="aIndex">
              <div class="answer-header">
                <el-icon><User /></el-icon>
                <span>用户 {{ aIndex + 1 }}</span>
                <span class="answer-time">{{ formatAnswerTime(answer.submittedAt) }}</span>
              </div>
              <div class="answer-content">{{ answer.text || '（未填写）' }}</div>
            </div>
          </div>
          <div v-else class="no-answers">
            <el-empty description="暂无回答" :image-size="60" />
          </div>
        </div>

        <!-- 评分题 -->
        <div class="rating-stats" v-else-if="question.type === 'rating'">
          <div v-if="stats.answers && stats.answers.length > 0">
            <div class="rating-summary">
              <div class="rating-average">
                <span class="label">平均分：</span>
                <el-rate 
                  :model-value="Math.floor(getAverageRatingForQuestion(question.id))" 
                  disabled 
                  show-score 
                  :score-template="Math.floor(getAverageRatingForQuestion(question.id)) + ' 分'" 
                />
              </div>
              <div class="rating-count">
                <span class="label">评分人数：</span>
                <span class="value">{{ getRatingCountForQuestion(question.id) }} 人</span>
              </div>
            </div>
            
            <div class="rating-distribution">
              <div class="distribution-item" v-for="star in [5, 4, 3, 2, 1]" :key="star">
                <span class="star-label">{{ star }} 星</span>
                <el-progress 
                  :percentage="getRatingPercentage(question.id, star)"
                  :stroke-width="12"
                  :color="getProgressColor(getRatingPercentage(question.id, star))"
                >
                  <span>{{ getRatingCount(question.id, star) }} 人</span>
                </el-progress>
              </div>
            </div>
          </div>
          <div v-else class="no-ratings">
            <el-empty description="暂无评分" :image-size="60" />
          </div>
        </div>

        <el-divider v-if="qIndex < stats.questionList.length - 1" />
      </div>

      <div v-if="!stats.questionList || stats.questionList.length === 0" class="no-data">
        <el-empty description="该问卷暂无问题数据" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { User } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  stats: {
    type: Object,
    default: null
  }
});

defineEmits(['update:visible']);

// 辅助函数
const calculatePercentage = (count, total) => {
  if (!total || total === 0) return '0%';
  const percentage = ((count || 0) / total * 100).toFixed(1);
  return `${percentage}%`;
};

const getQuestionTypeLabel = (type) => {
  const typeMap = {
    'single': '单选题',
    'multiple': '多选题',
    'text': '文本题',
    'rating': '评分题',
    'dropdown': '下拉题'
  };
  return typeMap[type] || type;
};

const getProgressColor = (percentage) => {
  if (percentage >= 60) return '#67C23A';
  if (percentage >= 30) return '#E6A23C';
  return '#F56C6C';
};

const formatAnswerTime = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString("zh-CN");
  } catch (error) {
    return '';
  }
};

// 获取文本题的所有回答
const getTextAnswersForQuestion = (questionId) => {
  if (!props.stats || !props.stats.answers) return [];
  
  const answers = [];
  props.stats.answers.forEach(answer => {
    const questionAnswer = answer.answers?.find(a => a.questionId == questionId);
    if (questionAnswer) {
      answers.push({
        text: questionAnswer.text || questionAnswer.answer,
        submittedAt: answer.submittedAt
      });
    }
  });
  
  return answers;
};

// 获取评分题的平均分（向下取整）
const getAverageRatingForQuestion = (questionId) => {
  if (!props.stats || !props.stats.answers) return 0;
  
  const ratings = [];
  props.stats.answers.forEach(answer => {
    const questionAnswer = answer.answers?.find(a => a.questionId == questionId);
    if (questionAnswer && questionAnswer.answer !== null && questionAnswer.answer !== undefined) {
      const rating = parseFloat(questionAnswer.answer);
      if (!isNaN(rating)) {
        ratings.push(Math.floor(rating));
      }
    }
  });
  
  if (ratings.length === 0) return 0;
  const average = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  return Math.floor(average);
};

// 获取评分题的评分人数
const getRatingCountForQuestion = (questionId) => {
  if (!props.stats || !props.stats.answers) return 0;
  
  let count = 0;
  props.stats.answers.forEach(answer => {
    const questionAnswer = answer.answers?.find(a => a.questionId == questionId);
    if (questionAnswer && questionAnswer.answer !== null && questionAnswer.answer !== undefined) {
      count++;
    }
  });
  
  return count;
};

// 获取特定星级的评分数量
const getRatingCount = (questionId, star) => {
  if (!props.stats || !props.stats.answers) return 0;
  
  let count = 0;
  props.stats.answers.forEach(answer => {
    const questionAnswer = answer.answers?.find(a => a.questionId == questionId);
    if (questionAnswer && questionAnswer.answer !== null && questionAnswer.answer !== undefined) {
      const rating = Math.floor(parseFloat(questionAnswer.answer));
      if (rating === star) {
        count++;
      }
    }
  });
  
  return count;
};

// 获取特定星级的评分百分比
const getRatingPercentage = (questionId, star) => {
  const total = getRatingCountForQuestion(questionId);
  if (total === 0) return 0;
  
  const count = getRatingCount(questionId, star);
  return parseFloat(((count / total) * 100).toFixed(1));
};
</script>

<style scoped lang="scss">
.stats-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.stats-container {
  max-height: 600px;
  overflow-y: auto;
}

.question-stats {
  margin-bottom: 24px;

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .options-stats {
    .option-item {
      margin-bottom: 16px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;

      .option-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .option-text {
          font-size: 14px;
          color: #606266;
          flex: 1;
        }

        .option-stats-numbers {
          display: flex;
          gap: 16px;
          align-items: center;

          .count {
            font-size: 14px;
            font-weight: 600;
            color: var(--color-primary);
          }

          .percentage {
            font-size: 14px;
            font-weight: 600;
            color: #909399;
          }
        }
      }
    }
  }

  .text-answers {
    .text-answer-item {
      margin-bottom: 12px;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 8px;

      .answer-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;
        color: #909399;

        .answer-time {
          margin-left: auto;
        }
      }

      .answer-content {
        padding: 8px;
        background: white;
        border-radius: 4px;
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  .rating-stats {
    .rating-summary {
      display: flex;
      gap: 40px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;

      .rating-average,
      .rating-count {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          font-size: 14px;
          font-weight: 600;
          color: #606266;
        }

        .value {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-primary);
        }
      }
    }

    .rating-distribution {
      .distribution-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;

        .star-label {
          width: 60px;
          font-size: 14px;
          color: #606266;
        }

        .el-progress {
          flex: 1;
        }
      }
    }
  }
}

.no-data,
.no-options,
.no-answers,
.no-ratings {
  padding: 20px 0;
  text-align: center;
}
</style>
