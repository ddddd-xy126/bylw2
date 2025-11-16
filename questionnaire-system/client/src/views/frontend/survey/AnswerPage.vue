<template>
  <div class="answer-page">
    <!-- 页面头部 - 与问卷详情页样式一致 -->
    <div class="page-header">
      <el-page-header @back="handleGoBack">
        <template #content>
          <div class="header-content">
            <span class="header-title">{{
              questionnaire.title || "问卷作答"
            }}</span>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/home' }"
                >首页</el-breadcrumb-item
              >
              <el-breadcrumb-item>问卷作答</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
        </template>
      </el-page-header>
    </div>

    <div class="answer-container">
      <!-- 左侧统计区域 -->
      <div class="stats-area">
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <h4>答题统计</h4>
          </template>
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-label">已答题数</div>
              <div class="stat-value">{{ answeredCount }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">剩余题数</div>
              <div class="stat-value">{{ totalQuestions - answeredCount }}</div>
            </div>
            <div class="stat-item elapsed">
              <div class="stat-label">用时</div>
              <div class="stat-value elapsed-value">
                {{ formatTime(elapsedTime) }}
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中间题目区域 -->
      <div class="question-area">
        <el-card class="question-card" shadow="hover" v-loading="loading">
          <template v-if="!loading && currentQuestion">
            <!-- 问题标题 -->
            <div class="question-header">
              <div class="question-number">{{ currentQuestionIndex + 1 }}</div>
              <div class="question-info">
                <h3 class="question-title">
                  {{ currentQuestion.title || currentQuestion.content }}
                </h3>
                <div class="question-meta">
                  <el-tag
                    size="small"
                    :type="getQuestionTypeColor(currentQuestion.type)"
                  >
                    {{ getQuestionTypeName(currentQuestion.type) }}
                  </el-tag>
                  <span v-if="currentQuestion.required" class="required-mark"
                    >*必答</span
                  >
                </div>
              </div>
            </div>

            <!-- 问题描述 -->
            <div
              class="question-description"
              v-if="currentQuestion.description"
            >
              <p>{{ currentQuestion.description }}</p>
            </div>

            <!-- 答题区域 - 使用动画组件 -->
            <div class="answer-section">
              <AnimatedQuestion
                :question-type="currentQuestion.type"
                :options="currentQuestion.options"
                v-model="currentAnswer"
                :max-rating="currentQuestion.maxRating || 5"
                :rating-texts="ratingTexts"
                :placeholder="
                  currentQuestion.placeholder || '请在此输入您的答案...'
                "
                :max-length="currentQuestion.maxLength || 500"
                :rows="4"
                @change="handleAnswerChange"
                @commit="handleTextCommit"
              />
            </div>

            <!-- 操作按钮 -->
            <div class="question-actions">
              <el-button
                @click="prevQuestion"
                :disabled="currentQuestionIndex === 0"
                size="large"
              >
                <el-icon><ArrowLeft /></el-icon>
                上一题
              </el-button>

              <el-button
                type="primary"
                @click="nextQuestion"
                size="large"
                :disabled="!canProceed"
              >
                {{ shouldShowSubmit ? "提交问卷" : "下一题" }}
                <el-icon v-if="!shouldShowSubmit"><ArrowRight /></el-icon>
                <el-icon v-else><Check /></el-icon>
              </el-button>
            </div>
          </template>

          <!-- 完成页面 -->
          <template v-else-if="!loading && isCompleted">
            <div class="completion-section">
              <el-result
                icon="success"
                title="问卷完成！"
                :sub-title="`感谢您的参与，总共回答了 ${totalQuestions} 道题目`"
              >
                <template #extra>
                  <div class="completion-actions">
                    <el-button type="primary" size="large" @click="viewResults">
                      查看结果
                    </el-button>
                    <el-button @click="restartSurvey" size="large">
                      重新答题
                    </el-button>
                  </div>
                </template>
              </el-result>
            </div>
          </template>

          <!-- 加载状态 -->
          <template v-else>
            <div class="loading-section">
              <el-skeleton :rows="5" animated />
            </div>
          </template>
        </el-card>
      </div>

      <!-- 右侧进度区域 -->
      <div class="progress-area">
        <!-- 进度卡片（封装） -->
        <ProgressCard
          :questionnaire="questionnaire"
          :answers="answers"
          :current-question-index="currentQuestionIndex"
          :progress-percentage="Math.round(progressPercentage)"
          :answered-count="answeredCount"
          :elapsed-time="elapsedTime"
          :format-time="formatTime"
          @go-to-question="goToQuestion"
        ></ProgressCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, ArrowRight, Check } from "@element-plus/icons-vue";

