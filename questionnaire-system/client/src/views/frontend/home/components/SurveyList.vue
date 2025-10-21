<template>
  <div class="survey-section">
    <div class="section-header">
      <h2>问卷列表</h2>
      <el-radio-group 
        :model-value="sortBy" 
        @update:model-value="$emit('update:sortBy', $event)"
        @change="$emit('sortChange')"
      >
        <el-radio-button value="latest">最新</el-radio-button>
        <el-radio-button value="hot">热门</el-radio-button>
        <el-radio-button value="recommended">推荐</el-radio-button>
      </el-radio-group>
    </div>

    <el-loading :loading="loading">
      <!-- 所有排序都使用 Featured 卡片样式 -->
      <div class="featured-grid" v-if="surveys.length">
        <div 
          v-for="survey in surveys" 
          :key="survey.id"
          class="featured-card"
          @click="$emit('surveyClick', survey.id)"
        >
          <div class="card-badge">
            <span v-if="survey.participants > 2000" class="hot-badge">🔥 热门</span>
            <span v-if="isNew(survey.createdAt)" class="new-badge">🆕 新品</span>
          </div>
          
          <div class="card-content">
            <h3 class="card-title">{{ survey.title }}</h3>
            <p class="card-description">{{ survey.description }}</p>
            
            <div class="card-meta">
              <div class="meta-item">
                <el-icon><User /></el-icon>
                <span>{{ formatParticipants(survey.participants || survey.participantCount) }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ survey.duration }}分钟</span>
              </div>
              <div class="meta-item rating">
                <el-rate 
                  :model-value="survey.rating || 0" 
                  disabled 
                  show-score 
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </div>
            </div>
            
            <div class="card-tags">
              <el-tag 
                v-for="tag in (survey.tags || []).slice(0, 3)" 
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
              @click.stop="$emit('surveyStart', survey.id)"
            >
              开始测试
            </el-button>
            <el-button 
              size="small" 
              :type="isFavorite(survey.id) ? 'warning' : 'default'"
              @click.stop="$emit('toggleFavorite', survey.id)"
              v-if="showFavorite"
            >
              <el-icon>
                <StarFilled v-if="isFavorite(survey.id)" />
                <Star v-else />
              </el-icon>
              {{ isFavorite(survey.id) ? '已收藏' : '收藏' }}
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="!loading && !surveys.length" description="暂无问卷数据" :image-size="100" />
    </el-loading>
  </div>
</template>

<script setup>
import { Star, StarFilled, User, Clock } from '@element-plus/icons-vue';

defineProps({
  surveys: {
    type: Array,
    default: () => []
  },
  sortBy: {
    type: String,
    default: 'latest'
  },
  loading: {
    type: Boolean,
    default: false
  },
  getCategoryName: {
    type: Function,
    required: false  // 不再必需
  },
  isFavorite: {
    type: Function,
    required: true
  },
  showFavorite: {
    type: Boolean,
    default: true
  }
});

defineEmits([
  'update:sortBy',
  'sortChange',
  'surveyClick',
  'surveyStart',
  'toggleFavorite'
]);

// 判断是否是新问卷（7天内）
const isNew = (createdAt) => {
  if (!createdAt) return false;
  return new Date(createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
};

// 格式化参与人数
const formatParticipants = (num) => {
  if (!num) return '0';
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};
</script><style scoped>
.survey-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

/* Featured 卡片样式 */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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

.card-footer .el-button--warning {
  background: linear-gradient(135deg, #fadb14 0%, #ffd666 100%);
  border-color: #fadb14;
  color: white;
}

.card-footer .el-button--warning:hover {
  background: linear-gradient(135deg, #ffd666 0%, #fadb14 100%);
  transform: scale(1.05);
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