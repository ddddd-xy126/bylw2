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

          <!-- 圆形进度条 -->
          <div class="circle-progress">
            <el-progress
              type="circle"
              :percentage="progressPercentage"
              :width="120"
              :stroke-width="8"
              color="#67C23A"
            >
              <template #default="{ percentage }">
                <span class="progress-inner">
                  <div class="progress-number">{{ percentage }}%</div>
                  <div class="progress-label">已完成</div>
                </span>
              </template>
            </el-progress>
          </div>

          <!-- 树木生长动画 -->
          <div class="tree-animation">
            <div class="tree-container">
              <div class="tree-trunk"></div>
              <div 
                class="tree-branch" 
                v-for="(branch, index) in treeBranches" 
                :key="index"
                :style="branch.style"
                :class="{ 'grown': branch.grown }"
              ></div>
              <div 
                class="tree-leaf" 
                v-for="(leaf, index) in treeLeaves" 
                :key="index"
                :style="leaf.style"
                :class="{ 'grown': leaf.grown }"
              >🍃</div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock
} from "@element-plus/icons-vue";

import { getSurveyDetail, submitSurveyApi } from "@/api/survey";
import { useUserStore } from "@/store/user";

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

// 树木动画数据
const treeBranches = ref([]);
const treeLeaves = ref([]);

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

const initTreeAnimation = () => {
  // 初始化树枝
  treeBranches.value = [
    { 
      style: { 
        left: '50%', 
        bottom: '60px', 
        transform: 'translateX(-50%) rotate(-15deg)',
        width: '40px',
        height: '4px'
      }, 
      grown: false 
    },
    { 
      style: { 
        left: '45%', 
        bottom: '80px', 
        transform: 'translateX(-50%) rotate(20deg)',
        width: '35px',
        height: '3px'
      }, 
      grown: false 
    },
    { 
      style: { 
        left: '55%', 
        bottom: '70px', 
        transform: 'translateX(-50%) rotate(-25deg)',
        width: '30px',
        height: '3px'
      }, 
      grown: false 
    },
  ];

  // 初始化树叶
  treeLeaves.value = [
    { style: { left: '40%', bottom: '90px' }, grown: false },
    { style: { left: '60%', bottom: '95px' }, grown: false },
    { style: { left: '50%', bottom: '105px' }, grown: false },
    { style: { left: '35%', bottom: '85px' }, grown: false },
    { style: { left: '65%', bottom: '80px' }, grown: false },
  ];
};

const updateTreeGrowth = () => {
  const progress = progressPercentage.value;
  
  // 树枝生长
  treeBranches.value.forEach((branch, index) => {
    const threshold = (index + 1) * (100 / treeBranches.value.length) * 0.6;
    branch.grown = progress >= threshold;
  });
  
  // 树叶生长
  treeLeaves.value.forEach((leaf, index) => {
    const threshold = 40 + (index * 12); // 从40%开始长叶子
    leaf.grown = progress >= threshold;
  });
};

const handleAnswerChange = () => {
  // 答案改变时更新树木生长
  updateTreeGrowth();
};