import { getSurveyDetail, submitSurveyApi } from "@/api/survey";
import { useUserStore } from "@/store/user";
import ProgressCard from "./components/ProgressCard.vue";
import AnimatedQuestion from "./components/AnimatedQuestion.vue";
import { useQuestionnaireLogic } from "@/composables/useQuestionnaireLogic";
import { useAnswerTimer } from "@/composables/useAnswerTimer";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const questionnaire = reactive({
  id: null,
  title: "",
  questions: [],
  estimatedTime: 5,
});

// 使用 composables
const {
  answers,
  committedAnswers,
  currentQuestionIndex,
  totalQuestions,
  currentQuestion,
  progressPercentage,
  initializeLogic,
  setAnswer,
  commitAnswer,
  goToQuestion,
  nextQuestion: nextQuestionLogic,
  prevQuestion: prevQuestionLogic,
  validateRequiredQuestions,
  resetAnswers,
} = useQuestionnaireLogic();

const {
  elapsedTime,
  formatTime,
  startTimer,
  resetTimer,
  stopTimer,
} = useAnswerTimer();
// 当前答案
const currentAnswer = computed({
  get() {
    if (!currentQuestion.value) return null;
    const answer = answers.value[currentQuestion.value.id];

    // 处理多选题的初始值
    if (currentQuestion.value.type === "multiple" && !answer) {
      return [];
    }

    return answer;
  },
  set(value) {
    if (currentQuestion.value) {
      setAnswer(currentQuestion.value.id, value);
    }
  },
});

const isCompleted = ref(false);

// 评分选项
const ratingTexts = ref(["很差", "较差", "一般", "较好", "很好"]);

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === totalQuestions.value - 1;
});

// 是否应该显示"提交问卷"按钮（考虑跳转逻辑）
const shouldShowSubmit = computed(() => {
  // 如果是最后一题，显示提交
  if (isLastQuestion.value) {
    return true;
  }

  // 检查当前题目是否有"结束问卷"的跳转逻辑
  const question = currentQuestion.value;
  if (
    question?.enableLogic &&
    question.logicRules &&
    question.logicRules.length > 0
  ) {
    const userAnswer = currentAnswer.value;
    let matchedRule = null;

    if (question.type === "single") {
      matchedRule = question.logicRules.find(
        (rule) => rule.optionId === userAnswer
      );
    } else if (question.type === "multiple" && Array.isArray(userAnswer)) {
      matchedRule = question.logicRules.find((rule) =>
        userAnswer.includes(rule.optionId)
      );
    }

    // 如果匹配到"结束问卷"规则，显示提交按钮
    if (matchedRule && matchedRule.isEnd) {
      return true;
    }
  }

  return false;
});

const isAnswered = computed(() => {
  const answer = currentAnswer.value;
  if (currentQuestion.value?.type === "multiple") {
    return Array.isArray(answer) && answer.length > 0;
  }
  return answer !== null && answer !== undefined && answer !== "";
});

// 是否可以进入下一题（必答题必须作答，非必答题可以跳过）
const canProceed = computed(() => {
  // 如果是必答题，必须已回答
  if (currentQuestion.value?.required) {
    return isAnswered.value;
  }
  // 非必答题可以直接进入下一题
  return true;
});

