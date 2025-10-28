<template>
  <el-card class="progress-card" shadow="hover">
    <template #header>
      <div class="progress-header">
        <h4>答题进度</h4>
        <span class="progress-text">{{ progressPercentage }}%</span>
      </div>
    </template>

    <div class="dynamic-progress-container">
      <div class="progress-item">
        <RandomProgress :percent="progressPercentage" :questionnaire-id="questionnaire?.id" />
      </div>
    </div>

    <div class="question-nav">
      <h5>题目导航</h5>
      <div class="nav-grid">
        <div v-for="(question, index) in questionnaire.questions" :key="question.id" class="nav-item" :class="{
          'current': index === currentQuestionIndex,
          'answered': answers[question.id] !== undefined,
          'required': question.required
        }" @click="$emit('go-to-question', index)">
          {{ index + 1 }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import RandomProgress from './RandomProgress.vue';

const props = defineProps({
  questionnaire: { type: Object, required: true },
  answers: { type: Object, required: true },
  currentQuestionIndex: { type: Number, required: true },
  progressPercentage: { type: Number, required: true },
  answeredCount: { type: Number, required: false },
  elapsedTime: { type: Number, required: false },
  formatTime: { type: Function, required: false }
});

const emits = defineEmits(['go-to-question']);
</script>

<style scoped>
/* 复用 AnswerPage 的样式类名，保持外观一致 */
.progress-card {
  border-radius: 16px;
  overflow: hidden;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  color: #67c23a;
  font-weight: 600;
}

.dynamic-progress-container {
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.progress-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
}

.question-nav {
  margin-top: 20px;
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
  background: #f5f7fa;
  color: #909399;
  border: 1px solid #e4e7ed;
}

.nav-item.current {
  background: var(--color-primary-light-3);
  color: white;
  border-color: var(--color-primary-light-3);
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
</style>