const nextQuestion = async () => {
  // 验证必答题
  if (currentQuestion.value?.required && !isAnswered.value) {
    ElMessage.warning('请回答当前问题后再继续');
    return;
  }

  if (isLastQuestion.value) {
    // 提交问卷
    await submitSurvey();
  } else {
    // 下一题
    currentQuestionIndex.value++;
    updateTreeGrowth();
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
    
    isCompleted.value = true;
    ElMessage.success('问卷提交成功！');
    
    // 停止计时器
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
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
    
    // 重置树木动画
    initTreeAnimation();
    
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

// 监听进度变化
watch(progressPercentage, () => {
  updateTreeGrowth();
});

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
    
    // 初始化树木动画
    initTreeAnimation();
    
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

<style scoped>
.answer-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

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

/* 主要内容区域 */
.answer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  align-items: start;
}

/* 问题区域 */
.question-area {
  min-height: 500px;
}

.question-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.question-header {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: flex-start;
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
}

.question-info {
  flex: 1;
}

.question-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.required-mark {
  color: #f56c6c;
  font-size: 12px;
  font-weight: 500;
}

.question-description {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.question-description p {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

/* 答题区域 */
.answer-section {
  margin-bottom: 32px;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 16px;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
}

.option-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.1);
}

.option-item.is-checked {
  border-color: #409eff;
  background: linear-gradient(135deg, #f0f9ff, #e1f3ff);
}

.option-text {
  font-size: 16px;
  color: #303133;
  line-height: 1.4;
}

.rating-section {
  text-align: center;
  padding: 20px;
}

/* 操作按钮 */
.question-actions {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.question-actions .el-button {
  flex: 1;
  max-width: 150px;
}

/* 完成页面 */
.completion-section {
  text-align: center;
  padding: 40px 20px;
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

/* 进度区域 */
.progress-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 100px;
}

.progress-card,
.stats-card {
  border-radius: 16px;
  overflow: hidden;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.progress-header h4 {
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

.circle-progress {
  text-align: center;
  margin: 20px 0;
}

.progress-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-number {
  font-size: 18px;
  font-weight: 700;
  color: #67c23a;
}

.progress-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 树木动画 */
.tree-animation {
  margin: 20px 0;
  height: 140px;
  position: relative;
  background: linear-gradient(to bottom, #87ceeb 0%, #98fb98 100%);
  border-radius: 8px;
  overflow: hidden;
}

.tree-container {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 120px;
}

.tree-trunk {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 60px;
  background: linear-gradient(to bottom, #8b4513, #a0522d);
  border-radius: 4px;
}

.tree-branch {
  position: absolute;
  background: #8b4513;
  border-radius: 2px;
  opacity: 0;
  transition: all 0.8s ease;
  transform-origin: left center;
}

.tree-branch.grown {
  opacity: 1;
  animation: growBranch 0.8s ease-out;
}

.tree-leaf {
  position: absolute;
  font-size: 16px;
  opacity: 0;
  transition: all 0.6s ease;
  transform: scale(0) rotate(0deg);
}

.tree-leaf.grown {
  opacity: 1;
  transform: scale(1) rotate(360deg);
  animation: growLeaf 0.6s ease-out;
}

@keyframes growBranch {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes growLeaf {
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

/* 题目导航 */
.question-nav {
  margin-top: 20px;
}

.question-nav h5 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
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
}

.nav-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  color: #409eff;
}

.nav-item.current {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.nav-item.answered {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

.nav-item.required::after {
  content: '*';
  position: absolute;
  top: -2px;
  right: -2px;
  color: #f56c6c;
  font-size: 10px;
}

/* 统计信息 */
.stats-card h4 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

.stat-value {
  color: #303133;
  font-weight: 600;
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .answer-container {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 16px;
  }
  
  .progress-area {
    order: -1;
    position: static;
  }
  
  .question-header {
    gap: 12px;
  }
  
  .question-number {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .question-title {
    font-size: 18px;
  }
  
  .question-actions {
    flex-direction: column;
  }
  
  .question-actions .el-button {
    max-width: none;
  }
  
  .completion-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-grid {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .tree-animation {
    height: 100px;
  }
  
  .tree-container {
    height: 80px;
  }
  
  .tree-trunk {
    height: 40px;
  }
}

@media (max-width: 480px) {
  .answer-container {
    padding: 12px;
  }
  
  .survey-title {
    font-size: 18px;
  }
  
  .question-title {
    font-size: 16px;
  }
  
  .option-item {
    padding: 12px;
  }
  
  .option-text {
    font-size: 14px;
  }
  
  .nav-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  
  .nav-item {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
}

/* 加载动画 */
.loading-section {
  padding: 40px 20px;
}

/* 自定义滚动条 */
.answer-page ::-webkit-scrollbar {
  width: 6px;
}

.answer-page ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.answer-page ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.answer-page ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
