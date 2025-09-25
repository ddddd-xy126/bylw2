<template>
  <div class="featured-surveys">
    <div class="featured-header">
      <h2>
        <el-icon><Star /></el-icon>
        热门推荐
      </h2>
      <p>精选优质问卷，助您深入了解自己</p>
    </div>
    
    <div class="featured-grid">
      <div 
        v-for="survey in featuredSurveys" 
        :key="survey.id"
        class="featured-card"
        @click="$emit('survey-click', survey.id)"
      >
        <div class="card-badge">
          <span v-if="survey.isHot" class="hot-badge">🔥 热门</span>
          <span v-if="survey.isNew" class="new-badge">🆕 新品</span>
        </div>
        
        <div class="card-content">
          <h3 class="card-title">{{ survey.title }}</h3>
          <p class="card-description">{{ survey.description }}</p>
          
          <div class="card-meta">
            <div class="meta-item">
              <el-icon><User /></el-icon>
              <span>{{ formatParticipants(survey.participants) }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Clock /></el-icon>
              <span>{{ survey.duration }}分钟</span>
            </div>
            <div class="meta-item rating">
              <el-rate 
                v-model="survey.rating" 
                disabled 
                show-score 
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </div>
          
          <div class="card-tags">
            <el-tag 
              v-for="tag in survey.tags.slice(0, 3)" 
              :key="tag"
              size="small"
              type="info"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="card-footer">
          <el-button 
            type="primary" 
            size="small" 
            @click.stop="$emit('survey-start', survey.id)"
          >
            开始测试
          </el-button>
          <el-button 
            size="small" 
            :icon="isFavorite(survey.id) ? 'Star' : 'StarFilled'"
            @click.stop="$emit('toggle-favorite', survey.id)"
          >
            {{ isFavorite(survey.id) ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star, User, Clock } from '@element-plus/icons-vue'

const props = defineProps({
  surveys: {
    type: Array,
    required: true
  },
  userFavorites: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['survey-click', 'survey-start', 'toggle-favorite'])

// 热门推荐问卷（取前6个高评分或高参与度的）
const featuredSurveys = computed(() => {
  return props.surveys
    .sort((a, b) => {
      // 按评分和参与人数排序
      const scoreA = a.rating * 0.6 + (a.participants / 1000) * 0.4
      const scoreB = b.rating * 0.6 + (b.participants / 1000) * 0.4
      return scoreB - scoreA
    })
    .slice(0, 6)
    .map(survey => ({
      ...survey,
      isHot: survey.participants > 1500,
      isNew: new Date(survey.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }))
})

const isFavorite = (surveyId) => {
  return props.userFavorites.includes(surveyId)
}

const formatParticipants = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped>
.featured-surveys {
  margin-bottom: 60px;
}

.featured-header {
  text-align: center;
  margin-bottom: 40px;
}

.featured-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.featured-header p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
}

.featured-card {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.card-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.hot-badge {
  background: linear-gradient(45deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.new-badge {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-content {
  margin-bottom: 20px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #888;
}

.meta-item.rating {
  margin-left: auto;
}

.card-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.card-footer {
  display: flex;
  gap: 12px;
  justify-content: space-between;
}

.card-footer .el-button {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .featured-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .featured-card {
    padding: 20px;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .card-meta {
    gap: 12px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>