<template>
  <div class="answer-page">
    <!-- 页面头部 -->
    <div class="answer-header">
      <div class="header-content">
        <el-page-header @back="handleGoBack">
          <template #content>
            <div class="header-info">
              <h2 class="survey-title">{{ questionnaire.title || '问卷作答' }}</h2>
              <div class="progress-info">
                第 {{ currentQuestionIndex + 1 }} 题，共 {{ totalQuestions }} 题
              </div>
            </div>
          </template>
        </el-page-header>
      </div>
    </div>

    <div class="answer-container">
      <!-- 左侧答题区域 -->
      <div class="question-area">
        <el-card class="question-card" shadow="hover" v-loading="loading">
          <template v-if="!loading && currentQuestion">
            <!-- 问题标题 -->
            <div class="question-header">
              <div class="question-number">{{ currentQuestionIndex + 1 }}</div>
              <div class="question-info">
                <h3 class="question-title">{{ currentQuestion.title || currentQuestion.content }}</h3>
                <div class="question-meta">
                  <el-tag size="small" :type="getQuestionTypeColor(currentQuestion.type)">
                    {{ getQuestionTypeName(currentQuestion.type) }}
                  </el-tag>
                  <span v-if="currentQuestion.required" class="required-mark">*必答</span>
                </div>
              </div>
            </div>

            <!-- 问题描述 -->
            <div class="question-description" v-if="currentQuestion.description">
              <p>{{ currentQuestion.description }}</p>
            </div>

            <!-- 答题区域 -->
            <div class="answer-section">
              <!-- 单选题 -->
              <template v-if="currentQuestion.type === 'single'">
                <el-radio-group 
                  v-model="currentAnswer" 
                  class="answer-options"
                  @change="handleAnswerChange"
                >
                  <el-radio 
                    v-for="option in currentQuestion.options" 
                    :key="option.id || option.value"
                    :label="option.id || option.value"
                    class="option-item"
                  >
                    <span class="option-text">{{ option.text || option.label }}</span>
                  </el-radio>
                </el-radio-group>
              </template>

              <!-- 多选题 -->
              <template v-else-if="currentQuestion.type === 'multiple'">
                <el-checkbox-group 
                  v-model="currentAnswer" 
                  class="answer-options"
                  @change="handleAnswerChange"
                >
                  <el-checkbox 
                    v-for="option in currentQuestion.options" 
                    :key="option.id || option.value"
                    :label="option.id || option.value"
                    class="option-item"
                  >
                    <span class="option-text">{{ option.text || option.label }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </template>

              <!-- 文本题 -->
              <template v-else-if="currentQuestion.type === 'text'">
                <el-input
                  v-model="currentAnswer"
                  type="textarea"
                  :rows="4"
                  placeholder="请在此输入您的答案..."
                  maxlength="500"
                  show-word-limit
                  @input="handleAnswerChange"
                />
              </template>

              <!-- 评分题 -->
              <template v-else-if="currentQuestion.type === 'rating'">
                <div class="rating-section">
                  <el-rate
                    v-model="currentAnswer"
                    :max="currentQuestion.maxRating || 5"
                    show-text
                    :texts="ratingTexts"
                    @change="handleAnswerChange"
                  />
                </div>
              </template>
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
                :disabled="!isAnswered && currentQuestion.required"
              >
                {{ isLastQuestion ? '提交问卷' : '下一题' }}
                <el-icon v-if="!isLastQuestion"><ArrowRight /></el-icon>
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
        <!-- 进度卡片 -->
        <el-card class="progress-card" shadow="hover">
          <template #header>
            <div class="progress-header">
              <h4>答题进度</h4>
              <span class="progress-text">{{ Math.round(progressPercentage) }}%</span>
            </div>
          </template>

          <!-- 动态进度条组件 -->
          <div class="dynamic-progress-container">
            <!-- 圆形进度条 -->
            <div class="progress-item">
              <DynamicProgress type="circle" :percent="Math.round(progressPercentage)" />
            </div>

            <!-- 树木生长动画 -->
            <div class="progress-item tree-growth-item">
              <TreeGrowth :progress="Math.round(progressPercentage)" />
            </div>

            <!-- 液体填充百分比 -->
            <div class="progress-item">
              <LiquidFill :model-value="Math.round(progressPercentage)" />
            </div>
          </div>



          <!-- 问题导航 -->
          <div class="question-nav">
            <h5>题目导航</h5>
            <div class="nav-grid">
              <div
                v-for="(question, index) in questionnaire.questions"
                :key="question.id"
                class="nav-item"
                :class="{
                  'current': index === currentQuestionIndex,
                  'answered': answers[question.id] !== undefined,
                  'required': question.required
                }"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </div>
            </div>
          </div>
        </el-card>

        <!-- 统计信息 -->
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
            <div class="stat-item">
              <div class="stat-label">用时</div>
              <div class="stat-value">{{ formatTime(elapsedTime) }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  Check
} from "@element-plus/icons-vue";

