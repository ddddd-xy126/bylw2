<template>
  <div class="stats-section">
    <el-row :gutter="24">
      <el-col :xs="12" :sm="6">
        <div class="stats-card gradient-1">
          <div class="stats-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ totalSurveys }}</div>
            <div class="stats-label">问卷总数</div>
          </div>
          <div class="stats-decoration">
            <div class="decoration-dot dot-1"></div>
            <div class="decoration-dot dot-2"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card gradient-2">
          <div class="stats-icon">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatNumber(totalParticipants) }}</div>
            <div class="stats-label">参与人数</div>
          </div>
          <div class="stats-decoration">
            <div class="decoration-dot dot-1"></div>
            <div class="decoration-dot dot-2"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card gradient-3">
          <div class="stats-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ userFavorites }}</div>
            <div class="stats-label">我的收藏</div>
          </div>
          <div class="stats-decoration">
            <div class="decoration-dot dot-1"></div>
            <div class="decoration-dot dot-2"></div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="6">
        <div class="stats-card gradient-4">
          <div class="stats-icon">
            <el-icon><Trophy /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ formatNumber(userPoints) }}</div>
            <div class="stats-label">我的积分</div>
          </div>
          <div class="stats-decoration">
            <div class="decoration-dot dot-1"></div>
            <div class="decoration-dot dot-2"></div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { Document, User, Star, Trophy } from "@element-plus/icons-vue";

defineProps({
  totalSurveys: {
    type: Number,
    default: 0
  },
  totalParticipants: {
    type: Number,
    default: 0
  },
  userFavorites: {
    type: Number,
    default: 0
  },
  userPoints: {
    type: Number,
    default: 0
  }
});

// 格式化数字显示
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
</script>

<style scoped>
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  position: relative;
  height: 120px;
  padding: 24px;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-2 {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-3 {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-4 {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 2rem;
  opacity: 0.3;
}

.stats-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  z-index: 2;
  position: relative;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stats-label {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.stats-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.decoration-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: pulse 3s ease-in-out infinite;
}

.dot-1 {
  width: 60px;
  height: 60px;
  top: -20px;
  right: -20px;
  animation-delay: 0s;
}

.dot-2 {
  width: 40px;
  height: 40px;
  bottom: -10px;
  left: -10px;
  animation-delay: -1.5s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-card {
    height: 100px;
    padding: 20px;
    margin-bottom: 16px;
  }
  
  .stats-number {
    font-size: 2rem;
  }
  
  .stats-label {
    font-size: 0.8rem;
  }
  
  .stats-icon {
    font-size: 1.5rem;
    top: 15px;
    right: 15px;
  }
}
</style>