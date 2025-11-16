<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="`${stats?.title}`"
    width="900px"
    class="stats-dialog"
    :append-to-body="true"
    :destroy-on-close="true"
    :z-index="3000"
  >
    <div class="stats-container" v-if="stats">
      <!-- 整体统计概览 -->
      <div class="stats-overview">
        <div class="overview-card">
          <div class="card-icon participants">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">参与人数</div>
            <div class="card-value">{{ stats.participantCount || 0 }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon questions">
            <el-icon><Document /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">问题数量</div>
            <div class="card-value">{{ stats.questionList?.length || 0 }}</div>
          </div>
        </div>
        <div class="overview-card">
          <div class="card-icon rating">
            <el-icon><Star /></el-icon>
          </div>
          <div class="card-content">
            <div class="card-label">平均评分</div>
            <div class="card-value">
              {{ (stats.averageRating || 0).toFixed(1) }}
            </div>
          </div>
        </div>
      </div>

      <el-divider />

      <div
        class="question-stats"
        v-for="(question, qIndex) in stats.questionList"
        :key="question.id"
      >
        <div class="question-header">
          <div class="question-number">Q{{ qIndex + 1 }}</div>
          <div class="question-title-wrapper">
            <h4>{{ question.title }}</h4>
            <el-tag size="small" :type="getQuestionTagType(question.type)">
              {{ getQuestionTypeLabel(question.type) }}
            </el-tag>
          </div>
        </div>

        <!-- 单选题/多选题 -->
        <div
          class="options-stats"
          v-if="question.type === 'single' || question.type === 'multiple'"
        >
          <div v-if="question.options && question.options.length > 0">
            <div
              class="option-item"
              v-for="option in question.options"
              :key="option.id"
            >
              <div class="option-info">
                <span class="option-text">{{ option.text }}</span>
                <div class="option-stats-numbers">
                  <span class="count">{{ option.selectedCount || 0 }}次</span>
                  <span class="percentage">{{
                    calculatePercentage(
                      option.selectedCount,
                      stats.participantCount
                    )
                  }}</span>
                </div>
              </div>
              <el-progress
                :percentage="
                  parseFloat(
                    calculatePercentage(
                      option.selectedCount,
                      stats.participantCount
                    )
                  )
                "
                :stroke-width="12"
                :color="
                  getProgressColor(
                    parseFloat(
                      calculatePercentage(
                        option.selectedCount,
                        stats.participantCount
                      )
                    )
                  )
                "
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
            <div
              class="text-answer-item"
              v-for="(answer, aIndex) in getTextAnswersForQuestion(question.id)"
              :key="aIndex"
            >
              <div class="answer-header">
                <el-icon><User /></el-icon>
                <span>用户 {{ aIndex + 1 }}</span>
                <span class="answer-time">{{
                  formatAnswerTime(answer.submittedAt)
                }}</span>
              </div>
              <div class="answer-content">
                {{ answer.text || "（未填写）" }}
              </div>
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
                  :model-value="
                    Math.floor(getAverageRatingForQuestion(question.id))
                  "
                  disabled
                  show-score
                  :score-template="
                    Math.floor(getAverageRatingForQuestion(question.id)) + ' 分'
                  "
                />
              </div>
              <div class="rating-count">
                <span class="label">评分人数：</span>
                <span class="value"
                  >{{ getRatingCountForQuestion(question.id) }} 人</span
                >
              </div>
            </div>

            <div class="rating-distribution">
              <div
                class="distribution-item"
                v-for="star in [5, 4, 3, 2, 1]"
                :key="star"
              >
                <span class="star-label">{{ star }} 星</span>
                <el-progress
                  :percentage="getRatingPercentage(question.id, star)"
                  :stroke-width="12"
                  :color="
                    getProgressColor(getRatingPercentage(question.id, star))
                  "
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

      <div
        v-if="!stats.questionList || stats.questionList.length === 0"
        class="no-data"
      >
        <el-empty description="该问卷暂无问题数据" />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { User, Document, Star } from "@element-plus/icons-vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  stats: {
    type: Object,
    default: null,
  },
});

defineEmits(["update:visible"]);

// 辅助函数
const calculatePercentage = (count, total) => {
  if (!total || total === 0) return "0%";
  const percentage = (((count || 0) / total) * 100).toFixed(1);
  return `${percentage}%`;
};

const getQuestionTypeLabel = (type) => {
  const typeMap = {
    single: "单选题",
    multiple: "多选题",
    text: "文本题",
    rating: "评分题",
    dropdown: "下拉题",
  };
  return typeMap[type] || type;
};

const getQuestionTagType = (type) => {
  const tagMap = {
    single: "",
    multiple: "success",
    text: "warning",
    rating: "danger",
    dropdown: "info",
  };
  return tagMap[type] || "";
};

const getProgressColor = (percentage) => {
  if (percentage >= 60) return "#67C23A";
  if (percentage >= 30) return "#E6A23C";
  return "#F56C6C";
};