// 已确认的答题数量（只有点击/失焦后计入）
const answeredCount = computed(() => {
  return Object.keys(committedAnswers.value).length;
});

// 当用户通过点击选项（单选/多选/评分）确认答案时调用
const handleAnswerChange = (value) => {
  if (!currentQuestion.value) return;
  commitAnswer(currentQuestion.value.id);
};

// 文本题失焦时才提交为已确认答案
const handleTextCommit = () => {
  if (!currentQuestion.value) return;
  const qid = currentQuestion.value.id;
  const val = answers.value[qid];
  if (val !== undefined && val !== null && String(val).trim() !== "") {
    commitAnswer(qid);
  }
};

// 下一题 - 使用 composable 的逻辑
const nextQuestion = async () => {
  // 验证必答题
  if (currentQuestion.value?.required && !isAnswered.value) {
    ElMessage.warning({
      message: "此题为必答题，请选择或填写答案后再继续",
      duration: 2000,
      showClose: true,
    });
    return;
  }

  // 使用 composable 的 nextQuestion 逻辑（包含跳转逻辑）
  const result = nextQuestionLogic(questionnaire.questions);

  // 如果已经是最后一题，提交问卷
  if (result === "complete") {
    await submitSurvey();
  }
};

const prevQuestion = () => {
  prevQuestionLogic();
};

const submitSurvey = async () => {
  try {
    loading.value = true;

    // 使用 composable 的验证方法
    const validation = validateRequiredQuestions(questionnaire.questions);

    if (!validation.isValid) {
      ElMessage.warning(
        `还有 ${validation.unansweredRequired.length} 道必答题未完成`
      );
      loading.value = false;
      return;
    }

    const duration = Math.floor(elapsedTime.value);
    const answerData = {
      surveyId: questionnaire.id,
      surveyTitle: questionnaire.title,
      userId: userStore.profile?.id,
      duration: duration,
      answers: Object.entries(answers.value).map(([questionId, answer]) => {
        const question = questionnaire.questions.find(
          (q) => q.id == questionId
        );
        let answerText = answer;

        if (question) {
          if (question.type === "single") {
            const option = question.options?.find((opt) => opt.id === answer);
            answerText = option ? option.text : answer;
          } else if (question.type === "multiple" && Array.isArray(answer)) {
            answerText = answer.map((answerId) => {
              const option = question.options?.find(
                (opt) => opt.id === answerId
              );
              return option ? option.text : answerId;
            });
          }
        }

        return {
          questionId,
          answer,
          text: answerText,
          question: question?.title || question?.content || "",
        };
      }),
    };

    const result = await submitSurveyApi(route.params.id, answerData);

    // 停止计时器
    stopTimer();

    // 更新用户积分状态
    if (result.pointsEarned && result.pointsEarned > 0) {
      const currentProfile = userStore.profile;
      if (currentProfile) {
        currentProfile.points =
          (currentProfile.points || 0) + result.pointsEarned;
        userStore.setProfile(currentProfile);
      }

      // 显示积分奖励提示
      let message = `问卷提交成功！获得 ${result.pointsEarned} 积分`;
      if (result.isFirstSurvey) {
        message += "（包含首次完成奖励 +20）";
      }
      ElMessage.success(message);
    } else {
      ElMessage.success("问卷提交成功！");
    }

    const surveyId = route.params.id;
    const userId = userStore.profile?.id;
    router.push(
      `/surveys/result/${result.answerId}?surveyId=${surveyId}&userId=${userId}`
    );
  } catch (error) {
    ElMessage.error("提交失败：" + error.message);
  } finally {
    loading.value = false;
  }
};

const viewResults = () => {
  router.push(`/surveys/result/${route.params.id}`);
};

