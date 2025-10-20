<template>
  <div class="progress-demo">
    <h1>动态进度条演示</h1>
    
    <div class="demo-container">
      <!-- 圆形进度条 -->
      <div class="progress-item">
        <h3>🔵 圆形进度条</h3>
        <DynamicProgress type="circle" :percent="progress" />
      </div>

      <!-- 液体填充 -->
      <div class="progress-item">
        <h3>💧 液体填充</h3>
        <DynamicProgress type="liquid" :percent="progress" />
      </div>
    </div>

    <!-- 控制滑块 -->
    <div class="control-panel">
      <h3>进度控制</h3>
      <el-slider v-model="progress" :max="100" :show-tooltip="true" />
      <div class="progress-value">当前进度: {{ progress }}%</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DynamicProgress from '@/components/DynamicProgress.vue'

const progress = ref(60)
</script>

<style scoped>
.progress-demo {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 40px;
  font-size: 36px;
}

.demo-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.progress-item {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.progress-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.progress-item h3 {
  margin: 0 0 20px 0;
  color: #555;
  font-size: 20px;
  text-align: center;
}

.control-panel {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
}

.control-panel h3 {
  margin: 0 0 20px 0;
  color: #555;
  font-size: 20px;
  text-align: center;
}

.progress-value {
  text-align: center;
  margin-top: 16px;
  font-size: 18px;
  color: #667eea;
  font-weight: bold;
}
</style>