const formatAnswerTime = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("zh-CN");
  } catch (error) {
    return "";
  }
};

// 获取文本题的所有回答
const getTextAnswersForQuestion = (questionId) => {
  if (!props.stats || !props.stats.answers) return [];

  const answers = [];
  props.stats.answers.forEach((answer) => {
    const questionAnswer = answer.answers?.find(
      (a) => a.questionId == questionId
    );
    if (questionAnswer) {
      answers.push({
        text: questionAnswer.text || questionAnswer.answer,
        submittedAt: answer.submittedAt,
      });
    }
  });

  return answers;
};

// 获取评分题的平均分（向下取整）
const getAverageRatingForQuestion = (questionId) => {
  if (!props.stats || !props.stats.answers) return 0;

  const ratings = [];
  props.stats.answers.forEach((answer) => {
    const questionAnswer = answer.answers?.find(
      (a) => a.questionId == questionId
    );
    if (
      questionAnswer &&
      questionAnswer.answer !== null &&
      questionAnswer.answer !== undefined
    ) {
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
  props.stats.answers.forEach((answer) => {
    const questionAnswer = answer.answers?.find(
      (a) => a.questionId == questionId
    );
    if (
      questionAnswer &&
      questionAnswer.answer !== null &&
      questionAnswer.answer !== undefined
    ) {
      count++;
    }
  });

  return count;
};

// 获取特定星级的评分数量
const getRatingCount = (questionId, star) => {
  if (!props.stats || !props.stats.answers) return 0;

  let count = 0;
  props.stats.answers.forEach((answer) => {
    const questionAnswer = answer.answers?.find(
      (a) => a.questionId == questionId
    );
    if (
      questionAnswer &&
      questionAnswer.answer !== null &&
      questionAnswer.answer !== undefined
    ) {
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
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    margin: 0;

    .el-dialog__title {
      color: white;
      font-size: 20px;
      font-weight: 600;
    }

    .el-dialog__headerbtn {
      top: 20px;

      .el-dialog__close {
        color: white;
        font-size: 20px;

        &:hover {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    background: #f8f9fa;
  }
}

.stats-container {
  max-height: 70vh;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}

/* 统计概览卡片 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  .overview-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;

      &.participants {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      &.questions {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      }

      &.rating {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      }
    }

    .card-content {
      flex: 1;

      .card-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 4px;
      }

      .card-value {
        font-size: 28px;
        font-weight: 700;
        color: #303133;
        line-height: 1;
      }
    }
  }
}

.question-stats {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:last-child {
    margin-bottom: 0;
  }

  .question-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;

    .question-number {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      flex-shrink: 0;
    }

    .question-title-wrapper {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        line-height: 1.5;
        flex: 1;
      }
    }
  }

  .options-stats {
    .option-item {
      margin-bottom: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;

      &:hover {
        background: #f0f2f5;
        border-color: #d3d8de;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .option-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;

        .option-text {
          font-size: 14px;
          color: #495057;
          font-weight: 500;
          flex: 1;
        }

        .option-stats-numbers {
          display: flex;
          gap: 20px;
          align-items: center;

          .count {
            font-size: 15px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .percentage {
            font-size: 14px;
            font-weight: 600;
            color: #6c757d;
            min-width: 45px;
            text-align: right;
          }
        }
      }

      :deep(.el-progress__text) {
        font-size: 13px !important;
        font-weight: 600;
      }
    }
  }

  .text-answers {
    .text-answer-item {
      margin-bottom: 16px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e9ecef;
      transition: all 0.2s ease;

      &:hover {
        background: #f0f2f5;
        border-color: #d3d8de;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .answer-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
        font-size: 13px;
        color: #6c757d;
        font-weight: 500;

        .el-icon {
          color: #667eea;
        }

        .answer-time {
          margin-left: auto;
          font-size: 12px;
          color: #909399;
        }
      }

      .answer-content {
        padding: 12px;
        background: white;
        border-radius: 6px;
        font-size: 14px;
        color: #495057;
        line-height: 1.7;
        border: 1px solid #e9ecef;
      }
    }
  }

  .rating-stats {
    .rating-summary {
      display: flex;
      gap: 40px;
      margin-bottom: 24px;
      padding: 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 10px;
      border: 1px solid #e9ecef;

      .rating-average,
      .rating-count {
        display: flex;
        align-items: center;
        gap: 12px;

        .label {
          font-size: 14px;
          font-weight: 600;
          color: #495057;
        }

        .value {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      }
    }

    .rating-distribution {
      .distribution-item {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 14px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        transition: all 0.2s ease;

        &:hover {
          background: #f0f2f5;
        }

        &:last-child {
          margin-bottom: 0;
        }

        .star-label {
          width: 70px;
          font-size: 14px;
          font-weight: 600;
          color: #495057;
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
