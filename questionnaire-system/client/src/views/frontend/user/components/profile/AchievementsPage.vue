<template>
  <div class="achievements-page">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <!-- 积分总数 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon points-icon">💰</div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.points }}</div>
              <div class="stat-label">积分总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 已完成问卷 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon completed-icon">📝</div>
            <div class="stat-info">
              <div class="stat-value">{{ userStats.completedSurveys }}</div>
              <div class="stat-label">已完成问卷</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 已获得徽章数 -->
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon badge-count-icon">🏅</div>
            <div class="stat-info">
              <div class="stat-value">{{ unlockedBadgesCount }}/{{ allBadges.length }}</div>
              <div class="stat-label">已获得徽章</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 成就徽章列表 -->
    <el-card class="badges-section">
      <template #header>
        <div class="section-header">
          <span class="section-title">成就徽章</span>
          <el-radio-group v-model="badgeFilter" size="small">
            <el-radio-button value="unlocked">已解锁</el-radio-button>
            <el-radio-button value="locked">未解锁</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div class="badges-grid">
        <!-- 已解锁徽章 -->
        <div 
          v-for="badge in displayBadges" 
          :key="badge.id"
          class="badge-item"
          :class="badgeFilter === 'unlocked' ? 'unlocked' : 'locked'"
        >
          <div class="badge-image-wrapper">
            <div class="badge-image" :class="{ 'locked-image': badgeFilter === 'locked' }">
              <img v-if="badge.image" :src="badge.image" :alt="badge.name" @error="handleImageError" />
              <div v-else class="badge-icon-fallback">{{ badge.icon }}</div>
            </div>
            <div v-if="badgeFilter === 'locked'" class="lock-overlay">
              <el-icon :size="40"><Lock /></el-icon>
            </div>
          </div>
          
          <div class="badge-info">
            <h3 class="badge-name">{{ badge.name }}</h3>
            <p class="badge-description">{{ badge.description }}</p>
            <el-tag 
              :type="badgeFilter === 'unlocked' ? 'success' : 'info'" 
              size="small" 
              effect="plain"
            >
              {{ badgeFilter === 'unlocked' ? '已解锁' : '未解锁' }}
            </el-tag>
            <div v-if="badgeFilter === 'unlocked'" class="badge-reward">
              <el-icon><Star /></el-icon>
              +{{ badge.points }} 积分
            </div>
            <div v-else class="badge-progress">
              <span>进度：{{ getCurrentProgress(badge) }}/{{ badge.requirement }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty 
        v-if="displayBadges.length === 0" 
        :description="badgeFilter === 'unlocked' ? '暂无已解锁徽章' : '恭喜！已解锁所有徽章'" 
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/store/user';
import { getUserAnsweredSurveysApi } from '@/api/user';
import apiClient from '@/api/index.js';
import { ElMessage } from 'element-plus';
import { Lock, Star } from '@element-plus/icons-vue';

const userStore = useUserStore();

// 用户统计数据
const userStats = ref({
  points: 0,
  completedSurveys: 0
});

// 徽章过滤器
const badgeFilter = ref('unlocked');

// 用户已解锁的徽章ID列表（从json-server读取）
const userUnlockedBadgeIds = ref([]);

// 所有徽章定义（从json-server读取）
const allBadges = ref([]);

// 用户答题统计
const answerStats = ref({
  perfectScoreCount: 0,
  highScoreCount: 0,
  speedPerfectCount: 0,
  fastCompleteCount: 0,
  consecutiveDays: 0,
  categoryCount: 0,
  earlyBirdCount: 0,
  registerDays: 0,
  shareCount: 0
});

// 已解锁徽章列表（从json-server读取）
const unlockedBadges = computed(() => {
  return allBadges.value.filter(badge => userUnlockedBadgeIds.value.includes(badge.id));
});

// 未解锁徽章列表
const lockedBadges = computed(() => {
  return allBadges.value.filter(badge => !userUnlockedBadgeIds.value.includes(badge.id));
});

// 已解锁徽章数量
const unlockedBadgesCount = computed(() => {
  return unlockedBadges.value.length;
});

// 根据过滤器显示的徽章
const displayBadges = computed(() => {
  return badgeFilter.value === 'unlocked' ? unlockedBadges.value : lockedBadges.value;
});

// 获取当前进度
const getCurrentProgress = (badge) => {
  // 根据徽章类型返回对应的进度
  if (!badge.type) return 0;
  
  switch (badge.type) {
    case 'survey_count':
      return userStats.value.completedSurveys;
    case 'perfect_score':
      return answerStats.value.perfectScoreCount;
    case 'high_score':
      return answerStats.value.highScoreCount;
    case 'speed_perfect':
      return answerStats.value.speedPerfectCount;
    case 'fast_complete':
      return answerStats.value.fastCompleteCount;
    case 'consecutive_days':
      return answerStats.value.consecutiveDays;
    case 'category_count':
      return answerStats.value.categoryCount;
    case 'early_bird':
      return answerStats.value.earlyBirdCount;
    case 'points':
      return userStats.value.points;
    case 'register_days':
      return answerStats.value.registerDays;
    case 'share_count':
      return answerStats.value.shareCount;
    default:
      return 0;
  }
};

// 加载用户数据
const loadUserData = async () => {
  try {
    const userId = userStore.userId;
    if (!userId) {
      ElMessage.warning('请先登录');
      return;
    }

    // 加载所有徽章定义
    const badgesData = await apiClient.get('/badges');
    allBadges.value = badgesData;

    // 获取用户基本信息
    const userInfo = await apiClient.get(`/users/${userId}`);
    userStats.value.points = userInfo.points || 0;
    
    // 获取用户已解锁的徽章ID列表
    userUnlockedBadgeIds.value = userInfo.unlockedBadges || [];

    // 获取答题记录
    const answers = await getUserAnsweredSurveysApi(userId);
    userStats.value.completedSurveys = answers.length;

    // 统计各种成就
    answerStats.value.perfectScoreCount = answers.filter(a => a.score === 100).length;
    answerStats.value.highScoreCount = answers.filter(a => a.score >= 90).length;
    
    // 统计速通满分次数（假设问卷预计时间的70%内完成且满分）
    const speedPerfects = answers.filter(a => {
      if (!a.survey || !a.survey.duration || !a.duration) return false;
      const expectedTime = a.survey.duration * 60;
      const actualTime = a.duration;
      return a.score === 100 && actualTime <= expectedTime * 0.7;
    });
    answerStats.value.speedPerfectCount = speedPerfects.length;

    // 统计快速完成次数（假设问卷预计时间的80%内完成）
    const fastCompletes = answers.filter(a => {
      if (!a.survey || !a.survey.duration || !a.duration) return false;
      const expectedTime = a.survey.duration * 60;
      const actualTime = a.duration;
      return actualTime <= expectedTime * 0.8;
    });
    answerStats.value.fastCompleteCount = fastCompletes.length;

    // 统计不同分类数量
    const categories = new Set(answers.map(a => a.category).filter(Boolean));
    answerStats.value.categoryCount = categories.size;

    // 统计早起鸟次数(6-8点)
    const earlyBirds = answers.filter(a => {
      if (!a.submittedAt) return false;
      const hour = new Date(a.submittedAt).getHours();
      return hour >= 6 && hour < 8;
    });
    answerStats.value.earlyBirdCount = earlyBirds.length;

    // 计算连续答题天数
    if (answers.length > 0) {
      const sortedDates = answers
        .map(a => new Date(a.submittedAt).toDateString())
        .sort()
        .reverse();
      
      let consecutive = 1;
      let currentStreak = 1;
      
      for (let i = 1; i < sortedDates.length; i++) {
        const date1 = new Date(sortedDates[i - 1]);
        const date2 = new Date(sortedDates[i]);
        const diffDays = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
          consecutive = Math.max(consecutive, currentStreak);
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      
      answerStats.value.consecutiveDays = consecutive;
    }

    // 计算注册天数
    if (userInfo.joinedDate) {
      const joinDate = new Date(userInfo.joinedDate);
      const now = new Date();
      const diffTime = Math.abs(now - joinDate);
      answerStats.value.registerDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 分享次数（模拟数据，实际应从后端获取）
    answerStats.value.shareCount = userInfo.shareCount || 0;

    // 检查并自动解锁徽章
    await checkAndUnlockBadges();
  } catch (error) {
    console.error('加载用户数据失败:', error);
    ElMessage.error('加载数据失败');
  }
};

// 检查并自动解锁徽章
const checkAndUnlockBadges = async () => {
  try {
    const userId = userStore.userId;
    const newlyUnlocked = [];
    
    // 检查每个徽章的解锁条件
    for (const badge of allBadges.value) {
      // 如果已经解锁，跳过
      if (userUnlockedBadgeIds.value.includes(badge.id)) {
        continue;
      }
      
      // 根据徽章类型检查是否应该解锁
      let shouldUnlock = false;
      const currentProgress = getCurrentProgress(badge);
      shouldUnlock = currentProgress >= badge.requirement;
      
      if (shouldUnlock) {
        newlyUnlocked.push(badge);
        userUnlockedBadgeIds.value.push(badge.id);
      }
    }
    
    // 如果有新解锁的徽章，更新用户数据
    if (newlyUnlocked.length > 0) {
      // 计算新增的积分
      const addedPoints = newlyUnlocked.reduce((sum, badge) => sum + badge.points, 0);
      const newPoints = userStats.value.points + addedPoints;
      
      // 更新json-server中的用户数据
      await apiClient.patch(`/users/${userId}`, {
        unlockedBadges: userUnlockedBadgeIds.value,
        points: newPoints
      });
      
      // 更新本地显示
      userStats.value.points = newPoints;
      
      // 显示解锁提示
      for (const badge of newlyUnlocked) {
        ElMessage.success({
          message: `🎉 恭喜解锁徽章：${badge.name}！获得 ${badge.points} 积分`,
          duration: 3000
        });
      }
    }
  } catch (error) {
    console.error('检查徽章解锁失败:', error);
  }
};

// 图片加载失败处理
const handleImageError = (e) => {
  e.target.style.display = 'none';
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.achievements-page {
  padding: 20px;
}

/* 统计卡片行 */
.stats-row {
  margin-bottom: 30px;
}

.stat-card {
  height: 100%;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  font-size: 32px;
  flex-shrink: 0;
}

.points-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.completed-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.badge-count-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

/* 徽章区域 */
.badges-section {
  margin-top: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.badge-item {
  background: #fff;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.badge-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge-item.locked {
  background: #f5f7fa;
}

.badge-item.unlocked {
  border-color: #67C23A;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.badge-image-wrapper {
  position: relative;
  width: 70px;
  height: 70px;
  margin: 0 auto 10px;
}

.badge-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-image.locked-image {
  background: #dcdfe6;
  filter: grayscale(100%);
}

.badge-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-icon-fallback {
  font-size: 32px;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.badge-info {
  margin-top: 5px;
}

.badge-name {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 5px 0;
}

.badge-description {
  font-size: 12px;
  color: #606266;
  margin: 0 0 8px 0;
  min-height: 32px;
  line-height: 1.4;
}

.badge-progress {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.badge-reward {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  padding: 3px 10px;
  background: #fff9e6;
  border-radius: 20px;
  color: #E6A23C;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .achievements-page {
    padding: 10px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }

  .badges-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .badge-image-wrapper {
    width: 60px;
    height: 60px;
  }

  .badge-icon-fallback {
    font-size: 28px;
  }

  .badge-name {
    font-size: 13px;
  }

  .badge-description {
    font-size: 11px;
  }
}

@media (min-width: 769px) and (max-width: 1200px) {
  .badges-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1201px) and (max-width: 1600px) {
  .badges-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