const restartSurvey = async () => {
  try {
    await ElMessageBox.confirm(
      "确定要重新开始答题吗？当前进度将会丢失。",
      "确认重新开始",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }
    );

    // 使用 composable 的重置方法
    resetAnswers();
    isCompleted.value = false;

    // 重置计时器
    resetTimer();
    startTimer();

    ElMessage.success("已重新开始答题");
  } catch (error) {
    // 用户取消
  }
};

const handleGoBack = async () => {
  if (answeredCount.value > 0) {
    try {
      await ElMessageBox.confirm(
        "确定要离开吗？当前进度将会丢失。",
        "确认离开",
        {
          confirmButtonText: "确定离开",
          cancelButtonText: "继续答题",
          type: "warning",
        }
      );
      router.back();
    } catch (error) {
      // 用户取消
    }
  } else {
    router.back();
  }
};

// 辅助方法
const getQuestionTypeName = (type) => {
  const nameMap = {
    single: "单选题",
    multiple: "多选题",
    text: "文本题",
    rating: "评分题",
  };
  return nameMap[type] || "其他";
};

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: "primary",
    multiple: "success",
    text: "warning",
    rating: "danger",
  };
  return colorMap[type] || "info";
};

// 生命周期
onMounted(async () => {
  try {
    const surveyData = await getSurveyDetail(route.params.id);
    questionnaire.id = surveyData.id;
    questionnaire.title = surveyData.title;
    questionnaire.questions = surveyData.questions || [];
    questionnaire.estimatedTime = surveyData.estimatedTime || 5;

    // 为问题添加默认的order字段（如果没有的话）
    questionnaire.questions.forEach((q, index) => {
      if (q.order === undefined) {
        q.order = index + 1;
      }
    });

    // 初始化 questionnaire logic
    initializeLogic(questionnaire.questions);

    // 开始计时
    startTimer();
  } catch (error) {
    ElMessage.error("加载问卷失败：" + error.message);
    console.error("加载失败:", error);
  } finally {
    loading.value = false;
  }
});

// composable 的 useAnswerTimer 已经自动清理，但还是要确保停止计时器
onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped lang="scss">
.answer-page {
  min-height: 100vh;
  background: var(--theme-background-color);
  padding: 30px 285px;

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

/* 头部样式*/
.page-header {
  background: linear-gradient(
    135deg,
    var(--color-primary-light-3) 0%,
    var(--color-primary) 100%
  );
  padding: 25px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);

  :deep(.el-page-header) {
    .el-page-header__back {
      color: var(--text-inverse);
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        color: var(--color-primary-dark-4);
        transform: translateX(-4px);
      }

      .el-icon {
        font-size: 18px;
      }
    }

    .el-page-header__content {
      color: var(--text-inverse);
    }
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-title {
      font-size: 24px;
      font-weight: 700;
      color: var(--text-inverse);
      margin-right: 16px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .el-breadcrumb {
      font-size: 14px;

      :deep(.el-breadcrumb__separator) {
        color: rgba(255, 255, 255, 0.7);
      }

      :deep(.el-breadcrumb__inner) {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 500;
        transition: color 0.3s ease;

        &:hover {
          color: var(--text-inverse);
        }

        &.is-link:hover {
          color: var(--color-primary-dark-4);
        }
      }
    }
  }
}

/* 主要内容区域 */
.answer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 300px 1fr 320px;
  gap: 20px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
}

/* 问题区域 */
.question-area {
  min-height: 500px;

  .question-card {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .question-header {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      align-items: flex-start;

      @media (max-width: 768px) {
        gap: 12px;
      }

      .question-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(
          135deg,
          var(--color-primary-light-3),
          #67c23a
        );
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        flex-shrink: 0;

        @media (max-width: 768px) {
          width: 32px;
          height: 32px;
          font-size: 14px;
        }
      }

      .question-info {
        flex: 1;

        .question-title {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #303133;
          line-height: 1.4;

          @media (max-width: 768px) {
            font-size: 18px;
          }

          @media (max-width: 480px) {
            font-size: 16px;
          }
        }

        .question-meta {
          display: flex;
          align-items: center;
          gap: 12px;

          .required-mark {
            color: #f56c6c;
            font-size: 12px;
            font-weight: 500;
          }
        }
      }
    }

    .question-description {
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--color-primary-light-3);

      p {
        margin: 0;
        color: #606266;
        line-height: 1.5;
      }
    }
  }
}