import { getSurveyDetail, submitSurveyApi } from "@/api/survey";
import { useUserStore } from "@/store/user";
import DynamicProgress from "@/components/DynamicProgress.vue";
import TreeGrowth from "@/components/TreeGrowth.vue";
import LiquidFill from "@/components/LiquidFill.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const loading = ref(true);
const questionnaire = reactive({ 
  id: null, 
  title: "", 
  questions: [],
  estimatedTime: 5
});
const answers = reactive({});
const currentQuestionIndex = ref(0);
const isCompleted = ref(false);
const startTime = ref(Date.now());
const elapsedTime = ref(0);
const timer = ref(null);

// 评分选项
const ratingTexts = ref(['很差', '较差', '一般', '较好', '很好']);

// 计算属性
const currentQuestion = computed(() => {
  const questions = getOrderedQuestions();
  return questions[currentQuestionIndex.value] || null;
});

const currentAnswer = computed({
  get() {
    if (!currentQuestion.value) return null;
    const answer = answers[currentQuestion.value.id];
    
    // 处理多选题的初始值
    if (currentQuestion.value.type === 'multiple' && !answer) {
      return [];
    }
    
    return answer;
  },
  set(value) {
    if (currentQuestion.value) {
      answers[currentQuestion.value.id] = value;
    }
  }
});

const totalQuestions = computed(() => {
  return questionnaire.questions.length;
});

const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === totalQuestions.value - 1;
});

const isAnswered = computed(() => {
  const answer = currentAnswer.value;
  if (currentQuestion.value?.type === 'multiple') {
    return Array.isArray(answer) && answer.length > 0;
  }
  return answer !== null && answer !== undefined && answer !== '';
});

const answeredCount = computed(() => {
  return Object.keys(answers).length;
});

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0;
  return (answeredCount.value / totalQuestions.value) * 100;
});

// 方法
const getOrderedQuestions = () => {
  return [...questionnaire.questions].sort((a, b) => {
    const orderA = a.order !== undefined ? a.order : a.id;
    const orderB = b.order !== undefined ? b.order : b.id;
    return orderA - orderB;
  });
};

const getQuestionTypeName = (type) => {
  const nameMap = {
    single: '单选题',
    multiple: '多选题',
    text: '文本题',
    rating: '评分题'
  };
  return nameMap[type] || '其他';
};

const getQuestionTypeColor = (type) => {
  const colorMap = {
    single: 'primary',
    multiple: 'success',
    text: 'warning',
    rating: 'danger'
  };
  return colorMap[type] || 'info';
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const handleAnswerChange = () => {
  // 答案改变时的处理
};

const nextQuestion = async () => {
  // 验证必答题
  if (currentQuestion.value?.required && !isAnswered.value) {
    ElMessage.warning('请回答当前问题后再继续');
    return;
  }

  // 检查是否有跳转逻辑
  const question = currentQuestion.value;
  if (question && question.enableLogic && question.logicRules && question.logicRules.length > 0) {
    // 获取用户的答案
    const userAnswer = answers[question.id];
    
    // 查找匹配的跳转规则
    let matchedRule = null;
    
    if (question.type === 'single') {
      // 单选题：直接匹配选项ID
      matchedRule = question.logicRules.find(rule => rule.optionId === userAnswer);
    } else if (question.type === 'multiple') {
      // 多选题：检查是否包含某个选项
      if (Array.isArray(userAnswer)) {
        matchedRule = question.logicRules.find(rule => userAnswer.includes(rule.optionId));
      }
    }
    
    if (matchedRule) {
      // 找到匹配的跳转规则
      const targetQuestionNumber = matchedRule.targetQuestion;
      const targetIndex = targetQuestionNumber - 1; // 题号转索引
      
      if (targetIndex >= 0 && targetIndex < totalQuestions.value) {
        // 跳转到指定题目
        currentQuestionIndex.value = targetIndex;
        return;
      }
    } else {
      // 没有匹配的跳转规则，如果启用了跳转逻辑，则直接结束问卷
      await submitSurvey();
      return;
    }
  }

  // 没有启用跳转逻辑，按顺序进行
  if (isLastQuestion.value) {
    // 提交问卷
    await submitSurvey();
  } else {
    // 下一题
    currentQuestionIndex.value++;
  }
};

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
  }
};