/* 答题区域 */
.answer-section {
  margin-bottom: 32px;

  .answer-options {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .option-item {
      padding: 16px;
      border: 2px solid #f0f0f0;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: pointer;
      background: white;

      @media (max-width: 480px) {
        padding: 12px;
      }

      &:hover {
        border-color: var(--color-primary-light-3);
        background: #f0f9ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(64, 158, 255, 0.1);
      }

      &.is-checked {
        border-color: var(--color-primary-light-3);
        background: linear-gradient(135deg, #f0f9ff, #e1f3ff);
      }

      .option-text {
        font-size: 16px;
        color: #303133;
        line-height: 1.4;

        @media (max-width: 480px) {
          font-size: 14px;
        }
      }
    }
  }

  .rating-section {
    text-align: center;
    padding: 20px;
  }
}

/* 操作按钮 */
.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  .el-button {
    flex: 1;
    max-width: 150px;

    @media (max-width: 768px) {
      max-width: none;
    }
  }
}

/* 完成页面 */
.completion-section {
  text-align: center;
  padding: 40px 20px;

  .completion-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-top: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
    }
  }
}

/* 进度区域 */
.progress-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 100px;

  @media (max-width: 768px) {
    order: -1;
    position: static;
  }

  .progress-card,
  .stats-card {
    border-radius: 16px;
    overflow: hidden;

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 0;

      h4 {
        margin: 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }

      .progress-text {
        color: #67c23a;
        font-weight: 600;
        font-size: 14px;
      }
    }
  }
}

/* 动态进度条容器 */
.dynamic-progress-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px 0;

  @media (max-width: 480px) {
    gap: 16px;
    padding: 16px 0;
  }

  .progress-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* 树木生长特殊样式 */
    &.tree-growth-item {
      background: radial-gradient(circle at center, #e8f5e9, #c8e6c9);
      padding: 0;
      overflow: hidden;
      min-height: 300px;

      &:hover {
        background: radial-gradient(circle at center, #c8e6c9, #a5d6a7);
        box-shadow: 0 8px 24px rgba(76, 175, 80, 0.3);
      }
    }
  }
}

/* 统计信息 */
.stats-card {
  background: linear-gradient(135deg, #f8fbff 0%, #f0f7ff 100%);
  border: none;
  overflow: hidden;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(
      90deg,
      var(--color-primary-light-3),
      var(--color-primary)
    );
  }

  :deep(.el-card__header) {
    background: transparent;
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);
    padding: 16px 20px;

    h4 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      gap: 8px;

      &::before {
        content: "📊";
        font-size: 18px;
      }
    }
  }

  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-radius: 10px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      .stat-label {
        color: #606266;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;

        &::before {
          content: "";
          width: 6px;
          height: 6px;
          background: var(--color-primary-light-3);
          border-radius: 50%;
        }
      }

      .stat-value {
        color: var(--color-primary);
        font-weight: 700;
        font-size: 20px;
        font-family: "Arial", sans-serif;
      }

      &.elapsed {
        background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);

        .stat-label::before {
          background: #e6a23c;
        }

        .elapsed-value {
          font-size: 24px;
          color: #e6a23c;
          font-weight: 700;
          letter-spacing: 1px;
          font-variant-numeric: tabular-nums;
        }
      }
    }
  }
}

/* 左侧统计区域（非粘性） */
.stats-area {
  position: static;
}

/* 加载动画 */
.loading-section {
  padding: 40px 20px;
}
</style>