const goToQuestion = (index) => {
  if (index >= 0 && index < totalQuestions.value) {
    currentQuestionIndex.value = index;
  }
};

const submitSurvey = async () => {
  try {
    loading.value = true;
    
    // 检查必答题
    const unansweredRequired = questionnaire.questions.filter(q => 
      q.required && (answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '')
    );
    
    if (unansweredRequired.length > 0) {
      ElMessage.warning(`还有 ${unansweredRequired.length} 道必答题未完成`);
      loading.value = false;
      return;
    }

    const duration = Math.floor(elapsedTime.value);
    const answerData = {
      surveyId: questionnaire.id,
      surveyTitle: questionnaire.title,
      userId: userStore.profile?.id,
      duration: duration,
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
        question: questionnaire.questions.find(q => q.id == questionId)?.title || ''
      }))
    };

    const result = await submitSurveyApi(route.params.id, answerData);
    
    // 停止计时器
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    
    ElMessage.success('问卷提交成功！');
    
    // 直接跳转到结果页面（使用返回的 answerId）
    if (result && result.answerId) {
      router.push(`/surveys/result/${result.answerId}`);
    } else {
      // 如果没有返回 answerId，显示完成页面
      isCompleted.value = true;
    }
    
  } catch (error) {
    ElMessage.error('提交失败：' + error.message);
  } finally {
    loading.value = false;
  }
};

const viewResults = () => {
  router.push(`/surveys/result/${route.params.id}`);
};

const restartSurvey = async () => {
  try {
    await ElMessageBox.confirm('确定要重新开始答题吗？当前进度将会丢失。', '确认重新开始', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 重置所有数据
    Object.keys(answers).forEach(key => delete answers[key]);
    currentQuestionIndex.value = 0;
    isCompleted.value = false;
    startTime.value = Date.now();
    elapsedTime.value = 0;
    
    // 重新开始计时器
    startTimer();
    
    ElMessage.success('已重新开始答题');
  } catch (error) {
    // 用户取消
  }
};

const handleGoBack = async () => {
  if (answeredCount.value > 0) {
    try {
      await ElMessageBox.confirm('确定要离开吗？当前进度将会丢失。', '确认离开', {
        confirmButtonText: '确定离开',
        cancelButtonText: '继续答题',
        type: 'warning'
      });
      router.back();
    } catch (error) {
      // 用户取消
    }
  } else {
    router.back();
  }
};

const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  
  timer.value = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
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
    
    // 开始计时
    startTimer();
    
  } catch (error) {
    ElMessage.error('加载问卷失败：' + error.message);
    console.error('加载失败:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
});
</script>

<style scoped lang="scss">
.answer-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);

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

/* 头部样式 */
.answer-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .survey-title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #303133;
      }

      .progress-info {
        color: #606266;
        font-size: 14px;
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
  grid-template-columns: 1fr 350px;
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
        background: linear-gradient(135deg, #409eff, #67c23a);
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
      border-left: 4px solid #409eff;

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
        border-color: #409eff;
        background: #f0f9ff;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(64, 158, 255, 0.1);
      }

      &.is-checked {
        border-color: #409eff;
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

/* 问题导航 */
.question-nav {
  margin-top: 20px;

  h5 {
    margin: 0 0 12px 0;
    color: #303133;
    font-size: 14px;
    font-weight: 600;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(6, 1fr);
    }

    @media (max-width: 480px) {
      grid-template-columns: repeat(8, 1fr);
    }
  }

  .nav-item {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f5f7fa;
    color: #909399;
    border: 1px solid #e4e7ed;
    position: relative;

    @media (max-width: 480px) {
      width: 28px;
      height: 28px;
      font-size: 11px;
    }

    &:hover {
      border-color: #409eff;
      background: #f0f9ff;
      color: #409eff;
    }

    &.current {
      background: #409eff;
      color: white;
      border-color: #409eff;
    }

    &.answered {
      background: #67c23a;
      color: white;
      border-color: #67c23a;
    }

    &.required::after {
      content: '*';
      position: absolute;
      top: -2px;
      right: -2px;
      color: #f56c6c;
      font-size: 10px;
    }
  }
}

/* 统计信息 */
.stats-card {
  .stats-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;

      .stat-label {
        color: #606266;
        font-size: 14px;
      }

      .stat-value {
        color: #303133;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
}

/* 加载动画 */
.loading-section {
  padding: 40px 20px;
}
</style>
